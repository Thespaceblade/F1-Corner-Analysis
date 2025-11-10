import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getDb, isDatabaseEnabled, DriverRow, LapRow, SessionRow } from '../../../../../../lib/db'

// Mark this route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic'

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

// Helper function to read file with timeout
async function readFileWithTimeout(filePath: string, timeoutMs: number = 30000): Promise<string> {
  return Promise.race([
    fs.readFile(filePath, 'utf8'),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error(`File read timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ])
}

// Helper function to load corners from JSON file
async function loadCornersFromFile(sessionPath: string, driverCodes: string[]): Promise<Record<string, any[]>> {
  try {
    const raw = await readFileWithTimeout(sessionPath, 30000)
    const jsonData = JSON.parse(raw)
    const corners = jsonData?.corners ?? {}
    
    // If no driver codes provided, return all corners (for file-based loading when no filter)
    // If driver codes are provided, filter corners to match those drivers
    if (driverCodes.length === 0) {
      return corners
    }
    
    // Filter corners to only include requested drivers
    const filteredCorners: Record<string, any[]> = {}
    for (const code of driverCodes) {
      if (corners[code]) {
        filteredCorners[code] = corners[code]
      } else {
        // Include driver even if no corners found (empty array) to maintain consistency
        filteredCorners[code] = []
      }
    }
    return filteredCorners
  } catch (error) {
    console.warn(`Failed to load corners from file ${sessionPath}:`, error instanceof Error ? error.message : String(error))
    // Return empty corners object if file can't be read
    // If we have driver codes, return empty arrays for each driver
    return driverCodes.length > 0 
      ? Object.fromEntries(driverCodes.map(c => [c, []]))
      : {}
  }
}

export async function GET(request: Request, { params }: Params) {
  const { year, round, session } = params
  const sessionPath = resolveSessionPath(year, round, session.toUpperCase())
  const url = new URL(request.url)
  const driversFilter = normalizeDriverCodes(url.searchParams.get('drivers'))

  const startTime = Date.now()

  try {
    if (isDatabaseEnabled()) {
      const sql = getDb()
      const sessionRows = await sql`select * from sessions where year=${Number(year)} and round_slug=${round} and session_code=${session.toUpperCase()} limit 1` as SessionRow[]
      if (!sessionRows.length) {
        throw new Error('Session not found in database')
      }
      const s = sessionRows[0]
      
      // Query laps - if driversFilter is empty, get all laps
      const lapsQuery = driversFilter.length
        ? sql`select driver_code, lap_number, stint, compound, tyre_life, lap_time_seconds, sector1_seconds, sector2_seconds, sector3_seconds, track_status, flags, is_valid from laps where session_id=${s.id} and driver_code = any(${driversFilter})`
        : sql`select driver_code, lap_number, stint, compound, tyre_life, lap_time_seconds, sector1_seconds, sector2_seconds, sector3_seconds, track_status, flags, is_valid from laps where session_id=${s.id}`

      const laps = (await lapsQuery) as LapRow[]
      const driverCodes = Array.from(new Set(laps.map(l => (l.driver_code || '').toUpperCase()).filter(Boolean)))
      
      // If no drivers found, return empty payload
      if (driverCodes.length === 0) {
        return NextResponse.json({
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
            availableDrivers: [],
          },
          drivers: {},
          laps: [],
          corners: {},
          notes: driversFilter.length ? [`No drivers found matching: ${driversFilter.join(', ')}`] : [],
        })
      }
      
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

      // Load corners from JSON file (database doesn't store corners)
      // If no driver filter was requested, load ALL corners from the file
      // If a driver filter was requested, filter corners to match the requested drivers (not just drivers with laps)
      const cornersToLoad = driversFilter.length > 0 ? driversFilter : []
      const allCorners = await loadCornersFromFile(sessionPath, cornersToLoad)
      
      // If we have a driver filter, we already filtered in loadCornersFromFile
      // If no filter, we have all corners, but we should still filter to only drivers that have laps
      // (to maintain consistency between laps and corners)
      const corners = driversFilter.length > 0
        ? allCorners
        : Object.fromEntries(
            Object.entries(allCorners).filter(([driverCode]) => driverCodes.includes(driverCode))
          )

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
        corners,
        notes: [] as string[],
      }

      const elapsed = Date.now() - startTime
      console.log(`[API] Loaded session ${year}/${round}/${session} from database in ${elapsed}ms (${driverCodes.length} drivers, ${laps.length} laps)`)
      
      return NextResponse.json(payload)
    }

    // File-based loading
    const raw = await readFileWithTimeout(sessionPath, 30000)
    const payload = JSON.parse(raw)
    const filtered = filterDrivers(payload, driversFilter)
    
    const elapsed = Date.now() - startTime
    const driverCount = Object.keys(filtered.drivers ?? {}).length
    const lapCount = filtered.laps?.length ?? 0
    console.log(`[API] Loaded session ${year}/${round}/${session} from file in ${elapsed}ms (${driverCount} drivers, ${lapCount} laps)`)
    
    return NextResponse.json(filtered)
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[API] Error loading session ${year}/${round}/${session} after ${elapsed}ms:`, errorMessage)
    
    // Check if it's a file not found error
    if (error instanceof Error && (error.message.includes('ENOENT') || error.message.includes('not found'))) {
      return NextResponse.json(
        {
          error: 'Session data not found',
          details: `Session file not found: ${sessionPath}`,
          params: { year, round, session },
        },
        { status: 404 },
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to load session data',
        details: errorMessage,
        params: { year, round, session },
      },
      { status: 500 },
    )
  }
}
