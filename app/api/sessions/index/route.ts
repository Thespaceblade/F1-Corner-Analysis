import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getDb, isDatabaseEnabled } from '../../../../lib/db'
import { isRemoteDataEnabled, fetchFromRemote } from '../../../../lib/remoteData'

// Mark this route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic'

type SessionIndex = {
  years: Record<string, {
    rounds: Array<{ id: string, sessions: string[] }>
  }>
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function GET() {
  const index: SessionIndex = { years: {} }

  try {
    if (isRemoteDataEnabled()) {
      const payload = await fetchFromRemote<SessionIndex>('/api/sessions/index')
      return NextResponse.json(payload)
    }

    if (isDatabaseEnabled()) {
      const sql = getDb()
      const rows = await sql`select distinct year, round_slug, session_code from sessions order by year, round_slug, session_code`
      for (const row of rows as any[]) {
        const y = String(row.year)
        if (!index.years[y]) index.years[y] = { rounds: [] }
        const entry = index.years[y]
        let round = entry.rounds.find(r => r.id === row.round_slug)
        if (!round) {
          round = { id: row.round_slug as string, sessions: [] }
          entry.rounds.push(round)
        }
        if (!round.sessions.includes(row.session_code)) {
          round.sessions.push(row.session_code)
        }
      }
      // sort rounds by round number from calendar if available, otherwise alphabetically
      for (const y of Object.keys(index.years)) {
        // Try to load calendar data for this year to get round numbers
        const calendarPath = path.join(process.cwd(), 'public', 'data', `calendar${y}.json`)
        let roundNumberMap: Map<string, number> | null = null
        
        try {
          if (await exists(calendarPath)) {
            const calendarData = JSON.parse(await fs.readFile(calendarPath, 'utf-8'))
            roundNumberMap = new Map()
            if (calendarData?.rounds) {
              for (const round of calendarData.rounds) {
                if (round.id && typeof round.round === 'number') {
                  roundNumberMap.set(round.id, round.round)
                }
              }
            }
          }
        } catch {
          // Calendar file doesn't exist or is invalid, continue without it
        }
        
        // Sort rounds by round number if available, otherwise alphabetically
        index.years[y].rounds.sort((a, b) => {
          if (roundNumberMap) {
            const roundA = roundNumberMap.get(a.id)
            const roundB = roundNumberMap.get(b.id)
            if (roundA !== undefined && roundB !== undefined) {
              return roundA - roundB
            }
          }
          // Fallback to alphabetical
          return a.id.localeCompare(b.id)
        })
        
        index.years[y].rounds.forEach(r => r.sessions.sort())
      }
      return NextResponse.json(index)
    }

    const root = path.join(process.cwd(), 'public', 'data', 'sessions')
    
    // Check if directory exists before trying to read it
    try {
      await fs.access(root)
    } catch {
      // Directory doesn't exist, return empty index
      return NextResponse.json(index)
    }
    
    const years = await fs.readdir(root, { withFileTypes: true })
    for (const yearDir of years) {
      if (!yearDir.isDirectory()) continue
      const year = yearDir.name
      const yearPath = path.join(root, year)
      const rounds: Array<{ id: string, sessions: string[] }> = []

      const roundDirs = await fs.readdir(yearPath, { withFileTypes: true })
      for (const rd of roundDirs) {
        if (!rd.isDirectory()) continue
        const roundId = rd.name
        const roundPath = path.join(yearPath, roundId)
        const sessionDirs = await fs.readdir(roundPath, { withFileTypes: true })
        const sessions: string[] = []
        for (const sd of sessionDirs) {
          if (!sd.isDirectory()) continue
          const sessionCode = sd.name
          const sessionJson = path.join(roundPath, sessionCode, 'session.json')
          if (await exists(sessionJson)) {
            sessions.push(sessionCode)
          }
        }
        if (sessions.length) {
          rounds.push({ id: roundId, sessions: sessions.sort() })
        }
      }

      if (rounds.length) {
        // Try to load calendar data for this year to get round numbers
        const calendarPath = path.join(process.cwd(), 'public', 'data', `calendar${year}.json`)
        let roundNumberMap: Map<string, number> | null = null
        
        try {
          if (await exists(calendarPath)) {
            const calendarData = JSON.parse(await fs.readFile(calendarPath, 'utf-8'))
            roundNumberMap = new Map()
            if (calendarData?.rounds) {
              for (const round of calendarData.rounds) {
                if (round.id && typeof round.round === 'number') {
                  roundNumberMap.set(round.id, round.round)
                }
              }
            }
          }
        } catch {
          // Calendar file doesn't exist or is invalid, continue without it
        }
        
        // Sort rounds by round number if available, otherwise alphabetically
        rounds.sort((a, b) => {
          if (roundNumberMap) {
            const roundA = roundNumberMap.get(a.id)
            const roundB = roundNumberMap.get(b.id)
            if (roundA !== undefined && roundB !== undefined) {
              return roundA - roundB
            }
          }
          // Fallback to alphabetical
          return a.id.localeCompare(b.id)
        })
        
        index.years[year] = { rounds }
      }
    }

    return NextResponse.json(index)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scan sessions', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}


