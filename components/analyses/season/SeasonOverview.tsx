'use client'

import React, { useMemo, useState } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { 
  Trophy, 
  Target, 
  Zap, 
  Flag, 
  TrendingDown,
  TrendingUp,
  Building2,
  Gauge,
  Crosshair,
  Medal,
} from 'lucide-react'
import StatisticsCard from './StatisticsCard'
import ChampionshipProgressionChart from './ChampionshipProgressionChart'
import { getDriverColor, getTeamById } from '../../../lib/teamData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getDriverPhoto } from '../../../lib/driverPhotos'
import DriverBadge from '../../formatting/DriverBadge'

type SeasonOverviewProps = {
  seasonData: SeasonData
}

export default function SeasonOverview({ seasonData }: SeasonOverviewProps) {
  const [chartView, setChartView] = useState<'wins' | 'podiums' | 'poles' | 'fastest-laps'>('wins')
  const getSeasonDriverColor = (driverCode: string, fallback = '#e10600') =>
    getDriverColor(driverCode, seasonData.year) ?? fallback
  const getSeasonTeam = (teamId: string | null | undefined) =>
    teamId ? getTeamById(teamId, seasonData.year) : null
  
  // Get top drivers and teams
  const topDrivers = useMemo(() => {
    return Object.values(seasonData.drivers)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10)
  }, [seasonData.drivers])

  const topTeams = useMemo(() => {
    return Object.values(seasonData.teams)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5)
  }, [seasonData.teams])

  // Key statistics
  const driverChampion = seasonData.champion.driver 
    ? seasonData.drivers[seasonData.champion.driver]
    : null

  const constructorChampion = seasonData.champion.constructor
    ? seasonData.teams[seasonData.champion.constructor]
    : null

  // Most wins, poles, fastest laps
  const mostWins = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter(d => d.raceWins > 0)
      .sort((a, b) => b.raceWins - a.raceWins)
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const mostPoles = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter(d => d.polePositions > 0)
      .sort((a, b) => b.polePositions - a.polePositions)
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const mostFastestLaps = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter(d => d.fastestLaps > 0)
      .sort((a, b) => b.fastestLaps - a.fastestLaps)
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const mostDNFs = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter(d => d.dnfs > 0)
      .sort((a, b) => b.dnfs - a.dnfs)
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const bestAverageFinish = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter((d) => d.averageFinishPosition != null && d.racesFinished >= 3)
      .sort((a, b) => (a.averageFinishPosition ?? 99) - (b.averageFinishPosition ?? 99))
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const mostConsistent = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter((d) => d.finishingPositionStdDev != null && d.racesFinished >= 3)
      .sort((a, b) => (a.finishingPositionStdDev ?? 99) - (b.finishingPositionStdDev ?? 99))
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const mostPositionsGained = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter((d) => d.averagePositionsGained != null && d.raceStarts >= 3)
      .sort((a, b) => (b.averagePositionsGained ?? -99) - (a.averagePositionsGained ?? -99))
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const bestScoringRate = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter((d) => d.raceStarts >= 3)
      .sort((a, b) => b.pointScoringRate - a.pointScoringRate)
    return sorted[0] ?? null
  }, [seasonData.drivers])

  const titleFight = useMemo(() => {
    return Object.values(seasonData.drivers)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3)
      .map((driver, index, arr) => ({
        ...driver,
        position: index + 1,
        gapToLeader: arr[0].totalPoints - driver.totalPoints,
        gapAhead: index === 0 ? 0 : arr[index - 1].totalPoints - driver.totalPoints,
      }))
  }, [seasonData.drivers])

  const constructorFight = useMemo(() => {
    return Object.values(seasonData.teams)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3)
      .map((team, index, arr) => ({
        ...team,
        position: index + 1,
        gapToLeader: arr[0].totalPoints - team.totalPoints,
        info: getSeasonTeam(team.teamId),
      }))
  }, [seasonData.teams])

  const raceWinners = useMemo(() => {
    return seasonData.rounds
      .slice()
      .sort((a, b) => a.round - b.round)
      .map((round) => {
        const winner = round.results.find((r) => r.position === 1)
        const pole = round.qualifyingResults.find((q) => q.position === 1)
        return {
          round: round.round,
          trackId: round.trackId,
          trackName: round.trackName,
          date: round.date,
          winnerCode: winner?.driverCode ?? null,
          winnerTeamId: winner?.teamId ?? null,
          poleCode: pole?.driverCode ?? null,
          winnerPoints: winner?.points ?? 0,
        }
      })
  }, [seasonData.rounds])

  const winsByDriver = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const race of raceWinners) {
      if (!race.winnerCode) continue
      counts[race.winnerCode] = (counts[race.winnerCode] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([code, wins]) => ({ code, wins }))
      .sort((a, b) => b.wins - a.wins)
  }, [raceWinners])

  const recentForm = useMemo(() => {
    const lastRounds = seasonData.rounds
      .slice()
      .sort((a, b) => a.round - b.round)
      .slice(-5)
    return titleFight.map((driver) => {
      const finishes = lastRounds.map((round) => {
        const entry = round.results.find((r) => r.driverCode === driver.driverCode)
        return {
          round: round.round,
          trackName: round.trackName,
          position: entry?.position ?? null,
          status: entry?.status ?? null,
          points: entry?.points ?? 0,
        }
      })
      return { driver, finishes }
    })
  }, [seasonData.rounds, titleFight])

  // Points distribution data for pie chart (using team colors)
  const pointsDistribution = useMemo(() => {
    return topDrivers.slice(0, 8).map(driver => {
      const teamColor = driver.teamId 
        ? getSeasonTeam(driver.teamId)?.color 
        : null
      return {
        name: driver.driverCode,
        value: driver.totalPoints,
        color: teamColor ?? getSeasonDriverColor(driver.driverCode),
      }
    })
  }, [topDrivers])

  // Wins by team data for bar chart
  const winsByTeam = useMemo(() => {
    return topTeams.map(team => ({
      name: getSeasonTeam(team.teamId)?.shortName ?? team.teamId,
      wins: team.totalWins,
      color: getSeasonTeam(team.teamId)?.color ?? '#e10600',
    }))
  }, [topTeams])

  // Podiums by driver (top 5)
  const podiumsByDriver = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter(d => d.podiums > 0)
      .sort((a, b) => b.podiums - a.podiums)
      .slice(0, 5)
    
    return sorted.map(driver => {
      const teamColor = driver.teamId 
        ? getSeasonTeam(driver.teamId)?.color 
        : null
      return {
        name: driver.driverCode,
        podiums: driver.podiums,
        color: teamColor ?? getSeasonDriverColor(driver.driverCode),
      }
    })
  }, [seasonData.drivers])

  // Poles by driver (top 5)
  const polesByDriver = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter(d => d.polePositions > 0)
      .sort((a, b) => b.polePositions - a.polePositions)
      .slice(0, 5)
    
    return sorted.map(driver => {
      const teamColor = driver.teamId 
        ? getSeasonTeam(driver.teamId)?.color 
        : null
      return {
        name: driver.driverCode,
        value: driver.polePositions,
        color: teamColor ?? getSeasonDriverColor(driver.driverCode),
      }
    })
  }, [seasonData.drivers])

  // Fastest laps by driver (top 5)
  const fastestLapsByDriver = useMemo(() => {
    const sorted = Object.values(seasonData.drivers)
      .filter(d => d.fastestLaps > 0)
      .sort((a, b) => b.fastestLaps - a.fastestLaps)
      .slice(0, 5)
    
    return sorted.map(driver => {
      const teamColor = driver.teamId 
        ? getSeasonTeam(driver.teamId)?.color 
        : null
      return {
        name: driver.driverCode,
        value: driver.fastestLaps,
        color: teamColor ?? getSeasonDriverColor(driver.driverCode),
      }
    })
  }, [seasonData.drivers])

  // Chart data based on selected view
  const chartData = useMemo(() => {
    switch (chartView) {
      case 'wins':
        return winsByTeam.map(team => ({
          name: team.name,
          value: team.wins,
          color: team.color,
        }))
      case 'podiums':
        return podiumsByDriver.map(driver => ({
          name: driver.name,
          value: driver.podiums,
          color: driver.color,
        }))
      case 'poles':
        return polesByDriver
      case 'fastest-laps':
        return fastestLapsByDriver
      default:
        return []
    }
  }, [chartView, winsByTeam, podiumsByDriver, polesByDriver, fastestLapsByDriver])

  const chartTitle = useMemo(() => {
    switch (chartView) {
      case 'wins':
        return 'Wins by Team'
      case 'podiums':
        return 'Podiums by Driver (Top 5)'
      case 'poles':
        return 'Pole Positions by Driver (Top 5)'
      case 'fastest-laps':
        return 'Fastest Laps by Driver (Top 5)'
      default:
        return ''
    }
  }, [chartView])

  const championshipStandings = useMemo(() => {
    return Object.values(seasonData.drivers)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((driver, index) => ({ ...driver, position: index + 1 }))
  }, [seasonData.drivers])

  const constructorStandings = useMemo(() => {
    return Object.values(seasonData.teams)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((team, index) => ({ ...team, position: index + 1 }))
  }, [seasonData.teams])

  const showChampions = seasonData.isSeasonComplete && Boolean(driverChampion && constructorChampion)

  return (
    <div className="space-y-6">
      {showChampions && (
        /* Champions banner, shown only when the season is finished. */
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="border rounded-lg p-6 backdrop-blur-sm"
            style={{
              borderColor: `${getSeasonDriverColor(driverChampion!.driverCode, '#f59e0b')}40`,
              background: `linear-gradient(to bottom right, ${getSeasonDriverColor(driverChampion!.driverCode, '#f59e0b')}10, transparent)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy
                className="w-8 h-8"
                style={{ color: getSeasonDriverColor(driverChampion!.driverCode, '#fbbf24') }}
              />
              <div>
                <h4
                  className="text-lg font-bold"
                  style={{ color: getSeasonDriverColor(driverChampion!.driverCode, '#f0f0f0') }}
                >
                  World Champion
                </h4>
                <p className="text-xs text-gray-400">{seasonData.year} Driver Championship</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-800 border-4 flex-shrink-0"
                  style={{ borderColor: getSeasonDriverColor(driverChampion!.driverCode, '#fbbf24') }}
                >
                  <img
                    src={getDriverPhoto(driverChampion!.driverCode)}
                    alt={driverChampion!.driverCode}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: getSeasonDriverColor(driverChampion!.driverCode, '#fbbf24') }}
                >
                  {driverChampion!.totalPoints} pts
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">Wins</div>
                  <div className="font-semibold text-gray-200">{driverChampion!.raceWins}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Podiums</div>
                  <div className="font-semibold text-gray-200">{driverChampion!.podiums}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Poles</div>
                  <div className="font-semibold text-gray-200">{driverChampion!.polePositions}</div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="border rounded-lg p-6 backdrop-blur-sm"
            style={{
              borderColor: `${getSeasonTeam(constructorChampion!.teamId)?.color ?? '#3b82f6'}40`,
              background: `linear-gradient(to bottom right, ${getSeasonTeam(constructorChampion!.teamId)?.color ?? '#3b82f6'}10, transparent)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Building2
                className="w-8 h-8"
                style={{ color: getSeasonTeam(constructorChampion!.teamId)?.color ?? '#60a5fa' }}
              />
              <div>
                <h4
                  className="text-lg font-bold"
                  style={{ color: getSeasonTeam(constructorChampion!.teamId)?.color ?? '#f0f0f0' }}
                >
                  Constructor Champion
                </h4>
                <p className="text-xs text-gray-400">{seasonData.year} Team Championship</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img
                    src={getSeasonTeam(constructorChampion!.teamId)?.logoPath ?? `/team-logos/${constructorChampion!.teamId}.png`}
                    alt={getSeasonTeam(constructorChampion!.teamId)?.shortName ?? constructorChampion!.teamId}
                    className="relative z-10 h-full w-full object-contain"
                    style={
                      ['aston-martin', 'visa-rb', 'stake'].includes(constructorChampion!.teamId)
                        ? { transform: 'scale(1.3)' }
                        : undefined
                    }
                  />
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: getSeasonTeam(constructorChampion!.teamId)?.color ?? '#60a5fa' }}
                >
                  {constructorChampion!.totalPoints} pts
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">Wins</div>
                  <div className="font-semibold text-gray-200">{constructorChampion!.totalWins}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Podiums</div>
                  <div className="font-semibold text-gray-200">{constructorChampion!.totalPodiums}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">1-2s</div>
                  <div className="font-semibold text-gray-200">{constructorChampion!.oneTwo}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title fight: top 3 with gaps */}
      {titleFight.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-200">
                {seasonData.isSeasonComplete ? 'Final title fight' : 'Championship battle'}
              </h4>
              <p className="text-xs text-gray-400">
                Top three on points after {seasonData.completedRaces} rounds
              </p>
            </div>
            {titleFight.length >= 2 && (
              <div className="text-xs text-gray-500">
                Lead:{' '}
                <span className="font-semibold text-accent tabular-nums">
                  {titleFight[1].gapToLeader} pts
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {titleFight.map((driver) => {
              const team = getSeasonTeam(driver.teamId)
              const color = getSeasonDriverColor(driver.driverCode)
              return (
                <div
                  key={driver.driverCode}
                  className="relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm"
                  style={{
                    borderColor: `${color}55`,
                    background: `linear-gradient(160deg, ${color}14, transparent 70%)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 bg-gray-900"
                        style={{ borderColor: color }}
                      >
                        <img
                          src={getDriverPhoto(driver.driverCode)}
                          alt={driver.driverCode}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-semibold">
                          P{driver.position}
                        </div>
                        <DriverBadge code={driver.driverCode} year={seasonData.year} size="md" />
                        <div className="mt-0.5 truncate text-xs text-gray-500">
                          {team?.shortName ?? driver.teamId ?? 'n/a'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold tabular-nums text-gray-100">
                        {driver.totalPoints}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500">pts</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-[10px] uppercase text-gray-500">W</div>
                      <div className="text-sm font-semibold tabular-nums text-gray-200">{driver.raceWins}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-gray-500">Pod</div>
                      <div className="text-sm font-semibold tabular-nums text-gray-200">{driver.podiums}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-gray-500">Pole</div>
                      <div className="text-sm font-semibold tabular-nums text-gray-200">{driver.polePositions}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-gray-500">Gap</div>
                      <div className="text-sm font-semibold tabular-nums text-gray-200">
                        {driver.gapToLeader === 0 ? '-' : `-${driver.gapToLeader}`}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {constructorFight.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {constructorFight.map((team) => (
                <div
                  key={team.teamId}
                  className="flex items-center gap-3 rounded-lg border border-gray-700/80 bg-gray-900/40 px-3 py-2.5"
                >
                  <span
                    className={`w-5 text-sm font-bold tabular-nums ${
                      team.position === 1
                        ? 'text-amber-400'
                        : team.position === 2
                          ? 'text-gray-300'
                          : 'text-orange-400'
                    }`}
                  >
                    {team.position}
                  </span>
                  <div className="relative h-7 w-7 shrink-0">
                    <img
                      src={team.info?.logoPath ?? `/team-logos/${team.teamId}.png`}
                      alt={team.info?.shortName ?? team.teamId}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-200">
                      {team.info?.shortName ?? team.teamId}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {team.gapToLeader === 0 ? 'Leading' : `${team.gapToLeader} pts behind`}
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums text-gray-100">
                    {team.totalPoints}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cumulative points through the season */}
      {seasonData.rounds.length > 0 && (
        <ChampionshipProgressionChart seasonData={seasonData} />
      )}

      {!showChampions && (
        /* Mid-season: championship score tables instead of crowning a champion */
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-200">Championship Standings</h4>
              <p className="text-xs text-gray-400">
                After {seasonData.completedRaces} of {seasonData.totalRaces} rounds · season in progress
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30">
              <div className="px-3 py-2 border-b border-gray-700 bg-gray-900/50">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Drivers</h5>
              </div>
              <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-900/95">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Pos</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Driver</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Pts</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">W</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Pod</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Pole</th>
                    </tr>
                  </thead>
                  <tbody>
                    {championshipStandings.map((driver) => {
                      const team = getSeasonTeam(driver.teamId)
                      return (
                        <tr
                          key={driver.driverCode}
                          className="border-b border-gray-800/80 hover:bg-gray-800/40 transition-colors"
                        >
                          <td className="py-2 px-3">
                            <span
                              className={`font-bold tabular-nums text-sm ${
                                driver.position === 1
                                  ? 'text-amber-400'
                                  : driver.position === 2
                                    ? 'text-gray-300'
                                    : driver.position === 3
                                      ? 'text-orange-400'
                                      : 'text-gray-500'
                              }`}
                            >
                              {driver.position}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <DriverBadge
                                code={driver.driverCode}
                                year={seasonData.year}
                                size="sm"
                              />
                              <span className="text-xs text-gray-500 truncate hidden sm:inline">
                                {team?.shortName ?? driver.teamId ?? 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold tabular-nums text-gray-100">
                            {driver.totalPoints}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-400">{driver.raceWins}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-400">{driver.podiums}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-400">{driver.polePositions}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30">
              <div className="px-3 py-2 border-b border-gray-700 bg-gray-900/50">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Constructors</h5>
              </div>
              <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-900/95">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Pos</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Team</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Pts</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">W</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">Pod</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-[10px] uppercase">1-2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constructorStandings.map((team) => {
                      const teamInfo = getSeasonTeam(team.teamId)
                      return (
                        <tr
                          key={team.teamId}
                          className="border-b border-gray-800/80 hover:bg-gray-800/40 transition-colors"
                        >
                          <td className="py-2 px-3">
                            <span
                              className={`font-bold tabular-nums text-sm ${
                                team.position === 1
                                  ? 'text-amber-400'
                                  : team.position === 2
                                    ? 'text-gray-300'
                                    : team.position === 3
                                      ? 'text-orange-400'
                                      : 'text-gray-500'
                              }`}
                            >
                              {team.position}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="relative w-7 h-7 flex-shrink-0">
                                <img
                                  src={teamInfo?.logoPath ?? `/team-logos/${team.teamId}.png`}
                                  alt={teamInfo?.shortName ?? team.teamId}
                                  className="h-full w-full object-contain"
                                  style={
                                    ['aston-martin', 'visa-rb', 'stake', 'cadillac'].includes(team.teamId)
                                      ? { transform: 'scale(1.25)' }
                                      : undefined
                                  }
                                />
                              </div>
                              <span className="font-medium text-gray-200 text-sm">
                                {teamInfo?.shortName ?? team.teamId}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold tabular-nums text-gray-100">
                            {team.totalPoints}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-400">{team.totalWins}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-400">{team.totalPodiums}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-400">{team.oneTwo}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Race-by-race winners */}
      {raceWinners.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-200">Race winners</h4>
              <p className="text-xs text-gray-400">
                Every completed round · {winsByDriver.length} different winners
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {winsByDriver.slice(0, 6).map(({ code, wins }) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-900/50 px-2 py-0.5 text-[11px]"
                >
                  <span
                    className="font-semibold"
                    style={{ color: getSeasonDriverColor(code) }}
                  >
                    {code}
                  </span>
                  <span className="tabular-nums text-gray-400">{wins}×</span>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {raceWinners.map((race) => {
              const color = race.winnerCode
                ? getSeasonDriverColor(race.winnerCode)
                : '#6b7280'
              return (
                <div
                  key={`${race.round}-${race.trackId}`}
                  className="rounded-lg border border-gray-700/80 bg-gray-900/35 p-2.5"
                  style={{ borderTopColor: color, borderTopWidth: 2 }}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] uppercase tracking-wide text-gray-500">
                    <span>R{race.round}</span>
                    {race.poleCode && <span title="Pole">P {race.poleCode}</span>}
                  </div>
                  <div className="mt-1 truncate text-xs font-medium text-gray-300">
                    {race.trackName}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {race.winnerCode ? (
                      <DriverBadge code={race.winnerCode} year={seasonData.year} size="sm" />
                    ) : (
                      <span className="text-xs text-gray-500">TBD</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent form for title contenders */}
      {recentForm.length > 0 && seasonData.completedRaces >= 3 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Recent form</h4>
            <p className="text-xs text-gray-400">Last {recentForm[0]?.finishes.length ?? 0} race finishes for the top three</p>
          </div>
          <div className="space-y-2">
            {recentForm.map(({ driver, finishes }) => (
              <div
                key={driver.driverCode}
                className="flex flex-col gap-2 rounded-lg border border-gray-700/70 bg-gray-900/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-5 text-xs font-bold tabular-nums text-gray-500">
                    P{driver.position}
                  </span>
                  <DriverBadge code={driver.driverCode} year={seasonData.year} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {finishes.map((finish) => {
                    const pos = finish.position
                    const tone =
                      pos === 1
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : pos != null && pos <= 3
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          : pos != null && pos <= 10
                            ? 'bg-gray-700/60 text-gray-200 border-gray-600/60'
                            : 'bg-gray-900 text-gray-500 border-gray-700'
                    return (
                      <div
                        key={`${driver.driverCode}-${finish.round}`}
                        title={`${finish.trackName}${pos != null ? ` · P${pos}` : ''}${finish.status && finish.status !== 'Finished' ? ` · ${finish.status}` : ''}`}
                        className={`min-w-[2.25rem] rounded border px-1.5 py-1 text-center text-xs font-semibold tabular-nums ${tone}`}
                      >
                        {finish.status === 'DNF' || finish.status === 'DNS' || finish.status === 'DSQ'
                          ? finish.status.slice(0, 3)
                          : pos ?? '-'}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Statistics Grid */}
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-3">Season Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatisticsCard
            label="Total Races"
            value={seasonData.totalRaces}
            icon={Flag}
            description={`${seasonData.completedRaces} completed · ${Math.max(0, seasonData.totalRaces - seasonData.completedRaces)} remaining`}
          />
          
          {mostWins && (
            <StatisticsCard
              label="Most Wins"
              value={mostWins.raceWins}
              icon={Trophy}
              description={mostWins.driverCode}
              color={getSeasonDriverColor(mostWins.driverCode)}
            />
          )}
          
          {mostPoles && (
            <StatisticsCard
              label="Most Poles"
              value={mostPoles.polePositions}
              icon={Target}
              description={mostPoles.driverCode}
              color={getSeasonDriverColor(mostPoles.driverCode)}
            />
          )}
          
          {mostFastestLaps && (
            <StatisticsCard
              label="Most Fastest Laps"
              value={mostFastestLaps.fastestLaps}
              icon={Zap}
              description={mostFastestLaps.driverCode}
              color={getSeasonDriverColor(mostFastestLaps.driverCode)}
            />
          )}

          {bestAverageFinish && bestAverageFinish.averageFinishPosition != null && (
            <StatisticsCard
              label="Best Avg Finish"
              value={bestAverageFinish.averageFinishPosition.toFixed(1)}
              icon={Medal}
              description={bestAverageFinish.driverCode}
              color={getSeasonDriverColor(bestAverageFinish.driverCode)}
            />
          )}

          {mostConsistent && mostConsistent.finishingPositionStdDev != null && (
            <StatisticsCard
              label="Most Consistent"
              value={mostConsistent.finishingPositionStdDev.toFixed(2)}
              icon={Gauge}
              description={`${mostConsistent.driverCode} · lower σ`}
              color={getSeasonDriverColor(mostConsistent.driverCode)}
            />
          )}

          {mostPositionsGained && mostPositionsGained.averagePositionsGained != null && (
            <StatisticsCard
              label="Best Race Craft"
              value={`+${mostPositionsGained.averagePositionsGained.toFixed(1)}`}
              icon={TrendingUp}
              description={`${mostPositionsGained.driverCode} · avg places gained`}
              color={getSeasonDriverColor(mostPositionsGained.driverCode)}
            />
          )}

          {bestScoringRate && (
            <StatisticsCard
              label="Scoring Rate"
              value={`${bestScoringRate.pointScoringRate.toFixed(0)}%`}
              icon={Crosshair}
              description={bestScoringRate.driverCode}
              color={getSeasonDriverColor(bestScoringRate.driverCode)}
            />
          )}
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Points Distribution */}
        <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
          <h4 className="text-sm font-semibold text-gray-200 mb-3">Points Distribution (Top 8)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pointsDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{
                    stroke: '#a1a1aa',
                    strokeWidth: 1
                  }}
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '11px',
                    fill: '#f0f0f0',
                    fontWeight: 500
                  }}
                >
                  {pointsDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#111111"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '0.5rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '12px',
                    color: '#f0f0f0'
                  }}
                  itemStyle={{
                    color: '#f0f0f0'
                  }}
                  labelStyle={{
                    color: '#f0f0f0',
                    fontWeight: 600
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Performance Chart */}
        <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-200">{chartTitle}</h4>
            <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1">
              <button
                onClick={() => setChartView('wins')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  chartView === 'wins' 
                    ? 'bg-accent text-white font-semibold' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Wins
              </button>
              <button
                onClick={() => setChartView('podiums')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  chartView === 'podiums' 
                    ? 'bg-accent text-white font-semibold' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Podiums
              </button>
              <button
                onClick={() => setChartView('poles')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  chartView === 'poles' 
                    ? 'bg-accent text-white font-semibold' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Poles
              </button>
              <button
                onClick={() => setChartView('fastest-laps')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  chartView === 'fastest-laps' 
                    ? 'bg-accent text-white font-semibold' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Fastest
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout={chartView === 'wins' ? 'vertical' : 'horizontal'}
                margin={{ top: 10, right: 20, left: chartView === 'wins' ? 10 : 10, bottom: chartView === 'wins' ? 10 : 20 }}
              >
                {chartView === 'wins' ? (
                  <>
                    <XAxis 
                      type="number"
                      stroke="#a1a1aa"
                      tick={{ 
                        fill: '#f0f0f0',
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      stroke="#a1a1aa"
                      tick={{ 
                        fill: '#f0f0f0',
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500
                      }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                      width={60}
                    />
                  </>
                ) : (
                  <>
                    <XAxis 
                      type="number"
                      stroke="#a1a1aa"
                      tick={{ 
                        fill: '#f0f0f0',
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      stroke="#a1a1aa"
                      tick={{ 
                        fill: '#f0f0f0',
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500
                      }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                      width={50}
                    />
                  </>
                )}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '0.5rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '12px',
                    color: '#f0f0f0'
                  }}
                  itemStyle={{
                    color: '#f0f0f0'
                  }}
                  labelStyle={{
                    color: '#f0f0f0',
                    fontWeight: 600
                  }}
                  cursor={{ fill: 'rgba(225, 6, 0, 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={chartView === 'wins' ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                  maxBarSize={chartView === 'wins' ? 40 : 60}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      {mostDNFs && mostDNFs.dnfs > 0 && (
        <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
          <h4 className="text-sm font-semibold text-gray-200 mb-3">Reliability</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatisticsCard
              label="Most DNFs"
              value={mostDNFs.dnfs}
              icon={TrendingDown}
              description={mostDNFs.driverCode}
              color="#ef4444"
              variant="muted"
            />
          </div>
        </div>
      )}
    </div>
  )
}
