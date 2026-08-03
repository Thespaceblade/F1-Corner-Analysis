'use client'

import React, { useEffect, useMemo, useState } from 'react'
import AppShell from './AppShell'
import Toolbar from './Toolbar'
import SeasonReview from './SeasonReview'
import Chatbot from './Chatbot'
import { getAvailableCalendarYears } from '../lib/calendarData'
import { getSupportedSeasonYears } from '../lib/teamData'

const PREFERENCES_STORAGE_KEY = 'f1ca:user-preferences:v1'

export default function SeasonPage() {
  const [selectedYear, setSelectedYear] = useState(0)
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])
  const [preferencesHydrated, setPreferencesHydrated] = useState(false)

  const availableYears = useMemo(
    () =>
      Array.from(new Set([...getSupportedSeasonYears(), ...getAvailableCalendarYears()])).sort(
        (a, b) => a - b,
      ),
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const queryYear = Number(new URLSearchParams(window.location.search).get('year'))
      const saved = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as {
          selectedYear?: number
          selectedDrivers?: string[]
        }
        if (typeof parsed.selectedYear === 'number') setSelectedYear(parsed.selectedYear)
        if (Array.isArray(parsed.selectedDrivers)) {
          setSelectedDrivers(parsed.selectedDrivers.filter((d): d is string => typeof d === 'string'))
        }
      }
      if (Number.isInteger(queryYear) && queryYear > 0) setSelectedYear(queryYear)
    } catch (error) {
      console.warn('[SeasonPage] Failed to restore preferences:', error)
    } finally {
      setPreferencesHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!preferencesHydrated || availableYears.length === 0) return
    if (selectedYear !== 0 && availableYears.includes(selectedYear)) return
    setSelectedYear(Math.max(...availableYears))
  }, [preferencesHydrated, selectedYear, availableYears])

  useEffect(() => {
    if (typeof window === 'undefined' || !preferencesHydrated) return

    try {
      const existing = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      const parsed = existing ? JSON.parse(existing) : {}
      window.localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          selectedYear,
          selectedDrivers,
        }),
      )
    } catch (error) {
      console.warn('[SeasonPage] Failed to persist preferences:', error)
    }
  }, [preferencesHydrated, selectedYear, selectedDrivers])

  return (
    <AppShell
      kicker="Championship"
      title={selectedYear > 0 ? `${selectedYear} Season` : 'Season Review'}
      description="Standings, head-to-heads, progression, and form by circuit type across the whole year."
      aside={
        <Chatbot
          context={{
            track: '',
            year: selectedYear,
            session: '',
            drivers: selectedDrivers,
          }}
        />
      }
    >
      <div className="page-section page-section-2">
        <Toolbar
          mode="season"
          years={availableYears.length > 0 ? availableYears : [selectedYear]}
          selectedYear={selectedYear}
          onYearChangeAction={setSelectedYear}
          selectedDrivers={selectedDrivers}
          onDriversChangeAction={setSelectedDrivers}
          selectedSession=""
          onSessionChangeAction={() => {}}
          availableSessions={[]}
          roundNumber={null}
          sessionData={null}
        />
      </div>

      {selectedYear > 0 ? (
        <SeasonReview year={selectedYear} selectedDrivers={selectedDrivers} />
      ) : (
        <section className="mt-6 page-section page-section-3">
          <div className="panel p-8 text-center text-sm text-gray-400">
            Select a year above to load season statistics.
          </div>
        </section>
      )}
    </AppShell>
  )
}
