'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import AppShell from './AppShell'
import Chatbot from './Chatbot'
import CustomSelect from './CustomSelect'
import { useYearPreference } from './useYearPreference'
import { useSeasonData } from './useSeasonData'
import { getSeasonTeams, getTeamById } from '../lib/teamData'

type DriverEntry = {
  code: string
  name: string
  number: number
  photoPath: string | null
  teamId: string
  teamName: string
  teamShortName: string
  color: string
  points: number | null
  position: number | null
  wins: number | null
}

export default function DriversPage() {
  const { selectedYear, setSelectedYear, availableYears, hydrated } = useYearPreference()
  const { seasonData, loading, error } = useSeasonData(selectedYear)

  const drivers = useMemo<DriverEntry[]>(() => {
    if (selectedYear <= 0) return []

    const seen = new Set<string>()
    const rows: DriverEntry[] = []

    for (const team of getSeasonTeams(selectedYear)) {
      for (const driver of team.drivers) {
        if (seen.has(driver.code)) continue
        seen.add(driver.code)

        const stats = seasonData?.drivers?.[driver.code] ?? null
        const rankIndex = seasonData
          ? Object.values(seasonData.drivers)
              .sort((a, b) => b.totalPoints - a.totalPoints)
              .findIndex((d) => d.driverCode === driver.code)
          : -1

        rows.push({
          code: driver.code,
          name: driver.name,
          number: driver.number,
          photoPath: driver.photoPath,
          teamId: team.id,
          teamName: team.name,
          teamShortName: team.shortName,
          color: team.color,
          points: stats?.totalPoints ?? null,
          position: rankIndex >= 0 ? rankIndex + 1 : null,
          wins: stats?.raceWins ?? null,
        })
      }
    }

    return rows.sort((a, b) => {
      if (a.points != null && b.points != null) return b.points - a.points
      if (a.points != null) return -1
      if (b.points != null) return 1
      return a.name.localeCompare(b.name)
    })
  }, [selectedYear, seasonData])

  const yearAside = (
    <CustomSelect
      value={selectedYear > 0 ? selectedYear : ''}
      onChange={(v) => setSelectedYear(Number(v))}
      placeholder="Year"
      options={availableYears.map((year) => ({ value: year, label: String(year) }))}
      minWidth="120px"
    />
  )

  return (
    <AppShell
      kicker="Grid"
      title="Drivers"
      description="Every driver on the grid. Open a driver to see their result at every circuit this season."
      headerAside={yearAside}
      aside={
        <Chatbot context={{ track: '', year: selectedYear, session: '', drivers: [] }} />
      }
    >
      {error && (
        <div className="panel p-4 mb-4 text-sm text-amber-300">
          Season stats unavailable ({error}). Showing the roster for {selectedYear}.
        </div>
      )}

      {hydrated && selectedYear > 0 && drivers.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-gray-400">
          No drivers found for {selectedYear}.
        </div>
      ) : (
        <ul className="entity-grid">
          {drivers.map((driver) => {
            const teamLogo =
              getTeamById(driver.teamId, selectedYear)?.logoPath ??
              `/team-logos/${driver.teamId}.png`
            return (
              <li key={driver.code}>
                <Link
                  href={`/drivers/${encodeURIComponent(driver.code)}?year=${selectedYear}`}
                  className="entity-card is-driver"
                  style={{ ['--team-color' as string]: driver.color }}
                >
                  <span className="entity-card-accent" aria-hidden="true" />
                  <div className="entity-card-head">
                    {driver.photoPath ? (
                      <img src={driver.photoPath} alt="" className="entity-card-photo" />
                    ) : (
                      <span className="entity-card-photo entity-card-photo-fallback">
                        {driver.code}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="entity-card-title">{driver.name}</p>
                      <p className="entity-card-sub">
                        {driver.code} · #{driver.number}
                      </p>
                    </div>
                    {driver.position != null && (
                      <span className="entity-card-rank">P{driver.position}</span>
                    )}
                  </div>

                  <div className="entity-card-drivers">
                    <span className="entity-card-team">
                      <img src={teamLogo} alt="" className="entity-card-team-logo" />
                      {driver.teamShortName}
                    </span>
                  </div>

                  <div className="entity-card-stats">
                    <div className="entity-stat">
                      <span className="entity-stat-value">
                        {driver.points != null ? driver.points : loading ? '…' : '—'}
                      </span>
                      <span className="entity-stat-label">Points</span>
                    </div>
                    <div className="entity-stat">
                      <span className="entity-stat-value">
                        {driver.wins != null ? driver.wins : loading ? '…' : '—'}
                      </span>
                      <span className="entity-stat-label">Wins</span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </AppShell>
  )
}
