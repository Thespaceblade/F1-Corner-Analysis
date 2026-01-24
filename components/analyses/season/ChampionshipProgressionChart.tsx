'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { driverColorMap, f1Teams } from '../../../lib/teamData'
import CustomSelect from '../../CustomSelect'

type ChampionshipProgressionChartProps = {
  seasonData: SeasonData
  selectedDrivers?: string[]
}

export default function ChampionshipProgressionChart({ 
  seasonData, 
  selectedDrivers = [] 
}: ChampionshipProgressionChartProps) {
  const [championshipType, setChampionshipType] = useState<'drivers' | 'constructors'>('drivers')
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])

  const progression = seasonData.championshipProgression

  // Get top entities to show by default
  const topEntities = useMemo(() => {
    if (championshipType === 'drivers') {
      return Object.values(seasonData.drivers)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5)
        .map(d => d.driverCode)
    } else {
      return Object.values(seasonData.teams)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5)
        .map(t => t.teamId)
    }
  }, [championshipType, seasonData])

  // Use toolbar-selected drivers if available (only for drivers mode)
  const entitiesToShow = useMemo(() => {
    if (championshipType === 'drivers' && selectedDrivers.length > 0) {
      return selectedDrivers
    }
    return topEntities.slice(0, 3)
  }, [championshipType, selectedDrivers, topEntities])

  // Initialize/update selected entities based on toolbar selection or defaults
  useEffect(() => {
    setSelectedEntities(entitiesToShow)
  }, [entitiesToShow])

  // Build chart data
  const chartData = useMemo(() => {
    const data: Array<any> = []
    const maxRound = Math.max(...seasonData.rounds.map(r => r.round))

    for (let round = 1; round <= maxRound; round++) {
      const dataPoint: any = { round }

      const entities = championshipType === 'drivers' 
        ? selectedEntities 
        : selectedEntities

      for (const entity of entities) {
        const progressionData = championshipType === 'drivers'
          ? progression.drivers[entity]
          : progression.constructors[entity]

        const roundData = progressionData?.find(p => p.round === round)
        dataPoint[entity] = roundData?.points ?? null
      }

      data.push(dataPoint)
    }

    return data
  }, [championshipType, selectedEntities, progression, seasonData.rounds])

  const availableOptions = championshipType === 'drivers'
    ? Object.keys(seasonData.drivers).sort()
    : Object.keys(seasonData.teams).map(t => 
        f1Teams.find(team => team.id === t)?.shortName ?? t
      )

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-3">Championship Progression</h4>
        <p className="text-xs text-gray-400 mb-4">
          Track points evolution throughout the season
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setChampionshipType('drivers')}
            className={`px-3 py-1.5 text-xs rounded ${
              championshipType === 'drivers'
                ? 'bg-accent/15 text-accent border border-accent/40'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-accent/40'
            }`}
          >
            Drivers
          </button>
          <button
            onClick={() => setChampionshipType('constructors')}
            className={`px-3 py-1.5 text-xs rounded ${
              championshipType === 'constructors'
                ? 'bg-accent/15 text-accent border border-accent/40'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-accent/40'
            }`}
          >
            Constructors
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis 
                dataKey="round" 
                stroke="#9aa4b2"
                tick={{ 
                  fill: '#e7eaee', 
                  fontSize: 11,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                tickLine={{ stroke: '#374151' }}
                axisLine={{ stroke: '#374151' }}
                label={{ 
                  value: 'Round', 
                  position: 'insideBottom', 
                  offset: -10, 
                  fill: '#9aa4b2',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: 12
                }}
              />
              <YAxis 
                stroke="#9aa4b2"
                tick={{ 
                  fill: '#e7eaee', 
                  fontSize: 11,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                tickLine={{ stroke: '#374151' }}
                axisLine={{ stroke: '#374151' }}
                label={{ 
                  value: 'Points', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#9aa4b2',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: 12
                }}
              />
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
              <Legend 
                wrapperStyle={{ 
                  fontSize: '11px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: '#e7eaee'
                }}
                iconType="line"
              />
              {selectedEntities.slice(0, 8).map((entity, index) => (
                <Line
                  key={entity}
                  type="monotone"
                  dataKey={entity}
                  stroke={championshipType === 'drivers' 
                    ? (driverColorMap[entity] ?? '#7cc7ff')
                    : (f1Teams.find(t => t.id === entity)?.color ?? '#7cc7ff')
                  }
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#12151b' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {championshipType === 'drivers' && selectedDrivers.length > 0 ? (
          <span>Showing selected drivers from toolbar</span>
        ) : (
          <span>Showing top {selectedEntities.length} {championshipType}</span>
        )}
      </div>
    </div>
  )
}
