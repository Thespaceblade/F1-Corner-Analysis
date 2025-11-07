import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getDb, isDatabaseEnabled, DriverRow, LapRow, SessionRow } from '../../../../../../lib/db'

type Params = {
  params: {
    year: string
    round: string
    session: string
  }
}

function resolveSessionPath(year: string, round: string, session: string) {
  return path.join(process.cwd(), 'public', 'data', 'sessions', year, round, session, 'session.json')
}

function normalizeDriverCodes(raw: string | null) {
  if (!raw) return []
  return raw
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
}

function filterDrivers(payload: any, driverCodes: string[]) {
  if (!driverCodes.length) {
    return payload
  }

  const allDrivers = Object.keys(payload?.drivers ?? {})
  const requested = driverCodes
  const foundSet = new Set(allDrivers.filter((code) => requested.includes(code)))
  const missing = requested.filter((code) => !foundSet.has(code))

  const filteredDrivers = Object.fromEntries(
    Object.entries(payload?.drivers ?? {}).filter(([code]) => foundSet.has(code)),
  )

  const filteredLaps = (payload?.laps ?? []).filter((lap: any) => foundSet.has(lap.driver))

  const filteredCorners = Object.fromEntries(
    Object.entries(payload?.corners ?? {}).filter(([code]) => foundSet.has(code)),
  )

  const meta = {
    ...(payload?.meta ?? {}),
    requestedDrivers: requested,
    filteredDrivers: Array.from(foundSet),
    missingDrivers: missing,
  }

  const notes: string[] = Array.isArray(payload?.notes) ? [...payload.notes] : []
  if (missing.length) {
    notes.push(`Drivers not found in dataset: ${missing.join(', ')}`)
  }
  if (!foundSet.size) {
    notes.push('No drivers matched the current filter.')
  }

  return {
    ...payload,
    meta,
    drivers: filteredDrivers,
    laps: filteredLaps,
    corners: filteredCorners,
    notes,
  }
}

export async function GET(request: Request, { params }: Params) {
  const { year, round, session } = params
  const sessionPath = resolveSessionPath(year, round, session.toUpperCase())
  const url = new URL(request.url)
  const driversFilter = normalizeDriverCodes(url.searchParams.get('drivers'))

  try {
    if (isDatabaseEnabled()) {
      const sql = getDb()
      const sessionRows = await sql`select * from sessions where year=${Number(year)} and round_slug=${round} and session_code=${session.toUpperCase()} limit 1` as SessionRow[]
      if (!sessionRows.length) {
        throw new Error('Session not found in database')
      }
      const s = sessionRows[0]
      const lapsQuery = driversFilter.length
        ? sql`select driver_code, lap_number, stint, compound, tyre_life, lap_time_seconds, sector1_seconds, sector2_seconds, sector3_seconds, track_status, flags, is_valid from laps where session_id=${s.id} and driver_code = any(${driversFilter})`
        : sql`select driver_code, lap_number, stint, compound, tyre_life, lap_time_seconds, sector1_seconds, sector2_seconds, sector3_seconds, track_status, flags, is_valid from laps where session_id=${s.id}`

      const laps = (await lapsQuery) as LapRow[]
      const driverCodes = Array.from(new Set(laps.map(l => (l.driver_code || '').toUpperCase()).filter(Boolean)))
      const driverRows = driverCodes.length
        ? (await sql`select code, team, number from drivers where code = any(${driverCodes})`) as DriverRow[]
        : []

      const drivers = Object.fromEntries(
        driverRows.map(d => [d.code.toUpperCase(), { code: d.code.toUpperCase(), team: d.team, number: d.number, defaultCompound: null }])
      )

      const lapsPayload = laps.map(l => ({
        driver: (l.driver_code || '').toUpperCase(),
        lapNumber: l.lap_number ?? null,
        stint: l.stint ?? null,
        compound: l.compound ?? null,
        tyreLife: l.tyre_life ?? null,
        lapTimeSeconds: l.lap_time_seconds ?? null,
        sectorTimesSeconds: [l.sector1_seconds ?? null, l.sector2_seconds ?? null, l.sector3_seconds ?? null],
        isPersonalBest: false,
        trackStatus: l.track_status ?? null,
        hasData: true,
        flags: Array.isArray(l.flags) ? l.flags : [],
        isValid: typeof l.is_valid === 'boolean' ? l.is_valid : undefined,
      }))

      const payload = {
        meta: {
          year: s.year,
          round: s.round_slug,
          session: s.session_code,
          generatedAt: s.generated_at ?? undefined,
          requestedDrivers: driversFilter.length ? driversFilter : null,
          event: {
            name: s.event_name,
            country: s.country,
            officialName: s.official_name,
          },
          availableDrivers: driverCodes,
          // total/valid/outlier counts are optional unless precomputed in DB
        },
        drivers,
        laps: lapsPayload,
        corners: Object.fromEntries(driverCodes.map(c => [c, [] as unknown[]])),
        notes: [] as string[],
      }

      return NextResponse.json(payload)
    }

    const raw = await fs.readFile(sessionPath, 'utf8')
    const payload = JSON.parse(raw)
    const filtered = filterDrivers(payload, driversFilter)
    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Session data not found',
        details: error instanceof Error ? error.message : String(error),
        params,
      },
      { status: 404 },
    )
  }
}
