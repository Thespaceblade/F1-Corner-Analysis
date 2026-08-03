'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { getDriverColor, getTeamById } from '../../../lib/teamData'

type ChampionshipProgressionChartProps = {
  seasonData: SeasonData
  selectedDrivers?: string[]
}

export default function ChampionshipProgressionChart({
  seasonData,
  selectedDrivers = [],
}: ChampionshipProgressionChartProps) {
  const [championshipType, setChampionshipType] = useState<'drivers' | 'constructors'>('drivers')
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])

  const progression = seasonData.championshipProgression

  const allEntities = useMemo(() => {
    if (championshipType === 'drivers') {
      return Object.values(seasonData.drivers)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((d) => d.driverCode)
    }
    return Object.values(seasonData.teams)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((t) => t.teamId)
  }, [championshipType, seasonData])

  const defaultEntities = useMemo(() => {
    if (championshipType === 'drivers' && selectedDrivers.length > 0) {
      return selectedDrivers
        .map((c) => c.toUpperCase())
        .filter((c) => allEntities.includes(c))
        .slice(0, 8)
    }
    return allEntities.slice(0, 5)
  }, [allEntities, championshipType, selectedDrivers])

  useEffect(() => {
    setSelectedEntities(defaultEntities)
  }, [defaultEntities])

  const chartData = useMemo(() => {
    const maxRound = Math.max(0, ...seasonData.rounds.map((r) => r.round))
    const data: Array<Record<string, number | null>> = []

    for (let round = 1; round <= maxRound; round++) {
      const dataPoint: Record<string, number | null> = { round }
      for (const entity of selectedEntities) {
        const series =
          championshipType === 'drivers'
            ? progression.drivers[entity]
            : progression.constructors[entity]
        const roundData = series?.find((p) => p.round === round)
        dataPoint[entity] = roundData?.points ?? null
      }
      data.push(dataPoint)
    }

    return data
  }, [championshipType, selectedEntities, progression, seasonData.rounds])

  const toggleEntity = (entity: string) => {
    setSelectedEntities((prev) => {
      if (prev.includes(entity)) {
        if (prev.length <= 1) return prev
        return prev.filter((e) => e !== entity)
      }
      if (prev.length >= 8) return prev
      return [...prev, entity]
    })
  }

  const entityLabel = (entity: string) => {
    if (championshipType === 'drivers') return entity
    return getTeamById(entity, seasonData.year)?.shortName ?? entity
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-1">Championship Progression</h4>
        <p className="text-xs text-gray-400">
          Cumulative points by round. Toggle up to 8 lines on the chart.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setChampionshipType('drivers')}
            className={`px-3 py-1.5 text-xs rounded border transition ${
              championshipType === 'drivers'
                ? 'bg-accent/15 text-accent border-accent/40'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-accent/40'
            }`}
          >
            Drivers
          </button>
          <button
            type="button"
            onClick={() => setChampionshipType('constructors')}
            className={`px-3 py-1.5 text-xs rounded border transition ${
              championshipType === 'constructors'
                ? 'bg-accent/15 text-accent border-accent/40'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-accent/40'
            }`}
          >
            Constructors
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedEntities(allEntities.slice(0, 5))}
            className="px-2.5 py-1 text-[11px] rounded border border-gray-700 text-gray-400 hover:border-accent/40 hover:text-accent"
          >
            Top 5
          </button>
          <button
            type="button"
            onClick={() => setSelectedEntities(allEntities.slice(0, 8))}
            className="px-2.5 py-1 text-[11px] rounded border border-gray-700 text-gray-400 hover:border-accent/40 hover:text-accent"
          >
            Top 8
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allEntities.map((entity) => {
          const active = selectedEntities.includes(entity)
          const color =
            championshipType === 'drivers'
              ? getDriverColor(entity, seasonData.year) ?? '#e10600'
              : getTeamById(entity, seasonData.year)?.color ?? '#e10600'
          return (
            <button
              key={entity}
              type="button"
              onClick={() => toggleEntity(entity)}
              className={`px-2 py-1 text-[11px] rounded border transition ${
                active
                  ? 'border-accent/40 text-gray-100'
                  : 'border-gray-800 text-gray-500 hover:border-gray-600'
              }`}
              style={active ? { backgroundColor: `${color}22`, borderColor: `${color}88` } : undefined}
            >
              {entityLabel(entity)}
            </button>
          )
        })}
      </div>

      <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.3} />
              <XAxis
                dataKey="round"
                stroke="#a1a1aa"
                tick={{ fill: '#f0f0f0', fontSize: 11 }}
                tickLine={{ stroke: '#3f3f46' }}
                axisLine={{ stroke: '#3f3f46' }}
                label={{
                  value: 'Round',
                  position: 'insideBottom',
                  offset: -10,
                  fill: '#a1a1aa',
                  fontSize: 12,
                }}
              />
              <YAxis
                stroke="#a1a1aa"
                tick={{ fill: '#f0f0f0', fontSize: 11 }}
                tickLine={{ stroke: '#3f3f46' }}
                axisLine={{ stroke: '#3f3f46' }}
                label={{
                  value: 'Points',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#a1a1aa',
                  fontSize: 12,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f0f0f0',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#f0f0f0' }} iconType="line" />
              {selectedEntities.map((entity) => (
                <Line
                  key={entity}
                  type="monotone"
                  dataKey={entity}
                  name={entityLabel(entity)}
                  stroke={
                    championshipType === 'drivers'
                      ? getDriverColor(entity, seasonData.year) ?? '#e10600'
                      : getTeamById(entity, seasonData.year)?.color ?? '#e10600'
                  }
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 2, fill: '#111111' }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
