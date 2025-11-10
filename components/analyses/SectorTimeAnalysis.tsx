'use client'

import React, { useMemo } from 'react'
import { SessionPayload } from '../../lib/sessionDataClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import { driverColorMap } from '../../lib/teamData'
import TimeDisplay from '../formatting/TimeDisplay'
import DriverBadge from '../formatting/DriverBadge'
import DeltaBadge from '../formatting/DeltaBadge'

type SectorTimeAnalysisProps = {
  sessionData: SessionPayload
  selectedDrivers: string[]
}

type SectorStats = {
  driver: string
  sector1: number[]
  sector2: number[]
  sector3: number[]
  bestSector1: number | null
  bestSector2: number | null
  bestSector3: number | null
  avgSector1: number | null
  avgSector2: number | null
  avgSector3: number | null
  bestLap: number | null
  bestLapNumber: number | null
  sampleCount: number
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

const SECTOR_COLORS = {
  S1: '#ef4444',
  S2: '#eab308',
  S3: '#22c55e',
}

export default function SectorTimeAnalysis({
  sessionData,
  selectedDrivers,
}: SectorTimeAnalysisProps) {
  // Aggregate sector times by driver
  const sectorData = useMemo((): SectorStats[] => {
    if (!sessionData?.laps) return [] as SectorStats[]

    const sectorStats: Record<string, SectorStats> = {}

    selectedDrivers.forEach(driver => {
      const driverLaps = sessionData.laps.filter(
        lap => lap.driver.toUpperCase() === driver.toUpperCase() && 
               lap.isValid !== false &&
               lap.sectorTimesSeconds
      )

      const sector1Times: number[] = []
      const sector2Times: number[] = []
      const sector3Times: number[] = []
      let bestLap: number | null = null
      let bestLapNumber: number | null = null

      driverLaps.forEach(lap => {
        if (lap.sectorTimesSeconds[0] !== null && lap.sectorTimesSeconds[0] !== undefined) {
          sector1Times.push(lap.sectorTimesSeconds[0])
        }
        if (lap.sectorTimesSeconds[1] !== null && lap.sectorTimesSeconds[1] !== undefined) {
          sector2Times.push(lap.sectorTimesSeconds[1])
        }
        if (lap.sectorTimesSeconds[2] !== null && lap.sectorTimesSeconds[2] !== undefined) {
          sector3Times.push(lap.sectorTimesSeconds[2])
        }

        // Track best lap
        if (lap.lapTimeSeconds !== null && lap.lapTimeSeconds !== undefined) {
          if (bestLap === null || lap.lapTimeSeconds < bestLap) {
            bestLap = lap.lapTimeSeconds
            bestLapNumber = lap.lapNumber
          }
        }
      })

      const avgSector1 = sector1Times.length > 0
        ? sector1Times.reduce((a: number, b: number) => a + b, 0) / sector1Times.length
        : null
      const avgSector2 = sector2Times.length > 0
        ? sector2Times.reduce((a: number, b: number) => a + b, 0) / sector2Times.length
        : null
      const avgSector3 = sector3Times.length > 0
        ? sector3Times.reduce((a: number, b: number) => a + b, 0) / sector3Times.length
        : null

      sectorStats[driver] = {
        driver,
        sector1: sector1Times,
        sector2: sector2Times,
        sector3: sector3Times,
        bestSector1: sector1Times.length > 0 ? Math.min(...sector1Times) : null,
        bestSector2: sector2Times.length > 0 ? Math.min(...sector2Times) : null,
        bestSector3: sector3Times.length > 0 ? Math.min(...sector3Times) : null,
        avgSector1,
        avgSector2,
        avgSector3,
        bestLap,
        bestLapNumber,
        sampleCount: driverLaps.length,
      }
    })

    return Object.values(sectorStats) as SectorStats[]
  }, [sessionData, selectedDrivers])

  // Chart data for sector comparison
  const sectorChartData = useMemo(() => {
    return sectorData.map(driver => ({
      driver: driver.driver,
      'Sector 1': driver.avgSector1,
      'Sector 2': driver.avgSector2,
      'Sector 3': driver.avgSector3,
      'Best S1': driver.bestSector1,
      'Best S2': driver.bestSector2,
      'Best S3': driver.bestSector3,
    }))
  }, [sectorData])

  // Find best sectors across all drivers
  const bestSectors = useMemo(() => {
    let bestS1: { driver: string; time: number } | null = null
    let bestS2: { driver: string; time: number } | null = null
    let bestS3: { driver: string; time: number } | null = null

    for (const driver of sectorData) {
      if (driver.bestSector1 !== null) {
        if (!bestS1 || driver.bestSector1 < bestS1.time) {
          bestS1 = { driver: driver.driver, time: driver.bestSector1 }
        }
      }
      if (driver.bestSector2 !== null) {
        if (!bestS2 || driver.bestSector2 < bestS2.time) {
          bestS2 = { driver: driver.driver, time: driver.bestSector2 }
        }
      }
      if (driver.bestSector3 !== null) {
        if (!bestS3 || driver.bestSector3 < bestS3.time) {
          bestS3 = { driver: driver.driver, time: driver.bestSector3 }
        }
      }
    }

    return { bestS1, bestS2, bestS3 }
  }, [sectorData])

  // Sector delta comparison (for 2 drivers)
  const sectorDeltaData = useMemo(() => {
    if (selectedDrivers.length < 2 || sectorData.length < 2) return []

    const driver1 = sectorData.find(d => d.driver.toUpperCase() === selectedDrivers[0].toUpperCase())
    const driver2 = sectorData.find(d => d.driver.toUpperCase() === selectedDrivers[1].toUpperCase())

    if (!driver1 || !driver2) return []

    return [
      {
        sector: 'S1',
        delta: driver1.avgSector1 !== null && driver2.avgSector1 !== null
          ? driver1.avgSector1 - driver2.avgSector1
          : null,
        driver1Time: driver1.avgSector1,
        driver2Time: driver2.avgSector1,
      },
      {
        sector: 'S2',
        delta: driver1.avgSector2 !== null && driver2.avgSector2 !== null
          ? driver1.avgSector2 - driver2.avgSector2
          : null,
        driver1Time: driver1.avgSector2,
        driver2Time: driver2.avgSector2,
      },
      {
        sector: 'S3',
        delta: driver1.avgSector3 !== null && driver2.avgSector3 !== null
          ? driver1.avgSector3 - driver2.avgSector3
          : null,
        driver1Time: driver1.avgSector3,
        driver2Time: driver2.avgSector3,
      },
    ]
  }, [sectorData, selectedDrivers])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Sector Time Analysis
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Analyze sector times, compare drivers, and identify sector-specific strengths.
        </p>
      </div>

      {/* Sector Summary Table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Sector Time Summary
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Driver</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg S1</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best S1</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg S2</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best S2</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Avg S3</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best S3</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best Lap</th>
                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Samples</th>
              </tr>
            </thead>
            <tbody>
              {sectorData.map((driverItem) => {
                const driverCode = driverItem.driver
                const isBestS1 = bestSectors.bestS1 !== null && bestSectors.bestS1.driver === driverCode
                const isBestS2 = bestSectors.bestS2 !== null && bestSectors.bestS2.driver === driverCode
                const isBestS3 = bestSectors.bestS3 !== null && bestSectors.bestS3.driver === driverCode
                
                return (
                  <tr key={driverCode} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-2 px-3">
                      <DriverBadge code={driverCode} size="sm" variant="badge" />
                    </td>
                    <td className="text-right py-2 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <TimeDisplay 
                          value={driverItem.avgSector1 ?? null} 
                          type="sector" 
                          variant="mono"
                          showUnit
                        />
                        {isBestS1 && (
                          <span className="text-green-400 text-xs">⭐</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2 px-3">
                      <TimeDisplay 
                        value={driverItem.bestSector1 ?? null} 
                        type="sector" 
                        variant="mono"
                        showUnit
                      />
                    </td>
                    <td className="text-right py-2 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <TimeDisplay 
                          value={driverItem.avgSector2 ?? null} 
                          type="sector" 
                          variant="mono"
                          showUnit
                        />
                        {isBestS2 && (
                          <span className="text-green-400 text-xs">⭐</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2 px-3">
                      <TimeDisplay 
                        value={driverItem.bestSector2 ?? null} 
                        type="sector" 
                        variant="mono"
                        showUnit
                      />
                    </td>
                    <td className="text-right py-2 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <TimeDisplay 
                          value={driverItem.avgSector3 ?? null} 
                          type="sector" 
                          variant="mono"
                          showUnit
                        />
                        {isBestS3 && (
                          <span className="text-green-400 text-xs">⭐</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2 px-3">
                      <TimeDisplay 
                        value={driverItem.bestSector3 ?? null} 
                        type="sector" 
                        variant="mono"
                        showUnit
                      />
                    </td>
                    <td className="text-right py-2 px-3">
                      <div className="flex flex-col items-end">
                        <TimeDisplay 
                          value={driverItem.bestLap ?? null} 
                          type="lap" 
                          variant="mono"
                          showUnit
                        />
                        {driverItem.bestLapNumber && (
                          <span className="text-xs text-gray-500">L{driverItem.bestLapNumber}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2 px-3 text-gray-400">{driverItem.sampleCount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Comparison Chart */}
      {sectorChartData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Average Sector Times Comparison
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="driver" 
                  stroke="#9aa4b2"
                  label={{ value: 'Driver', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  label={{ value: 'Sector Time (s)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload) return null
                    return (
                      <div className="panel p-3 min-w-[140px]">
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          {payload[0]?.payload.driver}
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
                <Bar dataKey="Sector 1" fill={SECTOR_COLORS.S1} />
                <Bar dataKey="Sector 2" fill={SECTOR_COLORS.S2} />
                <Bar dataKey="Sector 3" fill={SECTOR_COLORS.S3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sector Delta Chart (for 2 drivers) */}
      {selectedDrivers.length >= 2 && sectorDeltaData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Sector Delta Comparison
          </h4>
          <p className="text-xs text-gray-400 mb-4">
            Time difference per sector: {selectedDrivers[0]} vs {selectedDrivers[1]}. Positive values mean {selectedDrivers[0]} is slower.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorDeltaData} margin={{ top: 12, right: 12, left: 6, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 6" className="chart-grid" />
                <XAxis
                  dataKey="sector"
                  stroke="#9aa4b2"
                  label={{ value: 'Sector', position: 'insideBottom', offset: -4 }}
                />
                <YAxis
                  stroke="#9aa4b2"
                  label={{ value: 'Delta (s)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value: number) => value.toFixed(3)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null
                    const data = payload[0].payload
                    return (
                      <div className="panel p-2 min-w-[140px]">
                        <div className="text-xs font-semibold text-gray-300 mb-1">
                          Sector {data.sector}
                        </div>
                        <div className="text-xs text-gray-200 space-y-1">
                          <div className="flex items-center gap-2">
                            <DriverBadge code={selectedDrivers[0]} size="sm" variant="chip" />
                            <TimeDisplay value={data.driver1Time ?? null} type="sector" variant="mono" showUnit />
                          </div>
                          <div className="flex items-center gap-2">
                            <DriverBadge code={selectedDrivers[1]} size="sm" variant="chip" />
                            <TimeDisplay value={data.driver2Time ?? null} type="sector" variant="mono" showUnit />
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span>Δ:</span>
                            <DeltaBadge 
                              value={data.delta} 
                              unit="s" 
                              variant="inline" 
                              inverted={false}
                            />
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
                  {sectorDeltaData.map((entry, index) => (
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
    </div>
  )
}


