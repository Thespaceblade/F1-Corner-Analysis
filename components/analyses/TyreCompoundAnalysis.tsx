'use client'

import React, { useMemo } from 'react'
import { SessionPayload } from '../../lib/sessionDataClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from 'recharts'
import { driverColorMap } from '../../lib/teamData'

type TyreCompoundAnalysisProps = {
  sessionData: SessionPayload
  selectedDrivers: string[]
}

const FALLBACK_COLORS = [
  '#7cc7ff',
  '#22c55e',
  '#facc15',
  '#f97316',
  '#a855f7',
  '#f87171'
]

const getDriverColor = (code: string, index: number) => {
  const normalized = code.toUpperCase()
  return driverColorMap[normalized] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

const COMPOUND_COLORS: Record<string, string> = {
  'SOFT': '#ef4444',
  'MEDIUM': '#eab308',
  'HARD': '#cbd5e1',
  'INTERMEDIATE': '#06b6d4',
  'WET': '#3b82f6',
}

export default function TyreCompoundAnalysis({
  sessionData,
  selectedDrivers,
}: TyreCompoundAnalysisProps) {
  // Group laps by compound
  const compoundData = useMemo(() => {
    if (!sessionData?.laps) return {}

    const compoundStats: Record<string, Record<string, {
      compound: string
      laps: number[]
      avgLapTime: number | null
      bestLapTime: number | null
      worstLapTime: number | null
      sampleCount: number
      avgTyreLife: number | null
    }>> = {}

    selectedDrivers.forEach(driver => {
      compoundStats[driver] = {}
      const driverLaps = sessionData.laps.filter(
        lap => lap.driver.toUpperCase() === driver.toUpperCase() && 
               lap.isValid !== false &&
               lap.compound
      )

      driverLaps.forEach(lap => {
        const compound = lap.compound?.toUpperCase() || 'UNKNOWN'
        if (!compoundStats[driver][compound]) {
          compoundStats[driver][compound] = {
            compound,
            laps: [],
            avgLapTime: null,
            bestLapTime: null,
            worstLapTime: null,
            sampleCount: 0,
            avgTyreLife: null,
          }
        }

        if (lap.lapTimeSeconds !== null) {
          compoundStats[driver][compound].laps.push(lap.lapTimeSeconds)
        }
        compoundStats[driver][compound].sampleCount++
      })

      // Calculate statistics for each compound
      Object.keys(compoundStats[driver]).forEach(compound => {
        const stats = compoundStats[driver][compound]
        if (stats.laps.length > 0) {
          stats.avgLapTime = stats.laps.reduce((a, b) => a + b, 0) / stats.laps.length
          stats.bestLapTime = Math.min(...stats.laps)
          stats.worstLapTime = Math.max(...stats.laps)
        }

        // Calculate average tyre life
        const tyreLives = driverLaps
          .filter(lap => lap.compound?.toUpperCase() === compound && lap.tyreLife !== null)
          .map(lap => lap.tyreLife!)
        
        if (tyreLives.length > 0) {
          stats.avgTyreLife = tyreLives.reduce((a, b) => a + b, 0) / tyreLives.length
        }
      })
    })

    return compoundStats
  }, [sessionData, selectedDrivers])

  // Chart data for compound comparison
  const compoundChartData = useMemo(() => {
    const allCompounds = new Set<string>()
    selectedDrivers.forEach(driver => {
      Object.keys(compoundData[driver] || {}).forEach(compound => {
        allCompounds.add(compound)
      })
    })

    return Array.from(allCompounds).map(compound => {
      const dataPoint: { compound: string; [driverCode: string]: number | null } = {
        compound,
      }

      selectedDrivers.forEach(driver => {
        const stats = compoundData[driver]?.[compound]
        dataPoint[driver] = stats?.avgLapTime ?? null
      })

      return dataPoint
    })
  }, [compoundData, selectedDrivers])

  // Tyre life vs performance
  const tyreLifePerformanceData = useMemo(() => {
    if (!sessionData?.laps) return []

    const performanceByLife: Record<number, Record<string, number[]>> = {}

    selectedDrivers.forEach(driver => {
      const driverLaps = sessionData.laps.filter(
        lap => lap.driver.toUpperCase() === driver.toUpperCase() &&
               lap.isValid !== false &&
               lap.tyreLife !== null &&
               lap.lapTimeSeconds !== null
      )

      driverLaps.forEach(lap => {
        const tyreLife = Math.floor(lap.tyreLife! / 5) * 5 // Round to nearest 5
        if (!performanceByLife[tyreLife]) {
          performanceByLife[tyreLife] = {}
        }
        if (!performanceByLife[tyreLife][driver]) {
          performanceByLife[tyreLife][driver] = []
        }
        performanceByLife[tyreLife][driver].push(lap.lapTimeSeconds!)
      })
    })

    return Object.entries(performanceByLife)
      .map(([tyreLife, drivers]) => {
        const dataPoint: { tyreLife: number; [driverCode: string]: number | null } = {
          tyreLife: parseInt(tyreLife),
        }

        selectedDrivers.forEach(driver => {
          const times = drivers[driver] || []
          dataPoint[driver] = times.length > 0
            ? times.reduce((a, b) => a + b, 0) / times.length
            : null
        })

        return dataPoint
      })
      .sort((a, b) => a.tyreLife - b.tyreLife)
  }, [sessionData, selectedDrivers])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Tyre Compound Analysis
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Analyze performance by tyre compound and tyre life.
        </p>
      </div>

      {/* Compound Summary Table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Compound Performance Summary
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Driver</th>
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Compound</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Laps</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg Lap Time</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best Lap</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Worst Lap</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg Tyre Life</th>
              </tr>
            </thead>
            <tbody>
              {selectedDrivers.flatMap(driver => {
                const driverCompounds = compoundData[driver] || {}
                return Object.values(driverCompounds).map((stats, idx) => (
                  <tr key={`${driver}-${stats.compound}-${idx}`} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-2 px-3 font-medium text-gray-200">{driver}</td>
                    <td className="py-2 px-3">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: COMPOUND_COLORS[stats.compound] ? `${COMPOUND_COLORS[stats.compound]}33` : 'rgba(156, 163, 175, 0.2)',
                          color: COMPOUND_COLORS[stats.compound] || '#9ca3af',
                        }}
                      >
                        {stats.compound}
                      </span>
                    </td>
                    <td className="text-right py-2 px-3 text-gray-300">{stats.sampleCount}</td>
                    <td className="text-right py-2 px-3 text-gray-300">
                      {stats.avgLapTime !== null ? stats.avgLapTime.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3 text-green-400">
                      {stats.bestLapTime !== null ? stats.bestLapTime.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3 text-red-400">
                      {stats.worstLapTime !== null ? stats.worstLapTime.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3 text-gray-300">
                      {stats.avgTyreLife !== null ? stats.avgTyreLife.toFixed(1) : 'N/A'} laps
                    </td>
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compound Comparison Chart */}
      {compoundChartData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Average Lap Time by Compound
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compoundChartData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="compound" 
                  stroke="#9aa4b2"
                  label={{ value: 'Compound', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  label={{ value: 'Avg Lap Time (s)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload) return null
                    return (
                      <div className="panel p-3 min-w-[140px]">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          {payload[0]?.payload.compound}
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : 'N/A'}s
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
                <Legend />
                {selectedDrivers.map((driver, index) => (
                  <Bar 
                    key={driver}
                    dataKey={driver} 
                    fill={getDriverColor(driver, index)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tyre Life Performance Chart */}
      {tyreLifePerformanceData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Performance vs Tyre Life
          </h4>
          <p className="text-xs text-gray-400 mb-4">
            Average lap time at different tyre life stages (rounded to nearest 5 laps).
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tyreLifePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="tyreLife" 
                  stroke="#9aa4b2"
                  label={{ value: 'Tyre Life (laps)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  label={{ value: 'Avg Lap Time (s)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload) return null
                    return (
                      <div className="panel p-3 min-w-[140px]">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          Tyre Life: {payload[0]?.payload.tyreLife} laps
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : 'N/A'}s
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
                <Legend />
                {selectedDrivers.map((driver, index) => (
                  <Line
                    key={driver}
                    type="monotone"
                    dataKey={driver}
                    stroke={getDriverColor(driver, index)}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}


