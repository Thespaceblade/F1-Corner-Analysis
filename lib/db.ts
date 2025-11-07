// Lightweight Neon client for serverless Postgres on Vercel
// Switch on by setting process.env.DATA_SOURCE = 'database' and providing DATABASE_URL

import { neon } from '@neondatabase/serverless'

export function isDatabaseEnabled(): boolean {
  return (
    typeof process.env.DATA_SOURCE === 'string' &&
    process.env.DATA_SOURCE.toLowerCase() === 'database' &&
    typeof process.env.DATABASE_URL === 'string' &&
    !!process.env.DATABASE_URL
  )
}

export function getDb() {
  if (!isDatabaseEnabled()) {
    throw new Error('Database not enabled. Set DATA_SOURCE=database and DATABASE_URL.')
  }
  const connection = process.env.DATABASE_URL as string
  return neon(connection)
}

export type SessionRow = {
  id: number
  year: number
  round_slug: string
  session_code: string
  event_name: string | null
  country: string | null
  official_name: string | null
  generated_at: string | null
}

export type DriverRow = {
  code: string
  team: string | null
  number: number | null
}

export type LapRow = {
  driver_code: string
  lap_number: number | null
  stint: number | null
  compound: string | null
  tyre_life: number | null
  lap_time_seconds: number | null
  sector1_seconds: number | null
  sector2_seconds: number | null
  sector3_seconds: number | null
  track_status: string | null
  flags: string[] | null
  is_valid: boolean | null
}


