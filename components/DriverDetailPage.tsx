'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import AppShell from './AppShell'
import Chatbot from './Chatbot'
import CustomSelect from './CustomSelect'
import { useYearPreference } from './useYearPreference'
import { useSeasonData } from './useSeasonData'
import { getSeasonDriverEntry } from '../lib/seasonMetadata'
import { getTeamById } from '../lib/teamData'
import { getDriverTrackRows } from '../lib/entityTrackPerformance'

type DriverDetailPageProps = {
  driverCode: string
}

function positionClass(position: number | null): string {
  if (position === 1) return 'text-amber-400'
  if (position === 2) return 'text-gray-300'
  if (position === 3) return 'text-orange-400'
  if (position != null && position <= 10) return 'text-green-400'
  return 'text-gray-300'
}

export default function DriverDetailPage({ driverCode }: DriverDetailPageProps) {
  const code = driverCode.toUpperCase()
  const { selectedYear, setSelectedYear, availableYears, hydrated } = useYearPreference()
  const { seasonData, loading, error } = useSeasonData(selectedYear)

  const entry = useMemo(
    () => (selectedYear > 0 ? getSeasonDriverEntry(code, selectedYear) : null),
    [code, selectedYear],
  )
  const driver = entry?.driver ?? null
  const stats = seasonData?.drivers?.[code] ?? null

  const teamId = stats?.teamId ?? entry?.team.id ?? null
  const team = useMemo(
    () => (teamId && selectedYear > 0 ? getTeamById(teamId, selectedYear) : entry?.team ?? null),
    [teamId, selectedYear, entry],
  )

  const rank = useMemo(() => {
    if (!seasonData) return null
    const index = Object.values(seasonData.drivers)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .findIndex((d) => d.driverCode === code)
    return index >= 0 ? index + 1 : null
  }, [seasonData, code])

  const trackRows = useMemo(() => {
    if (!seasonData) return []
    return getDriverTrackRows(seasonData, code)
  }, [seasonData, code])

  const yearAside = (
    <CustomSelect
      value={selectedYear > 0 ? selectedYear : ''}
      onChange={(v) => setSelectedYear(Number(v))}
      placeholder="Year"
      options={availableYears.map((year) => ({ value: year, label: String(year) }))}
      minWidth="120px"
    />
  )

  const displayName = driver?.name ?? code
  const color = team?.color ?? '#9aa4b2'

  return (
    <AppShell
      contextLabel={displayName}
      kicker="Driver"
      title={displayName}
      description={
        driver ? `Race-by-race performance for ${displayName} in ${selectedYear}.` : undefined
      }
      headerAside={yearAside}
      aside={<Chatbot context={{ track: '', year: selectedYear, session: '', drivers: [code] }} />}
    >
      {hydrated && selectedYear > 0 && !entry ? (
        <div className="panel p-8 text-center text-sm text-gray-400">
          Unknown driver &ldquo;{code}&rdquo; for {selectedYear}.{' '}
          <Link href={`/drivers?year=${selectedYear}`} className="text-accent underline">
            Back to all drivers
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
              {driver?.photoPath ? (
                <img src={driver.photoPath} alt="" className="entity-detail-photo" />
              ) : (
                <span className="entity-detail-photo entity-detail-photo-fallback">{code}</span>
              )}
              <div>
                <h2 className="entity-detail-name">{displayName}</h2>
                <div className="entity-detail-drivers">
                  <span className="entity-detail-sub">
                    {code}
                    {driver?.number != null && ` · #${driver.number}`}
                  </span>
                  {team && (
                    <Link
                      href={`/teams/${encodeURIComponent(team.id)}?year=${selectedYear}`}
                      className="entity-card-team"
                    >
                      <img
                        src={team.logoPath ?? `/team-logos/${team.id}.png`}
                        alt=""
                        className="entity-card-team-logo"
                      />
                      {team.shortName}
                    </Link>
                  )}
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
                <span className="entity-stat-value">{rank != null ? `P${rank}` : '—'}</span>
                <span className="entity-stat-label">Position</span>
              </div>
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats ? stats.raceWins : loading ? '…' : '—'}
                </span>
                <span className="entity-stat-label">Wins</span>
              </div>
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats ? stats.podiums : loading ? '…' : '—'}
                </span>
                <span className="entity-stat-label">Podiums</span>
              </div>
              <div className="entity-stat">
                <span className="entity-stat-value">
                  {stats?.averageFinishPosition != null
                    ? stats.averageFinishPosition.toFixed(1)
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
                        <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">QUALI</th>
                        <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">RACE</th>
                        <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">+/-</th>
                        <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">PTS</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">STATUS</th>
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
                          <td className="text-right py-3 px-3 text-gray-300">
                            {row.qualiPosition ? `P${row.qualiPosition}` : 'N/A'}
                          </td>
                          <td className="text-right py-3 px-3 font-medium">
                            <span className={positionClass(row.racePosition)}>
                              {row.racePosition ? `P${row.racePosition}` : 'N/A'}
                              {row.fastestLap && (
                                <span className="ml-1 text-[10px] text-purple-400">FL</span>
                              )}
                            </span>
                          </td>
                          <td className="text-right py-3 px-3">
                            {row.positionsGained !== null ? (
                              <span
                                className={
                                  row.positionsGained > 0
                                    ? 'text-green-400'
                                    : row.positionsGained < 0
                                      ? 'text-red-400'
                                      : 'text-gray-400'
                                }
                              >
                                {row.positionsGained > 0 ? '+' : ''}
                                {row.positionsGained}
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-3 font-semibold text-gray-200">
                            {row.points}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={
                                row.status === 'Finished'
                                  ? 'text-gray-400 text-xs'
                                  : 'text-red-400 text-xs'
                              }
                            >
                              {row.status}
                            </span>
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
