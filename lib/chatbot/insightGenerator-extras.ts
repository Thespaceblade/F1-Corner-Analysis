/**
 * Additional insight generation functions for tyre compounds, lap trends, and qualifying segments
 */

import { f1Teams } from '../teamData'

// Type definitions (matching types.ts)
type DriverCornerStats = {
  driverCode: string
  cornerNumber: number
  avgTime: number | null
  bestTime: number | null
  worstTime: number | null
  avgEntrySpeed: number
  avgApexSpeed: number
  avgExitSpeed: number
  sampleCount: number
  cornerType?: 'slow' | 'medium' | 'fast' | 'unknown'
}

/**
 * Get driver name from code
 */
function getDriverName(driverCode: string): string {
  const driver = f1Teams
    .flatMap(team => team.drivers)
    .find(d => d.code === driverCode)
  return driver?.name || driverCode
}

/**
 * Generate tyre compound insights for comparison
 * Analyzes corner performance by tyre compound
 */
export function generateTyreInsightsForComparison(
  laps: any[],
  driver1Code: string,
  driver2Code: string,
  _comparisonData: {
    driver1: DriverCornerStats[]
    driver2: DriverCornerStats[]
    deltas: Array<{
      cornerNumber: number
      timeDelta: number | null
      speedDelta?: number
      cornerType?: 'slow' | 'medium' | 'fast'
    }>
  }
): string[] {
  const insights: string[] = []

  // Create lap map by lap number for quick lookup
  const driver1LapMap = new Map<number, any>()
  const driver2LapMap = new Map<number, any>()

  laps.forEach((lap: any) => {
    if (lap.lapNumber && lap.driver) {
      const driver = lap.driver.toUpperCase()
      if (driver === driver1Code.toUpperCase()) {
        driver1LapMap.set(lap.lapNumber, lap)
      } else if (driver === driver2Code.toUpperCase()) {
        driver2LapMap.set(lap.lapNumber, lap)
      }
    }
  })

  // Get valid laps for both drivers
  const driver1Laps = Array.from(driver1LapMap.values()).filter((l: any) => l.compound && l.lapTimeSeconds && l.isValid !== false)
  const driver2Laps = Array.from(driver2LapMap.values()).filter((l: any) => l.compound && l.lapTimeSeconds && l.isValid !== false)

  if (driver1Laps.length === 0 || driver2Laps.length === 0) {
    return insights
  }

  // Group by compound and calculate average lap times
  const driver1ByCompound: Record<string, number[]> = {}
  const driver2ByCompound: Record<string, number[]> = {}

  driver1Laps.forEach((lap: any) => {
    const compound = lap.compound?.toUpperCase()
    if (compound && lap.lapTimeSeconds) {
      if (!driver1ByCompound[compound]) {
        driver1ByCompound[compound] = []
      }
      driver1ByCompound[compound].push(lap.lapTimeSeconds)
    }
  })

  driver2Laps.forEach((lap: any) => {
    const compound = lap.compound?.toUpperCase()
    if (compound && lap.lapTimeSeconds) {
      if (!driver2ByCompound[compound]) {
        driver2ByCompound[compound] = []
      }
      driver2ByCompound[compound].push(lap.lapTimeSeconds)
    }
  })

  // Compare performance by compound (if both drivers used same compounds)
  const commonCompounds = Object.keys(driver1ByCompound).filter(c => driver2ByCompound[c] && driver1ByCompound[c].length >= 2 && driver2ByCompound[c].length >= 2)
  
  if (commonCompounds.length > 0) {
    commonCompounds.forEach(compound => {
      const driver1Avg = driver1ByCompound[compound].reduce((a, b) => a + b, 0) / driver1ByCompound[compound].length
      const driver2Avg = driver2ByCompound[compound].reduce((a, b) => a + b, 0) / driver2ByCompound[compound].length
      const delta = driver1Avg - driver2Avg
      const fasterDriver = delta > 0 ? driver2Code : driver1Code
      const fasterDriverName = getDriverName(fasterDriver)
      const deltaAbs = Math.abs(delta)
      
      if (deltaAbs > 0.2) { // Only show if significant difference (lap time, so larger threshold)
        insights.push(`${fasterDriverName} (${fasterDriver}) faster on ${compound.toLowerCase()}s (avg ${deltaAbs.toFixed(1)}s/lap)`)
      }
    })
  }

  return insights.slice(0, 2) // Max 2 tyre insights
}

/**
 * Generate lap trend insights for comparison
 * Shows how performance changed over the session
 */
export function generateLapTrendInsightsForComparison(
  laps: any[],
  driver1Code: string,
  driver2Code: string
): string[] {
  const insights: string[] = []

  // Get valid laps for both drivers (filter out outliers)
  const driver1Laps = laps
    .filter((l: any) => l.driver?.toUpperCase() === driver1Code.toUpperCase())
    .filter((l: any) => l.lapTimeSeconds && l.lapNumber && l.isValid !== false)
    .sort((a: any, b: any) => (a.lapNumber || 0) - (b.lapNumber || 0))
  
  const driver2Laps = laps
    .filter((l: any) => l.driver?.toUpperCase() === driver2Code.toUpperCase())
    .filter((l: any) => l.lapTimeSeconds && l.lapNumber && l.isValid !== false)
    .sort((a: any, b: any) => (a.lapNumber || 0) - (b.lapNumber || 0))

  if (driver1Laps.length < 6 || driver2Laps.length < 6) {
    return insights // Need enough laps for meaningful trend analysis
  }

  // Analyze first third vs last third (more granular than half)
  const driver1Third = Math.floor(driver1Laps.length / 3)
  const driver2Third = Math.floor(driver2Laps.length / 3)
  
  const driver1First = driver1Laps.slice(0, driver1Third)
  const driver1Last = driver1Laps.slice(-driver1Third)
  const driver2First = driver2Laps.slice(0, driver2Third)
  const driver2Last = driver2Laps.slice(-driver2Third)

  const driver1FirstAvg = driver1First.reduce((sum, l) => sum + (l.lapTimeSeconds || 0), 0) / driver1First.length
  const driver1LastAvg = driver1Last.reduce((sum, l) => sum + (l.lapTimeSeconds || 0), 0) / driver1Last.length
  const driver2FirstAvg = driver2First.reduce((sum, l) => sum + (l.lapTimeSeconds || 0), 0) / driver2First.length
  const driver2LastAvg = driver2Last.reduce((sum, l) => sum + (l.lapTimeSeconds || 0), 0) / driver2Last.length

  // Check for improvement/degradation (use 0.3s threshold for lap times)
  const driver1Trend = driver1LastAvg - driver1FirstAvg
  const driver2Trend = driver2LastAvg - driver2FirstAvg

  if (Math.abs(driver1Trend) > 0.3) {
    const driver1Name = getDriverName(driver1Code)
    const firstLap = driver1First[0]?.lapNumber
    const lastLap = driver1Last[driver1Last.length - 1]?.lapNumber
    if (firstLap && lastLap) {
      if (driver1Trend > 0) {
        insights.push(`${driver1Name} (${driver1Code}) degraded (laps ${firstLap}-${Math.floor(driver1Laps.length/3)}: ${driver1FirstAvg.toFixed(1)}s, laps ${lastLap - driver1Third + 1}-${lastLap}: ${driver1LastAvg.toFixed(1)}s)`)
      } else {
        insights.push(`${driver1Name} (${driver1Code}) improved (laps ${firstLap}-${Math.floor(driver1Laps.length/3)}: ${driver1FirstAvg.toFixed(1)}s, laps ${lastLap - driver1Third + 1}-${lastLap}: ${driver1LastAvg.toFixed(1)}s)`)
      }
    }
  }

  if (Math.abs(driver2Trend) > 0.3) {
    const driver2Name = getDriverName(driver2Code)
    const firstLap = driver2First[0]?.lapNumber
    const lastLap = driver2Last[driver2Last.length - 1]?.lapNumber
    if (firstLap && lastLap) {
      if (driver2Trend > 0) {
        insights.push(`${driver2Name} (${driver2Code}) degraded (laps ${firstLap}-${Math.floor(driver2Laps.length/3)}: ${driver2FirstAvg.toFixed(1)}s, laps ${lastLap - driver2Third + 1}-${lastLap}: ${driver2LastAvg.toFixed(1)}s)`)
      } else {
        insights.push(`${driver2Name} (${driver2Code}) improved (laps ${firstLap}-${Math.floor(driver2Laps.length/3)}: ${driver2FirstAvg.toFixed(1)}s, laps ${lastLap - driver2Third + 1}-${lastLap}: ${driver2LastAvg.toFixed(1)}s)`)
      }
    }
  }

  return insights.slice(0, 2) // Max 2 trend insights
}

/**
 * Generate qualifying segment insights
 * Compares performance across Q1, Q2, Q3
 */
export function generateQualifyingSegmentInsights(
  laps: any[],
  qualifyingBoundaries: {
    q1Start: number
    q1End: number | null
    q2Start: number | null
    q2End: number | null
    q3Start: number | null
    q3End: number | null
  },
  driver1Code: string,
  driver2Code: string
): string[] {
  const insights: string[] = []

  if (!qualifyingBoundaries.q1Start) {
    return insights // Not a qualifying session or boundaries not available
  }

  // Get valid laps for both drivers
  const driver1Laps = laps
    .filter((l: any) => l.driver?.toUpperCase() === driver1Code.toUpperCase())
    .filter((l: any) => l.lapTimeSeconds && l.sessionTimeSeconds !== null && l.sessionTimeSeconds !== undefined && l.isValid !== false)
  
  const driver2Laps = laps
    .filter((l: any) => l.driver?.toUpperCase() === driver2Code.toUpperCase())
    .filter((l: any) => l.lapTimeSeconds && l.sessionTimeSeconds !== null && l.sessionTimeSeconds !== undefined && l.isValid !== false)

  if (driver1Laps.length === 0 || driver2Laps.length === 0) {
    return insights
  }

  // Map laps to qualifying segments based on session time
  const getSegment = (sessionTime: number): 'Q1' | 'Q2' | 'Q3' | null => {
    if (sessionTime >= qualifyingBoundaries.q1Start) {
      if (qualifyingBoundaries.q1End !== null && sessionTime <= qualifyingBoundaries.q1End) {
        return 'Q1'
      }
      if (qualifyingBoundaries.q2Start && sessionTime >= qualifyingBoundaries.q2Start) {
        if (qualifyingBoundaries.q2End === null || sessionTime <= qualifyingBoundaries.q2End) {
          return 'Q2'
        }
      }
      if (qualifyingBoundaries.q3Start && sessionTime >= qualifyingBoundaries.q3Start) {
        if (qualifyingBoundaries.q3End === null || sessionTime <= qualifyingBoundaries.q3End) {
          return 'Q3'
        }
      }
      // If we're past Q1 start but boundaries are unclear, try to infer
      if (!qualifyingBoundaries.q2Start && !qualifyingBoundaries.q3Start) {
        return 'Q1' // Assume Q1 if no other segments defined
      }
    }
    return null
  }

  // Group by segment and find best lap per segment
  const driver1BySegment: Record<string, number[]> = { Q1: [], Q2: [], Q3: [] }
  const driver2BySegment: Record<string, number[]> = { Q1: [], Q2: [], Q3: [] }

  driver1Laps.forEach((lap: any) => {
    const segment = getSegment(lap.sessionTimeSeconds)
    if (segment && lap.lapTimeSeconds) {
      driver1BySegment[segment].push(lap.lapTimeSeconds)
    }
  })

  driver2Laps.forEach((lap: any) => {
    const segment = getSegment(lap.sessionTimeSeconds)
    if (segment && lap.lapTimeSeconds) {
      driver2BySegment[segment].push(lap.lapTimeSeconds)
    }
  })

  // Compare best times in each segment (more meaningful than average for qualifying)
  const segments: Array<'Q1' | 'Q2' | 'Q3'> = ['Q1', 'Q2', 'Q3']
  segments.forEach(segment => {
    if (driver1BySegment[segment].length > 0 && driver2BySegment[segment].length > 0) {
      const driver1Best = Math.min(...driver1BySegment[segment])
      const driver2Best = Math.min(...driver2BySegment[segment])
      const delta = driver1Best - driver2Best
      const fasterDriver = delta > 0 ? driver2Code : driver1Code
      const fasterDriverName = getDriverName(fasterDriver)
      const deltaAbs = Math.abs(delta)

      if (deltaAbs > 0.05) { // Only show if significant (qualifying is about best times)
        insights.push(`${fasterDriverName} (${fasterDriver}) faster in ${segment} (best: ${Math.min(driver1Best, driver2Best).toFixed(3)}s, +${deltaAbs.toFixed(3)}s)`)
      }
    }
  })

  return insights.slice(0, 2) // Max 2 qualifying insights
}

/**
 * Generate lap trend insights for driver
 * Shows performance progression over session
 */
export function generateLapTrendInsightsForDriver(
  laps: any[],
  driverCode: string,
  _stats: DriverCornerStats[]
): string[] {
  const insights: string[] = []

  // Get valid laps for driver (filter outliers)
  const driverLaps = laps
    .filter((l: any) => l.driver?.toUpperCase() === driverCode.toUpperCase())
    .filter((l: any) => l.lapTimeSeconds && l.lapNumber && l.isValid !== false)
    .sort((a: any, b: any) => (a.lapNumber || 0) - (b.lapNumber || 0))

  if (driverLaps.length < 6) {
    return insights // Need enough laps for meaningful trend analysis
  }

  // Analyze first third vs last third
  const third = Math.floor(driverLaps.length / 3)
  const firstThird = driverLaps.slice(0, third)
  const lastThird = driverLaps.slice(-third)

  const firstAvg = firstThird.reduce((sum, l) => sum + (l.lapTimeSeconds || 0), 0) / firstThird.length
  const lastAvg = lastThird.reduce((sum, l) => sum + (l.lapTimeSeconds || 0), 0) / lastThird.length
  const trend = lastAvg - firstAvg

  if (Math.abs(trend) > 0.3) {
    const firstLap = firstThird[0]?.lapNumber
    const lastLap = lastThird[lastThird.length - 1]?.lapNumber
    if (firstLap && lastLap) {
      if (trend > 0) {
        insights.push(`Degraded later (laps ${firstLap}-${Math.floor(driverLaps.length/3)}: ${firstAvg.toFixed(1)}s, laps ${lastLap - third + 1}-${lastLap}: ${lastAvg.toFixed(1)}s)`)
      } else {
        insights.push(`Improved later (laps ${firstLap}-${Math.floor(driverLaps.length/3)}: ${firstAvg.toFixed(1)}s, laps ${lastLap - third + 1}-${lastLap}: ${lastAvg.toFixed(1)}s)`)
      }
    }
  }

  // Find best lap window (5-lap rolling average)
  if (driverLaps.length >= 10) {
    const windowSize = 5
    let bestAvg = Infinity
    let bestStart = 0

    for (let i = 0; i <= driverLaps.length - windowSize; i++) {
      const window = driverLaps.slice(i, i + windowSize)
      const avg = window.reduce((sum, l) => sum + (l.lapTimeSeconds || 0), 0) / window.length
      if (avg < bestAvg) {
        bestAvg = avg
        bestStart = i
      }
    }

    const bestEnd = bestStart + windowSize - 1
    if (bestStart < driverLaps.length && bestEnd < driverLaps.length && driverLaps[bestStart] && driverLaps[bestEnd]) {
      insights.push(`Best period: laps ${driverLaps[bestStart].lapNumber}-${driverLaps[bestEnd].lapNumber} (avg ${bestAvg.toFixed(1)}s)`)
    }
  }

  return insights.slice(0, 2) // Max 2 trend insights
}

/**
 * Generate qualifying segment insights for driver
 * Shows performance across Q1, Q2, Q3
 */
export function generateQualifyingSegmentInsightsForDriver(
  laps: any[],
  qualifyingBoundaries: {
    q1Start: number
    q1End: number | null
    q2Start: number | null
    q2End: number | null
    q3Start: number | null
    q3End: number | null
  },
  driverCode: string
): string[] {
  const insights: string[] = []

  if (!qualifyingBoundaries.q1Start) {
    return insights
  }

  // Get valid laps for driver
  const driverLaps = laps
    .filter((l: any) => l.driver?.toUpperCase() === driverCode.toUpperCase())
    .filter((l: any) => l.lapTimeSeconds && l.sessionTimeSeconds !== null && l.sessionTimeSeconds !== undefined && l.isValid !== false)

  if (driverLaps.length === 0) {
    return insights
  }

  // Map laps to qualifying segments based on session time
  const getSegment = (sessionTime: number): 'Q1' | 'Q2' | 'Q3' | null => {
    if (sessionTime >= qualifyingBoundaries.q1Start) {
      if (qualifyingBoundaries.q1End !== null && sessionTime <= qualifyingBoundaries.q1End) {
        return 'Q1'
      }
      if (qualifyingBoundaries.q2Start && sessionTime >= qualifyingBoundaries.q2Start) {
        if (qualifyingBoundaries.q2End === null || sessionTime <= qualifyingBoundaries.q2End) {
          return 'Q2'
        }
      }
      if (qualifyingBoundaries.q3Start && sessionTime >= qualifyingBoundaries.q3Start) {
        if (qualifyingBoundaries.q3End === null || sessionTime <= qualifyingBoundaries.q3End) {
          return 'Q3'
        }
      }
      // Fallback: if past Q1 start but no other segments, assume Q1
      if (!qualifyingBoundaries.q2Start && !qualifyingBoundaries.q3Start) {
        return 'Q1'
      }
    }
    return null
  }

  // Group by segment and find best times (more meaningful for qualifying)
  const bySegment: Record<string, number[]> = { Q1: [], Q2: [], Q3: [] }

  driverLaps.forEach((lap: any) => {
    const segment = getSegment(lap.sessionTimeSeconds)
    if (segment && lap.lapTimeSeconds) {
      bySegment[segment].push(lap.lapTimeSeconds)
    }
  })

  // Find best segment and compare best times
  const segments: Array<'Q1' | 'Q2' | 'Q3'> = ['Q1', 'Q2', 'Q3']
  const segmentBests: Array<{ segment: string; best: number }> = []

  segments.forEach(segment => {
    if (bySegment[segment].length > 0) {
      const best = Math.min(...bySegment[segment])
      segmentBests.push({ segment, best })
    }
  })

  if (segmentBests.length > 1) {
    segmentBests.sort((a, b) => a.best - b.best)
    const best = segmentBests[0]
    const worst = segmentBests[segmentBests.length - 1]
    
    if (worst.best - best.best > 0.2) {
      insights.push(`Pushed in ${best.segment} (best: ${best.best.toFixed(3)}s vs ${worst.segment}: ${worst.best.toFixed(3)}s)`)
    } else if (segmentBests.length === 3) {
      // Show consistency if all segments are close
      const avg = segmentBests.reduce((sum, s) => sum + s.best, 0) / segmentBests.length
      const variance = segmentBests.reduce((sum, s) => sum + Math.pow(s.best - avg, 2), 0) / segmentBests.length
      if (Math.sqrt(variance) < 0.1) {
        const q1Best = segmentBests.find(s => s.segment === 'Q1')?.best.toFixed(3)
        const q2Best = segmentBests.find(s => s.segment === 'Q2')?.best.toFixed(3)
        const q3Best = segmentBests.find(s => s.segment === 'Q3')?.best.toFixed(3)
        if (q1Best && q2Best && q3Best) {
          insights.push(`Consistent across segments (Q1: ${q1Best}s, Q2: ${q2Best}s, Q3: ${q3Best}s)`)
        }
      }
    }
  }

  return insights.slice(0, 1) // Max 1 qualifying insight
}
