'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import AppShell from './AppShell'
import Chatbot from './Chatbot'
import CustomSelect from './CustomSelect'
import DriverBadge from './formatting/DriverBadge'
import { useYearPreference } from './useYearPreference'
import { useSeasonData } from './useSeasonData'
import { getSeasonTeams } from '../lib/teamData'

export default function TeamsPage() {
  const { selectedYear, setSelectedYear, availableYears, hydrated } = useYearPreference()
  const { seasonData, loading, error } = useSeasonData(selectedYear)

  const teams = useMemo(() => {
    if (selectedYear <= 0) return []
    const roster = getSeasonTeams(selectedYear)

    return roster
      .map((team) => {
        const stats = seasonData?.teams?.[team.id] ?? null
        return {
          team,
          points: stats?.totalPoints ?? null,
          position: stats?.constructorPosition ?? null,
          wins: stats?.totalWins ?? null,
        }
      })
      .sort((a, b) => {
        if (a.points != null && b.points != null) return b.points - a.points
        if (a.points != null) return -1
        if (b.points != null) return 1
        return a.team.name.localeCompare(b.team.name)
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
      kicker="Constructors"
      title="Teams"
      description="Every constructor on the grid. Open a team to see how each car performed at every circuit."
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

      {hydrated && selectedYear > 0 && teams.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-gray-400">
          No teams found for {selectedYear}.
        </div>
      ) : (
        <ul className="entity-grid">
          {teams.map(({ team, points, position, wins }) => (
            <li key={team.id}>
              <Link
                href={`/teams/${encodeURIComponent(team.id)}?year=${selectedYear}`}
                className="entity-card"
                style={{ ['--team-color' as string]: team.color }}
              >
                <span className="entity-card-accent" aria-hidden="true" />
                <div className="entity-card-head">
                  <img
                    src={team.logoPath ?? `/team-logos/${team.id}.png`}
                    alt=""
                    className="entity-card-logo"
                  />
                  <div className="min-w-0">
                    <p className="entity-card-title">{team.name}</p>
                    <p className="entity-card-sub">{team.shortName}</p>
                  </div>
                  {position != null && (
                    <span className="entity-card-rank">P{position}</span>
                  )}
                </div>

                <div className="entity-card-drivers">
                  {team.drivers.map((driver) => (
                    <DriverBadge
                      key={`${team.id}-${driver.code}`}
                      code={driver.code}
                      year={selectedYear}
                      size="sm"
                      variant="badge"
                    />
                  ))}
                </div>

                <div className="entity-card-stats">
                  <div className="entity-stat">
                    <span className="entity-stat-value">
                      {points != null ? points : loading ? '…' : '—'}
                    </span>
                    <span className="entity-stat-label">Points</span>
                  </div>
                  <div className="entity-stat">
                    <span className="entity-stat-value">
                      {wins != null ? wins : loading ? '…' : '—'}
                    </span>
                    <span className="entity-stat-label">Wins</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
