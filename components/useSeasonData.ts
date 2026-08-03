'use client'

import { useEffect, useState } from 'react'
import { SeasonData } from '../lib/seasonTypes'

type SeasonDataState = {
  seasonData: SeasonData | null
  loading: boolean
  error: string | null
}

/**
 * Loads aggregated season data from the existing `/api/seasons/:year/summary`
 * endpoint. Returns `null` seasonData (without an error) when the year has no
 * results yet, so callers can gracefully fall back to roster-only metadata.
 */
export function useSeasonData(year: number): SeasonDataState {
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!year || year <= 0) {
      setSeasonData(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/seasons/${year}/summary`)
        if (response.status === 404) {
          if (!cancelled) setSeasonData(null)
          return
        }
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.message || payload?.error || response.statusText)
        }
        const data = (await response.json()) as SeasonData
        if (!cancelled) setSeasonData(data)
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading season data:', err)
          setError(err instanceof Error ? err.message : 'Failed to load season data')
          setSeasonData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [year])

  return { seasonData, loading, error }
}
