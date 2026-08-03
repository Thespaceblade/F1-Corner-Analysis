/**
 * Deployable precomputed season summaries.
 *
 * Full session JSON under public/data/sessions/ is excluded from Vercel
 * (.vercelignore) and often stale on REMOTE_DATA_URL hosts. These caches are
 * small (~100–200KB), committed with the repo, and keep standings correct + fast.
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { SeasonData } from './seasonTypes'

export function seasonCachePath(year: number): string {
  return path.join(process.cwd(), 'public', 'data', 'season-cache', `${year}.json`)
}

export async function loadSeasonDataFromCache(year: number): Promise<SeasonData | null> {
  try {
    const raw = await fs.readFile(seasonCachePath(year), 'utf-8')
    const data = JSON.parse(raw) as SeasonData
    if (!data || data.year !== year || !data.drivers || !data.rounds) {
      return null
    }
    return data
  } catch {
    return null
  }
}
