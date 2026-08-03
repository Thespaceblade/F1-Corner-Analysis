'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { calculateHeadToHead } from '../../../lib/seasonAggregator'
import CustomSelect from '../../CustomSelect'
import DriverBadge from '../../formatting/DriverBadge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDriverColor, getTeamById } from '../../../lib/teamData'

type HeadToHeadComparisonProps = {
  seasonData: SeasonData
  selectedDrivers?: string[]
}

function formatGap(seconds: number | null, invertLabel = false): string {
  if (seconds == null || Number.isNaN(seconds)) return 'N/A'
  const abs = Math.abs(seconds)
  const formatted = abs < 1 ? `${(abs * 1000).toFixed(0)}ms` : `${abs.toFixed(3)}s`
  if (seconds === 0) return 'Even'
  if (invertLabel) {
    return seconds < 0 ? `${formatted} faster` : `${formatted} slower`
  }
  return seconds < 0 ? `${formatted} (P1 ahead)` : `${formatted} (P2 ahead)`
}

function formatPosition(position: number | null | undefined): string {
  return position == null ? 'N/A' : `P${position}`
}

export default function HeadToHeadComparison({
  seasonData,
  selectedDrivers = [],
}: HeadToHeadComparisonProps) {
  const driverCodes = useMemo(
    () =>
      Object.values(seasonData.drivers)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((d) => d.driverCode),
    [seasonData.drivers],
  )

  const defaults = useMemo(() => {
    const fromToolbar = selectedDrivers
      .map((c) => c.toUpperCase())
      .filter((c) => driverCodes.includes(c))
    return {
      d1: fromToolbar[0] ?? driverCodes[0] ?? '',
      d2: fromToolbar[1] ?? driverCodes[1] ?? '',
    }
  }, [driverCodes, selectedDrivers])

  const [driver1, setDriver1] = useState(defaults.d1)
  const [driver2, setDriver2] = useState(defaults.d2)

  useEffect(() => {
    setDriver1(defaults.d1)
    setDriver2(defaults.d2)
  }, [defaults.d1, defaults.d2, seasonData.year])

  const h2hData = useMemo(() => {
    if (!driver1 || !driver2 || driver1 === driver2) return null
    return calculateHeadToHead(driver1, driver2, seasonData.rounds)
  }, [driver1, driver2, seasonData.rounds])

  const color1 = getDriverColor(driver1, seasonData.year) ?? '#e10600'
  const color2 = getDriverColor(driver2, seasonData.year) ?? '#ff7c7c'

  const qualiChartData = h2hData
    ? [
        { name: driver1, value: h2hData.qualifyingWins.driver1 },
        { name: driver2, value: h2hData.qualifyingWins.driver2 },
      ]
    : []

  const raceChartData = h2hData
    ? [
        { name: driver1, value: h2hData.raceWins.driver1 },
        { name: driver2, value: h2hData.raceWins.driver2 },
      ]
    : []

  const selectOptions = driverCodes.map((code) => {
    const teamId = seasonData.drivers[code]?.teamId
    const team = teamId ? getTeamById(teamId, seasonData.year) : null
    return {
      value: code,
      label: team ? `${code} · ${team.shortName}` : code,
    }
  })

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-1">Head-to-Head Comparison</h4>
        <p className="text-xs text-gray-400">
          Qualifying edges, race battles, gaps, and a round-by-round scorecard
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Driver 1</label>
          <CustomSelect
            value={driver1}
            onChange={(v) => setDriver1(String(v))}
            options={selectOptions}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Driver 2</label>
          <CustomSelect
            value={driver2}
            onChange={(v) => setDriver2(String(v))}
            options={selectOptions}
          />
        </div>
      </div>

      {h2hData && driver1 !== driver2 ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            <DriverBadge code={driver1} year={seasonData.year} size="md" variant="badge" />
            <span className="font-display text-lg text-gray-500">vs</span>
            <DriverBadge code={driver2} year={seasonData.year} size="md" variant="badge" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
              <div className="text-xs text-gray-400 mb-2">Qualifying H2H</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold" style={{ color: color1 }}>
                  {h2hData.qualifyingWins.driver1}
                </span>
                <span className="text-gray-600">–</span>
                <span className="text-2xl font-bold" style={{ color: color2 }}>
                  {h2hData.qualifyingWins.driver2}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {h2hData.qualifyingWins.total} sessions compared
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
              <div className="text-xs text-gray-400 mb-2">Race H2H</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold" style={{ color: color1 }}>
                  {h2hData.raceWins.driver1}
                </span>
                <span className="text-gray-600">–</span>
                <span className="text-2xl font-bold" style={{ color: color2 }}>
                  {h2hData.raceWins.driver2}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {h2hData.raceWins.total} finishes compared
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
              <div className="text-xs text-gray-400 mb-2">Points</div>
              <div className="text-2xl font-bold text-gray-100">
                {h2hData.pointsDifference > 0 ? '+' : ''}
                {h2hData.pointsDifference}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {h2hData.pointsScored.driver1} vs {h2hData.pointsScored.driver2}
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
              <div className="text-xs text-gray-400 mb-2">Avg quali gap</div>
              <div className="text-lg font-semibold text-gray-100">
                {formatGap(h2hData.avgQualifyingGap)}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Avg race pos gap:{' '}
                {h2hData.avgRaceGap == null
                  ? 'N/A'
                  : `${h2hData.avgRaceGap > 0 ? '+' : ''}${h2hData.avgRaceGap.toFixed(1)}`}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/20 text-sm">
              <div className="text-xs text-gray-400 mb-1">Best / worst finish: {driver1}</div>
              <div className="text-gray-200">
                {formatPosition(h2hData.driver1BestFinish)} · {formatPosition(h2hData.driver1WorsFinish)}
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/20 text-sm">
              <div className="text-xs text-gray-400 mb-1">Best / worst finish: {driver2}</div>
              <div className="text-gray-200">
                {formatPosition(h2hData.driver2BestFinish)} · {formatPosition(h2hData.driver2WorstFinish)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
              <h5 className="text-sm font-semibold text-gray-200 mb-3">Qualifying battles won</h5>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qualiChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#f0f0f0', fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke="#a1a1aa" tick={{ fill: '#f0f0f0', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        color: '#f0f0f0',
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                      {qualiChartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={getDriverColor(entry.name, seasonData.year) ?? '#e10600'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
              <h5 className="text-sm font-semibold text-gray-200 mb-3">Race battles won</h5>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={raceChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#f0f0f0', fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke="#a1a1aa" tick={{ fill: '#f0f0f0', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        color: '#f0f0f0',
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                      {raceChartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={getDriverColor(entry.name, seasonData.year) ?? '#e10600'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/30">
            <div className="px-3 py-2.5 border-b border-gray-700 bg-gray-900/40">
              <h5 className="text-sm font-semibold text-gray-200">Round-by-round</h5>
            </div>
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900/95">
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2.5 px-3 text-gray-400 font-semibold text-xs">Rnd</th>
                    <th className="text-left py-2.5 px-3 text-gray-400 font-semibold text-xs">Track</th>
                    <th className="text-right py-2.5 px-3 text-gray-400 font-semibold text-xs">
                      {driver1} Q
                    </th>
                    <th className="text-right py-2.5 px-3 text-gray-400 font-semibold text-xs">
                      {driver2} Q
                    </th>
                    <th className="text-right py-2.5 px-3 text-gray-400 font-semibold text-xs">
                      {driver1} R
                    </th>
                    <th className="text-right py-2.5 px-3 text-gray-400 font-semibold text-xs">
                      {driver2} R
                    </th>
                    <th className="text-right py-2.5 px-3 text-gray-400 font-semibold text-xs">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {h2hData.raceByRace.map((row) => {
                    const qWinner =
                      row.driver1Quali != null &&
                      row.driver2Quali != null &&
                      row.driver1Quali !== row.driver2Quali
                        ? row.driver1Quali < row.driver2Quali
                          ? 1
                          : 2
                        : 0
                    const rWinner =
                      row.driver1Race != null &&
                      row.driver2Race != null &&
                      row.driver1Race !== row.driver2Race
                        ? row.driver1Race < row.driver2Race
                          ? 1
                          : 2
                        : 0

                    return (
                      <tr key={row.round} className="border-b border-gray-800 hover:bg-gray-800/40">
                        <td className="py-2 px-3 text-gray-400">{row.round}</td>
                        <td className="py-2 px-3 text-gray-200">{row.trackName}</td>
                        <td
                          className={`text-right py-2 px-3 ${
                            qWinner === 1 ? 'text-accent font-semibold' : 'text-gray-300'
                          }`}
                        >
                          {row.driver1Quali != null ? `P${row.driver1Quali}` : 'N/A'}
                        </td>
                        <td
                          className={`text-right py-2 px-3 ${
                            qWinner === 2 ? 'text-accent font-semibold' : 'text-gray-300'
                          }`}
                        >
                          {row.driver2Quali != null ? `P${row.driver2Quali}` : 'N/A'}
                        </td>
                        <td
                          className={`text-right py-2 px-3 ${
                            rWinner === 1 ? 'text-accent font-semibold' : 'text-gray-300'
                          }`}
                        >
                          {row.driver1Race != null ? `P${row.driver1Race}` : 'N/A'}
                        </td>
                        <td
                          className={`text-right py-2 px-3 ${
                            rWinner === 2 ? 'text-accent font-semibold' : 'text-gray-300'
                          }`}
                        >
                          {row.driver2Race != null ? `P${row.driver2Race}` : 'N/A'}
                        </td>
                        <td className="text-right py-2 px-3 text-gray-400">
                          {row.driver1Points}–{row.driver2Points}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 py-10 border border-dashed border-gray-700 rounded-lg">
          <p>Select two different drivers to compare</p>
          <p className="text-xs text-gray-500 mt-1">
            Tip: pick drivers in the toolbar first to pre-fill this duel
          </p>
        </div>
      )}
    </div>
  )
}
