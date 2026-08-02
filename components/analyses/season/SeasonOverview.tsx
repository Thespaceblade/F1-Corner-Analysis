'use client'

import React, { useMemo, useState } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { 
  Trophy, 
  Target, 
  Zap, 
  Flag, 
  TrendingDown,
  Building2
} from 'lucide-react'
import StatisticsCard from './StatisticsCard'
import { getDriverColor, getTeamById } from '../../../lib/teamData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getDriverPhoto } from '../../../lib/driverPhotos'
import DriverBadge from '../../formatting/DriverBadge'

type SeasonOverviewProps = {
  seasonData: SeasonData
}

export default function SeasonOverview({ seasonData }: SeasonOverviewProps) {
  const [chartView, setChartView] = useState<'wins' | 'podiums' | 'poles' | 'fastest-laps'>('wins')
  const getSeasonDriverColor = (driverCode: string, fallback = '#7cc7ff') =>
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
      color: getSeasonTeam(team.teamId)?.color ?? '#7cc7ff',
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
      {showChampions ? (
        /* Champions Banner — only when the season is finished */
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
                  style={{ color: getSeasonDriverColor(driverChampion!.driverCode, '#e7eaee') }}
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
                  style={{ color: getSeasonTeam(constructorChampion!.teamId)?.color ?? '#e7eaee' }}
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
      ) : (
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
                                {team?.shortName ?? driver.teamId ?? '—'}
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

      {/* Key Statistics Grid */}
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-3">Season Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatisticsCard
            label="Total Races"
            value={seasonData.totalRaces}
            icon={Flag}
            description={`${seasonData.completedRaces} completed`}
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
                    stroke: '#9aa4b2',
                    strokeWidth: 1
                  }}
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '11px',
                    fill: '#e7eaee',
                    fontWeight: 500
                  }}
                >
                  {pointsDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#12151b"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '12px',
                    color: '#e7eaee'
                  }}
                  itemStyle={{
                    color: '#e7eaee'
                  }}
                  labelStyle={{
                    color: '#e7eaee',
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
                      stroke="#9aa4b2"
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      stroke="#9aa4b2"
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                      width={60}
                    />
                  </>
                ) : (
                  <>
                    <XAxis 
                      type="number"
                      stroke="#9aa4b2"
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      stroke="#9aa4b2"
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                      width={50}
                    />
                  </>
                )}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '12px',
                    color: '#e7eaee'
                  }}
                  itemStyle={{
                    color: '#e7eaee'
                  }}
                  labelStyle={{
                    color: '#e7eaee',
                    fontWeight: 600
                  }}
                  cursor={{ fill: 'rgba(124, 199, 255, 0.1)' }}
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
