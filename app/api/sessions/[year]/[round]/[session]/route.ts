import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { isDatabaseEnabled } from '../../../../../../lib/db'
import { loadSessionPayloadFromDatabase } from '../../../../../../lib/databaseData'
import { isRemoteDataEnabled, fetchFromRemote } from '../../../../../../lib/remoteData'
import { getCalendarForYear } from '../../../../../../lib/calendarData'
import {
  describeSessionEvent,
  sessionMatchesRound,
} from '../../../../../../lib/sessionEventGuard'

// Mark this route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic'

function assertPayloadMatchesRound(
  year: string,
  round: string,
  payload: unknown
): NextResponse | null {
  const calendar = getCalendarForYear(Number(year))
  const calendarRound = calendar?.rounds.find((entry) => entry.id === round)
  if (!calendarRound || !payload || typeof payload !== 'object') {
    return null
  }

  const session = payload as {
    meta?: {
      status?: string
      event?: { name?: string | null; officialName?: string | null }
    }
  }

  if (session.meta?.status && session.meta.status !== 'ok') {
    return NextResponse.json(
      {
        error: 'Session data unavailable',
        details: `Session status is "${session.meta.status}" for ${year}/${round}. Re-fetch this session.`,
        params: { year, round },
      },
      { status: 409 }
    )
  }

  if (
    !sessionMatchesRound(session, {
      id: calendarRound.id,
      name: calendarRound.name,
      location: calendarRound.location,
    })
  ) {
    return NextResponse.json(
      {
        error: 'Session event mismatch',
        details:
          `Remote/file payload for ${year}/${round} is "${describeSessionEvent(session)}" ` +
          `but the calendar expects "${calendarRound.name}". ` +
          `This is usually a stale jason-server / DB copy (FastF1 slug mismatch). ` +
          `Copy the fixed session JSON from this repo onto the data host and re-import.`,
        params: { year, round, expected: calendarRound.name, actual: describeSessionEvent(session) },
      },
      { status: 409 }
    )
  }

  return null
}

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

export async function GET(request: Request, { params }: Params) {
  const { year, round, session } = params
  const sessionPath = resolveSessionPath(year, round, session.toUpperCase())
  const isVercelRuntime = process.env.VERCEL === '1'
  const url = new URL(request.url)
  const driversFilter = normalizeDriverCodes(url.searchParams.get('drivers'))

  const startTime = Date.now()

  try {
    // Remote data server (e.g. jason-server via Tailscale Funnel): Vercel proxies to your server
    if (isRemoteDataEnabled()) {
      const remotePath = `/api/sessions/${year}/${round}/${session.toUpperCase()}${driversFilter.length ? `?drivers=${driversFilter.join(',')}` : ''}`
      const payload = await fetchFromRemote<unknown>(remotePath)
      const mismatch = assertPayloadMatchesRound(year, round, payload)
      if (mismatch) {
        console.error(`[API] Rejected mismatched remote session ${year}/${round}/${session}`)
        return mismatch
      }
      const elapsed = Date.now() - startTime
      const driverCount = typeof payload === 'object' && payload !== null && 'drivers' in payload
        ? Object.keys((payload as { drivers?: Record<string, unknown> }).drivers ?? {}).length
        : 0
      console.log(`[API] Proxied session ${year}/${round}/${session} from remote in ${elapsed}ms (${driverCount} drivers)`)
      return NextResponse.json(payload)
    }

    // Database (Neon, Supabase, etc.)
    if (isDatabaseEnabled()) {
      const payload = await loadSessionPayloadFromDatabase({
        year: Number(year),
        round,
        session: session.toUpperCase(),
        driversFilter,
      })
      const mismatch = assertPayloadMatchesRound(year, round, payload)
      if (mismatch) {
        console.error(`[API] Rejected mismatched database session ${year}/${round}/${session}`)
        return mismatch
      }
      const elapsed = Date.now() - startTime
      const driverCount = Object.keys(payload.drivers ?? {}).length
      const lapCount = payload.laps?.length ?? 0
      console.log(`[API] Loaded session ${year}/${round}/${session} from database in ${elapsed}ms (${driverCount} drivers, ${lapCount} laps)`)
      return NextResponse.json(payload)
    }

    // File-based loading (fallback for local development)
    if (isVercelRuntime) {
      return NextResponse.json(
        {
          error: 'File data source disabled on Vercel',
          details: 'Configure DATA_SOURCE=database with DATABASE_URL (or SUPABASE_DB_URL), or set REMOTE_DATA_URL.',
          params: { year, round, session },
        },
        { status: 503 }
      )
    }

    try {
      const raw = await readFileWithTimeout(sessionPath, 30000)
      const payload = JSON.parse(raw)
      const mismatch = assertPayloadMatchesRound(year, round, payload)
      if (mismatch) {
        console.error(`[API] Rejected mismatched file session ${year}/${round}/${session}`)
        return mismatch
      }
      const filtered = filterDrivers(payload, driversFilter)
      
      const elapsed = Date.now() - startTime
      const driverCount = Object.keys(filtered.drivers ?? {}).length
      const lapCount = filtered.laps?.length ?? 0
      console.log(`[API] Loaded session ${year}/${round}/${session} from file in ${elapsed}ms (${driverCount} drivers, ${lapCount} laps)`)
      
      return NextResponse.json(filtered)
    } catch (fileError) {
      // File not found - suggest using database
      if (fileError instanceof Error && (fileError.message.includes('ENOENT') || fileError.message.includes('not found'))) {
        return NextResponse.json(
          {
            error: 'Session data not found',
            details: 'Session data not available. Set REMOTE_DATA_URL (your jason-server URL), or DATA_SOURCE=database and DATABASE_URL.',
            params: { year, round, session },
          },
          { status: 404 },
        )
      }
      throw fileError
    }
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
