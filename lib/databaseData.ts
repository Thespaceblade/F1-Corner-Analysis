import { queryDb } from './db'
import type {
  CornerMetrics,
  QualifyingBoundaries,
  QualifyingResult,
  RaceResult,
  SessionDriver,
  SessionLap,
  SessionPayload,
} from './sessionDataClient'

type SessionRecord = {
  id: number
  year: number
  round_slug: string
  round_number: number | null
  session_code: string
  event_name: string | null
  country: string | null
  official_name: string | null
  generated_at: string | null
  status: string | null
  total_lap_count: number | null
  valid_lap_count: number | null
  outlier_lap_count: number | null
}

type SessionDriverRow = {
  driver_code: string
  team: string | null
  number: number | null
  default_compound: string | null
}

type LapRecord = {
  driver_code: string
  lap_number: number | null
  stint: number | null
  compound: string | null
  tyre_life: number | null
  lap_time_seconds: number | null
  session_time_seconds: number | null
  sector1_seconds: number | null
  sector2_seconds: number | null
  sector3_seconds: number | null
  is_personal_best: boolean | null
  track_status: string | null
  has_data: boolean | null
  flags: string[] | null
  is_valid: boolean | null
}

type CornerRecord = {
  driver_code: string
  detected_corner_index: number | null
  lap_number: number | null
  entry_speed: number | null
  apex_speed: number | null
  exit_speed: number | null
  corner_time: number | null
  braking_distance: number | null
  acceleration_distance: number | null
  entry_distance: number | null
  apex_distance: number | null
  exit_distance: number | null
  min_speed: number | null
  corner_number: number | null
  corner_type: string | null
}

type QualifyingBoundariesRow = {
  q1_start: number | null
  q1_end: number | null
  q2_start: number | null
  q2_end: number | null
  q3_start: number | null
  q3_end: number | null
}

type RaceResultRow = {
  position: number | null
  driver_code: string
  driver_number: number | null
  team_name: string | null
  grid_position: number | null
  status: string | null
  points: number | null
  classified_position: string | null
  time_seconds: number | null
  laps_completed: number | null
}

type QualifyingResultRow = {
  position: number | null
  driver_code: string
  driver_number: number | null
  team_name: string | null
  q1_time_seconds: number | null
  q2_time_seconds: number | null
  q3_time_seconds: number | null
}

type CalendarRoundRow = {
  round: number
  id: string
  name: string | null
  location: string | null
  date: string | null
  official_name: string | null
}

export type SessionIndex = {
  years: Record<
    string,
    {
      rounds: Array<{ id: string; sessions: string[] }>
    }
  >
}

function normalizeDriverCodes(driverCodes: string[]): string[] {
  return Array.from(new Set(driverCodes.map((code) => code.trim().toUpperCase()).filter(Boolean)))
}

export async function loadCalendarRoundsFromDatabase(year: number): Promise<CalendarRoundRow[]> {
  return queryDb<CalendarRoundRow>(
    `
      select
        round_number as round,
        round_slug as id,
        name,
        location,
        date_label as date,
        official_name
      from calendar_rounds
      where year = $1
      order by round_number asc, round_slug asc
    `,
    [year],
  )
}

export async function loadSessionIndexFromDatabase(): Promise<SessionIndex> {
  const rows = await queryDb<{
    year: number
    round_slug: string
    session_code: string
    round_number: number | null
  }>(
    `
      select
        s.year,
        s.round_slug,
        s.session_code,
        coalesce(s.round_number, c.round_number) as round_number
      from sessions s
      left join calendar_rounds c
        on c.year = s.year
       and c.round_slug = s.round_slug
      order by
        s.year asc,
        coalesce(s.round_number, c.round_number) asc nulls last,
        s.round_slug asc,
        s.session_code asc
    `,
  )

  const index: SessionIndex = { years: {} }
  const roundOrder = new Map<string, number | null>()

  for (const row of rows) {
    const yearKey = String(row.year)
    if (!index.years[yearKey]) {
      index.years[yearKey] = { rounds: [] }
    }

    const orderKey = `${yearKey}:${row.round_slug}`
    if (!roundOrder.has(orderKey)) {
      roundOrder.set(orderKey, row.round_number)
    }

    let round = index.years[yearKey].rounds.find((entry) => entry.id === row.round_slug)
    if (!round) {
      round = { id: row.round_slug, sessions: [] }
      index.years[yearKey].rounds.push(round)
    }

    if (!round.sessions.includes(row.session_code)) {
      round.sessions.push(row.session_code)
    }
  }

  for (const [year, entry] of Object.entries(index.years)) {
    entry.rounds.sort((a, b) => {
      const orderA = roundOrder.get(`${year}:${a.id}`)
      const orderB = roundOrder.get(`${year}:${b.id}`)
      if (orderA !== null && orderA !== undefined && orderB !== null && orderB !== undefined) {
        return orderA - orderB
      }
      return a.id.localeCompare(b.id)
    })
    entry.rounds.forEach((round) => round.sessions.sort())
  }

  return index
}

export async function loadSessionPayloadFromDatabase({
  year,
  round,
  session,
  driversFilter = [],
}: {
  year: number
  round: string
  session: string
  driversFilter?: string[]
}): Promise<SessionPayload> {
  const requestedDrivers = normalizeDriverCodes(driversFilter)

  const sessionRows = await queryDb<SessionRecord>(
    `
      select
        id,
        year,
        round_slug,
        round_number,
        session_code,
        event_name,
        country,
        official_name,
        generated_at,
        status,
        total_lap_count,
        valid_lap_count,
        outlier_lap_count
      from sessions
      where year = $1 and round_slug = $2 and session_code = $3
      limit 1
    `,
    [year, round, session.toUpperCase()],
  )

  if (!sessionRows.length) {
    throw new Error('Session not found in database')
  }

  const sessionRecord = sessionRows[0]
  const sessionDrivers = await queryDb<SessionDriverRow>(
    `
      select
        driver_code,
        team,
        number,
        default_compound
      from session_drivers
      where session_id = $1
      order by driver_code asc
    `,
    [sessionRecord.id],
  )

  const availableDrivers = sessionDrivers.map((row) => row.driver_code.toUpperCase())
  const availableDriverSet = new Set(availableDrivers)
  const selectedDriverCodes = requestedDrivers.length
    ? requestedDrivers.filter((code) => availableDriverSet.has(code))
    : availableDrivers
  const selectedDriverSet = new Set(selectedDriverCodes)
  const missingDrivers = requestedDrivers.filter((code) => !selectedDriverSet.has(code))

  const selectedSessionDrivers = sessionDrivers.filter((row) => selectedDriverSet.has(row.driver_code.toUpperCase()))
  const filtersActive = requestedDrivers.length > 0
  const driverFilterValues = filtersActive ? [sessionRecord.id, selectedDriverCodes] : [sessionRecord.id]

  const laps = selectedDriverCodes.length || !filtersActive
    ? await queryDb<LapRecord>(
        `
          select
            driver_code,
            lap_number,
            stint,
            compound,
            tyre_life,
            lap_time_seconds,
            session_time_seconds,
            sector1_seconds,
            sector2_seconds,
            sector3_seconds,
            is_personal_best,
            track_status,
            has_data,
            flags,
            is_valid
          from laps
          where session_id = $1
            ${filtersActive ? 'and driver_code = any($2::text[])' : ''}
          order by driver_code asc, lap_order asc, id asc
        `,
        driverFilterValues,
      )
    : []

  const corners = selectedDriverCodes.length || !filtersActive
    ? await queryDb<CornerRecord>(
        `
          select
            driver_code,
            detected_corner_index,
            lap_number,
            entry_speed,
            apex_speed,
            exit_speed,
            corner_time,
            braking_distance,
            acceleration_distance,
            entry_distance,
            apex_distance,
            exit_distance,
            min_speed,
            corner_number,
            corner_type
          from corners
          where session_id = $1
            ${filtersActive ? 'and driver_code = any($2::text[])' : ''}
          order by driver_code asc, corner_order asc, id asc
        `,
        driverFilterValues,
      )
    : []

  const [qualifyingBoundariesRows, raceResultsRows, qualifyingResultsRows] = await Promise.all([
    queryDb<QualifyingBoundariesRow>(
      `
        select
          q1_start,
          q1_end,
          q2_start,
          q2_end,
          q3_start,
          q3_end
        from qualifying_boundaries
        where session_id = $1
        limit 1
      `,
      [sessionRecord.id],
    ),
    queryDb<RaceResultRow>(
      `
        select
          position,
          driver_code,
          driver_number,
          team_name,
          grid_position,
          status,
          points,
          classified_position,
          time_seconds,
          laps_completed
        from race_results
        where session_id = $1
        order by position asc nulls last, driver_code asc
      `,
      [sessionRecord.id],
    ),
    queryDb<QualifyingResultRow>(
      `
        select
          position,
          driver_code,
          driver_number,
          team_name,
          q1_time_seconds,
          q2_time_seconds,
          q3_time_seconds
        from qualifying_results
        where session_id = $1
        order by position asc nulls last, driver_code asc
      `,
      [sessionRecord.id],
    ),
  ])

  const drivers: Record<string, SessionDriver> = Object.fromEntries(
    selectedSessionDrivers.map((row) => [
      row.driver_code.toUpperCase(),
      {
        code: row.driver_code.toUpperCase(),
        team: row.team,
        number: row.number,
        defaultCompound: row.default_compound,
      },
    ]),
  )

  const lapsPayload: SessionLap[] = laps.map((row) => ({
    driver: row.driver_code.toUpperCase(),
    lapNumber: row.lap_number,
    stint: row.stint,
    compound: row.compound,
    tyreLife: row.tyre_life,
    lapTimeSeconds: row.lap_time_seconds,
    sessionTimeSeconds: row.session_time_seconds,
    sectorTimesSeconds: [row.sector1_seconds, row.sector2_seconds, row.sector3_seconds],
    isPersonalBest: Boolean(row.is_personal_best),
    trackStatus: row.track_status,
    hasData: row.has_data ?? true,
    flags: Array.isArray(row.flags) ? row.flags : [],
    isValid: typeof row.is_valid === 'boolean' ? row.is_valid : undefined,
  }))

  const cornerPayload: Record<string, CornerMetrics[]> = Object.fromEntries(
    selectedDriverCodes.map((code) => [code, []]),
  )
  for (const row of corners) {
    const driverCode = row.driver_code.toUpperCase()
    if (!cornerPayload[driverCode]) {
      cornerPayload[driverCode] = []
    }
    cornerPayload[driverCode].push({
      detectedCornerIndex: row.detected_corner_index ?? undefined,
      lapNumber: row.lap_number ?? 0,
      entrySpeed: row.entry_speed ?? 0,
      apexSpeed: row.apex_speed ?? 0,
      exitSpeed: row.exit_speed ?? 0,
      cornerTime: row.corner_time,
      brakingDistance: row.braking_distance ?? 0,
      accelerationDistance: row.acceleration_distance ?? 0,
      entryDistance: row.entry_distance ?? 0,
      apexDistance: row.apex_distance ?? 0,
      exitDistance: row.exit_distance ?? 0,
      minSpeed: row.min_speed ?? 0,
      cornerNumber: row.corner_number ?? 0,
      cornerType: (row.corner_type as CornerMetrics['cornerType'] | null) ?? 'unknown',
    })
  }

  const qualifyingBoundaries = qualifyingBoundariesRows[0]
    ? ({
        q1Start: qualifyingBoundariesRows[0].q1_start ?? 0,
        q1End: qualifyingBoundariesRows[0].q1_end,
        q2Start: qualifyingBoundariesRows[0].q2_start,
        q2End: qualifyingBoundariesRows[0].q2_end,
        q3Start: qualifyingBoundariesRows[0].q3_start,
        q3End: qualifyingBoundariesRows[0].q3_end,
      } satisfies QualifyingBoundaries)
    : undefined

  const raceResults: RaceResult[] = raceResultsRows.map((row) => ({
    position: row.position,
    driverCode: row.driver_code.toUpperCase(),
    driverNumber: row.driver_number,
    teamName: row.team_name,
    gridPosition: row.grid_position,
    status: row.status ?? 'Unknown',
    points: row.points ?? 0,
    classifiedPosition: row.classified_position,
    time: row.time_seconds,
    lapsCompleted: row.laps_completed,
  }))

  const qualifyingResults: QualifyingResult[] = qualifyingResultsRows.map((row) => ({
    position: row.position,
    driverCode: row.driver_code.toUpperCase(),
    driverNumber: row.driver_number,
    teamName: row.team_name,
    q1Time: row.q1_time_seconds,
    q2Time: row.q2_time_seconds,
    q3Time: row.q3_time_seconds,
  }))

  const notes: string[] = []
  if (missingDrivers.length) {
    notes.push(`Drivers not found in dataset: ${missingDrivers.join(', ')}`)
  }
  if (filtersActive && !selectedDriverCodes.length) {
    notes.push('No drivers matched the current filter.')
  }

  return {
    meta: {
      year: sessionRecord.year,
      round: sessionRecord.round_slug,
      session: sessionRecord.session_code,
      generatedAt: sessionRecord.generated_at ?? undefined,
      requestedDrivers: filtersActive ? requestedDrivers : null,
      filteredDrivers: filtersActive ? selectedDriverCodes : undefined,
      missingDrivers: filtersActive ? missingDrivers : undefined,
      status: sessionRecord.status ?? undefined,
      event: {
        name: sessionRecord.event_name,
        country: sessionRecord.country,
        officialName: sessionRecord.official_name,
      },
      availableDrivers,
      totalLapCount: sessionRecord.total_lap_count ?? undefined,
      validLapCount: sessionRecord.valid_lap_count ?? undefined,
      outlierLapCount: sessionRecord.outlier_lap_count ?? undefined,
    },
    drivers,
    laps: lapsPayload,
    corners: cornerPayload,
    notes,
    qualifyingBoundaries,
    raceResults,
    qualifyingResults,
  }
}
