'use client'

import React, { useMemo, useState } from 'react'
import { SessionPayload } from '../../lib/sessionDataClient'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from 'recharts'
import { getDriverColor as getSeasonDriverColor } from '../../lib/teamData'
import TimeDisplay from '../formatting/TimeDisplay'
import DriverBadge from '../formatting/DriverBadge'
import DeltaBadge from '../formatting/DeltaBadge'

type SessionOverviewProps = {
  sessionData: SessionPayload
  selectedDrivers: string[]
}

const FALLBACK_COLORS = [
  '#e10600',
  '#22c55e',
  '#facc15',
  '#f97316',
  '#a855f7',
  '#f87171'
]

const getDriverColor = (code: string, index: number, year?: number) => {
  return getSeasonDriverColor(code, year) ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export default function SessionOverview({
  sessionData,
  selectedDrivers,
}: SessionOverviewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Check if qualifying session
  const isQualifying = useMemo(() => {
    const sessionCode = sessionData.meta?.session?.toUpperCase()
    return sessionCode === 'Q' || sessionCode === 'SQ'
  }, [sessionData])

  // Best Lap Breakdown
  const bestLapBreakdown = useMemo(() => {
    if (!sessionData?.laps) return []

    return selectedDrivers.map(driver => {
      const driverLaps = sessionData.laps.filter(
        lap => lap.driver.toUpperCase() === driver.toUpperCase() &&
               lap.isValid !== false &&
               lap.lapTimeSeconds !== null
      )

      if (driverLaps.length === 0) {
        return {
          driver,
          bestLapTime: null,
          bestLapNumber: null,
          sectors: [null, null, null],
          hasData: false,
        }
      }

      const bestLap = driverLaps.reduce((best, lap) => 
        lap.lapTimeSeconds! < best.lapTimeSeconds! ? lap : best
      )

      return {
        driver,
        bestLapTime: bestLap.lapTimeSeconds,
        bestLapNumber: bestLap.lapNumber,
        sectors: bestLap.sectorTimesSeconds || [null, null, null],
        hasData: true,
      }
    })
  }, [sessionData, selectedDrivers])

  // Personal Best Tracking
  const personalBestTracking = useMemo(() => {
    if (!sessionData?.laps) return []

    const pbData: Record<string, {
      driver: string
      personalBests: Array<{
        lapNumber: number
        lapTime: number
        sessionTime: number | null
        improved: boolean
      }>
      currentPB: number | null
      pbLapNumber: number | null
    }> = {}

    selectedDrivers.forEach(driver => {
      const driverLaps = sessionData.laps
        .filter(lap => 
          lap.driver.toUpperCase() === driver.toUpperCase() &&
          lap.isValid !== false &&
          lap.lapTimeSeconds !== null &&
          lap.lapNumber !== null
        )
        .sort((a, b) => (a.lapNumber || 0) - (b.lapNumber || 0))

      let currentPB: number | null = null
      const personalBests: Array<{
        lapNumber: number
        lapTime: number
        sessionTime: number | null
        improved: boolean
      }> = []

      driverLaps.forEach(lap => {
        if (currentPB === null || lap.lapTimeSeconds! < currentPB) {
          personalBests.push({
            lapNumber: lap.lapNumber!,
            lapTime: lap.lapTimeSeconds!,
            sessionTime: lap.sessionTimeSeconds || null,
            improved: true,
          })
          currentPB = lap.lapTimeSeconds!
        }
      })

      pbData[driver] = {
        driver,
        personalBests,
        currentPB,
        pbLapNumber: personalBests.length > 0 ? personalBests[personalBests.length - 1].lapNumber : null,
      }
    })

    return Object.values(pbData)
  }, [sessionData, selectedDrivers])

  // Qualifying Progression (Q1 → Q2 → Q3)
  const qualifyingProgression = useMemo(() => {
    if (!isQualifying || !sessionData.qualifyingBoundaries) return null

    const boundaries = sessionData.qualifyingBoundaries
    const progression: Record<string, {
      driver: string
      q1: { time: number | null; lapNumber: number | null }
      q2: { time: number | null; lapNumber: number | null }
      q3: { time: number | null; lapNumber: number | null }
      progression: number | null // Improvement from Q1 to Q3
    }> = {}

    selectedDrivers.forEach(driver => {
      const driverLaps = sessionData.laps.filter(
        lap => lap.driver.toUpperCase() === driver.toUpperCase() &&
               lap.isValid !== false &&
               lap.lapTimeSeconds !== null &&
               lap.sessionTimeSeconds !== null
      )

      // Find best lap in each segment
      const q1Laps = driverLaps.filter(lap => 
        boundaries.q1End !== null && lap.sessionTimeSeconds! <= boundaries.q1End
      )
      const q2Laps = driverLaps.filter(lap => 
        boundaries.q1End !== null && 
        boundaries.q2End !== null &&
        lap.sessionTimeSeconds! > boundaries.q1End &&
        lap.sessionTimeSeconds! <= boundaries.q2End
      )
      const q3Laps = driverLaps.filter(lap => 
        boundaries.q2End !== null && 
        boundaries.q3End !== null &&
        lap.sessionTimeSeconds! > boundaries.q2End &&
        lap.sessionTimeSeconds! <= boundaries.q3End
      )

      const q1Best = q1Laps.length > 0
        ? q1Laps.reduce((best, lap) => {
            if (!best || !best.lapTimeSeconds) return lap
            if (!lap.lapTimeSeconds) return best
            return lap.lapTimeSeconds < best.lapTimeSeconds ? lap : best
          }, q1Laps[0])
        : null
      const q2Best = q2Laps.length > 0
        ? q2Laps.reduce((best, lap) => {
            if (!best || !best.lapTimeSeconds) return lap
            if (!lap.lapTimeSeconds) return best
            return lap.lapTimeSeconds < best.lapTimeSeconds ? lap : best
          }, q2Laps[0])
        : null
      const q3Best = q3Laps.length > 0
        ? q3Laps.reduce((best, lap) => {
            if (!best || !best.lapTimeSeconds) return lap
            if (!lap.lapTimeSeconds) return best
            return lap.lapTimeSeconds < best.lapTimeSeconds ? lap : best
          }, q3Laps[0])
        : null

      progression[driver] = {
        driver,
        q1: {
          time: q1Best?.lapTimeSeconds || null,
          lapNumber: q1Best?.lapNumber || null,
        },
        q2: {
          time: q2Best?.lapTimeSeconds || null,
          lapNumber: q2Best?.lapNumber || null,
        },
        q3: {
          time: q3Best?.lapTimeSeconds || null,
          lapNumber: q3Best?.lapNumber || null,
        },
        progression: q1Best && q3Best 
          ? q3Best.lapTimeSeconds! - q1Best.lapTimeSeconds!
          : null,
      }
    })

    return Object.values(progression)
  }, [sessionData, selectedDrivers, isQualifying])

  // Lap Time Trends
  const lapTimeTrends = useMemo(() => {
    if (!sessionData?.laps) return []

    const trendData: Array<{
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
          lap.lapTimeSeconds !== null
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

      trendData.push(dataPoint)
    })

    return trendData
  }, [sessionData, selectedDrivers])

  // Calculate Y-axis domain for lap time charts (within 1 second of fastest/slowest)
  const lapTimeYDomain = useMemo(() => {
    const allLapTimes: number[] = []
    
    // Collect all lap times from trend data
    lapTimeTrends.forEach(dataPoint => {
      selectedDrivers.forEach(driver => {
        const time = dataPoint[driver]
        if (time !== null && typeof time === 'number') {
          allLapTimes.push(time)
        }
      })
    })

    // Also collect from qualifying progression if available
    if (qualifyingProgression) {
      qualifyingProgression.forEach(prog => {
        if (prog.q1.time !== null) allLapTimes.push(prog.q1.time)
        if (prog.q2.time !== null) allLapTimes.push(prog.q2.time)
        if (prog.q3.time !== null) allLapTimes.push(prog.q3.time)
      })
    }

    if (allLapTimes.length === 0) return undefined

    const minTime = Math.min(...allLapTimes)
    const maxTime = Math.max(...allLapTimes)
    
    // Add 1 second padding on each side
    return [minTime - 1, maxTime + 1]
  }, [lapTimeTrends, qualifyingProgression, selectedDrivers])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="space-y-4 relative">
      {/* Translucent background element */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent rounded-lg pointer-events-none -z-10" />
      
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Session Overview
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Quick insights and key metrics from the session.
        </p>
      </div>

      {/* Best Lap Breakdown - Collapsible */}
      <div className="border border-gray-700 rounded-lg backdrop-blur-sm bg-gray-800/30">
        <button
          type="button"
          onClick={() => toggleSection('best-lap')}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800/40 transition-colors"
        >
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Best Lap Breakdown</h4>
            <p className="text-xs text-gray-400 mt-1">Best lap times with sector breakdown</p>
          </div>
          <span className="text-gray-400">
            {expandedSection === 'best-lap' ? '▼' : '▶'}
          </span>
        </button>
        {expandedSection === 'best-lap' && (
          <div className="px-4 pb-4 border-t border-gray-700">
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-400 font-semibold">Driver</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold">Best Lap</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold">Lap #</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold">S1</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold">S2</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold">S3</th>
                  </tr>
                </thead>
                <tbody>
                  {bestLapBreakdown.map((lap) => (
                    <tr key={lap.driver} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-2 px-3">
                        <DriverBadge code={lap.driver} year={sessionData.meta.year} size="sm" variant="badge" />
                      </td>
                      <td className="text-right py-2 px-3">
                        <TimeDisplay 
                          value={lap.bestLapTime ?? null} 
                          type="lap" 
                          variant="mono"
                          showUnit
                        />
                      </td>
                      <td className="text-right py-2 px-3 text-gray-400">
                        {lap.bestLapNumber || 'N/A'}
                      </td>
                      <td className="text-right py-2 px-3">
                        <TimeDisplay 
                          value={lap.sectors[0] ?? null} 
                          type="sector" 
                          variant="mono"
                          showUnit
                        />
                      </td>
                      <td className="text-right py-2 px-3">
                        <TimeDisplay 
                          value={lap.sectors[1] ?? null} 
                          type="sector" 
                          variant="mono"
                          showUnit
                        />
                      </td>
                      <td className="text-right py-2 px-3">
                        <TimeDisplay 
                          value={lap.sectors[2] ?? null} 
                          type="sector" 
                          variant="mono"
                          showUnit
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Qualifying Progression - Collapsible (only for qualifying) */}
      {isQualifying && qualifyingProgression && (
        <div className="border border-gray-700 rounded-lg backdrop-blur-sm bg-gray-800/30">
          <button
            type="button"
            onClick={() => toggleSection('qualifying')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800/40 transition-colors"
          >
            <div>
              <h4 className="text-sm font-semibold text-gray-200">Qualifying Progression</h4>
              <p className="text-xs text-gray-400 mt-1">Q1 → Q2 → Q3 progression</p>
            </div>
            <span className="text-gray-400">
              {expandedSection === 'qualifying' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'qualifying' && (
            <div className="px-4 pb-4 border-t border-gray-700">
              <div className="mt-4 space-y-4">
                {/* Progression Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-400 font-semibold">Driver</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-semibold">Q1</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-semibold">Q2</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-semibold">Q3</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-semibold">Improvement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualifyingProgression.map((prog) => (
                        <tr key={prog.driver} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-2 px-3">
                            <DriverBadge code={prog.driver} year={sessionData.meta.year} size="sm" variant="badge" />
                          </td>
                          <td className="text-right py-2 px-3">
                            <div className="flex flex-col items-end">
                              <TimeDisplay 
                                value={prog.q1.time ?? null} 
                                type="lap" 
                                variant="mono"
                                showUnit
                              />
                              {prog.q1.lapNumber && (
                                <span className="text-xs text-gray-500">L{prog.q1.lapNumber}</span>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-2 px-3">
                            <div className="flex flex-col items-end">
                              <TimeDisplay 
                                value={prog.q2.time ?? null} 
                                type="lap" 
                                variant="mono"
                                showUnit
                              />
                              {prog.q2.lapNumber && (
                                <span className="text-xs text-gray-500">L{prog.q2.lapNumber}</span>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-2 px-3">
                            <div className="flex flex-col items-end">
                              <TimeDisplay 
                                value={prog.q3.time ?? null} 
                                type="lap" 
                                variant="mono"
                                showUnit
                              />
                              {prog.q3.lapNumber && (
                                <span className="text-xs text-gray-500">L{prog.q3.lapNumber}</span>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-2 px-3">
                            {prog.progression !== null ? (
                              <DeltaBadge 
                                value={prog.progression} 
                                unit="s" 
                                variant="inline"
                                inverted={true}
                              />
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Progression Chart */}
                {qualifyingProgression.some(p => p.q1.time !== null || p.q2.time !== null || p.q3.time !== null) && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={qualifyingProgression.map(p => ({
                        driver: p.driver,
                        Q1: p.q1.time,
                        Q2: p.q2.time,
                        Q3: p.q3.time,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                        <XAxis 
                          dataKey="driver" 
                          stroke="#9aa4b2"
                          tick={{ fill: '#9aa4b2', fontSize: 12 }}
                          label={{ value: 'Driver', position: 'insideBottom', offset: -5, fill: '#9aa4b2', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#9aa4b2"
                          domain={lapTimeYDomain}
                          tick={{ fill: '#9aa4b2', fontSize: 12 }}
                          label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft', fill: '#9aa4b2', fontSize: 12 }}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload) return null
                            return (
                              <div className="panel p-3 min-w-[140px] backdrop-blur-sm bg-gray-900/95">
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
                        <Legend 
                          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                          iconType="line"
                        />
                        <Line type="monotone" dataKey="Q1" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Q2" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Q3" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personal Best Tracking - Collapsible */}
      <div className="border border-gray-700 rounded-lg backdrop-blur-sm bg-gray-800/30">
        <button
          type="button"
          onClick={() => toggleSection('personal-best')}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800/40 transition-colors"
        >
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Personal Best Tracking</h4>
            <p className="text-xs text-gray-400 mt-1">
              Track personal best improvements throughout session
            </p>
          </div>
          <span className="text-gray-400">
            {expandedSection === 'personal-best' ? '▼' : '▶'}
          </span>
        </button>
        {expandedSection === 'personal-best' && (
          <div className="px-4 pb-4 border-t border-gray-700">
            <div className="mt-4 space-y-4">
              {personalBestTracking.map((driver) => (
                <div key={driver.driver} className="border border-gray-800 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <DriverBadge code={driver.driver} year={sessionData.meta.year} size="sm" variant="badge" />
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>Current PB:</span>
                      <TimeDisplay 
                        value={driver.currentPB ?? null} 
                        type="lap" 
                        variant="mono"
                        showUnit
                      />
                      {driver.pbLapNumber && (
                        <span className="text-xs">(Lap {driver.pbLapNumber})</span>
                      )}
                    </div>
                  </div>
                  {driver.personalBests.length > 0 && (
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>PB Improvements: {driver.personalBests.length}</span>
                        <span className="flex items-center gap-1">
                          First: L{driver.personalBests[0].lapNumber} (
                          <TimeDisplay 
                            value={driver.personalBests[0].lapTime} 
                            type="lap" 
                            variant="mono"
                            showUnit
                          />
                          )
                        </span>
                      </div>
                      {driver.personalBests.length > 1 && (
                        <div className="flex justify-between items-center">
                          <span>Best Improvement:</span>
                          <DeltaBadge 
                            value={driver.personalBests[0].lapTime - driver.personalBests[driver.personalBests.length - 1].lapTime}
                            unit="s"
                            variant="inline"
                            inverted={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lap Time Trends - Always visible but compact */}
      {lapTimeTrends.length > 0 && (
        <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
          <h4 className="text-sm font-semibold text-gray-200 mb-3">Lap Time Trends</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lapTimeTrends}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="lapNumber" 
                  stroke="#9aa4b2"
                  tick={{ fill: '#9aa4b2', fontSize: 12 }}
                  label={{ value: 'Lap Number', position: 'insideBottom', offset: -5, fill: '#9aa4b2', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9aa4b2"
                  domain={lapTimeYDomain}
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
    </div>
  )
}
