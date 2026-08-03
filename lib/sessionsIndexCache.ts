/**
 * Deployable session availability index.
 *
 * Avoids parsing ~1GB of session.json on every /api/sessions/index request,
 * and keeps the Toolbar free of phantom S/SQ files when remote/DB is stale.
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { SessionIndex } from './databaseData'

export function sessionsIndexCachePath(): string {
  return path.join(process.cwd(), 'public', 'data', 'sessions-index.json')
}

export async function loadSessionsIndexFromCache(): Promise<SessionIndex | null> {
  try {
    const raw = await fs.readFile(sessionsIndexCachePath(), 'utf-8')
    const data = JSON.parse(raw) as SessionIndex
    if (!data?.years || typeof data.years !== 'object') {
      return null
    }
    return data
  } catch {
    return null
  }
}
