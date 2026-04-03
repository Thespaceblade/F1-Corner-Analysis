// Shared Postgres client for Vercel/serverless deployments.
// Supports Neon/Supabase/any managed Postgres via DATABASE_URL (or SUPABASE_DB_URL).
// Enable by setting DATA_SOURCE=database.

import { Pool, QueryResultRow } from 'pg'

let pool: Pool | null = null

function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  return typeof url === 'string' && url.length > 0 ? url : null
}

export function isDatabaseEnabled(): boolean {
  return (
    typeof process.env.DATA_SOURCE === 'string' &&
    process.env.DATA_SOURCE.toLowerCase() === 'database' &&
    !!getDatabaseUrl()
  )
}

function getPool(): Pool {
  if (pool) return pool

  const connection = getDatabaseUrl()
  if (!connection) {
    throw new Error('Database not configured. Set DATABASE_URL (or SUPABASE_DB_URL).')
  }

  pool = new Pool({
    connectionString: connection,
    ssl: { rejectUnauthorized: false },
    // Serverless runtimes should keep application-side pooling very small.
    // Supabase recommends transaction pooling for serverless and starting at 1 connection.
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
  })

  return pool
}

export async function queryDb<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
  if (!isDatabaseEnabled()) {
    throw new Error('Database not enabled. Set DATA_SOURCE=database and DATABASE_URL (or SUPABASE_DB_URL).')
  }
  const client = getPool()
  const result = await client.query<T>(text, values)
  return result.rows
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
