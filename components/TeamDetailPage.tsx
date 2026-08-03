'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import AppShell from './AppShell'
import Chatbot from './Chatbot'
import CustomSelect from './CustomSelect'
import DriverBadge from './formatting/DriverBadge'
import { useYearPreference } from './useYearPreference'
import { useSeasonData } from './useSeasonData'
import { getTeamById } from '../lib/teamData'
import { getTeamTrackRows } from '../lib/entityTrackPerformance'

type TeamDetailPageProps = {
  teamId: string
}

function positionClass(position: number | null): string {
  if (position === 1) return 'text-amber-400'
  if (position === 2) return 'text-gray-300'
  if (position === 3) return 'text-orange-400'
  if (position != null && position <= 10) return 'text-green-400'
  return 'text-gray-300'
}

export default function TeamDetailPage({ teamId }: TeamDetailPageProps) {
  const { selectedYear, setSelectedYear, availableYears, hydrated } = useYearPreference()
  const { seasonData, loading, error } = useSeasonData(selectedYear)

  const team = useMemo(
    () => (selectedYear > 0 ? getTeamById(teamId, selectedYear) : null),
    [teamId, selectedYear],
  )
  const stats = seasonData?.teams?.[teamId] ?? null

  const trackRows = useMemo(() => {
    if (!seasonData) return []
    return getTeamTrackRows(seasonData, teamId)
  }, [seasonData, teamId])

  const driverCodes = useMemo(() => {
    const set = new Set<string>()
    if (stats?.driver1) set.add(stats.driver1)
    if (stats?.driver2) set.add(stats.driver2)
    for (const row of trackRows) {
      for (const d of row.drivers) set.add(d.driverCode)
    }
    if (set.size === 0 && team) {
      team.drivers.forEach((d) => set.add(d.code))
    }
    return Array.from(set)
  }, [stats, trackRows, team])

  const yearAside = (
    <CustomSelect
      value={selectedYear > 0 ? selectedYear : ''}
      onChange={(v) => setSelectedYear(Number(v))}
      placeholder="Year"
      options={availableYears.map((year) => ({ value: year, label: String(year) }))}
      minWidth="120px"
    />
  )

  const color = team?.color ?? '#9aa4b2'

  return (
    <AppShell
      contextLabel={team?.name ?? teamId}
      kicker="Constructor"
      title={team?.name ?? teamId}
      description={
        team
          ? `Season-by-circuit performance for ${team.name} in ${selectedYear}.`
          : undefined
      }
      headerAside={yearAside}
      aside={
        <Chatbot context={{ track: '', year: selectedYear, session: '', drivers: driverCodes }} />
      }
    >
      {hydrated && selectedYear > 0 && !team ? (
        <div className="panel p-8 text-center text-sm text-gray-400">
          Unknown team &ldquo;{teamId}&rdquo; for {selectedYear}.{' '}
          <Link href={`/teams?year=${selectedYear}`} className="text-accent underline">
            Back to all teams
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-6">
          <section
            className="entity-detail-header panel p-5"
            style={{ ['--team-color' as string]: color }}
          >
            <span className="entity-detail-accent" aria-hidden="true" />
            <div className="entity-detail-headline">
              {team && (
                <img
                  src={team.logoPath ?? `/team-logos/${teamId}.png`}
                  alt=""
                  className="entity-detail-logo"
                />
              )}
              <div>
                <h2 className="entity-detail-name">{team?.name ?? teamId}</h2>
                <div className="entity-detail-drivers">
                  {(team?.drivers ?? []).map((driver) => (
                    <Link
                      key={driver.code}
                      href={`/drivers/${encodeURIComponent(driver.code)}?year=${selectedYear}`}
                      className="entity-detail-driver-link"
                    >
                      <DriverBadge
                        code={driver.code}
                        year={selectedYear}
                        size="sm"
                        variant="badge"
                        showName
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="entity-detail-stats">
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats ? stats.totalPoints : loading ? '…' : '—'}
                </span>
                <span className="entity-stat-label">Points</span>
              </div>
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats?.constructorPosition != null ? `P${stats.constructorPosition}` : '—'}
                </span>
                <span className="entity-stat-label">Position</span>
              </div>
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats ? stats.totalWins : loading ? '…' : '—'}
                </span>
                <span className="entity-stat-label">Wins</span>
              </div>
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats ? stats.totalPodiums : loading ? '…' : '—'}
                </span>
                <span className="entity-stat-label">Podiums</span>
              </div>
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats?.averageFinishingPosition != null
                    ? stats.averageFinishingPosition.toFixed(1)
                    : '—'}
                </span>
                <span className="entity-stat-label">Avg finish</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Performance by Circuit</h3>

            {error && (
              <div className="panel p-4 mb-3 text-sm text-amber-300">
                Season results unavailable ({error}).
              </div>
            )}

            {loading && !seasonData ? (
              <div className="panel p-8 text-center text-sm text-gray-400">Loading results…</div>
            ) : trackRows.length === 0 ? (
              <div className="panel p-8 text-center text-sm text-gray-400">
                No race results available for {selectedYear} yet.
              </div>
            ) : (
              <div className="entity-table-wrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-900/50">
                        <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">RD</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">TRACK</th>
                        {driverCodes.map((code) => (
                          <th
                            key={code}
                            className="text-right py-3 px-3 text-gray-400 font-semibold text-xs"
                          >
                            {code}
                          </th>
                        ))}
                        <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">PTS</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">RESULT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trackRows.map((row) => (
                        <tr
                          key={row.round}
                          className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                        >
                          <td className="py-3 px-3 text-gray-400">{row.round}</td>
                          <td className="py-3 px-3">
                            <Link
                              href={`/race/${encodeURIComponent(row.trackId)}?year=${selectedYear}&session=R`}
                              className="text-gray-200 hover:text-accent transition-colors"
                            >
                              {row.trackName}
                            </Link>
                          </td>
                          {driverCodes.map((code) => {
                            const cell = row.drivers.find((d) => d.driverCode === code)
                            return (
                              <td key={code} className="text-right py-3 px-3">
                                {cell && cell.racePosition != null ? (
                                  <span className={`font-medium ${positionClass(cell.racePosition)}`}>
                                    P{cell.racePosition}
                                    {cell.qualiPosition != null && (
                                      <span className="ml-1 text-[10px] text-gray-500">
                                        (Q{cell.qualiPosition})
                                      </span>
                                    )}
                                  </span>
                                ) : cell && cell.status !== 'Finished' ? (
                                  <span className="text-red-400 text-xs">{cell.status}</span>
                                ) : (
                                  <span className="text-gray-600">—</span>
                                )}
                              </td>
                            )
                          })}
                          <td className="text-right py-3 px-3 font-semibold text-gray-200">
                            {row.totalPoints}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {row.oneTwo && <span className="entity-flag is-gold">1-2</span>}
                              {row.doublePodium && !row.oneTwo && (
                                <span className="entity-flag is-podium">2x POD</span>
                              )}
                              {row.doublePoints && !row.doublePodium && (
                                <span className="entity-flag">2x PTS</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}
