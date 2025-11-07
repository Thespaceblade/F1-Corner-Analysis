'use client'

import React, { useMemo } from 'react'
import { CornerMetrics } from '../lib/sessionDataClient'

type CornerInfo = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

type CornerTableProps = {
  corners: Record<string, CornerMetrics[]>
  cornerInfo: CornerInfo[]
  selectedDrivers: string[]
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

const typeColors: Record<CornerInfo['type'], string> = {
  slow: '#ef4444',
  medium: '#eab308',
  fast: '#22c55e'
}

export default function CornerTable({ corners, cornerInfo, selectedDrivers }: CornerTableProps) {
  const hasCornerData = Object.values(corners ?? {}).some((driverCorners) =>
    Array.isArray(driverCorners) && driverCorners.length > 0
  )

  // Aggregate corner data by corner number
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
      const driverCorners = corners[driverCode] || []

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

        const avgEntrySpeed = cornerLaps.reduce((sum, c) => sum + c.entrySpeed, 0) / cornerLaps.length
        const avgApexSpeed = cornerLaps.reduce((sum, c) => sum + c.apexSpeed, 0) / cornerLaps.length
        const avgExitSpeed = cornerLaps.reduce((sum, c) => sum + c.exitSpeed, 0) / cornerLaps.length
        const avgCornerTime = validTimes.length > 0
          ? validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length
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
  }, [corners, cornerInfo, selectedDrivers])

  return (
    <div className="mt-6 panel p-4">
      <h2 className="text-lg font-semibold text-gray-100">Corner Analysis</h2>
      <p className="text-xs text-gray-500">
        Corner-level telemetry showing average speeds and corner times. Best times are highlighted in yellow.
      </p>

      {!hasCornerData && (
        <div className="mt-4 rounded border border-dashed border-gray-600/60 bg-gray-900/40 p-4 text-sm text-gray-400">
          Corner telemetry is not yet generated for this session. Generate the dataset with corner detection enabled.
        </div>
      )}

      {hasCornerData && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="text-gray-400">
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
                <tr key={corner.cornerNumber} className="border-t border-[var(--border-clr)]">
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
      )}
    </div>
  )
}
