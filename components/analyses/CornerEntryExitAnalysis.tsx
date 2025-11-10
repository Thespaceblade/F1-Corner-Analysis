'use client'

import React, { useMemo } from 'react'
import { SessionPayload, CornerMetrics } from '../../lib/sessionDataClient'
import { CornerPerformance } from '../../lib/cornerPerformanceAggregator'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import CornerBadge from '../formatting/CornerBadge'
import SpeedDisplay from '../formatting/SpeedDisplay'
import DriverBadge from '../formatting/DriverBadge'

type CornerEntryExitAnalysisProps = {
  sessionData: SessionPayload
  cornerPerformance: Record<number, CornerPerformance> | undefined
  selectedDrivers: string[]
  cornerInfo: Array<{
    number: number
    type: 'slow' | 'medium' | 'fast'
  }>
}

export default function CornerEntryExitAnalysis({
  sessionData,
  cornerPerformance,
  selectedDrivers,
  cornerInfo,
}: CornerEntryExitAnalysisProps) {
  // Aggregate entry/exit data by corner
  const cornerData = useMemo(() => {
    if (!cornerPerformance) return []

    return Object.values(cornerPerformance)
      .map(corner => {
        const cornerInfoItem = cornerInfo.find(c => c.number === corner.cornerNumber)
        return {
          cornerNumber: corner.cornerNumber,
          cornerType: corner.cornerType,
          avgEntrySpeed: Math.round(corner.avgSpeed.entry),
          avgApexSpeed: Math.round(corner.avgSpeed.apex),
          avgExitSpeed: Math.round(corner.avgSpeed.exit),
          speedDrop: Math.round(corner.avgSpeed.entry - corner.avgSpeed.apex),
          speedRecovery: Math.round(corner.avgSpeed.exit - corner.avgSpeed.apex),
          brakingDistance: 'N/A', // Will be shown in detailed table
          accelerationDistance: 'N/A', // Will be shown in detailed table
          avgTime: corner.avgTime ? corner.avgTime.toFixed(3) : 'N/A',
          sampleCount: corner.sampleCount,
        }
      })
      .sort((a, b) => a.cornerNumber - b.cornerNumber)
  }, [cornerPerformance, cornerInfo])

  // Get detailed corner metrics for selected drivers
  const driverCornerDetails = useMemo(() => {
    if (!sessionData?.corners) return {}

    const details: Record<string, Record<number, {
      entrySpeed: number
      apexSpeed: number
      exitSpeed: number
      brakingDistance: number
      accelerationDistance: number
    }>> = {}

    selectedDrivers.forEach(driver => {
      const driverCorners = sessionData.corners[driver] || []
      details[driver] = {}

      // Group by corner number and calculate averages
      const byCorner = new Map<number, CornerMetrics[]>()
      driverCorners.forEach(corner => {
        const num = corner.cornerNumber
        if (!byCorner.has(num)) {
          byCorner.set(num, [])
        }
        byCorner.get(num)!.push(corner)
      })

      byCorner.forEach((corners, cornerNum) => {
        const avgEntry = corners.reduce((sum, c) => sum + c.entrySpeed, 0) / corners.length
        const avgApex = corners.reduce((sum, c) => sum + c.apexSpeed, 0) / corners.length
        const avgExit = corners.reduce((sum, c) => sum + c.exitSpeed, 0) / corners.length
        const avgBrakingDist = corners.reduce((sum, c) => sum + c.brakingDistance, 0) / corners.length
        const avgAccelDist = corners.reduce((sum, c) => sum + c.accelerationDistance, 0) / corners.length

        details[driver][cornerNum] = {
          entrySpeed: Math.round(avgEntry),
          apexSpeed: Math.round(avgApex),
          exitSpeed: Math.round(avgExit),
          brakingDistance: Math.round(avgBrakingDist),
          accelerationDistance: Math.round(avgAccelDist),
        }
      })
    })

    return details
  }, [sessionData, selectedDrivers])

  // Chart data for speed profile
  const speedChartData = useMemo(() => {
    return cornerData.map(corner => ({
      name: `C${corner.cornerNumber}`,
      cornerNumber: corner.cornerNumber,
      entry: corner.avgEntrySpeed,
      apex: corner.avgApexSpeed,
      exit: corner.avgExitSpeed,
    }))
  }, [cornerData])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Corner Entry/Exit Analysis
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Analyze corner entry speeds, apex speeds, exit speeds, and braking/acceleration zones.
        </p>
      </div>

      {/* Speed Profile Chart */}
      {speedChartData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Speed Profile by Corner
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speedChartData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9aa4b2"
                  label={{ value: 'Corner', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }}
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
                          <div className="text-blue-400">
                            Entry: <SpeedDisplay value={data.entry} rounded variant="default" className="text-blue-400" />
                          </div>
                          <div className="text-red-400">
                            Apex: <SpeedDisplay value={data.apex} rounded variant="default" className="text-red-400" />
                          </div>
                          <div className="text-green-400">
                            Exit: <SpeedDisplay value={data.exit} rounded variant="default" className="text-green-400" />
                          </div>
                          <div className="text-gray-400 mt-2">
                            Speed Drop: <SpeedDisplay value={data.entry - data.apex} rounded variant="default" className="text-gray-400" />
                          </div>
                          <div className="text-gray-400">
                            Speed Recovery: <SpeedDisplay value={data.exit - data.apex} rounded variant="default" className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
                <Legend />
                <Bar dataKey="entry" fill="#60a5fa" name="Entry Speed" />
                <Bar dataKey="apex" fill="#f87171" name="Apex Speed" />
                <Bar dataKey="exit" fill="#4ade80" name="Exit Speed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Corner Table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Corner Entry/Exit Details
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Corner</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Entry (km/h)</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Apex (km/h)</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Exit (km/h)</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Speed Drop</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Recovery</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Braking (m)</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Accel (m)</th>
              </tr>
            </thead>
            <tbody>
              {selectedDrivers.length > 0 && Object.keys(driverCornerDetails).length > 0 ? (
                selectedDrivers.flatMap(driver => {
                  const driverCorners = driverCornerDetails[driver]
                  if (!driverCorners) return []

                  return Object.entries(driverCorners)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([cornerNum, data]) => {
                      const cornerNumInt = parseInt(cornerNum)
                      const cornerInfoItem = cornerInfo.find(c => c.number === cornerNumInt)
                      const speedDrop = data.entrySpeed - data.apexSpeed
                      const speedRecovery = data.exitSpeed - data.apexSpeed

                      return (
                        <tr key={`${driver}-${cornerNum}`} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-200">
                                C{cornerNum}
                              </span>
                              <DriverBadge code={driver} size="sm" variant="chip" />
                              {cornerInfoItem && (
                                <CornerBadge type={cornerInfoItem.type} showLabel={false} size="sm" />
                              )}
                            </div>
                          </td>
                          <td className="text-right py-2 px-3">
                            <SpeedDisplay value={data.entrySpeed} rounded variant="default" />
                          </td>
                          <td className="text-right py-2 px-3">
                            <SpeedDisplay value={data.apexSpeed} rounded variant="default" />
                          </td>
                          <td className="text-right py-2 px-3">
                            <SpeedDisplay value={data.exitSpeed} rounded variant="default" />
                          </td>
                          <td className="text-right py-2 px-3 text-red-400">
                            <SpeedDisplay value={speedDrop} rounded variant="default" className="text-red-400" />
                          </td>
                          <td className="text-right py-2 px-3 text-green-400">
                            <SpeedDisplay value={speedRecovery} rounded variant="default" className="text-green-400" />
                          </td>
                          <td className="text-right py-2 px-3 text-gray-400">{data.brakingDistance}</td>
                          <td className="text-right py-2 px-3 text-gray-400">{data.accelerationDistance}</td>
                        </tr>
                      )
                    })
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">
                    No corner data available for selected drivers
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

