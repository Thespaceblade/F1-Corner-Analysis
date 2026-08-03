/**
 * Query executor - retrieves data from database and JSON files
 */

import { promises as fs } from 'fs'
import path from 'path'
import { isDatabaseEnabled, queryDb } from '../db'
import { loadSessionPayloadFromDatabase } from '../databaseData'
import type { SessionPayload } from '../sessionDataClient'
import type {
  QueryParameters,
  QueryResult,
  CornerPerformanceData,
  DriverCornerStats,
} from './types'

const SESSION_FALLBACK_ORDER = ['Q', 'R', 'SQ', 'S', 'FP3', 'FP2', 'FP1'] as const

function normalizeDriverFilter(driverCodes?: string[]): string[] {
  if (!driverCodes?.length) return []
  return Array.from(
    new Set(driverCodes.map((code) => code.trim().toUpperCase()).filter(Boolean))
  )
}

function filterSessionPayload(
  payload: SessionPayload,
  driverCodes?: string[]
): SessionPayload {
  const requested = normalizeDriverFilter(driverCodes)
  if (!requested.length) return payload

  const allDrivers = Object.keys(payload.drivers ?? {})
  const foundSet = new Set(allDrivers.filter((code) => requested.includes(code)))
  const missing = requested.filter((code) => !foundSet.has(code))

  const notes: string[] = Array.isArray(payload.notes) ? [...payload.notes] : []
  if (missing.length) {
    notes.push(`Drivers not found in dataset: ${missing.join(', ')}`)
  }

  return {
    ...payload,
    meta: {
      ...payload.meta,
      requestedDrivers: requested,
      filteredDrivers: Array.from(foundSet),
      missingDrivers: missing,
    },
    drivers: Object.fromEntries(
      Object.entries(payload.drivers ?? {}).filter(([code]) => foundSet.has(code))
    ),
    laps: (payload.laps ?? []).filter((lap) => foundSet.has(lap.driver)),
    corners: Object.fromEntries(
      Object.entries(payload.corners ?? {}).filter(([code]) => foundSet.has(code))
    ),
    notes,
  }
}

async function loadSessionFromFile(
  roundSlug: string,
  year: number,
  sessionCode: string
): Promise<SessionPayload | null> {
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

  try {
    const raw = await fs.readFile(sessionPath, 'utf8')
    return JSON.parse(raw) as SessionPayload
  } catch {
    return null
  }
}

async function resolveAvailableSessionCodes(
  roundSlug: string,
  year: number
): Promise<string[]> {
  const available = await getAvailableSessions(roundSlug, year)
  return available.map((entry) => entry.session.toUpperCase())
}

/**
 * Resolve the session code strictly.
 * Only substitutes when the preferred session does not exist at all
 * (e.g. Miami 2026 has R but no Q). Never swaps sessions because a
 * driver is missing from an existing session.
 */
async function resolveSessionCode(
  roundSlug: string,
  year: number,
  preferredSession?: string
): Promise<{ session: string; substitutedFrom?: string }> {
  const preferred = (preferredSession || 'Q').toUpperCase()
  const available = await resolveAvailableSessionCodes(roundSlug, year)

  if (!available.length) {
    return { session: preferred }
  }

  if (available.includes(preferred)) {
    return { session: preferred }
  }

  for (const code of SESSION_FALLBACK_ORDER) {
    if (available.includes(code)) {
      return { session: code, substitutedFrom: preferred }
    }
  }

  return { session: available[0], substitutedFrom: preferred }
}

/**
 * Get session data for a specific session
 */
export async function getSessionData(
  roundSlug: string,
  year: number,
  sessionCode: string,
  driverCodes?: string[]
): Promise<SessionPayload> {
  try {
    const { session: resolvedSession, substitutedFrom } = await resolveSessionCode(
      roundSlug,
      year,
      sessionCode
    )
    const driversFilter = normalizeDriverFilter(driverCodes)

    let payload: SessionPayload | null = null

    if (isDatabaseEnabled()) {
      try {
        payload = await loadSessionPayloadFromDatabase({
          year,
          round: roundSlug,
          session: resolvedSession,
          driversFilter,
        })
      } catch (dbError) {
        // Fall through to file-backed data in local/dev when DB misses a session.
        if (!(dbError instanceof Error) || !dbError.message.includes('Session not found')) {
          throw dbError
        }
      }
    }

    if (!payload) {
      payload = await loadSessionFromFile(roundSlug, year, resolvedSession)
    }

    if (!payload) {
      throw new Error(
        `Session not found for ${year}/${roundSlug}/${resolvedSession}`
      )
    }

    const filtered = filterSessionPayload(payload, driversFilter)
    const notes = Array.isArray(filtered.notes) ? [...filtered.notes] : []

    if (substitutedFrom) {
      notes.unshift(
        `Session ${substitutedFrom} is not available for ${year}/${roundSlug}; using ${resolvedSession} instead.`
      )
    }

    // Be explicit when requested drivers have no corner telemetry in THIS session.
    if (driversFilter.length) {
      const missingCorners = driversFilter.filter(
        (code) => !(filtered.corners?.[code] || []).length
      )
      if (missingCorners.length) {
        notes.push(
          `No corner telemetry for ${missingCorners.join(', ')} in ${year}/${roundSlug}/${resolvedSession}.`
        )
      }
    }

    return {
      ...filtered,
      notes,
    }
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
  driverCode?: string,
  preloadedSession?: SessionPayload
): Promise<CornerPerformanceData[]> {
  const sessionData =
    preloadedSession ??
    (await getSessionData(
      roundSlug,
      year,
      sessionCode,
      driverCode ? [driverCode] : undefined
    ))

  const results: CornerPerformanceData[] = []

  // Extract corner data from session payload
  if (sessionData.corners) {
    const driversToProcess = driverCode
      ? [driverCode.toUpperCase()]
      : Object.keys(sessionData.corners)

    for (const driver of driversToProcess) {
      const driverCorners = sessionData.corners[driver] || []
      // Use cornerNumber if available, otherwise fall back to detectedCornerIndex
      const cornerData = driverCorners.filter(
        (c: any) =>
          c.cornerNumber === cornerNumber ||
          (c.cornerNumber === undefined && c.detectedCornerIndex === cornerNumber)
      )

      for (const corner of cornerData) {
        // Use cornerNumber if available, otherwise use detectedCornerIndex
        const num = corner.cornerNumber ?? corner.detectedCornerIndex
        if (num === undefined || num === null) {
          continue // Skip corners without a number
        }

        results.push({
          cornerNumber: num,
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
  cornerNumber?: number,
  preloadedSession?: SessionPayload
): Promise<DriverCornerStats[]> {
  const normalizedDriver = driverCode.toUpperCase()
  const sessionData =
    preloadedSession ??
    (await getSessionData(roundSlug, year, sessionCode, [normalizedDriver]))

  const results: DriverCornerStats[] = []

  if (sessionData.corners && sessionData.corners[normalizedDriver]) {
    const driverCorners = sessionData.corners[normalizedDriver] || []

    // Use cornerNumber if available, otherwise fall back to detectedCornerIndex
    const cornersToProcess = cornerNumber
      ? driverCorners.filter(
          (c: any) =>
            c.cornerNumber === cornerNumber ||
            (c.cornerNumber === undefined && c.detectedCornerIndex === cornerNumber)
        )
      : driverCorners

    // Group by corner number (use cornerNumber if available, otherwise detectedCornerIndex)
    const cornersByNumber: Record<number, any[]> = {}
    for (const corner of cornersToProcess) {
      // Use cornerNumber if available, otherwise fall back to detectedCornerIndex
      const num = corner.cornerNumber ?? corner.detectedCornerIndex
      if (num === undefined || num === null) {
        continue // Skip corners without a number
      }
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

      // Determine corner type (use most common type, or first non-unknown type)
      const cornerTypes = corners
        .map((c) => c.cornerType)
        .filter(
          (t): t is 'slow' | 'medium' | 'fast' =>
            t !== undefined && t !== 'unknown'
        )
      const cornerType =
        cornerTypes.length > 0
          ? cornerTypes[0] // Use first non-unknown type (usually consistent)
          : corners[0]?.cornerType || 'unknown'

      results.push({
        driverCode: normalizedDriver,
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
        cornerType: cornerType !== 'unknown' ? cornerType : undefined,
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
  cornerNumber?: number,
  preloadedSession?: SessionPayload
): Promise<{
  driver1: DriverCornerStats[]
  driver2: DriverCornerStats[]
  deltas: Array<{
    cornerNumber: number
    timeDelta: number | null
    speedDelta: number
    cornerType?: 'slow' | 'medium' | 'fast'
  }>
}> {
  const sessionData =
    preloadedSession ??
    (await getSessionData(roundSlug, year, sessionCode, [driverCode1, driverCode2]))

  const [stats1, stats2] = await Promise.all([
    getDriverCornerStats(driverCode1, roundSlug, year, sessionCode, cornerNumber, sessionData),
    getDriverCornerStats(driverCode2, roundSlug, year, sessionCode, cornerNumber, sessionData),
  ])

  // Calculate deltas
  const deltas: Array<{
    cornerNumber: number
    timeDelta: number | null
    speedDelta: number
    cornerType?: 'slow' | 'medium' | 'fast'
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

      // Use corner type from either stat (they should match)
      // Filter out 'unknown' type
      const cornerType =
        stat1.cornerType && stat1.cornerType !== 'unknown'
          ? stat1.cornerType
          : stat2.cornerType && stat2.cornerType !== 'unknown'
            ? stat2.cornerType
            : undefined

      deltas.push({
        cornerNumber: cornerNum,
        timeDelta,
        speedDelta,
        cornerType,
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
      const rows = await queryDb<{ session_code: string; event_name: string | null; country: string | null }>(
        `SELECT DISTINCT session_code, event_name, country
         FROM sessions
         WHERE year = $1 AND round_slug = $2
         ORDER BY session_code`,
        [year, roundSlug]
      )
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
          const raw = await fs.readFile(sessionJson, 'utf-8')
          const payload = JSON.parse(raw) as {
            meta?: { status?: string }
            drivers?: Record<string, unknown>
            raceResults?: unknown[]
            qualifyingResults?: unknown[]
            laps?: unknown[]
          }
          const status = payload.meta?.status
          if (status && status !== 'ok') continue
          const driverCount = payload.drivers ? Object.keys(payload.drivers).length : 0
          const resultCount =
            (payload.raceResults?.length ?? 0) + (payload.qualifyingResults?.length ?? 0)
          const lapCount = payload.laps?.length ?? 0
          if (driverCount === 0 && resultCount === 0 && lapCount === 0) continue
          sessionList.push({ session: sessionDir.name })
        } catch {
          // Session JSON doesn't exist or is unreadable, skip
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
  _context?: any
): Promise<QueryResult> {
  // Default to current year and most common session if not specified
  const year = parameters.year || new Date().getFullYear()
  const preferredSession = parameters.session || 'Q'
  const track = parameters.track || parameters.roundSlug

  // SESSION_INFO queries don't always require a track
  if (!track && intent !== 'SESSION_INFO') {
    throw new Error('Track/round slug is required')
  }

  // Soft-handle intents that are classified but not yet implemented
  if (
    intent === 'STATISTICAL' ||
    intent === 'TREND_ANALYSIS' ||
    intent === 'TYRE_ANALYSIS'
  ) {
    if (!track) {
      throw new Error('Track/round slug is required')
    }

    // Fall back to the closest supported analysis so users still get useful data.
    const fallbackIntent =
      parameters.driverCodes && parameters.driverCodes.length >= 2
        ? 'COMPARISON'
        : parameters.driverCode
          ? 'DRIVER_PERFORMANCE'
          : parameters.cornerNumber
            ? 'CORNER_PERFORMANCE'
            : 'SESSION_INFO'

    return executeQuery(fallbackIntent, parameters, _context)
  }

  switch (intent) {
    case 'CORNER_PERFORMANCE': {
      if (!parameters.cornerNumber) {
        throw new Error('Corner number is required for corner performance queries')
      }
      if (!track) {
        throw new Error('Track/round slug is required for corner performance queries')
      }
      const sessionData = await getSessionData(
        track,
        year,
        preferredSession,
        parameters.driverCode ? [parameters.driverCode] : undefined
      )
      const session = sessionData.meta.session || preferredSession
      const data = await getCornerPerformance(
        parameters.cornerNumber,
        track,
        year,
        session,
        parameters.driverCode,
        sessionData
      )
      return {
        type: 'CORNER_PERFORMANCE',
        data,
        metadata: {
          track,
          year,
          session,
          timestamp: new Date().toISOString(),
          notes: sessionData.notes,
          laps: sessionData.laps || [],
          qualifyingBoundaries: sessionData.qualifyingBoundaries,
        },
      }
    }

    case 'DRIVER_PERFORMANCE': {
      if (!parameters.driverCode) {
        throw new Error('Driver code is required for driver performance queries')
      }
      if (!track) {
        throw new Error('Track/round slug is required for driver performance queries')
      }
      const sessionData = await getSessionData(track, year, preferredSession, [
        parameters.driverCode,
      ])
      const session = sessionData.meta.session || preferredSession
      const data = await getDriverCornerStats(
        parameters.driverCode,
        track,
        year,
        session,
        parameters.cornerNumber,
        sessionData
      )
      return {
        type: 'DRIVER_PERFORMANCE',
        data,
        metadata: {
          track,
          year,
          session,
          timestamp: new Date().toISOString(),
          notes: sessionData.notes,
          laps: sessionData.laps || [],
          qualifyingBoundaries: sessionData.qualifyingBoundaries,
        },
      }
    }

    case 'COMPARISON': {
      if (!parameters.driverCodes || parameters.driverCodes.length < 2) {
        throw new Error('At least two driver codes are required for comparison')
      }
      if (!track) {
        throw new Error('Track/round slug is required for comparison queries')
      }
      const sessionData = await getSessionData(
        track,
        year,
        preferredSession,
        parameters.driverCodes
      )
      const session = sessionData.meta.session || preferredSession
      const data = await compareDrivers(
        parameters.driverCodes[0],
        parameters.driverCodes[1],
        track,
        year,
        session,
        parameters.cornerNumber,
        sessionData
      )
      return {
        type: 'COMPARISON',
        data,
        metadata: {
          track,
          year,
          session,
          timestamp: new Date().toISOString(),
          notes: sessionData.notes,
          laps: sessionData.laps || [],
          qualifyingBoundaries: sessionData.qualifyingBoundaries,
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
