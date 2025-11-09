/**
 * Query executor - retrieves data from database and JSON files
 */

import { promises as fs } from 'fs'
import path from 'path'
import { getDb, isDatabaseEnabled, DriverRow, LapRow, SessionRow } from '../db'
import type {
  QueryParameters,
  QueryResult,
  CornerPerformanceData,
  DriverCornerStats,
} from './types'

/**
 * Normalize driver codes
 */
function normalizeDriverCodes(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
}

/**
 * Get session data for a specific session
 */
export async function getSessionData(
  roundSlug: string,
  year: number,
  sessionCode: string,
  driverCodes?: string[]
): Promise<any> {
  try {
    const sessionPath = path.join(
      process.cwd(),
      'public',
      'data',
      'sessions',
      String(year),
      roundSlug,
      sessionCode.toUpperCase(),
      'session.json'
    )

    if (isDatabaseEnabled()) {
      const sql = getDb()
      const sessionRows = await sql`
        SELECT * FROM sessions 
        WHERE year = ${year} 
        AND round_slug = ${roundSlug} 
        AND session_code = ${sessionCode.toUpperCase()} 
        LIMIT 1
      ` as SessionRow[]

      if (!sessionRows.length) {
        throw new Error('Session not found in database')
      }

      const s = sessionRows[0]
      const driversFilter = driverCodes || []
      const lapsQuery = driversFilter.length
        ? sql`
          SELECT driver_code, lap_number, stint, compound, tyre_life, 
                 lap_time_seconds, sector1_seconds, sector2_seconds, 
                 sector3_seconds, track_status, flags, is_valid 
          FROM laps 
          WHERE session_id = ${s.id} 
          AND driver_code = ANY(${driversFilter})
        `
        : sql`
          SELECT driver_code, lap_number, stint, compound, tyre_life, 
                 lap_time_seconds, sector1_seconds, sector2_seconds, 
                 sector3_seconds, track_status, flags, is_valid 
          FROM laps 
          WHERE session_id = ${s.id}
        `

      const laps = (await lapsQuery) as LapRow[]
      const driverCodesList = Array.from(
        new Set(laps.map((l) => (l.driver_code || '').toUpperCase()).filter(Boolean))
      )
      const driverRows = driverCodesList.length
        ? ((await sql`
            SELECT code, team, number 
            FROM drivers 
            WHERE code = ANY(${driverCodesList})
          `) as DriverRow[])
        : []

      const drivers = Object.fromEntries(
        driverRows.map((d) => [
          d.code.toUpperCase(),
          {
            code: d.code.toUpperCase(),
            team: d.team,
            number: d.number,
            defaultCompound: null,
          },
        ])
      )

      const lapsPayload = laps.map((l) => ({
        driver: (l.driver_code || '').toUpperCase(),
        lapNumber: l.lap_number ?? null,
        stint: l.stint ?? null,
        compound: l.compound ?? null,
        tyreLife: l.tyre_life ?? null,
        lapTimeSeconds: l.lap_time_seconds ?? null,
        sectorTimesSeconds: [
          l.sector1_seconds ?? null,
          l.sector2_seconds ?? null,
          l.sector3_seconds ?? null,
        ],
        isPersonalBest: false,
        trackStatus: l.track_status ?? null,
        hasData: true,
        flags: Array.isArray(l.flags) ? l.flags : [],
        isValid: typeof l.is_valid === 'boolean' ? l.is_valid : undefined,
      }))

      return {
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
          availableDrivers: driverCodesList,
        },
        drivers,
        laps: lapsPayload,
        corners: Object.fromEntries(
          driverCodesList.map((c) => [c, [] as unknown[]])
        ),
        notes: [] as string[],
      }
    }

    // Fallback to JSON file
    const raw = await fs.readFile(sessionPath, 'utf8')
    const payload = JSON.parse(raw)

    // Filter drivers if specified
    if (driverCodes && driverCodes.length > 0) {
      const allDrivers = Object.keys(payload?.drivers ?? {})
      const requested = driverCodes
      const foundSet = new Set(allDrivers.filter((code) => requested.includes(code)))
      const missing = requested.filter((code) => !foundSet.has(code))

      const filteredDrivers = Object.fromEntries(
        Object.entries(payload?.drivers ?? {}).filter(([code]) =>
          foundSet.has(code)
        )
      )

      const filteredLaps = (payload?.laps ?? []).filter((lap: any) =>
        foundSet.has(lap.driver)
      )

      const filteredCorners = Object.fromEntries(
        Object.entries(payload?.corners ?? {}).filter(([code]) =>
          foundSet.has(code)
        )
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

      return {
        ...payload,
        meta,
        drivers: filteredDrivers,
        laps: filteredLaps,
        corners: filteredCorners,
        notes,
      }
    }

    return payload
  } catch (error) {
    console.error('Error loading session data:', error)
    throw new Error(
      `Failed to load session data: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Get corner performance data for a specific corner
 */
export async function getCornerPerformance(
  cornerNumber: number,
  roundSlug: string,
  year: number,
  sessionCode: string,
  driverCode?: string
): Promise<CornerPerformanceData[]> {
  const sessionData = await getSessionData(
    roundSlug,
    year,
    sessionCode,
    driverCode ? [driverCode] : undefined
  )

  const results: CornerPerformanceData[] = []

  // Extract corner data from session payload
  if (sessionData.corners) {
    const driversToProcess = driverCode
      ? [driverCode]
      : Object.keys(sessionData.corners)

    for (const driver of driversToProcess) {
      const driverCorners = sessionData.corners[driver] || []
      const cornerData = driverCorners.filter(
        (c: any) => c.cornerNumber === cornerNumber
      )

      for (const corner of cornerData) {
        results.push({
          cornerNumber: corner.cornerNumber,
          driverCode: driver,
          cornerTime: corner.cornerTime,
          entrySpeed: corner.entrySpeed,
          apexSpeed: corner.apexSpeed,
          exitSpeed: corner.exitSpeed,
          lapNumber: corner.lapNumber,
          cornerType: corner.cornerType || 'unknown',
        })
      }
    }
  }

  return results
}

/**
 * Get driver corner statistics
 */
export async function getDriverCornerStats(
  driverCode: string,
  roundSlug: string,
  year: number,
  sessionCode: string,
  cornerNumber?: number
): Promise<DriverCornerStats[]> {
  const sessionData = await getSessionData(
    roundSlug,
    year,
    sessionCode,
    [driverCode]
  )

  const results: DriverCornerStats[] = []

  if (sessionData.corners && sessionData.corners[driverCode]) {
    const driverCorners = sessionData.corners[driverCode] || []
    const cornersToProcess = cornerNumber
      ? driverCorners.filter((c: any) => c.cornerNumber === cornerNumber)
      : driverCorners

    // Group by corner number
    const cornersByNumber: Record<number, any[]> = {}
    for (const corner of cornersToProcess) {
      const num = corner.cornerNumber
      if (!cornersByNumber[num]) {
        cornersByNumber[num] = []
      }
      cornersByNumber[num].push(corner)
    }

    // Calculate statistics for each corner
    for (const [cornerNumStr, corners] of Object.entries(cornersByNumber)) {
      const cornerNum = parseInt(cornerNumStr, 10)
      const validTimes = corners
        .map((c) => c.cornerTime)
        .filter((t): t is number => t !== null && !isNaN(t))

      const entrySpeeds = corners.map((c) => c.entrySpeed).filter((s) => s > 0)
      const apexSpeeds = corners.map((c) => c.apexSpeed).filter((s) => s > 0)
      const exitSpeeds = corners.map((c) => c.exitSpeed).filter((s) => s > 0)

      results.push({
        driverCode,
        cornerNumber: cornerNum,
        avgTime:
          validTimes.length > 0
            ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
            : null,
        bestTime: validTimes.length > 0 ? Math.min(...validTimes) : null,
        worstTime: validTimes.length > 0 ? Math.max(...validTimes) : null,
        avgEntrySpeed:
          entrySpeeds.length > 0
            ? entrySpeeds.reduce((a, b) => a + b, 0) / entrySpeeds.length
            : 0,
        avgApexSpeed:
          apexSpeeds.length > 0
            ? apexSpeeds.reduce((a, b) => a + b, 0) / apexSpeeds.length
            : 0,
        avgExitSpeed:
          exitSpeeds.length > 0
            ? exitSpeeds.reduce((a, b) => a + b, 0) / exitSpeeds.length
            : 0,
        sampleCount: corners.length,
      })
    }
  }

  return results
}

/**
 * Compare two drivers at a specific corner or overall
 */
export async function compareDrivers(
  driverCode1: string,
  driverCode2: string,
  roundSlug: string,
  year: number,
  sessionCode: string,
  cornerNumber?: number
): Promise<{
  driver1: DriverCornerStats[]
  driver2: DriverCornerStats[]
  deltas: Array<{
    cornerNumber: number
    timeDelta: number | null
    speedDelta: number
  }>
}> {
  const [stats1, stats2] = await Promise.all([
    getDriverCornerStats(driverCode1, roundSlug, year, sessionCode, cornerNumber),
    getDriverCornerStats(driverCode2, roundSlug, year, sessionCode, cornerNumber),
  ])

  // Calculate deltas
  const deltas: Array<{
    cornerNumber: number
    timeDelta: number | null
    speedDelta: number
  }> = []

  const stats1Map = new Map(stats1.map((s) => [s.cornerNumber, s]))
  const stats2Map = new Map(stats2.map((s) => [s.cornerNumber, s]))

  for (const [cornerNum, stat1] of stats1Map.entries()) {
    const stat2 = stats2Map.get(cornerNum)
    if (stat2) {
      const timeDelta =
        stat1.avgTime !== null && stat2.avgTime !== null
          ? stat1.avgTime - stat2.avgTime
          : null
      const speedDelta = stat1.avgApexSpeed - stat2.avgApexSpeed

      deltas.push({
        cornerNumber: cornerNum,
        timeDelta,
        speedDelta,
      })
    }
  }

  return {
    driver1: stats1,
    driver2: stats2,
    deltas,
  }
}

/**
 * Get available sessions for a track and year
 */
export async function getAvailableSessions(
  roundSlug: string,
  year: number
): Promise<Array<{ session: string; eventName?: string; country?: string }>> {
  if (isDatabaseEnabled()) {
    try {
      const sql = getDb()
      const rows = await sql`
        SELECT DISTINCT session_code, event_name, country
        FROM sessions
        WHERE year = ${year} AND round_slug = ${roundSlug}
        ORDER BY session_code
      `
      return rows.map((row: any) => ({
        session: row.session_code,
        eventName: row.event_name,
        country: row.country,
      }))
    } catch (error) {
      console.error('Error querying database:', error)
    }
  }

  // Fallback to file system
  try {
    const sessionsPath = path.join(
      process.cwd(),
      'public',
      'data',
      'sessions',
      String(year),
      roundSlug
    )
    const sessions = await fs.readdir(sessionsPath, { withFileTypes: true })
    const sessionList: Array<{ session: string }> = []

    for (const sessionDir of sessions) {
      if (sessionDir.isDirectory()) {
        const sessionJson = path.join(
          sessionsPath,
          sessionDir.name,
          'session.json'
        )
        try {
          await fs.access(sessionJson)
          sessionList.push({ session: sessionDir.name })
        } catch {
          // Session JSON doesn't exist, skip
        }
      }
    }

    return sessionList
  } catch (error) {
    console.error('Error reading sessions from file system:', error)
    return []
  }
}

/**
 * Execute a query based on intent and parameters
 */
export async function executeQuery(
  intent: string,
  parameters: QueryParameters,
  context?: any
): Promise<QueryResult> {
  // Default to current year and most common session if not specified
  const year = parameters.year || new Date().getFullYear()
  const session = parameters.session || 'Q'
  const track = parameters.track || parameters.roundSlug

  // SESSION_INFO queries don't always require a track
  if (!track && intent !== 'SESSION_INFO') {
    throw new Error('Track/round slug is required')
  }

  switch (intent) {
    case 'CORNER_PERFORMANCE': {
      if (!parameters.cornerNumber) {
        throw new Error('Corner number is required for corner performance queries')
      }
      const data = await getCornerPerformance(
        parameters.cornerNumber,
        track,
        year,
        session,
        parameters.driverCode
      )
      return {
        type: 'CORNER_PERFORMANCE',
        data,
        metadata: {
          track,
          year,
          session,
          timestamp: new Date().toISOString(),
        },
      }
    }

    case 'DRIVER_PERFORMANCE': {
      if (!parameters.driverCode) {
        throw new Error('Driver code is required for driver performance queries')
      }
      const data = await getDriverCornerStats(
        parameters.driverCode,
        track,
        year,
        session,
        parameters.cornerNumber
      )
      return {
        type: 'DRIVER_PERFORMANCE',
        data,
        metadata: {
          track,
          year,
          session,
          timestamp: new Date().toISOString(),
        },
      }
    }

    case 'COMPARISON': {
      if (!parameters.driverCodes || parameters.driverCodes.length < 2) {
        throw new Error('At least two driver codes are required for comparison')
      }
      const data = await compareDrivers(
        parameters.driverCodes[0],
        parameters.driverCodes[1],
        track,
        year,
        session,
        parameters.cornerNumber
      )
      return {
        type: 'COMPARISON',
        data,
        metadata: {
          track,
          year,
          session,
          timestamp: new Date().toISOString(),
        },
      }
    }

    case 'SESSION_INFO': {
      // If track is provided, get sessions for that track
      // If not, we might want to list all tracks (future enhancement)
      if (track) {
        const data = await getAvailableSessions(track, year)
        return {
          type: 'SESSION_INFO',
          data,
          metadata: {
            track,
            year,
            timestamp: new Date().toISOString(),
          },
        }
      } else {
        // Return message that track is needed
        return {
          type: 'SESSION_INFO',
          data: { message: 'Please specify a track to see available sessions' },
          metadata: {
            year,
            timestamp: new Date().toISOString(),
          },
        }
      }
    }

    default:
      throw new Error(`Unsupported query intent: ${intent}`)
  }
}

