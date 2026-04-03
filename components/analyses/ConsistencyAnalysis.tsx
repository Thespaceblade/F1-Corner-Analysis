'use client'

import React, { useMemo } from 'react'
import { SessionPayload } from '../../lib/sessionDataClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { getDriverColor as getSeasonDriverColor } from '../../lib/teamData'

type ConsistencyAnalysisProps = {
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

export default function ConsistencyAnalysis({
  sessionData,
  selectedDrivers,
}: ConsistencyAnalysisProps) {
  // Calculate consistency metrics
  const consistencyData = useMemo(() => {
    if (!sessionData?.laps) return []

    const driverStats: Array<{
      driver: string
      avgLapTime: number | null
      bestLapTime: number | null
      worstLapTime: number | null
      stdDev: number | null
      variance: number | null
      consistency: number | null // Lower is better (stdDev / avgLapTime)
      sampleCount: number
      validLaps: number[]
    }> = []

    selectedDrivers.forEach(driver => {
      const driverLaps = sessionData.laps
        .filter(lap => 
          lap.driver.toUpperCase() === driver.toUpperCase() && 
          lap.isValid !== false &&
          lap.lapTimeSeconds !== null
        )
        .map(lap => lap.lapTimeSeconds!)

      if (driverLaps.length === 0) {
        driverStats.push({
          driver,
          avgLapTime: null,
          bestLapTime: null,
          worstLapTime: null,
          stdDev: null,
          variance: null,
          consistency: null,
          sampleCount: 0,
          validLaps: [],
        })
        return
      }

      const avgLapTime = driverLaps.reduce((a: number, b: number) => a + b, 0) / driverLaps.length
      const bestLapTime = Math.min(...driverLaps)
      const worstLapTime = Math.max(...driverLaps)

      // Calculate standard deviation
      const variance = driverLaps.reduce((sum: number, time: number) => sum + Math.pow(time - avgLapTime, 2), 0) / driverLaps.length
      const stdDev = Math.sqrt(variance)

      // Consistency score (coefficient of variation) - lower is more consistent
      const consistency = avgLapTime > 0 ? stdDev / avgLapTime : null

      driverStats.push({
        driver,
        avgLapTime,
        bestLapTime,
        worstLapTime,
        stdDev,
        variance,
        consistency,
        sampleCount: driverLaps.length,
        validLaps: driverLaps,
      })
    })

    return driverStats.sort((a, b) => {
      // Sort by consistency (lower is better), then by average time
      if (a.consistency !== null && b.consistency !== null) {
        return a.consistency - b.consistency
      }
      if (a.avgLapTime !== null && b.avgLapTime !== null) {
        return a.avgLapTime - b.avgLapTime
      }
      return 0
    })
  }, [sessionData, selectedDrivers])

  // Lap time distribution (histogram data)
  const distributionData = useMemo(() => {
    if (!sessionData?.laps) return []

    // Create bins for histogram
    const bins: Record<string, Record<string, number>> = {}
    const binSize = 0.5 // 0.5 second bins

    selectedDrivers.forEach(driver => {
      const driverLaps = sessionData.laps
        .filter(lap => 
          lap.driver.toUpperCase() === driver.toUpperCase() && 
          lap.isValid !== false &&
          lap.lapTimeSeconds !== null
        )
        .map(lap => lap.lapTimeSeconds!)

      driverLaps.forEach(time => {
        const bin = Math.floor(time / binSize) * binSize
        const binKey = bin.toFixed(1)
        
        if (!bins[binKey]) {
          bins[binKey] = {}
        }
        if (!bins[binKey][driver]) {
          bins[binKey][driver] = 0
        }
        bins[binKey][driver]++
      })
    })

    return Object.entries(bins)
      .map(([bin, drivers]) => {
        const dataPoint: { timeBin: number; [driverCode: string]: number } = {
          timeBin: parseFloat(bin),
        }

        selectedDrivers.forEach(driver => {
          dataPoint[driver] = drivers[driver] || 0
        })

        return dataPoint
      })
      .sort((a, b) => a.timeBin - b.timeBin)
  }, [sessionData, selectedDrivers])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Consistency Analysis
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Analyze lap time consistency, standard deviation, and performance distribution.
        </p>
      </div>

      {/* Consistency Summary Table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Consistency Metrics
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Driver</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg Lap Time</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best Lap</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Worst Lap</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Std Dev</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Consistency</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Range</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Samples</th>
              </tr>
            </thead>
            <tbody>
              {consistencyData.map((driver) => {
                const range = driver.bestLapTime !== null && driver.worstLapTime !== null
                  ? driver.worstLapTime - driver.bestLapTime
                  : null

                return (
                  <tr key={driver.driver} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-2 px-3 font-medium text-gray-200">{driver.driver}</td>
                    <td className="text-right py-2 px-3 text-gray-300">
                      {driver.avgLapTime !== null ? driver.avgLapTime.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3 text-green-400">
                      {driver.bestLapTime !== null ? driver.bestLapTime.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3 text-red-400">
                      {driver.worstLapTime !== null ? driver.worstLapTime.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3 text-gray-300">
                      {driver.stdDev !== null ? driver.stdDev.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3">
                      {driver.consistency !== null ? (
                        <span className={driver.consistency < 0.01 ? 'text-green-400' : driver.consistency < 0.02 ? 'text-yellow-400' : 'text-red-400'}>
                          {(driver.consistency * 100).toFixed(2)}%
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="text-right py-2 px-3 text-gray-300">
                      {range !== null ? range.toFixed(3) : 'N/A'}s
                    </td>
                    <td className="text-right py-2 px-3 text-gray-400">{driver.sampleCount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Consistency: Coefficient of variation (std dev / avg). Lower is more consistent. &lt;1% = excellent, &lt;2% = good, &gt;2% = variable.
        </p>
      </div>

      {/* Consistency Comparison Chart */}
      {consistencyData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Consistency Comparison
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistencyData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="driver" 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Driver', position: 'insideBottom', offset: -5, fill: '#9aa4b2', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Standard Deviation (s)', angle: -90, position: 'insideLeft', fill: '#9aa4b2', fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null
                    const data = payload[0].payload
                    return (
                      <div className="panel p-3 min-w-[180px] backdrop-blur-sm bg-gray-900/95">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          {data.driver}
                        </div>
                        <div className="space-y-1 text-xs text-gray-200">
                          <div>Std Dev: {data.stdDev?.toFixed(3)}s</div>
                          <div>Consistency: {data.consistency !== null ? (data.consistency * 100).toFixed(2) : 'N/A'}%</div>
                          <div>Avg: {data.avgLapTime?.toFixed(3)}s</div>
                          <div>Range: {data.bestLapTime && data.worstLapTime ? (data.worstLapTime - data.bestLapTime).toFixed(3) : 'N/A'}s</div>
                        </div>
                      </div>
                    )
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                <Bar dataKey="stdDev" fill="#7cc7ff" name="Standard Deviation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Lap Time Distribution */}
      {distributionData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Lap Time Distribution
          </h4>
          <p className="text-xs text-gray-400 mb-4">
            Distribution of lap times (0.5 second bins). Shows consistency and spread of performance.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="timeBin" 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Lap Time (s)', position: 'insideBottom', offset: -5, fill: '#9aa4b2', fontSize: 12 }}
                  tickFormatter={(value: number) => value.toFixed(1)}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#9aa4b2', fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload) return null
                    return (
                      <div className="panel p-3 min-w-[140px] backdrop-blur-sm bg-gray-900/95">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          Time: {payload[0]?.payload.timeBin.toFixed(1)}s
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
                />
                {selectedDrivers.map((driver, index) => (
                  <Bar 
                    key={driver}
                    dataKey={driver} 
                    fill={getDriverColor(driver, index, sessionData.meta.year)}
                    opacity={0.7}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

