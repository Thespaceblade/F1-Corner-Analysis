'use client'

import { useEffect, useMemo, useState } from 'react'
import { getAvailableCalendarYears } from '../lib/calendarData'
import { getSupportedSeasonYears } from '../lib/teamData'

const PREFERENCES_STORAGE_KEY = 'f1ca:user-preferences:v1'

/**
 * Shared year selection that mirrors SeasonPage: hydrates from the `?year=`
 * query param and the shared `f1ca:user-preferences:v1` localStorage key, then
 * keeps both in sync as the selection changes.
 */
export function useYearPreference() {
  const [selectedYear, setSelectedYear] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  const availableYears = useMemo(
    () =>
      Array.from(
        new Set([...getSupportedSeasonYears(), ...getAvailableCalendarYears()]),
      ).sort((a, b) => a - b),
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const queryYear = Number(new URLSearchParams(window.location.search).get('year'))
      const saved = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { selectedYear?: number }
        if (typeof parsed.selectedYear === 'number') setSelectedYear(parsed.selectedYear)
      }
      if (Number.isInteger(queryYear) && queryYear > 0) setSelectedYear(queryYear)
    } catch (error) {
      console.warn('[useYearPreference] Failed to restore preferences:', error)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated || availableYears.length === 0) return
    if (selectedYear !== 0 && availableYears.includes(selectedYear)) return
    setSelectedYear(Math.max(...availableYears))
  }, [hydrated, selectedYear, availableYears])

  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) return

    try {
      const existing = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      const parsed = existing ? JSON.parse(existing) : {}
      window.localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({ ...parsed, selectedYear }),
      )

      const url = new URL(window.location.href)
      if (selectedYear > 0) url.searchParams.set('year', String(selectedYear))
      else url.searchParams.delete('year')
      window.history.replaceState({}, '', url.toString())
    } catch (error) {
      console.warn('[useYearPreference] Failed to persist preferences:', error)
    }
  }, [hydrated, selectedYear])

  return { selectedYear, setSelectedYear, availableYears, hydrated }
}
