'use client'

import React, { useMemo, useState } from 'react'
import { SeasonData, getTrackType, type TrackType } from '../../../lib/seasonTypes'
import { getDriverColor, getTeamById } from '../../../lib/teamData'
import DriverBadge from '../../formatting/DriverBadge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type TrackTypeAnalysisProps = {
  seasonData: SeasonData
  selectedDrivers?: string[]
}

type TrackBucket = {
  races: number
  wins: number
  podiums: number
  points: number
  dnfs: number
  finishes: number[]
  quali: number[]
}

const TRACK_TYPE_META: Record<TrackType, { label: string; blurb: string }> = {
  street: {
    label: 'Street',
    blurb: 'Walls, low grip, and precision: Monaco, Singapore, Jeddah, Miami, Las Vegas, Baku.',
  },
  highSpeed: {
    label: 'High-speed',
    blurb: 'Long straights and big aero demands: Monza, Spa, Silverstone, Bahrain.',
  },
  traditional: {
    label: 'Traditional',
    blurb: 'Technical and permanent circuits that make up most of the calendar.',
  },
}

function emptyBucket(): TrackBucket {
  return { races: 0, wins: 0, podiums: 0, points: 0, dnfs: 0, finishes: [], quali: [] }
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export default function TrackTypeAnalysis({
  seasonData,
  selectedDrivers = [],
}: TrackTypeAnalysisProps) {
  const [activeType, setActiveType] = useState<TrackType>('street')

  const driverCodes = useMemo(() => {
    const ranked = Object.values(seasonData.drivers)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((d) => d.driverCode)
    if (selectedDrivers.length > 0) {
      return ranked.filter((code) =>
        selectedDrivers.some((d) => d.toUpperCase() === code.toUpperCase()),
      )
    }
    return ranked.slice(0, 8)
  }, [seasonData.drivers, selectedDrivers])

  const byDriver = useMemo(() => {
    const map = new Map<string, Record<TrackType, TrackBucket>>()

    for (const code of Object.keys(seasonData.drivers)) {
      map.set(code, {
        street: emptyBucket(),
        highSpeed: emptyBucket(),
        traditional: emptyBucket(),
      })
    }

    for (const round of seasonData.rounds) {
      const trackType = getTrackType(round.trackId)
      for (const result of round.results) {
        const bucket = map.get(result.driverCode)?.[trackType]
        if (!bucket) continue
        bucket.races++
        bucket.points += result.points
        if (result.status === 'DNF') bucket.dnfs++
        if (result.status === 'Finished') {
          bucket.finishes.push(result.position)
          if (result.position === 1) bucket.wins++
          if (result.position <= 3) bucket.podiums++
        }
      }
      for (const quali of round.qualifyingResults) {
        const bucket = map.get(quali.driverCode)?.[trackType]
        if (!bucket || !quali.position) continue
        bucket.quali.push(quali.position)
      }
    }

    return map
  }, [seasonData])

  const ranking = useMemo(() => {
    return driverCodes
      .map((code) => {
        const bucket = byDriver.get(code)?.[activeType] ?? emptyBucket()
        const driver = seasonData.drivers[code]
        return {
          code,
          teamId: driver?.teamId ?? null,
          ...bucket,
          avgFinish: avg(bucket.finishes),
          avgQuali: avg(bucket.quali),
        }
      })
      .filter((row) => row.races > 0)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        const aAvg = a.avgFinish ?? 999
        const bAvg = b.avgFinish ?? 999
        return aAvg - bAvg
      })
  }, [activeType, byDriver, driverCodes, seasonData.drivers])

  const chartData = useMemo(
    () =>
      ranking.slice(0, 8).map((row) => ({
        name: row.code,
        points: row.points,
        color:
          (row.teamId ? getTeamById(row.teamId, seasonData.year)?.color : null) ??
          getDriverColor(row.code, seasonData.year) ??
          '#e10600',
      })),
    [ranking, seasonData.year],
  )

  const calendarSplit = useMemo(() => {
    const counts: Record<TrackType, number> = { street: 0, highSpeed: 0, traditional: 0 }
    for (const round of seasonData.rounds) {
      counts[getTrackType(round.trackId)]++
    }
    return counts
  }, [seasonData.rounds])

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-1">Performance by Track Type</h4>
        <p className="text-xs text-gray-400">
          Who thrives on street circuits, high-speed tracks, and traditional layouts
          {selectedDrivers.length > 0 ? ' · filtered to toolbar drivers' : ' · showing championship leaders'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(TRACK_TYPE_META) as TrackType[]).map((type) => {
          const active = activeType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={`rounded-lg border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-accent/50 bg-accent/10'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-500'
              }`}
            >
              <div className={`font-display text-sm font-semibold ${active ? 'text-accent' : 'text-gray-200'}`}>
                {TRACK_TYPE_META[type].label}
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500">
                {calendarSplit[type]} race{calendarSplit[type] === 1 ? '' : 's'} this season
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500">{TRACK_TYPE_META[activeType].blurb}</p>

      {chartData.length > 0 && (
        <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
          <h5 className="text-sm font-semibold text-gray-200 mb-3">
            Points on {TRACK_TYPE_META[activeType].label.toLowerCase()} circuits
          </h5>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#f0f0f0', fontSize: 11 }} />
                <YAxis stroke="#a1a1aa" tick={{ fill: '#f0f0f0', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#f0f0f0',
                  }}
                />
                <Bar dataKey="points" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">Driver</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">Races</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">Pts</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">Wins</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">Pod</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">Avg Fin</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">Avg Quali</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">DNF</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500 text-sm">
                    No results for this track type yet
                  </td>
                </tr>
              ) : (
                ranking.map((row) => (
                  <tr key={row.code} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <DriverBadge code={row.code} year={seasonData.year} size="sm" variant="badge" />
                    </td>
                    <td className="text-right py-2.5 px-3 text-gray-300">{row.races}</td>
                    <td className="text-right py-2.5 px-3 font-semibold text-gray-100">{row.points}</td>
                    <td className="text-right py-2.5 px-3 text-gray-300">{row.wins}</td>
                    <td className="text-right py-2.5 px-3 text-gray-300">{row.podiums}</td>
                    <td className="text-right py-2.5 px-3 text-gray-300">
                      {row.avgFinish != null ? row.avgFinish.toFixed(1) : 'N/A'}
                    </td>
                    <td className="text-right py-2.5 px-3 text-gray-300">
                      {row.avgQuali != null ? row.avgQuali.toFixed(1) : 'N/A'}
                    </td>
                    <td className="text-right py-2.5 px-3 text-gray-300">{row.dnfs}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
