import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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
