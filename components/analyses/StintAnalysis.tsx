'use client'

import React, { useMemo } from 'react'
import { SessionPayload } from '../../lib/sessionDataClient'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { getDriverColor as getSeasonDriverColor } from '../../lib/teamData'

type StintAnalysisProps = {
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

const getDriverColor = (code: string, index: number, year?: number) => {
  return getSeasonDriverColor(code, year) ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export default function StintAnalysis({
  sessionData,
  selectedDrivers,
}: StintAnalysisProps) {
  // Group laps by driver and stint
  const stintData = useMemo(() => {
    if (!sessionData?.laps) return {}

    const stintsByDriver: Record<string, Record<number, {
      laps: number[]
      compound: string | null
      tyreLife: number[]
      avgLapTime: number | null
    }>> = {}

    selectedDrivers.forEach(driver => {
      stintsByDriver[driver] = {}
      const driverLaps = sessionData.laps.filter(
        lap => lap.driver.toUpperCase() === driver.toUpperCase() && lap.isValid !== false
      )

      driverLaps.forEach(lap => {
        const stint = lap.stint ?? 1
        if (!stintsByDriver[driver][stint]) {
          stintsByDriver[driver][stint] = {
            laps: [],
            compound: lap.compound || null,
            tyreLife: [],
            avgLapTime: null,
          }
        }

        if (lap.lapTimeSeconds !== null) {
          stintsByDriver[driver][stint].laps.push(lap.lapTimeSeconds)
        }
        if (lap.tyreLife !== null && lap.tyreLife !== undefined) {
          stintsByDriver[driver][stint].tyreLife.push(lap.tyreLife)
        }
        if (!stintsByDriver[driver][stint].compound && lap.compound) {
          stintsByDriver[driver][stint].compound = lap.compound
        }
      })

      // Calculate averages
      Object.keys(stintsByDriver[driver]).forEach(stintStr => {
        const stint = parseInt(stintStr)
        const stintData = stintsByDriver[driver][stint]
        if (stintData.laps.length > 0) {
          stintData.avgLapTime = stintData.laps.reduce((a: number, b: number) => a + b, 0) / stintData.laps.length
        }
      })
    })

    return stintsByDriver
  }, [sessionData, selectedDrivers])

  // Chart data for stint performance
  const stintChartData = useMemo(() => {
    const chartData: Array<{
      lapNumber: number
      [driverCode: string]: number | null
    }> = []

    if (!sessionData?.laps) return chartData

    // Get all lap numbers
    const lapNumbers = new Set<number>()
    selectedDrivers.forEach(driver => {
      sessionData.laps
        .filter(lap => 
          lap.driver.toUpperCase() === driver.toUpperCase() && 
          lap.isValid !== false &&
          lap.lapNumber !== null
        )
        .forEach(lap => lapNumbers.add(lap.lapNumber!))
    })

    Array.from(lapNumbers).sort((a, b) => a - b).forEach(lapNum => {
      const dataPoint: { lapNumber: number; [driverCode: string]: number | null } = {
        lapNumber: lapNum,
      }

      selectedDrivers.forEach(driver => {
        const lap = sessionData.laps.find(
          l => l.driver.toUpperCase() === driver.toUpperCase() &&
               l.lapNumber === lapNum &&
               l.isValid !== false
        )
        dataPoint[driver] = lap?.lapTimeSeconds ?? null
      })

      chartData.push(dataPoint)
    })

    return chartData
  }, [sessionData, selectedDrivers])

  // Tyre degradation data
  const tyreDegradationData = useMemo(() => {
    if (!sessionData?.laps) return []

    const degradation: Array<{
      lapNumber: number
      [driverCode: string]: number | null
    }> = []

    const lapNumbers = new Set<number>()
    selectedDrivers.forEach(driver => {
      sessionData.laps
        .filter(lap => 
          lap.driver.toUpperCase() === driver.toUpperCase() && 
          lap.isValid !== false &&
          lap.lapNumber !== null &&
          lap.tyreLife !== null
        )
        .forEach(lap => lapNumbers.add(lap.lapNumber!))
    })

    Array.from(lapNumbers).sort((a, b) => a - b).forEach(lapNum => {
      const dataPoint: { lapNumber: number; [driverCode: string]: number | null } = {
        lapNumber: lapNum,
      }

      selectedDrivers.forEach(driver => {
        const lap = sessionData.laps.find(
          l => l.driver.toUpperCase() === driver.toUpperCase() &&
               l.lapNumber === lapNum &&
               l.isValid !== false
        )
        dataPoint[driver] = lap?.tyreLife ?? null
      })

      degradation.push(dataPoint)
    })

    return degradation
  }, [sessionData, selectedDrivers])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Stint Analysis
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Analyze performance across stints, tyre compounds, and tyre life.
        </p>
      </div>

      {/* Stint Summary Table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Stint Summary
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Driver</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Stint</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Laps</th>
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Compound</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg Lap Time</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best Lap</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Worst Lap</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stintData).flatMap(([driver, stints]) => 
                Object.entries(stints)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([stintStr, stint]) => {
                    const stintNum = parseInt(stintStr)
                    const bestLap = stint.laps.length > 0 ? Math.min(...stint.laps).toFixed(3) : 'N/A'
                    const worstLap = stint.laps.length > 0 ? Math.max(...stint.laps).toFixed(3) : 'N/A'
                    const avgLapTime = stint.avgLapTime ? stint.avgLapTime.toFixed(3) : 'N/A'

                    return (
                      <tr key={`${driver}-${stintNum}`} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-2 px-3 font-medium text-gray-200">{driver}</td>
                        <td className="text-right py-2 px-3 text-gray-300">{stintNum}</td>
                        <td className="text-right py-2 px-3 text-gray-300">{stint.laps.length}</td>
                        <td className="py-2 px-3">
                          <span className="text-gray-300">{stint.compound || 'N/A'}</span>
                        </td>
                        <td className="text-right py-2 px-3 text-gray-300">{avgLapTime}s</td>
                        <td className="text-right py-2 px-3 text-green-400">{bestLap}s</td>
                        <td className="text-right py-2 px-3 text-red-400">{worstLap}s</td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lap Time by Stint Chart */}
      {stintChartData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Lap Time Performance
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stintChartData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="lapNumber" 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Lap Number', position: 'insideBottom', offset: -5, fill: '#9aa4b2', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft', fill: '#9aa4b2', fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload) return null
                    return (
                      <div className="panel p-3 min-w-[140px] backdrop-blur-sm bg-gray-900/95">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          Lap {payload[0]?.payload.lapNumber}
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
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  iconType="line"
                />
                {selectedDrivers.map((driver, index) => (
                  <Line
                    key={driver}
                    type="monotone"
                    dataKey={driver}
                    stroke={getDriverColor(driver, index, sessionData.meta.year)}
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

      {/* Tyre Life Chart */}
      {tyreDegradationData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Tyre Life
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tyreDegradationData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="lapNumber" 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Lap Number', position: 'insideBottom', offset: -5, fill: '#9aa4b2', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Tyre Life (laps)', angle: -90, position: 'insideLeft', fill: '#9aa4b2', fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload) return null
                    return (
                      <div className="panel p-3 min-w-[140px] backdrop-blur-sm bg-gray-900/95">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          Lap {payload[0]?.payload.lapNumber}
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? entry.value : 'N/A'} laps
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  iconType="line"
                />
                {selectedDrivers.map((driver, index) => (
                  <Line
                    key={driver}
                    type="monotone"
                    dataKey={driver}
                    stroke={getDriverColor(driver, index, sessionData.meta.year)}
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
