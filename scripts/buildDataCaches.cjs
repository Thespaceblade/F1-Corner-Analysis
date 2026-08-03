#!/usr/bin/env node
/**
 * Rebuild deployable data caches from on-disk session JSON.
 *
 * Always rebuilds public/data/sessions-index.json.
 * Refreshes public/data/season-cache/{year}.json when DATA_CACHE_BASE_URL
 * (default http://127.0.0.1:3000) is reachable.
 *
 * Usage:
 *   npm run build:data-caches
 *   DATA_CACHE_BASE_URL=http://127.0.0.1:3010 npm run build:data-caches
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SESSIONS_ROOT = path.join(ROOT, 'public', 'data', 'sessions')
const INDEX_OUT = path.join(ROOT, 'public', 'data', 'sessions-index.json')
const SEASON_CACHE_DIR = path.join(ROOT, 'public', 'data', 'season-cache')
const YEARS = [2025, 2026]

function buildSessionsIndex() {
  const index = { years: {} }

  if (!fs.existsSync(SESSIONS_ROOT)) {
    console.warn('[buildDataCaches] No public/data/sessions directory — writing empty index')
    fs.writeFileSync(INDEX_OUT, JSON.stringify(index, null, 2) + '\n')
    return index
  }

  for (const year of fs.readdirSync(SESSIONS_ROOT).sort()) {
    const yearPath = path.join(SESSIONS_ROOT, year)
    if (!fs.statSync(yearPath).isDirectory()) continue

    const roundNumberMap = new Map()
    const calendarPath = path.join(ROOT, 'public', 'data', `calendar${year}.json`)
    if (fs.existsSync(calendarPath)) {
      try {
        const calendar = JSON.parse(fs.readFileSync(calendarPath, 'utf8'))
        for (const round of calendar.rounds || []) {
          if (round.id && typeof round.round === 'number') {
            roundNumberMap.set(round.id, round.round)
          }
        }
      } catch {
        // ignore invalid calendar
      }
    }

    const rounds = []
    for (const roundId of fs.readdirSync(yearPath).sort()) {
      const roundPath = path.join(yearPath, roundId)
      if (!fs.statSync(roundPath).isDirectory()) continue

      const sessions = []
      for (const sessionCode of fs.readdirSync(roundPath).sort()) {
        const sessionJson = path.join(roundPath, sessionCode, 'session.json')
        if (!fs.existsSync(sessionJson)) continue

        try {
          const payload = JSON.parse(fs.readFileSync(sessionJson, 'utf8'))
          const status = payload?.meta?.status
          if (status && status !== 'ok') continue
          const driverCount = payload.drivers ? Object.keys(payload.drivers).length : 0
          const resultCount =
            (payload.raceResults?.length ?? 0) + (payload.qualifyingResults?.length ?? 0)
          const lapCount = payload.laps?.length ?? 0
          if (driverCount === 0 && resultCount === 0 && lapCount === 0) continue
          sessions.push(sessionCode)
        } catch {
          continue
        }
      }

      if (sessions.length) {
        rounds.push({ id: roundId, sessions: sessions.sort() })
      }
    }

    rounds.sort((a, b) => {
      const ra = roundNumberMap.get(a.id)
      const rb = roundNumberMap.get(b.id)
      if (ra !== undefined && rb !== undefined) return ra - rb
      return a.id.localeCompare(b.id)
    })

    if (rounds.length) {
      index.years[year] = { rounds }
    }
  }

  fs.mkdirSync(path.dirname(INDEX_OUT), { recursive: true })
  fs.writeFileSync(INDEX_OUT, JSON.stringify(index, null, 2) + '\n')
  console.log(
    `[buildDataCaches] Wrote ${INDEX_OUT} (${Object.keys(index.years)
      .map((y) => `${y}:${index.years[y].rounds.length}`)
      .join(', ')})`
  )
  return index
}

async function refreshSeasonCaches(baseUrl) {
  fs.mkdirSync(SEASON_CACHE_DIR, { recursive: true })
  let refreshed = 0

  for (const year of YEARS) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/seasons/${year}/summary?fresh=1`
    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.warn(`[buildDataCaches] ${url} → HTTP ${res.status} (keeping existing cache)`)
        continue
      }
      const data = await res.json()
      if (!data?.drivers || !data?.rounds) {
        console.warn(`[buildDataCaches] ${url} returned unexpected shape (keeping existing cache)`)
        continue
      }
      // Avoid writing a response that itself came from an older cache when we
      // intentionally want a live rebuild: allow cache, but require rounds.
      const outPath = path.join(SEASON_CACHE_DIR, `${year}.json`)
      fs.writeFileSync(outPath, JSON.stringify(data))
      const top = Object.values(data.drivers)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 3)
        .map((d) => `${d.driverCode}:${d.totalPoints}`)
        .join(', ')
      console.log(
        `[buildDataCaches] Wrote ${outPath} (${data.rounds.length} rounds; top ${top})`
      )
      refreshed += 1
    } catch (error) {
      console.warn(
        `[buildDataCaches] Could not refresh ${year} season cache from ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      console.warn(
        '[buildDataCaches] Start the app (`npm run dev`) and re-run, or keep the committed season-cache files.'
      )
    }
  }

  return refreshed
}

async function main() {
  buildSessionsIndex()
  const baseUrl = process.env.DATA_CACHE_BASE_URL || 'http://127.0.0.1:3000'
  const refreshed = await refreshSeasonCaches(baseUrl)
  if (refreshed === 0) {
    console.log(
      '[buildDataCaches] Season caches unchanged. To refresh: npm run dev && DATA_CACHE_BASE_URL=http://127.0.0.1:3000 npm run build:data-caches'
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
