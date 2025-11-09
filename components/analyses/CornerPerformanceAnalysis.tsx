'use client'

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts'
import { CornerMetrics, SessionPayload } from '../../lib/sessionDataClient'
import { filterCorners, CornerFilter } from '../../lib/cornerFilter'

type CornerPerformanceAnalysisProps = {
  corners: Record<string, CornerMetrics[]>
  cornerInfo: Array<{
    number: number
    type: 'slow' | 'medium' | 'fast'
    x: number
    y: number
  }>
  selectedDrivers: string[]
  cornerFilter: CornerFilter
  sessionData: SessionPayload | null
}

type AggregatedCornerData = {
  avgEntrySpeed: number
  avgApexSpeed: number
  avgExitSpeed: number
  avgCornerTime: number | null
  bestCornerTime: number | null
  bestLapNumber: number | null
  lapCount: number
}

type CornerDeltaData = {
  cornerNumber: number
  cornerType: 'slow' | 'medium' | 'fast'
  delta: number | null
  driver1Time: number | null
  driver2Time: number | null
}

const typeColors: Record<'slow' | 'medium' | 'fast', string> = {
  slow: '#ef4444',
  medium: '#eab308',
  fast: '#22c55e'
}

export default function CornerPerformanceAnalysis({
  corners,
  cornerInfo,
  selectedDrivers,
  cornerFilter,
  sessionData,
}: CornerPerformanceAnalysisProps) {
  // Filter corners based on filter criteria
  const filteredCorners = useMemo(() => {
    if (!sessionData) return corners
    return filterCorners(corners, cornerFilter, sessionData)
  }, [corners, cornerFilter, sessionData])

  const hasCornerData = Object.values(filteredCorners ?? {}).some((driverCorners) =>
    Array.isArray(driverCorners) && driverCorners.length > 0
  )

  // Aggregate corner data by corner number (from CornerTable)
  const aggregatedCorners = useMemo(() => {
    const aggregated: Map<number, {
      cornerNumber: number
      cornerType: 'slow' | 'medium' | 'fast'
      driverData: Record<string, AggregatedCornerData>
    }> = new Map()

    // Initialize with track corner info
    cornerInfo.forEach(corner => {
      aggregated.set(corner.number, {
        cornerNumber: corner.number,
        cornerType: corner.type,
        driverData: {},
      })
    })

    // Aggregate data from each driver
    selectedDrivers.forEach(driverCode => {
      const driverCorners = filteredCorners[driverCode] || []

      // Group by corner number
      const byCorner = new Map<number, CornerMetrics[]>()
      driverCorners.forEach(corner => {
        const num = corner.cornerNumber
        if (!byCorner.has(num)) {
          byCorner.set(num, [])
        }
        byCorner.get(num)!.push(corner)
      })

      // Calculate aggregates for each corner
      byCorner.forEach((cornerLaps, cornerNum) => {
        if (!aggregated.has(cornerNum)) {
          // Corner not in track definition - use detected type or default
          const detectedType = cornerLaps[0]?.cornerType || 'medium'
          aggregated.set(cornerNum, {
            cornerNumber: cornerNum,
            cornerType: detectedType === 'unknown' ? 'medium' : detectedType,
            driverData: {},
          })
        }

        const corner = aggregated.get(cornerNum)!
        const validTimes = cornerLaps
          .map(c => c.cornerTime)
          .filter((t): t is number => t !== null && !isNaN(t))

        const avgEntrySpeed = cornerLaps.reduce((sum: number, c) => sum + c.entrySpeed, 0) / cornerLaps.length
        const avgApexSpeed = cornerLaps.reduce((sum: number, c) => sum + c.apexSpeed, 0) / cornerLaps.length
        const avgExitSpeed = cornerLaps.reduce((sum: number, c) => sum + c.exitSpeed, 0) / cornerLaps.length
        const avgCornerTime = validTimes.length > 0
          ? validTimes.reduce((sum: number, t: number) => sum + t, 0) / validTimes.length
          : null

        const bestTimeIndex = validTimes.length > 0
          ? validTimes.indexOf(Math.min(...validTimes))
          : -1

        corner.driverData[driverCode] = {
          avgEntrySpeed: Math.round(avgEntrySpeed * 10) / 10,
          avgApexSpeed: Math.round(avgApexSpeed * 10) / 10,
          avgExitSpeed: Math.round(avgExitSpeed * 10) / 10,
          avgCornerTime: avgCornerTime ? Math.round(avgCornerTime * 1000) / 1000 : null,
          bestCornerTime: bestTimeIndex >= 0 ? Math.round(validTimes[bestTimeIndex] * 1000) / 1000 : null,
          bestLapNumber: bestTimeIndex >= 0 ? cornerLaps[bestTimeIndex].lapNumber : null,
          lapCount: cornerLaps.length,
        }
      })
    })

    return Array.from(aggregated.values()).sort((a, b) => a.cornerNumber - b.cornerNumber)
  }, [filteredCorners, cornerInfo, selectedDrivers])

  // Calculate delta data (from CornerDeltaChart)
  const deltaData = useMemo(() => {
    if (selectedDrivers.length < 2) return []

    const driver1 = selectedDrivers[0]
    const driver2 = selectedDrivers[1]
    const driver1Corners = filteredCorners[driver1] || []
    const driver2Corners = filteredCorners[driver2] || []

    // Group corners by corner number
    const driver1ByCorner = new Map<number, CornerMetrics[]>()
    const driver2ByCorner = new Map<number, CornerMetrics[]>()

    driver1Corners.forEach(corner => {
      const num = corner.cornerNumber
      if (!driver1ByCorner.has(num)) {
        driver1ByCorner.set(num, [])
      }
      driver1ByCorner.get(num)!.push(corner)
    })

    driver2Corners.forEach(corner => {
      const num = corner.cornerNumber
      if (!driver2ByCorner.has(num)) {
        driver2ByCorner.set(num, [])
      }
      driver2ByCorner.get(num)!.push(corner)
    })

    // Calculate average corner times and deltas
    const deltas: CornerDeltaData[] = []
    const allCornerNumbers = new Set([
      ...driver1ByCorner.keys(),
      ...driver2ByCorner.keys(),
    ])

    allCornerNumbers.forEach(cornerNum => {
      const driver1Laps = driver1ByCorner.get(cornerNum) || []
      const driver2Laps = driver2ByCorner.get(cornerNum) || []

      // Calculate average corner times
      const driver1Times = driver1Laps
        .map(c => c.cornerTime)
        .filter((t): t is number => t !== null && !isNaN(t))
      const driver2Times = driver2Laps
        .map(c => c.cornerTime)
        .filter((t): t is number => t !== null && !isNaN(t))

      if (driver1Times.length === 0 || driver2Times.length === 0) {
        return
      }

      const driver1Avg = driver1Times.reduce((sum: number, t: number) => sum + t, 0) / driver1Times.length
      const driver2Avg = driver2Times.reduce((sum: number, t: number) => sum + t, 0) / driver2Times.length

      // Delta: positive means driver1 is slower
      const delta = driver1Avg - driver2Avg

      // Get corner type from cornerInfo or use 'medium' as default
      const cornerInfoItem = cornerInfo.find(c => c.number === cornerNum)
      const cornerType = cornerInfoItem?.type || 'medium'

      deltas.push({
        cornerNumber: cornerNum,
        cornerType,
        delta: Math.round(delta * 1000) / 1000,
        driver1Time: Math.round(driver1Avg * 1000) / 1000,
        driver2Time: Math.round(driver2Avg * 1000) / 1000,
      })
    })

    return deltas.sort((a, b) => a.cornerNumber - b.cornerNumber)
  }, [filteredCorners, cornerInfo, selectedDrivers])

  if (!hasCornerData) {
    return (
      <div className="rounded border border-dashed border-gray-600/60 bg-gray-900/40 p-4 text-sm text-gray-400">
        Corner telemetry is not yet generated for this session. Generate the dataset with corner detection enabled.
      </div>
    )
  }

  const driver1 = selectedDrivers[0]
  const driver2 = selectedDrivers[1]

  return (
    <div className="space-y-6">
      {/* Corner Performance Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300">
            Corner Performance Table
          </h4>
          {cornerFilter.type !== 'all' && (
            <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-800/50">
              {cornerFilter.type === 'qualifying-segment' && cornerFilter.segment
                ? `Filtered: ${cornerFilter.segment}`
                : cornerFilter.type === 'lap' && cornerFilter.lapNumber
                ? `Filtered: Lap ${cornerFilter.lapNumber}`
                : cornerFilter.type === 'average'
                ? 'Filtered: Average'
                : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Corner-level telemetry showing average speeds and corner times. Best times are highlighted in yellow.
          {cornerFilter.type === 'qualifying-segment' && cornerFilter.segment && ' Showing fastest lap from ' + cornerFilter.segment + '.'}
          {cornerFilter.type === 'lap' && cornerFilter.lapNumber && ' Showing corners from lap ' + cornerFilter.lapNumber + '.'}
          {cornerFilter.type === 'average' && ' Showing average performance across all valid laps.'}
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="pb-2">Corner</th>
                <th className="pb-2">Type</th>
                {selectedDrivers.map((code) => (
                  <th key={code} className="pb-2 text-center">
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aggregatedCorners.map((corner) => (
                <tr key={corner.cornerNumber} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="py-2 font-medium text-gray-200">{corner.cornerNumber}</td>
                  <td className="py-2">
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: typeColors[corner.cornerType] }}
                    />
                    <span className="uppercase tracking-wide text-xs text-gray-400">{corner.cornerType}</span>
                  </td>
                  {selectedDrivers.map((code) => {
                    const data = corner.driverData[code]
                    if (!data || data.lapCount === 0) {
                      return (
                        <td key={code} className="py-2 text-gray-500 text-xs text-center">
                          No data
                        </td>
                      )
                    }

                    return (
                      <td key={code} className="py-2 text-gray-300">
                        <div className="text-xs space-y-1">
                          {data.avgCornerTime !== null && (
                            <div className="font-mono text-center">
                              <span className={data.bestCornerTime !== null && data.bestCornerTime < data.avgCornerTime ? 'text-yellow-400' : ''}>
                                {data.avgCornerTime.toFixed(3)}s
                              </span>
                              {data.bestCornerTime !== null && data.bestCornerTime < data.avgCornerTime && (
                                <span className="ml-1 text-yellow-400 text-[10px]" title={`Best: ${data.bestCornerTime.toFixed(3)}s (Lap ${data.bestLapNumber})`}>
                                  ⭐
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-500 text-center space-y-0.5">
                            <div>Entry: {data.avgEntrySpeed.toFixed(0)} km/h</div>
                            <div>Apex: {data.avgApexSpeed.toFixed(0)} km/h</div>
                            <div>Exit: {data.avgExitSpeed.toFixed(0)} km/h</div>
                            <div className="text-[9px] text-gray-600 mt-1">
                              {data.lapCount} lap{data.lapCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corner Delta Chart */}
      {selectedDrivers.length >= 2 && deltaData.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Corner Delta Comparison
          </h4>
          <p className="text-xs text-gray-400 mb-4">
            Time difference per corner: {driver1} vs {driver2}. Positive values mean {driver1} is slower.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deltaData} margin={{ top: 12, right: 12, left: 6, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 6" className="chart-grid" />
                <XAxis
                  dataKey="cornerNumber"
                  stroke="#9aa4b2"
                  label={{ value: 'Corner', position: 'insideBottomRight', offset: -4 }}
                />
                <YAxis
                  stroke="#9aa4b2"
                  label={{ value: 'Delta (s)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value: number) => value.toFixed(3)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null
                    const data = payload[0].payload as CornerDeltaData
                    return (
                      <div className="panel p-2 min-w-[140px]">
                        <div className="text-xs font-semibold text-gray-300 mb-1">
                          Corner {data.cornerNumber} ({data.cornerType})
                        </div>
                        <div className="text-xs text-gray-200">
                          <div>{driver1}: {data.driver1Time?.toFixed(3)}s</div>
                          <div>{driver2}: {data.driver2Time?.toFixed(3)}s</div>
                          <div className="mt-1 font-mono">
                            Δ: {data.delta !== null ? (data.delta > 0 ? '+' : '') + data.delta.toFixed(3) : 'N/A'}s
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
                <ReferenceLine y={0} stroke="#9aa4b2" strokeDasharray="2 2" />
                <Bar
                  dataKey="delta"
                  radius={[4, 4, 0, 0]}
                >
                  {deltaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.delta === null ? '#6b7280' : entry.delta > 0 ? '#ef4444' : '#22c55e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedDrivers.length < 2 && (
        <div className="rounded border border-dashed border-gray-600/60 bg-gray-900/40 p-4 text-sm text-gray-400">
          Select at least two drivers to compare corner performance.
        </div>
      )}
    </div>
  )
}

