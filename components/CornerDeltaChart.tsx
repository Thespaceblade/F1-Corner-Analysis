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
import { CornerMetrics } from '../lib/sessionDataClient'

type CornerDeltaChartProps = {
  corners: Record<string, CornerMetrics[]>
  cornerInfo: Array<{
    number: number
    type: 'slow' | 'medium' | 'fast'
  }>
  selectedDrivers: string[]
}

type CornerDeltaData = {
  cornerNumber: number
  cornerType: 'slow' | 'medium' | 'fast'
  delta: number | null
  driver1Time: number | null
  driver2Time: number | null
}

export default function CornerDeltaChart({
  corners,
  cornerInfo,
  selectedDrivers,
}: CornerDeltaChartProps) {
  const deltaData = useMemo(() => {
    if (selectedDrivers.length < 2) return []

    const driver1 = selectedDrivers[0]
    const driver2 = selectedDrivers[1]
    const driver1Corners = corners[driver1] || []
    const driver2Corners = corners[driver2] || []

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

      const driver1Avg = driver1Times.reduce((sum, t) => sum + t, 0) / driver1Times.length
      const driver2Avg = driver2Times.reduce((sum, t) => sum + t, 0) / driver2Times.length

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
  }, [corners, cornerInfo, selectedDrivers])

  if (selectedDrivers.length < 2) {
    return (
      <div className="mt-6 panel p-4">
        <h2 className="text-lg font-semibold text-gray-100">Corner Delta Comparison</h2>
        <p className="text-xs text-gray-500 mt-2">
          Select at least two drivers to compare corner performance.
        </p>
      </div>
    )
  }

  if (deltaData.length === 0) {
    return (
      <div className="mt-6 panel p-4">
        <h2 className="text-lg font-semibold text-gray-100">Corner Delta Comparison</h2>
        <p className="text-xs text-gray-500 mt-2">
          No corner data available for comparison.
        </p>
      </div>
    )
  }

  const driver1 = selectedDrivers[0]
  const driver2 = selectedDrivers[1]

  return (
    <div className="mt-6 panel p-4">
      <h2 className="text-lg font-semibold text-gray-100">Corner Delta Comparison</h2>
      <p className="text-xs text-gray-500">
        Time difference per corner: {driver1} vs {driver2}. Positive values mean {driver1} is slower.
      </p>

      <div className="mt-4 h-64">
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
  )
}

