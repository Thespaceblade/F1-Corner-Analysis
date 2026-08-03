'use client'

import React, { useMemo, useState } from 'react'
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
  ReferenceLine,
  ReferenceArea
} from 'recharts'
import { SessionPayload } from '../lib/sessionDataClient'
import { getDriverColor as getSeasonDriverColor } from '../lib/teamData'
import ChartTooltip from './ChartTooltip'
import LoadingIndicator from './LoadingIndicator'
import F1CarIcon from './F1CarIcon'

type ChartPanelProps = {
  sessionData: SessionPayload | null
  selectedDrivers: string[]
  loading: boolean
  showOutliers: boolean
  cornerFilter: {
    type: 'all' | 'qualifying-segment' | 'lap' | 'average'
    segment?: 'Q1' | 'Q2' | 'Q3'
    lapNumber?: number
  }
  onCornerFilterChange: (filter: {
    type: 'all' | 'qualifying-segment' | 'lap' | 'average'
    segment?: 'Q1' | 'Q2' | 'Q3'
    lapNumber?: number
  }) => void
  isQualifyingSession: boolean
  isRaceSession: boolean
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

type RacePointEvent = {
  lapNumber: number
  type: 'race-start' | 'pit-stop' | 'yellow-flag' | 'red-flag'
  driver?: string
}

type RacePeriodEvent = {
  startLap: number
  endLap: number
  type: 'safety-car' | 'virtual-safety-car'
  startLabel: string
  endLabel: string
}

type RaceEvents = {
  pointEvents: RacePointEvent[]
  periodEvents: RacePeriodEvent[]
}

// Unified event for label positioning
type LabeledEvent = {
  lapNumber: number
  label: string
  priority: number
  type: 'point' | 'period-start' | 'period-end'
  eventType: string
  driver?: string
  stroke: string
  strokeWidth: number
  strokeDasharray: string
  fontWeight: 'normal' | 'bold'
  offset: number  // Calculated vertical offset to prevent overlaps
}

// Event priority (lower number = higher priority, appears higher on chart)
const EVENT_PRIORITY: Record<string, number> = {
  'red-flag': 1,
  'race-start': 2,
  'period-start': 3,
  'period-end': 4,
  'pit-stop': 5,
  'yellow-flag': 6,
}

const extractRaceEvents = (
  sessionData: SessionPayload | null,
  drivers: string[],
  includeOutliers: boolean
): RaceEvents => {
  if (!sessionData || !drivers.length) {
    return { pointEvents: [], periodEvents: [] }
  }

  const pointEvents: RacePointEvent[] = []
  const periodEvents: RacePeriodEvent[] = []
  const driversSet = new Set(drivers.map(code => code.toUpperCase()))
  
  // Track last stint per driver to detect pit stops
  const lastStintByDriver = new Map<string, number | null>()
  
  // Track which laps have which flags for point events
  const redFlagLaps = new Set<number>()
  const yellowFlagLaps = new Set<number>()
  
  // Track safety car and VSC periods
  // Use a Map to track the highest priority flag per lap (SC > VSC)
  const scLapsByFlag = new Map<number, 'safety-car' | 'virtual-safety-car'>()
  
  // Race start (lap 1)
  const hasRaceStart = sessionData.laps.some(
    lap => lap.lapNumber === 1 && driversSet.has(lap.driver?.toUpperCase() ?? '')
  )
  if (hasRaceStart) {
    pointEvents.push({ lapNumber: 1, type: 'race-start' })
  }

  // Sort laps by lap number to process in order
  const sortedLaps = [...sessionData.laps].sort((a, b) => {
    const aNum = a.lapNumber ?? 0
    const bNum = b.lapNumber ?? 0
    return aNum - bNum
  })

  // First pass: collect all flag information from selected drivers
  // Note: For SC/VSC periods, we look at ALL laps (not just selected drivers) to get complete race-wide periods
  const allLapsForSC = includeOutliers 
    ? sessionData.laps 
    : sessionData.laps.filter(lap => lap.isValid !== false)

  // Track SC/VSC from all drivers to get complete periods
  for (const lap of allLapsForSC) {
    if (!lap || lap.lapNumber == null) continue
    const lapNumber = Number(lap.lapNumber)
    if (Number.isNaN(lapNumber)) continue
    
    const flags = lap.flags || []
    
    // Track safety car and VSC periods (period events) - SC takes priority over VSC
    if (flags.includes('safety-car')) {
      scLapsByFlag.set(lapNumber, 'safety-car')
    } else if (flags.includes('virtual-safety-car') && !scLapsByFlag.has(lapNumber)) {
      // Only set VSC if SC hasn't been set for this lap
      scLapsByFlag.set(lapNumber, 'virtual-safety-car')
    }
  }

  // Second pass: collect point events from selected drivers only
  for (const lap of sortedLaps) {
    if (!lap || lap.lapNumber == null) continue
    if (!includeOutliers && lap.isValid === false) continue
    
    const normalizedDriver = lap.driver?.toUpperCase()
    if (!driversSet.has(normalizedDriver ?? '')) continue

    const lapNumber = Number(lap.lapNumber)
    if (Number.isNaN(lapNumber)) continue

    const flags = lap.flags || []
    
    // Track red flags and yellow flags (point events) - only for selected drivers
    if (flags.includes('red-flag')) {
      redFlagLaps.add(lapNumber)
    }
    // Only track yellow flags if they're not part of SC/VSC (those are shown as periods)
    if (flags.includes('yellow-flag') && !flags.includes('safety-car') && !flags.includes('virtual-safety-car')) {
      yellowFlagLaps.add(lapNumber)
    }

    // Check for pit stops - look for "in-lap" flag (when driver actually pits)
    // Only for race sessions, not qualifying
    if (flags.includes('in-lap') && normalizedDriver && lapNumber > 1) {
      pointEvents.push({
        lapNumber,
        type: 'pit-stop',
        driver: normalizedDriver,
      })
    }
    
    // Track stint for reference (not used for pit detection anymore)
    if (normalizedDriver && lap.stint != null) {
      lastStintByDriver.set(normalizedDriver, lap.stint)
    }
  }

  // Convert red flag and yellow flag laps to point events
  for (const lapNumber of redFlagLaps) {
    pointEvents.push({ lapNumber, type: 'red-flag' })
  }
  for (const lapNumber of yellowFlagLaps) {
    pointEvents.push({ lapNumber, type: 'yellow-flag' })
  }

  // Convert safety car/VSC laps to periods
  // Group consecutive laps with the same flag type
  const scLaps = Array.from(scLapsByFlag.entries())
    .sort((a, b) => a[0] - b[0])
  
  if (scLaps.length > 0) {
    let currentPeriod: { startLap: number; endLap: number; type: 'safety-car' | 'virtual-safety-car'; startLabel: string; endLabel: string } | null = null
    
    for (const [lapNumber, type] of scLaps) {
      if (!currentPeriod) {
        // Start a new period
        const label: string = type === 'safety-car' ? 'SC start' : 'VSC start'
        currentPeriod = { startLap: lapNumber, endLap: lapNumber, type, startLabel: label, endLabel: '' }
      } else if (currentPeriod.type === type && lapNumber === currentPeriod.endLap + 1) {
        // Continue the current period (consecutive lap with same type)
        currentPeriod.endLap = lapNumber
      } else {
        // End current period (either type changed or gap in laps) and start a new one
        // Set end label for the previous period
        currentPeriod.endLabel = currentPeriod.type === 'safety-car' ? 'SC end' : 'VSC end'
        periodEvents.push(currentPeriod)
        const label: string = type === 'safety-car' ? 'SC start' : 'VSC start'
        currentPeriod = { startLap: lapNumber, endLap: lapNumber, type, startLabel: label, endLabel: '' }
      }
    }
    
    // Don't forget the last period - set end label
    if (currentPeriod) {
      currentPeriod.endLabel = currentPeriod.type === 'safety-car' ? 'SC end' : 'VSC end'
      periodEvents.push(currentPeriod)
    }
  }

  // Sort point events by lap number
  pointEvents.sort((a, b) => a.lapNumber - b.lapNumber)

  return { pointEvents, periodEvents }
}

// Calculate label offsets to prevent overlaps
const calculateLabelOffsets = (events: LabeledEvent[]): LabeledEvent[] => {
  const MIN_OFFSET = 5
  const OFFSET_STEP = 18  // Vertical spacing between labels
  const COLLISION_THRESHOLD = 2  // Consider events within 2 laps as potentially overlapping
  const MIN_LABEL_SPACING = 14  // Minimum pixels between labels
  
  // Sort by lap number, then priority
  const sorted = [...events].sort((a, b) => {
    if (a.lapNumber !== b.lapNumber) {
      return a.lapNumber - b.lapNumber
    }
    return a.priority - b.priority
  })
  
  // Calculate offsets with collision detection
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    // Base offset: minimum + (priority level * step)
    let offset = MIN_OFFSET + ((current.priority - 1) * OFFSET_STEP)
    
    // Check for collisions with previous events
    for (let j = 0; j < i; j++) {
      const previous = sorted[j]
      const lapDiff = Math.abs(current.lapNumber - previous.lapNumber)
      
      // If events are close together (within collision threshold)
      if (lapDiff <= COLLISION_THRESHOLD) {
        const offsetDiff = Math.abs(offset - previous.offset)
        
        // If offsets are too close, push current event down
        if (offsetDiff < MIN_LABEL_SPACING) {
          offset = previous.offset + MIN_LABEL_SPACING
        }
      }
    }
    
    // Ensure offset doesn't go too high (limit to reasonable chart margin)
    current.offset = Math.min(offset, 120)  // Max 120px offset
  }
  
  return sorted
}

// Convert race events to labeled events for positioning
const createLabeledEvents = (
  pointEvents: RacePointEvent[],
  periodEvents: RacePeriodEvent[]
): LabeledEvent[] => {
  const labeledEvents: LabeledEvent[] = []
  
  // Convert point events
  for (const event of pointEvents) {
    let label: string = ''
    let stroke: string = '#9aa4b2'
    let strokeWidth: number = 1
    let strokeDasharray: string = '3 3'
    let fontWeight: 'normal' | 'bold' = 'normal'
    
    switch (event.type) {
      case 'race-start':
        label = '🏁 Start'
        stroke = '#22c55e'
        strokeWidth = 2
        strokeDasharray = '5 5'
        fontWeight = 'bold'
        break
      case 'pit-stop':
        label = event.driver ? `Pit (${event.driver})` : 'Pit'
        stroke = '#f97316'
        strokeWidth = 1.5
        strokeDasharray = '4 4'
        break
      case 'yellow-flag':
        label = 'Yellow'
        stroke = '#eab308'
        strokeWidth = 1
        strokeDasharray = '3 3'
        break
      case 'red-flag':
        label = 'Red Flag'
        stroke = '#ef4444'
        strokeWidth = 2.5
        strokeDasharray = '10 5'
        fontWeight = 'bold'
        break
    }
    
    labeledEvents.push({
      lapNumber: event.lapNumber,
      label,
      priority: EVENT_PRIORITY[event.type] || 10,
      type: 'point',
      eventType: event.type,
      driver: event.driver,
      stroke,
      strokeWidth,
      strokeDasharray,
      fontWeight,
      offset: 5,  // Temporary, will be calculated
    })
  }
  
  // Convert period events (start and end)
  for (const period of periodEvents) {
    const periodStroke = period.type === 'safety-car' ? '#facc15' : '#fbbf24'
    const periodStrokeWidth = 2
    const periodDashArray = '5 5'
    
    // Start event
    labeledEvents.push({
      lapNumber: period.startLap,
      label: period.startLabel,
      priority: EVENT_PRIORITY['period-start'],
      type: 'period-start',
      eventType: period.type,
      stroke: periodStroke,
      strokeWidth: periodStrokeWidth,
      strokeDasharray: periodDashArray,
      fontWeight: 'normal',
      offset: 5,  // Temporary, will be calculated
    })
    
    // End event (only if different from start)
    if (period.endLap !== period.startLap) {
      labeledEvents.push({
        lapNumber: period.endLap,
        label: period.endLabel,
        priority: EVENT_PRIORITY['period-end'],
        type: 'period-end',
        eventType: period.type,
        stroke: periodStroke,
        strokeWidth: periodStrokeWidth,
        strokeDasharray: periodDashArray,
        fontWeight: 'normal',
        offset: 5,  // Temporary, will be calculated
      })
    }
  }
  
  return calculateLabelOffsets(labeledEvents)
}

export default function ChartPanel({ 
  sessionData, 
  selectedDrivers, 
  loading, 
  showOutliers,
  cornerFilter,
  onCornerFilterChange,
  isQualifyingSession,
  isRaceSession,
}: ChartPanelProps) {
  // Toggle for showing all valid times vs only fastest per driver (qualifying only)
  const [showAllValidTimes, setShowAllValidTimes] = useState(false)
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

  const chartData = useMemo(
    () => buildChartData(sessionData, driversToDisplay, showOutliers),
    [sessionData, driversToDisplay, showOutliers]
  )

  const qualifyingData = useMemo(
    () => buildQualifyingData(sessionData, driversToDisplay),
    [sessionData, driversToDisplay]
  )

  const compoundMap = useMemo(
    () => buildCompoundMap(sessionData, driversToDisplay, showOutliers),
    [sessionData, driversToDisplay, showOutliers]
  )

  // Extract race events for markers (only show when outliers are visible)
  // We extract events from all laps (including outliers) to get accurate event detection
  const raceEvents = useMemo(() => {
    if (!isRaceSession || !showOutliers) {
      return { pointEvents: [], periodEvents: [] }
    }
    // Always extract from all laps (pass true to include outliers) to detect events accurately
    return extractRaceEvents(sessionData, driversToDisplay, true)
  }, [sessionData, driversToDisplay, showOutliers, isRaceSession])

  // Create labeled events with calculated offsets to prevent overlaps
  const labeledEvents = useMemo(() => {
    if (!isRaceSession || !showOutliers || (!raceEvents.pointEvents.length && !raceEvents.periodEvents.length)) {
      return []
    }
    return createLabeledEvents(raceEvents.pointEvents, raceEvents.periodEvents)
  }, [raceEvents, isRaceSession, showOutliers])

  // Separate period events for area rendering (they need to be rendered separately)
  const periodEventsForAreas = useMemo(() => {
    return raceEvents.periodEvents
  }, [raceEvents.periodEvents])

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

  // Helper function to assign Q segment to an attempt based on session time or boundaries
  const assignSegmentToAttempt = (
    attempt: QualifyingAttempt,
    boundaries: { q1End: number; q2End: number; q3End: number } | null,
    sessionData: SessionPayload | null,
    allAttempts: QualifyingAttempt[]
  ): { qSegment: 'Q1' | 'Q2' | 'Q3'; xPosition: number } => {
    let qSegment: 'Q1' | 'Q2' | 'Q3' = 'Q1'
    let xPosition = 1

    if (boundaries && typeof attempt.sessionTimeSeconds === 'number' && sessionData?.qualifyingBoundaries) {
      // Use official qualifying boundaries from session_status
      const officialBoundaries = sessionData.qualifyingBoundaries
      const sessionTime = attempt.sessionTimeSeconds
      
      if (officialBoundaries.q1End !== null && sessionTime <= officialBoundaries.q1End) {
        qSegment = 'Q1'
        xPosition = 1
      } else if (officialBoundaries.q2End !== null && sessionTime <= officialBoundaries.q2End) {
        qSegment = 'Q2'
        xPosition = 2
      } else {
        qSegment = 'Q3'
        xPosition = 3
      }
    } else if (boundaries && typeof attempt.sessionTimeSeconds === 'number') {
      // Fallback: Calculate boundaries from session time gaps
      const sessionTimes = allAttempts
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
        
        const sessionTime = attempt.sessionTimeSeconds
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
      } else if (boundaries) {
        // Fallback to attempt number if no session time
        if (boundaries.q1End > 0 && attempt.attemptNumber <= boundaries.q1End) {
          qSegment = 'Q1'
          xPosition = 1
        } else if (boundaries.q2End > 0 && attempt.attemptNumber <= boundaries.q2End) {
          qSegment = 'Q2'
          xPosition = 2
        } else {
          qSegment = 'Q3'
          xPosition = 3
        }
      }
    } else if (boundaries) {
      // Fallback to attempt number if no session time
      if (boundaries.q1End > 0 && attempt.attemptNumber <= boundaries.q1End) {
        qSegment = 'Q1'
        xPosition = 1
      } else if (boundaries.q2End > 0 && attempt.attemptNumber <= boundaries.q2End) {
        qSegment = 'Q2'
        xPosition = 2
      } else {
        qSegment = 'Q3'
        xPosition = 3
      }
    }

    return { qSegment, xPosition }
  }

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
    if (!isQualifyingSession || !sessionData || !qualifyingBoundaries) return { Q1: null, Q2: null, Q3: null }
    
    // Get all qualifying attempts from all drivers
    const allDrivers = Object.keys(sessionData.drivers || {})
    const allQualifyingData = buildQualifyingData(sessionData, allDrivers)
    
    // Assign segments to all attempts
    const attemptsWithSegments = allQualifyingData.map(attempt => {
      const { qSegment, xPosition } = assignSegmentToAttempt(attempt, qualifyingBoundaries, sessionData, allQualifyingData)
      return {
        ...attempt,
        qSegment,
        xPosition,
      }
    })
    
    // Group by Q segment and find fastest in each
    const fastest: { Q1: QualifyingAttempt | null, Q2: QualifyingAttempt | null, Q3: QualifyingAttempt | null } = {
      Q1: null,
      Q2: null,
      Q3: null,
    }
    
    for (const attempt of attemptsWithSegments) {
      if (!attempt.qSegment) continue
      const current = fastest[attempt.qSegment]
      if (!current || attempt.lapTimeSeconds < current.lapTimeSeconds) {
        fastest[attempt.qSegment] = attempt
      }
    }
    
    return fastest
  }, [isQualifyingSession, sessionData, qualifyingBoundaries])

  // Assign Q segments to attempts based on session time and group by driver
  // Also add collision detection offsets and fastest time markers
  const qualifyingByDriver = useMemo(() => {
    if (!isQualifyingSession) return {}
    
    // First, assign Q segments and X positions to each attempt using the helper function
    const attemptsWithSegments = qualifyingData.map(attempt => {
      const { qSegment, xPosition } = assignSegmentToAttempt(
        attempt,
        qualifyingBoundaries,
        sessionData,
        qualifyingData
      )
      
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
    
    for (const [_segment, attempts] of attemptsBySegment.entries()) {
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
  }, [isQualifyingSession, qualifyingData, qualifyingBoundaries, fastestTimesBySegment, sessionData])

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

  // Get available lap numbers for race sessions
  const availableLapNumbers = useMemo(() => {
    if (!isRaceSession || !sessionData) return []
    const lapNumbers = new Set<number>()
    sessionData.laps.forEach(lap => {
      if (lap.lapNumber !== null && lap.isValid !== false) {
        lapNumbers.add(lap.lapNumber)
      }
    })
    return Array.from(lapNumbers).sort((a, b) => a - b)
  }, [isRaceSession, sessionData])

  // Check if qualifying boundaries are available
  const hasQualifyingBoundaries = useMemo(() => {
    return isQualifyingSession && sessionData?.qualifyingBoundaries !== undefined
  }, [isQualifyingSession, sessionData])

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

      {/* Event Marker Legend - Only show for race sessions when outliers are shown */}
      {isRaceSession && showOutliers && (raceEvents.pointEvents.length > 0 || raceEvents.periodEvents.length > 0) && (
        <div className="mb-4 rounded border border-gray-700 bg-gray-800/50 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-300">
            Event Markers
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {/* Point Events */}
            <div className="flex items-center gap-2">
              <svg width="32" height="4" className="flex-shrink-0">
                <line
                  x1="0"
                  y1="2"
                  x2="32"
                  y2="2"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
              </svg>
              <span className="text-gray-300">🏁 Start</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="32" height="4" className="flex-shrink-0">
                <line
                  x1="0"
                  y1="2"
                  x2="32"
                  y2="2"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
              <span className="text-gray-300">Pit Stop</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="32" height="4" className="flex-shrink-0">
                <line
                  x1="0"
                  y1="2"
                  x2="32"
                  y2="2"
                  stroke="#eab308"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </svg>
              <span className="text-gray-300">Yellow Flag</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="32" height="4" className="flex-shrink-0">
                <line
                  x1="0"
                  y1="2"
                  x2="32"
                  y2="2"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="10 5"
                />
              </svg>
              <span className="text-gray-300 font-bold">Red Flag</span>
            </div>
            {/* Period Events */}
            {periodEventsForAreas.some(p => p.type === 'safety-car') && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className="h-3 w-3 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: '#facc15',
                      opacity: 0.15,
                    }}
                  />
                  <svg width="16" height="4" className="flex-shrink-0">
                    <line
                      x1="0"
                      y1="2"
                      x2="16"
                      y2="2"
                      stroke="#facc15"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                  </svg>
                </div>
                <span className="text-gray-300">Safety Car</span>
              </div>
            )}
            {periodEventsForAreas.some(p => p.type === 'virtual-safety-car') && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className="h-3 w-3 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: '#fbbf24',
                      opacity: 0.12,
                    }}
                  />
                  <svg width="16" height="4" className="flex-shrink-0">
                    <line
                      x1="0"
                      y1="2"
                      x2="16"
                      y2="2"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                  </svg>
                </div>
                <span className="text-gray-300">Virtual Safety Car</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-[10px] text-gray-500">
            Event markers appear when "Hide outlier laps" is unchecked. Periods (SC/VSC) are shown as highlighted areas with start/end markers.
          </p>
        </div>
      )}

      {/* Corner Performance Filter Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3 p-3 rounded border border-gray-700 bg-gray-800/50">
        <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
          Corner Analysis:
        </div>
        
        {isQualifyingSession && hasQualifyingBoundaries && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Show fastest lap from:</span>
            <div className="flex gap-1">
              {(['Q1', 'Q2', 'Q3'] as const).map((segment) => {
                const isSelected = cornerFilter.type === 'qualifying-segment' && cornerFilter.segment === segment
                return (
                  <button
                    key={segment}
                    type="button"
                    onClick={() => {
                      onCornerFilterChange({
                        type: 'qualifying-segment',
                        segment,
                      })
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                      isSelected
                        ? 'bg-accent text-white border border-accent'
                        : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {segment}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  onCornerFilterChange({ type: 'all' })
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  cornerFilter.type === 'all'
                    ? 'bg-accent text-white border border-accent'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                }`}
              >
                All
              </button>
            </div>
          </div>
        )}
        
        {isRaceSession && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Show corners from:</span>
            <div className="flex gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  onCornerFilterChange({ type: 'average' })
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  cornerFilter.type === 'average'
                    ? 'bg-accent text-white border border-accent'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                }`}
              >
                Average
              </button>
              {availableLapNumbers.length > 0 && (
                <select
                  value={cornerFilter.type === 'lap' ? cornerFilter.lapNumber || '' : ''}
                  onChange={(e) => {
                    const lapNumber = parseInt(e.target.value, 10)
                    if (!isNaN(lapNumber)) {
                      onCornerFilterChange({
                        type: 'lap',
                        lapNumber,
                      })
                    }
                  }}
                  className="px-3 py-1 text-xs font-medium rounded bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="">Select Lap</option>
                  {availableLapNumbers.map((lapNum) => (
                    <option key={lapNum} value={lapNum}>
                      Lap {lapNum}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
        
        {!isQualifyingSession && !isRaceSession && (
          <div className="text-xs text-gray-500">
            Corner analysis available for qualifying and race sessions
          </div>
        )}
      </div>

      {loading && (
        <LoadingIndicator label="Loading session telemetry..." className="h-64" />
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
                const driverColor = getDriverColor(code, index, sessionData?.meta.year)
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
              {/* Race Period Events - Highlighted areas for Safety Car and VSC (render areas first, behind lines) */}
              {periodEventsForAreas.map((period, idx) => {
                const getPeriodStyle = (type: 'safety-car' | 'virtual-safety-car') => {
                  switch (type) {
                    case 'safety-car':
                      return {
                        fill: '#facc15',
                        fillOpacity: 0.15,
                      }
                    case 'virtual-safety-car':
                      return {
                        fill: '#fbbf24',
                        fillOpacity: 0.12,
                      }
                  }
                }
                const style = getPeriodStyle(period.type)
                return (
                  <ReferenceArea
                    key={`period-area-${period.type}-${period.startLap}-${period.endLap}-${idx}`}
                    x1={period.startLap - 0.5}
                    x2={period.endLap + 0.5}
                    fill={style.fill}
                    fillOpacity={style.fillOpacity}
                    stroke="none"
                  />
                )
              })}
              {/* All Race Events - Vertical dashed lines with smart label positioning */}
              {labeledEvents.map((event, idx) => (
                <ReferenceLine
                  key={`event-${event.type}-${event.lapNumber}-${event.eventType}-${idx}`}
                  x={event.lapNumber}
                  stroke={event.stroke}
                  strokeWidth={event.strokeWidth}
                  strokeDasharray={event.strokeDasharray}
                  label={{
                    value: event.label,
                    position: 'top',
                    offset: event.offset,
                    fill: event.stroke,
                    fontSize: 10,
                    fontWeight: event.fontWeight,
                  }}
                />
              ))}
              {driversToDisplay.map((code, index) => (
                <Line
                  key={code}
                  name={code}
                  type="monotone"
                  dataKey={code}
                  stroke={getDriverColor(code, index, sessionData?.meta.year)}
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
