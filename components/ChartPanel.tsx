'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine,
  ReferenceArea
} from 'recharts'
import { SessionPayload } from '../lib/sessionDataClient'
import { driverColorMap } from '../lib/teamData'
import ChartTooltip from './ChartTooltip'
import F1CarIcon from './F1CarIcon'

type ChartPanelProps = {
  sessionData: SessionPayload | null
  selectedDrivers: string[]
  loading: boolean
  showOutliers: boolean
}

type ChartDatum = {
  lapNumber: number
  [driverCode: string]: number | null | number[]
}

type QualifyingAttempt = {
  attemptNumber: number
  lapTimeSeconds: number
  driver: string
  isPersonalBest: boolean
  lapNumber: number | null
  compound: string | null
  sessionTimeSeconds?: number | null
  qSegment?: 'Q1' | 'Q2' | 'Q3'
  xPosition?: number // X position for scatter plot (1=Q1, 2=Q2, 3=Q3)
  offsetX?: number // Horizontal offset for collision avoidance
  offsetY?: number // Vertical offset for collision avoidance
  isFastestInSegment?: boolean // True if this is the fastest time in its Q segment
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

const buildChartData = (
  sessionData: SessionPayload | null,
  driverCodes: string[],
  showOutliers: boolean,
): ChartDatum[] => {
  if (!sessionData || !driverCodes.length) return []

  const driversSet = new Set(driverCodes.map(code => code.toUpperCase()))
  const lapsByNumber = new Map<number, ChartDatum>()

  for (const lap of sessionData.laps) {
    if (!lap || lap.lapNumber == null) continue
    if (!showOutliers && lap.isValid === false) continue
    const normalizedDriver = lap.driver?.toUpperCase()
    if (!driversSet.has(normalizedDriver)) continue

    const lapNumber = Number(lap.lapNumber)
    if (Number.isNaN(lapNumber)) continue

    const existing = lapsByNumber.get(lapNumber) ?? { lapNumber }
    existing[normalizedDriver] = typeof lap.lapTimeSeconds === 'number' ? lap.lapTimeSeconds : null
    lapsByNumber.set(lapNumber, existing)
  }

  return Array.from(lapsByNumber.values()).sort((a, b) => a.lapNumber - b.lapNumber)
}

const buildQualifyingData = (
  sessionData: SessionPayload | null,
  driverCodes: string[],
  showOutliers: boolean,
): QualifyingAttempt[] => {
  if (!sessionData || !driverCodes.length) return []

  const driversSet = new Set(driverCodes.map(code => code.toUpperCase()))
  const attempts: QualifyingAttempt[] = []
  const attemptCounters = new Map<string, number>()

  // First pass: collect all valid laps per driver to find best times
  const validLapsByDriver = new Map<string, number[]>()
  for (const lap of sessionData.laps) {
    if (!lap || lap.lapNumber == null) continue
    if (lap.isValid !== true) continue
    const normalizedDriver = lap.driver?.toUpperCase()
    if (!driversSet.has(normalizedDriver)) continue
    if (typeof lap.lapTimeSeconds !== 'number' || Number.isNaN(lap.lapTimeSeconds)) continue
    
    if (!validLapsByDriver.has(normalizedDriver)) {
      validLapsByDriver.set(normalizedDriver, [])
    }
    validLapsByDriver.get(normalizedDriver)!.push(lap.lapTimeSeconds)
  }

  // Calculate best time per driver (for outlier detection)
  const bestTimeByDriver = new Map<string, number>()
  for (const [driver, times] of validLapsByDriver.entries()) {
    bestTimeByDriver.set(driver, Math.min(...times))
  }

  // Sort laps by lap number to maintain attempt order
  const sortedLaps = [...sessionData.laps].sort((a, b) => {
    const aNum = a.lapNumber ?? 0
    const bNum = b.lapNumber ?? 0
    return aNum - bNum
  })

  for (const lap of sortedLaps) {
    if (!lap || lap.lapNumber == null) continue
    
    // For qualifying, ONLY count valid laps (officially counted laps)
    // Always exclude out-laps, in-laps, warm-up laps, etc.
    if (lap.isValid !== true) continue
    
    const normalizedDriver = lap.driver?.toUpperCase()
    if (!driversSet.has(normalizedDriver)) continue
    if (typeof lap.lapTimeSeconds !== 'number' || Number.isNaN(lap.lapTimeSeconds)) continue

    // Filter out laps that are significantly slower than the driver's best time
    // This catches slow laps that are marked valid but aren't real qualifying attempts
    const bestTime = bestTimeByDriver.get(normalizedDriver)
    if (bestTime !== undefined) {
      // If a lap is more than 25% slower than the driver's best, exclude it
      // This filters out slow laps that shouldn't be counted as attempts
      const threshold = bestTime * 1.25
      if (lap.lapTimeSeconds > threshold) {
        continue
      }
    }

    const currentCount = attemptCounters.get(normalizedDriver) ?? 0
    attemptCounters.set(normalizedDriver, currentCount + 1)

    attempts.push({
      attemptNumber: currentCount + 1,
      lapTimeSeconds: lap.lapTimeSeconds,
      driver: normalizedDriver,
      isPersonalBest: lap.isPersonalBest ?? false,
      lapNumber: lap.lapNumber,
      compound: lap.compound ?? null,
      sessionTimeSeconds: lap.sessionTimeSeconds ?? null,
    })
  }

  return attempts
}

const buildCompoundMap = (
  sessionData: SessionPayload | null,
  driverCodes: string[],
  showOutliers: boolean,
): Map<number, Map<string, string | null>> => {
  const compoundMap = new Map<number, Map<string, string | null>>()

  if (!sessionData || !driverCodes.length) return compoundMap

  const driversSet = new Set(driverCodes.map(code => code.toUpperCase()))

  for (const lap of sessionData.laps) {
    if (!lap || lap.lapNumber == null) continue
    if (!showOutliers && lap.isValid === false) continue
    const normalizedDriver = lap.driver?.toUpperCase()
    if (!driversSet.has(normalizedDriver)) continue

    const lapNumber = Number(lap.lapNumber)
    if (Number.isNaN(lapNumber)) continue

    let lapMap = compoundMap.get(lapNumber)
    if (!lapMap) {
      lapMap = new Map<string, string | null>()
      compoundMap.set(lapNumber, lapMap)
    }

    lapMap.set(normalizedDriver, lap.compound || null)
  }

  return compoundMap
}

const computeYDomain = (data: ChartDatum[], drivers: string[]): [number, number] | undefined => {
  let min = Infinity
  let max = -Infinity

  data.forEach(entry => {
    drivers.forEach(code => {
      const value = entry[code.toUpperCase()]
      if (typeof value === 'number' && !Number.isNaN(value)) {
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    })
  })

  if (min === Infinity || max === -Infinity) {
    return undefined
  }

  const padding = Math.max((max - min) * 0.05, 0.3)
  return [Math.max(min - padding, 0), max + padding]
}

export default function ChartPanel({ sessionData, selectedDrivers, loading, showOutliers }: ChartPanelProps) {
  // Toggle for showing all valid times vs only fastest per driver (qualifying only)
  const [showAllValidTimes, setShowAllValidTimes] = React.useState(false)
  const normalizedSelectedDrivers = useMemo(
    () => selectedDrivers.map(code => code.toUpperCase()),
    [selectedDrivers]
  )

  const availableDrivers = useMemo(() => {
    if (!sessionData) return []
    const driversFromData = Object.keys(sessionData.drivers ?? {})
    return driversFromData.map(code => code.toUpperCase())
  }, [sessionData])

  const driversToDisplay = useMemo(() => {
    if (!sessionData) return []
    const filtered = normalizedSelectedDrivers.filter(code => sessionData.drivers?.[code])

    if (filtered.length > 0) {
      return filtered
    }

    return availableDrivers.slice(0, 4)
  }, [availableDrivers, normalizedSelectedDrivers, sessionData])

  // Check if this is a qualifying or sprint qualifying session
  const isQualifyingSession = useMemo(() => {
    if (!sessionData) return false
    const sessionCode = sessionData.meta?.session?.toUpperCase()
    return sessionCode === 'Q' || sessionCode === 'SQ'
  }, [sessionData])

  const chartData = useMemo(
    () => buildChartData(sessionData, driversToDisplay, showOutliers),
    [sessionData, driversToDisplay, showOutliers]
  )

  const qualifyingData = useMemo(
    () => buildQualifyingData(sessionData, driversToDisplay, showOutliers),
    [sessionData, driversToDisplay, showOutliers]
  )

  const compoundMap = useMemo(
    () => buildCompoundMap(sessionData, driversToDisplay, showOutliers),
    [sessionData, driversToDisplay, showOutliers]
  )

  const yDomain = useMemo(() => {
    if (isQualifyingSession && qualifyingData.length > 0) {
      const times = qualifyingData.map(a => a.lapTimeSeconds).filter((t): t is number => typeof t === 'number')
      if (times.length === 0) return undefined
      const min = Math.min(...times)
      const max = Math.max(...times)
      const padding = Math.max((max - min) * 0.05, 0.3)
      return [Math.max(min - padding, 0), max + padding]
    }
    return computeYDomain(chartData, driversToDisplay)
  }, [isQualifyingSession, qualifyingData, chartData, driversToDisplay])

  // Calculate Q1/Q2/Q3 boundaries using official session_status data from FastF1
  // FastF1 provides session_status with "Started" and "Finished" events for each Q session
  // This is the most reliable way to identify Q boundaries
  const qualifyingBoundaries = useMemo(() => {
    if (!isQualifyingSession || qualifyingData.length === 0 || !sessionData) return null

    // First, try to use official qualifying boundaries from session_status
    if (sessionData.qualifyingBoundaries) {
      const boundaries = sessionData.qualifyingBoundaries
      
      // Map session times to attempt numbers
      const attemptByTime = new Map<number, number>()
      for (const attempt of qualifyingData) {
        if (typeof attempt.sessionTimeSeconds === 'number' && !Number.isNaN(attempt.sessionTimeSeconds)) {
          attemptByTime.set(attempt.sessionTimeSeconds, attempt.attemptNumber)
        }
      }

      // Find attempt numbers at boundaries
      let q1End = 0
      let q2End = 0
      let q3End = 0

      // Q1 end
      if (boundaries.q1End !== null) {
        const attemptsInQ1 = Array.from(attemptByTime.entries())
          .filter(([time]) => time <= boundaries.q1End!)
          .map(([, attempt]) => attempt)
        if (attemptsInQ1.length > 0) {
          q1End = Math.max(...attemptsInQ1) + 0.5
        }
      }

      // Q2 end
      if (boundaries.q2End !== null && q1End > 0) {
        const attemptsInQ2 = Array.from(attemptByTime.entries())
          .filter(([time]) => time > boundaries.q1End! && time <= boundaries.q2End!)
          .map(([, attempt]) => attempt)
        if (attemptsInQ2.length > 0) {
          q2End = Math.max(...attemptsInQ2) + 0.5
        }
      }

      // Q3 goes to the end
      if (q2End > 0) {
        const maxAttempt = Math.max(...qualifyingData.map(a => a.attemptNumber))
        q3End = maxAttempt + 0.5
      }

      if (q1End > 0) {
        return { q1End, q2End, q3End }
      }
    }

    // Fallback: Use session time gaps if no official boundaries available
    const sessionTimes = qualifyingData
      .map(a => a.sessionTimeSeconds)
      .filter((t): t is number => typeof t === 'number' && !Number.isNaN(t))
      .sort((a, b) => a - b)

    if (sessionTimes.length === 0) {
      // Final fallback: attempt-based
      const maxAttempt = Math.max(...qualifyingData.map(a => a.attemptNumber))
      if (maxAttempt > 7) {
        return { q1End: 3.5, q2End: 6.5, q3End: Math.min(maxAttempt + 0.5, 9.5) }
      } else if (maxAttempt > 4) {
        return { q1End: 3.5, q2End: 6.5, q3End: 0 }
      } else {
        return { q1End: 3.5, q2End: 0, q3End: 0 }
      }
    }

    // Fallback logic using gaps (same as before)
    const firstLapTime = sessionTimes[0]
    const gaps: Array<{ beforeTime: number; afterTime: number; gap: number }> = []
    for (let i = 1; i < sessionTimes.length; i++) {
      const gap = sessionTimes[i] - sessionTimes[i - 1]
      if (gap >= 120) {
        gaps.push({
          beforeTime: sessionTimes[i - 1],
          afterTime: sessionTimes[i],
          gap,
        })
      }
    }
    
    gaps.sort((a, b) => b.gap - a.gap)
    
    let q1EndTime: number | null = null
    let q2EndTime: number | null = null
    
    if (gaps.length >= 2) {
      const sortedByTime = [...gaps].sort((a, b) => a.beforeTime - b.beforeTime)
      q1EndTime = sortedByTime[0].beforeTime
      q2EndTime = sortedByTime[1].beforeTime
    } else if (gaps.length === 1) {
      q1EndTime = gaps[0].beforeTime
      q2EndTime = gaps[0].afterTime + 900
    } else {
      q1EndTime = firstLapTime + 1080
      q2EndTime = firstLapTime + 1080 + 150 + 900
    }

    const attemptByTime = new Map<number, number>()
    for (const attempt of qualifyingData) {
      if (typeof attempt.sessionTimeSeconds === 'number' && !Number.isNaN(attempt.sessionTimeSeconds)) {
        attemptByTime.set(attempt.sessionTimeSeconds, attempt.attemptNumber)
      }
    }

    let q1End = 0
    let q2End = 0
    let q3End = 0

    if (q1EndTime !== null) {
      const attemptsInQ1 = Array.from(attemptByTime.entries())
        .filter(([time]) => time <= q1EndTime!)
        .map(([, attempt]) => attempt)
      if (attemptsInQ1.length > 0) {
        q1End = Math.max(...attemptsInQ1) + 0.5
      } else {
        q1End = 3.5
      }
    }

    if (q2EndTime !== null && q1End > 0) {
      const attemptsInQ2 = Array.from(attemptByTime.entries())
        .filter(([time]) => time > q1EndTime! && time <= q2EndTime!)
        .map(([, attempt]) => attempt)
      if (attemptsInQ2.length > 0) {
        q2End = Math.max(...attemptsInQ2) + 0.5
      } else {
        q2End = 6.5
      }
    }

    if (q2End > 0) {
      const maxAttempt = Math.max(...qualifyingData.map(a => a.attemptNumber))
      q3End = maxAttempt + 0.5
    }

    if (q1End === 0) {
      const maxAttempt = Math.max(...qualifyingData.map(a => a.attemptNumber))
      if (maxAttempt > 7) {
        return { q1End: 3.5, q2End: 6.5, q3End: Math.min(maxAttempt + 0.5, 9.5) }
      } else if (maxAttempt > 4) {
        return { q1End: 3.5, q2End: 6.5, q3End: 0 }
      } else {
        return { q1End: 3.5, q2End: 0, q3End: 0 }
      }
    }

    return { q1End, q2End, q3End }
  }, [isQualifyingSession, qualifyingData, sessionData])

  // Find fastest time in each Q segment (across ALL drivers, not just selected)
  const fastestTimesBySegment = useMemo(() => {
    if (!isQualifyingSession || !sessionData) return { Q1: null, Q2: null, Q3: null }
    
    // Get all qualifying attempts from all drivers
    const allDrivers = Object.keys(sessionData.drivers || {})
    const allQualifyingData = buildQualifyingData(sessionData, allDrivers, showOutliers)
    
    // Group by Q segment and find fastest in each
    const fastest: { Q1: QualifyingAttempt | null, Q2: QualifyingAttempt | null, Q3: QualifyingAttempt | null } = {
      Q1: null,
      Q2: null,
      Q3: null,
    }
    
    for (const attempt of allQualifyingData) {
      if (!attempt.qSegment) continue
      const current = fastest[attempt.qSegment]
      if (!current || attempt.lapTimeSeconds < current.lapTimeSeconds) {
        fastest[attempt.qSegment] = attempt
      }
    }
    
    return fastest
  }, [isQualifyingSession, sessionData, showOutliers])

  // Assign Q segments to attempts based on session time and group by driver
  // Also add collision detection offsets and fastest time markers
  const qualifyingByDriver = useMemo(() => {
    if (!isQualifyingSession) return {}
    
    // First, assign Q segments and X positions to each attempt based on session time
    const attemptsWithSegments = qualifyingData.map(attempt => {
      let qSegment: 'Q1' | 'Q2' | 'Q3' = 'Q1'
      let xPosition = 1 // Default to Q1
      
      if (qualifyingBoundaries && typeof attempt.sessionTimeSeconds === 'number' && sessionData?.qualifyingBoundaries) {
        // Use official qualifying boundaries from session_status
        const boundaries = sessionData.qualifyingBoundaries
        const sessionTime = attempt.sessionTimeSeconds
        
        // Assign segment based on official boundaries
        if (boundaries.q1End !== null && sessionTime <= boundaries.q1End) {
          qSegment = 'Q1'
          xPosition = 1
        } else if (boundaries.q2End !== null && sessionTime <= boundaries.q2End) {
          qSegment = 'Q2'
          xPosition = 2
        } else {
          qSegment = 'Q3'
          xPosition = 3
        }
      } else if (qualifyingBoundaries && typeof attempt.sessionTimeSeconds === 'number') {
        // Fallback: Use session time gaps if no official boundaries
        const sessionTime = attempt.sessionTimeSeconds
        const sessionTimes = qualifyingData
          .map(a => a.sessionTimeSeconds)
          .filter((t): t is number => typeof t === 'number' && !Number.isNaN(t))
          .sort((a, b) => a - b)
        
        if (sessionTimes.length > 0) {
          const firstLapTime = sessionTimes[0]
          const gaps: Array<{ beforeTime: number; afterTime: number; gap: number }> = []
          for (let i = 1; i < sessionTimes.length; i++) {
            const gap = sessionTimes[i] - sessionTimes[i - 1]
            if (gap >= 120) {
              gaps.push({
                beforeTime: sessionTimes[i - 1],
                afterTime: sessionTimes[i],
                gap,
              })
            }
          }
          
          gaps.sort((a, b) => b.gap - a.gap)
          
          let q1EndTime: number | null = null
          let q2EndTime: number | null = null
          
          if (gaps.length >= 2) {
            const sortedByTime = [...gaps].sort((a, b) => a.beforeTime - b.beforeTime)
            q1EndTime = sortedByTime[0].beforeTime
            q2EndTime = sortedByTime[1].beforeTime
          } else if (gaps.length === 1) {
            q1EndTime = gaps[0].beforeTime
            q2EndTime = gaps[0].afterTime + 900
          } else {
            q1EndTime = firstLapTime + 1080
            q2EndTime = firstLapTime + 1080 + 150 + 900
          }
          
          if (q1EndTime !== null && sessionTime <= q1EndTime) {
            qSegment = 'Q1'
            xPosition = 1
          } else if (q2EndTime !== null && sessionTime <= q2EndTime) {
            qSegment = 'Q2'
            xPosition = 2
          } else {
            qSegment = 'Q3'
            xPosition = 3
          }
        } else {
          // Fallback to attempt number
          if (qualifyingBoundaries.q1End > 0 && attempt.attemptNumber <= qualifyingBoundaries.q1End) {
            qSegment = 'Q1'
            xPosition = 1
          } else if (qualifyingBoundaries.q2End > 0 && attempt.attemptNumber <= qualifyingBoundaries.q2End) {
            qSegment = 'Q2'
            xPosition = 2
          } else {
            qSegment = 'Q3'
            xPosition = 3
          }
        }
      } else if (qualifyingBoundaries) {
        // Fallback to attempt number if no session time
        if (qualifyingBoundaries.q1End > 0 && attempt.attemptNumber <= qualifyingBoundaries.q1End) {
          qSegment = 'Q1'
          xPosition = 1
        } else if (qualifyingBoundaries.q2End > 0 && attempt.attemptNumber <= qualifyingBoundaries.q2End) {
          qSegment = 'Q2'
          xPosition = 2
        } else {
          qSegment = 'Q3'
          xPosition = 3
        }
      }
      
      // Check if this is the fastest time in its segment
      const isFastest = fastestTimesBySegment[qSegment]?.driver === attempt.driver &&
                        fastestTimesBySegment[qSegment]?.lapTimeSeconds === attempt.lapTimeSeconds
      
      return {
        ...attempt,
        qSegment,
        xPosition, // X position for scatter plot (1=Q1, 2=Q2, 3=Q3)
        offsetX: 0,
        offsetY: 0,
        isFastestInSegment: isFastest,
      }
    })
    
    // Collision detection: prevent overlapping when times are close
    // Group attempts by Q segment and sort by lap time
    const attemptsBySegment = new Map<'Q1' | 'Q2' | 'Q3', QualifyingAttempt[]>()
    for (const attempt of attemptsWithSegments) {
      if (!attempt.qSegment) continue
      if (!attemptsBySegment.has(attempt.qSegment)) {
        attemptsBySegment.set(attempt.qSegment, [])
      }
      attemptsBySegment.get(attempt.qSegment)!.push(attempt)
    }
    
    // Process each segment separately
    const COLLISION_THRESHOLD = 0.15 // seconds - if times are within 0.15s, offset them
    const OFFSET_STEP = 0.12 // X offset step for collision avoidance
    
    for (const [segment, attempts] of attemptsBySegment.entries()) {
      // Sort by lap time
      attempts.sort((a, b) => a.lapTimeSeconds - b.lapTimeSeconds)
      
      // Check for collisions and apply offsets
      for (let i = 0; i < attempts.length; i++) {
        const current = attempts[i]
        let offsetX = 0
        let offsetY = 0
        let collisionCount = 0
        
        // Check collisions with all other attempts in the same segment
        for (let j = 0; j < attempts.length; j++) {
          if (i === j) continue
          const other = attempts[j]
          const timeDiff = Math.abs(current.lapTimeSeconds - other.lapTimeSeconds)
          
          if (timeDiff < COLLISION_THRESHOLD) {
            collisionCount++
            // Determine offset direction based on which car is faster
            const isFaster = current.lapTimeSeconds < other.lapTimeSeconds
            const direction = isFaster ? -1 : 1
            
            // Apply offset - alternate left/right for multiple collisions
            offsetX += direction * OFFSET_STEP * (collisionCount % 2 === 0 ? 1 : -1)
            // Small vertical offset for visual separation
            offsetY += (collisionCount % 2 === 0 ? 1 : -1) * 0.015
          }
        }
        
        // Limit offsets to prevent cars from going too far
        offsetX = Math.max(-0.3, Math.min(0.3, offsetX))
        offsetY = Math.max(-0.05, Math.min(0.05, offsetY))
        
        current.offsetX = offsetX
        current.offsetY = offsetY
      }
    }
    
    // Group by driver
    const grouped: Record<string, QualifyingAttempt[]> = {}
    for (const attempt of attemptsWithSegments) {
      if (!grouped[attempt.driver]) {
        grouped[attempt.driver] = []
      }
      grouped[attempt.driver].push(attempt)
    }
    return grouped
  }, [isQualifyingSession, qualifyingData, qualifyingBoundaries, fastestTimesBySegment])

  const showNoSelectionMessage =
    !normalizedSelectedDrivers.length ||
    (normalizedSelectedDrivers.length > 0 &&
      !driversToDisplay.some(code => normalizedSelectedDrivers.includes(code)))

  // Filter qualifying data based on toggle
  const filteredQualifyingByDriver = useMemo(() => {
    if (!isQualifyingSession || showAllValidTimes) {
      return qualifyingByDriver
    }
    
    // When toggle is off, only show fastest time per driver per Q segment
    const filtered: Record<string, QualifyingAttempt[]> = {}
    
    for (const [driver, attempts] of Object.entries(qualifyingByDriver)) {
      // Group by Q segment and find fastest in each
      const bySegment: Record<'Q1' | 'Q2' | 'Q3', QualifyingAttempt[]> = {
        Q1: [],
        Q2: [],
        Q3: [],
      }
      
      for (const attempt of attempts) {
        if (attempt.qSegment) {
          bySegment[attempt.qSegment].push(attempt)
        }
      }
      
      // Get fastest from each segment
      const fastest: QualifyingAttempt[] = []
      for (const segment of ['Q1', 'Q2', 'Q3'] as const) {
        if (bySegment[segment].length > 0) {
          const fastestInSegment = bySegment[segment].reduce((best, current) => 
            current.lapTimeSeconds < best.lapTimeSeconds ? current : best
          )
          fastest.push(fastestInSegment)
        }
      }
      
      filtered[driver] = fastest
    }
    
    return filtered
  }, [qualifyingByDriver, isQualifyingSession, showAllValidTimes])

  return (
    <div className="mt-6 panel p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Lap Time Comparison</h2>
          <p className="text-xs text-gray-500">
            {isQualifyingSession
              ? 'Qualifying attempts shown as scatter plot. Best laps highlighted in yellow. Attempts numbered sequentially per driver.'
              : 'Lap times pulled from FastF1 telemetry. Values plotted in seconds.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isQualifyingSession && (
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllValidTimes}
                onChange={(e) => setShowAllValidTimes(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent focus:ring-offset-gray-900"
              />
              <span>Show all valid times during session</span>
            </label>
          )}
        {sessionData?.meta?.event?.name && (
          <div className="text-right text-xs text-gray-400">
            <div>{sessionData.meta.event.name}</div>
            {sessionData.meta.event.country && <div>{sessionData.meta.event.country}</div>}
          </div>
        )}
        </div>
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Loading session telemetry…
        </div>
      )}

      {!loading && !sessionData && (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Select a track and session to load telemetry.
        </div>
      )}

      {!loading && sessionData && showNoSelectionMessage && (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-gray-400">
          <span>
            Telemetry for the selected drivers is not available in the current dataset. Choose
            another driver or regenerate data.
          </span>
          {availableDrivers.length > 0 && (
            <span className="text-xs text-gray-500">
              Available drivers: {availableDrivers.join(', ')}
            </span>
          )}
        </div>
      )}

      {!loading && sessionData && !chartData.length && !qualifyingData.length && !showNoSelectionMessage && (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          No lap times to display for the current selection.
        </div>
      )}

      {/* Qualifying/Sprint Qualifying: Scatter Plot */}
      {!loading && sessionData && isQualifyingSession && qualifyingData.length > 0 && !showNoSelectionMessage && (
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 12, left: 6, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 6" className="chart-grid" />
              <XAxis
                type="number"
                dataKey="xPosition"
                name="Qualifying Segment"
                stroke="#9aa4b2"
                domain={[0.5, 3.5]}
                ticks={[1, 2, 3]}
                tickFormatter={(value: number) => {
                  if (value === 1) return 'Q1'
                  if (value === 2) return 'Q2'
                  if (value === 3) return 'Q3'
                  return ''
                }}
              />
              <YAxis
                type="number"
                dataKey="lapTimeSeconds"
                name="Lap Time"
                stroke="#9aa4b2"
                domain={yDomain}
                width={60}
                tickFormatter={(value: number) => value.toFixed(1)}
                label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft' }}
              />
              {/* Q1/Q2/Q3 Colored Boxes */}
              <ReferenceArea
                x1={0.5}
                x2={1.5}
                fill="#ef4444"
                fillOpacity={0.1}
                stroke="#ef4444"
                strokeWidth={2}
                strokeOpacity={0.6}
              />
              {qualifyingBoundaries && qualifyingBoundaries.q2End > 0 && (
                <ReferenceArea
                  x1={1.5}
                  x2={2.5}
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeOpacity={0.6}
                />
              )}
              {qualifyingBoundaries && qualifyingBoundaries.q3End > 0 && (
                <ReferenceArea
                  x1={2.5}
                  x2={3.5}
                  fill="#22c55e"
                  fillOpacity={0.1}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeOpacity={0.6}
                />
              )}
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null
                  const data = payload[0].payload as QualifyingAttempt
                  const formatTime = (seconds: number) => {
                    const mins = Math.floor(seconds / 60)
                    const secs = (seconds % 60).toFixed(3)
                    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : `${secs}s`
                  }
                  // Get original lap time (before offset)
                  const originalTime = data.lapTimeSeconds - (data.offsetY || 0)
                  return (
                    <div className="panel p-2 min-w-[140px] animate-in fade-in-0 zoom-in-95 duration-200">
                      <div className="text-xs font-semibold text-gray-300 mb-1">
                        {data.driver} - {data.qSegment || 'Q1'}
                      </div>
                      <div className="text-xs text-gray-200 font-mono">
                        {formatTime(originalTime)}
                      </div>
                      {data.isFastestInSegment && (
                        <div className="text-xs text-yellow-400 font-medium mt-1 flex items-center gap-1">
                          🏁 Fastest in {data.qSegment}
                        </div>
                      )}
                      {data.isPersonalBest && (
                        <div className="text-xs text-accent font-medium mt-1">⭐ Personal Best</div>
                      )}
                      {data.compound && (
                        <div className="text-xs text-gray-400 mt-1">Compound: {data.compound}</div>
                      )}
                    </div>
                  )
                }}
              />
              <Legend />
              {/* Checkered flag markers for fastest times - find the actual position in displayed data */}
              {fastestTimesBySegment.Q1 && (() => {
                const fastest = fastestTimesBySegment.Q1
                // Find the attempt in the displayed data to get its offset
                const displayedAttempt = filteredQualifyingByDriver[fastest.driver]?.find(
                  a => a.lapTimeSeconds === fastest.lapTimeSeconds && a.qSegment === 'Q1'
                )
                const offsetX = displayedAttempt?.offsetX || 0
                const offsetY = displayedAttempt?.offsetY || 0
                return (
                  <ReferenceLine
                    x={1 + offsetX}
                    y={fastest.lapTimeSeconds + offsetY}
                    stroke="none"
                    label={{
                      value: '🏁',
                      position: 'top',
                      offset: 12,
                      style: { fontSize: '18px', fontWeight: 'bold' }
                    }}
                  />
                )
              })()}
              {fastestTimesBySegment.Q2 && (() => {
                const fastest = fastestTimesBySegment.Q2
                const displayedAttempt = filteredQualifyingByDriver[fastest.driver]?.find(
                  a => a.lapTimeSeconds === fastest.lapTimeSeconds && a.qSegment === 'Q2'
                )
                const offsetX = displayedAttempt?.offsetX || 0
                const offsetY = displayedAttempt?.offsetY || 0
                return (
                  <ReferenceLine
                    x={2 + offsetX}
                    y={fastest.lapTimeSeconds + offsetY}
                    stroke="none"
                    label={{
                      value: '🏁',
                      position: 'top',
                      offset: 12,
                      style: { fontSize: '18px', fontWeight: 'bold' }
                    }}
                  />
                )
              })()}
              {fastestTimesBySegment.Q3 && (() => {
                const fastest = fastestTimesBySegment.Q3
                const displayedAttempt = filteredQualifyingByDriver[fastest.driver]?.find(
                  a => a.lapTimeSeconds === fastest.lapTimeSeconds && a.qSegment === 'Q3'
                )
                const offsetX = displayedAttempt?.offsetX || 0
                const offsetY = displayedAttempt?.offsetY || 0
                return (
                  <ReferenceLine
                    x={3 + offsetX}
                    y={fastest.lapTimeSeconds + offsetY}
                    stroke="none"
                    label={{
                      value: '🏁',
                      position: 'top',
                      offset: 12,
                      style: { fontSize: '18px', fontWeight: 'bold' }
                    }}
                  />
                )
              })()}
              {driversToDisplay.map((code, index) => {
                const driverAttempts = filteredQualifyingByDriver[code] || []
                const driverColor = getDriverColor(code, index)
                return (
                  <Scatter
                    key={code}
                    name={code}
                    data={driverAttempts.map(attempt => ({
                      ...attempt,
                      xPosition: (attempt.xPosition || 1) + (attempt.offsetX || 0),
                      lapTimeSeconds: attempt.lapTimeSeconds + (attempt.offsetY || 0),
                    }))}
                    fill={driverColor}
                    shape={(props: any) => {
                      const { cx, cy, payload } = props
                      const attempt = payload as QualifyingAttempt
                      const carSize = attempt.isPersonalBest ? 28 : 26
                      return (
                        <g
                          transform={`translate(${cx},${cy})`}
                          style={{ 
                            cursor: 'pointer',
                            pointerEvents: 'all'
                          }}
                        >
                          <F1CarIcon
                            driverCode={code}
                            color={attempt.isPersonalBest ? '#facc15' : driverColor}
                            size={carSize}
                            className="drop-shadow-sm"
                          />
                        </g>
                      )
                    }}
                    isAnimationActive={false}
                  />
                )
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Race/Sprint: Line Chart */}
      {!loading && sessionData && !isQualifyingSession && chartData.length > 0 && !showNoSelectionMessage && (
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 12, left: 6, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 6" className="chart-grid" />
              <XAxis
                dataKey="lapNumber"
                stroke="#9aa4b2"
                label={{ value: 'Lap', position: 'insideBottomRight', offset: -4 }}
              />
              <YAxis
                stroke="#9aa4b2"
                domain={yDomain}
                width={60}
                tickFormatter={(value: number) => value.toFixed(1)}
              />
              <Tooltip content={<ChartTooltip compoundMap={compoundMap} />} />
              <Legend />
              {driversToDisplay.map((code, index) => (
                <Line
                  key={code}
                  name={code}
                  type="monotone"
                  dataKey={code}
                  stroke={getDriverColor(code, index)}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
