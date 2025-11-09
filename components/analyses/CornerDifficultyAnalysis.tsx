'use client'

import React, { useMemo } from 'react'
import { SessionPayload } from '../../lib/sessionDataClient'
import { CornerPerformance } from '../../lib/cornerPerformanceAggregator'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'

type CornerDifficultyAnalysisProps = {
  sessionData: SessionPayload
  cornerPerformance: Record<number, CornerPerformance> | undefined
  selectedDrivers: string[]
  cornerInfo: Array<{
    number: number
    type: 'slow' | 'medium' | 'fast'
  }>
}

export default function CornerDifficultyAnalysis({
  sessionData,
  cornerPerformance,
  selectedDrivers,
  cornerInfo,
}: CornerDifficultyAnalysisProps) {
  // Calculate corner difficulty metrics
  const difficultyData = useMemo(() => {
    if (!cornerPerformance || !sessionData?.corners) return []

    const corners: Array<{
      cornerNumber: number
      cornerType: 'slow' | 'medium' | 'fast' | 'unknown'
      timeVariance: number
      speedLoss: number
      avgTime: number
      importanceScore: number
      sampleCount: number
    }> = []

    Object.values(cornerPerformance).forEach(corner => {
      // Calculate time variance (standard deviation)
      const driverCorners: number[] = []
      selectedDrivers.forEach(driver => {
        const driverCornerData = sessionData.corners[driver]?.filter(
          c => c.cornerNumber === corner.cornerNumber && c.cornerTime !== null
        ) || []
        driverCornerData.forEach(c => {
          if (c.cornerTime !== null) {
            driverCorners.push(c.cornerTime)
          }
        })
      })

      if (driverCorners.length === 0) return

      const avgTime = driverCorners.reduce((a, b) => a + b, 0) / driverCorners.length
      const variance = driverCorners.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / driverCorners.length
      const timeVariance = Math.sqrt(variance)

      // Calculate speed loss (entry speed - apex speed)
      const speedLoss = corner.avgSpeed.entry - corner.avgSpeed.apex

      // Calculate importance score (correlation with overall performance)
      // For now, use time variance as a proxy (higher variance = more important)
      // In a full implementation, this would correlate with overall lap time
      const importanceScore = timeVariance * 10 // Scale for display

      corners.push({
        cornerNumber: corner.cornerNumber,
        cornerType: corner.cornerType,
        timeVariance: Math.round(timeVariance * 1000) / 1000, // Round to 3 decimals
        speedLoss: Math.round(speedLoss),
        avgTime: Math.round(avgTime * 1000) / 1000,
        importanceScore: Math.round(importanceScore * 100) / 100,
        sampleCount: corner.sampleCount,
      })
    })

    // Sort by difficulty (time variance) descending
    return corners.sort((a, b) => b.timeVariance - a.timeVariance)
  }, [cornerPerformance, sessionData, selectedDrivers])

  // Chart data for difficulty ranking
  const difficultyChartData = useMemo(() => {
    return difficultyData
      .slice(0, 15) // Top 15 most difficult corners
      .map(corner => ({
        name: `C${corner.cornerNumber}`,
        cornerNumber: corner.cornerNumber,
        variance: corner.timeVariance,
        speedLoss: corner.speedLoss,
        importance: corner.importanceScore,
      }))
      .reverse() // Reverse for display (easiest to hardest)
  }, [difficultyData])

  // Get corner type distribution
  const cornerTypeStats = useMemo(() => {
    const stats: Record<string, { count: number; avgVariance: number; avgSpeedLoss: number }> = {
      slow: { count: 0, avgVariance: 0, avgSpeedLoss: 0 },
      medium: { count: 0, avgVariance: 0, avgSpeedLoss: 0 },
      fast: { count: 0, avgVariance: 0, avgSpeedLoss: 0 },
    }

    difficultyData.forEach(corner => {
      const type = corner.cornerType === 'unknown' ? 'medium' : corner.cornerType
      if (stats[type]) {
        stats[type].count++
        stats[type].avgVariance += corner.timeVariance
        stats[type].avgSpeedLoss += corner.speedLoss
      }
    })

    Object.keys(stats).forEach(type => {
      if (stats[type].count > 0) {
        stats[type].avgVariance = stats[type].avgVariance / stats[type].count
        stats[type].avgSpeedLoss = stats[type].avgSpeedLoss / stats[type].count
      }
    })

    return stats
  }, [difficultyData])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Corner Difficulty Ranking
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Rank corners by difficulty based on time variance, speed loss, and importance to lap time.
        </p>
      </div>

      {/* Corner Type Statistics */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(cornerTypeStats).map(([type, stats]) => (
          <div key={type} className="panel p-4">
            <div className="text-sm font-semibold text-gray-300 mb-2 capitalize">
              {type} Corners
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div>Count: {stats.count}</div>
              <div>Avg Variance: {stats.avgVariance.toFixed(3)}s</div>
              <div>Avg Speed Loss: {stats.avgSpeedLoss.toFixed(0)} km/h</div>
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Ranking Chart */}
      {difficultyChartData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Top 15 Most Difficult Corners (by Time Variance)
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis type="number" stroke="#9aa4b2" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9aa4b2"
                  width={60}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null
                    const data = payload[0].payload
                    return (
                      <div className="panel p-3 min-w-[180px]">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          Corner {data.cornerNumber}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="text-gray-400">
                            Time Variance: {data.variance.toFixed(3)}s
                          </div>
                          <div className="text-gray-400">
                            Speed Loss: {data.speedLoss} km/h
                          </div>
                          <div className="text-gray-400">
                            Importance: {data.importance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
                <Legend />
                <Bar dataKey="variance" fill="#ef4444" name="Time Variance (s)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Difficulty Table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Complete Difficulty Ranking
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Rank</th>
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Corner</th>
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Type</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Time Variance</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Speed Loss</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg Time</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Importance</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Samples</th>
              </tr>
            </thead>
            <tbody>
              {difficultyData.map((corner, index) => {
                const cornerInfoItem = cornerInfo.find(c => c.number === corner.cornerNumber)
                return (
                  <tr 
                    key={corner.cornerNumber} 
                    className="border-b border-gray-800 hover:bg-gray-800/30"
                  >
                    <td className="py-2 px-3 text-gray-400">#{index + 1}</td>
                    <td className="py-2 px-3 font-medium text-gray-200">
                      Corner {corner.cornerNumber}
                    </td>
                    <td className="py-2 px-3">
                      {cornerInfoItem && (
                        <span 
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            cornerInfoItem.type === 'slow' ? 'bg-red-500/20 text-red-400' :
                            cornerInfoItem.type === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {cornerInfoItem.type}
                        </span>
                      )}
                    </td>
                    <td className="text-right py-2 px-3 text-red-400">
                      {corner.timeVariance.toFixed(3)}s
                    </td>
                    <td className="text-right py-2 px-3 text-gray-300">
                      {corner.speedLoss} km/h
                    </td>
                    <td className="text-right py-2 px-3 text-gray-300">
                      {corner.avgTime.toFixed(3)}s
                    </td>
                    <td className="text-right py-2 px-3 text-accent">
                      {corner.importanceScore.toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-3 text-gray-400">
                      {corner.sampleCount}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



