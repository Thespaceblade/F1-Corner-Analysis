/**
 * Corner filtering utilities.
 * 
 * Filters corner metrics based on qualifying segments, lap numbers, or averages.
 */

import { CornerMetrics, SessionPayload, QualifyingBoundaries } from './sessionDataClient'

export type CornerFilter = {
  type: 'all' | 'qualifying-segment' | 'lap' | 'average'
  segment?: 'Q1' | 'Q2' | 'Q3'
  lapNumber?: number
}

/**
 * Filter corners based on the filter criteria.
 * 
 * @param corners - Corner metrics by driver code
 * @param filter - Filter criteria
 * @param sessionData - Session data for qualifying boundaries and lap info
 * @returns Filtered corner metrics by driver code
 */
export function filterCorners(
  corners: Record<string, CornerMetrics[]>,
  filter: CornerFilter,
  sessionData: SessionPayload | null
): Record<string, CornerMetrics[]> {
  if (filter.type === 'all' || !sessionData) {
    return corners
  }

  const filtered: Record<string, CornerMetrics[]> = {}

  // Filter by lap number
  if (filter.type === 'lap' && filter.lapNumber !== undefined) {
    for (const [driver, driverCorners] of Object.entries(corners)) {
      filtered[driver] = driverCorners.filter(
        corner => corner.lapNumber === filter.lapNumber
      )
    }
    return filtered
  }

  // Filter by qualifying segment
  if (filter.type === 'qualifying-segment' && filter.segment && sessionData.qualifyingBoundaries) {
    const boundaries = sessionData.qualifyingBoundaries
    
    // For each driver, find their fastest lap in the segment
    const fastestLapNumberByDriver = new Map<string, number>()
    
    for (const driver of Object.keys(corners)) {
      const normalizedDriver = driver.toUpperCase()
      let fastestLapTime: number | null = null
      let fastestLapNumber: number | null = null
      
      for (const lap of sessionData.laps) {
        if (!lap.lapNumber || !lap.sessionTimeSeconds || !lap.lapTimeSeconds) continue
        if (lap.driver.toUpperCase() !== normalizedDriver) continue
        if (lap.isValid === false) continue
        
        let inSegment = false
        
        if (filter.segment === 'Q1') {
          inSegment = boundaries.q1End !== null && 
                      lap.sessionTimeSeconds <= boundaries.q1End
        } else if (filter.segment === 'Q2') {
          inSegment = boundaries.q1End !== null && 
                      boundaries.q2End !== null &&
                      lap.sessionTimeSeconds > boundaries.q1End &&
                      lap.sessionTimeSeconds <= boundaries.q2End
        } else if (filter.segment === 'Q3') {
          inSegment = boundaries.q2End !== null && 
                      boundaries.q3End !== null &&
                      lap.sessionTimeSeconds > boundaries.q2End &&
                      lap.sessionTimeSeconds <= boundaries.q3End
        }
        
        if (inSegment) {
          if (fastestLapTime === null || lap.lapTimeSeconds < fastestLapTime) {
            fastestLapTime = lap.lapTimeSeconds
            fastestLapNumber = lap.lapNumber
          }
        }
      }
      
      if (fastestLapNumber !== null) {
        fastestLapNumberByDriver.set(normalizedDriver, fastestLapNumber)
      }
    }
    
    // Filter corners to only include corners from fastest laps in segment
    for (const [driver, driverCorners] of Object.entries(corners)) {
      const normalizedDriver = driver.toUpperCase()
      const fastestLapNumber = fastestLapNumberByDriver.get(normalizedDriver)
      
      if (fastestLapNumber === undefined) {
        filtered[driver] = []
        continue
      }
      
      filtered[driver] = driverCorners.filter(
        corner => corner.lapNumber === fastestLapNumber
      )
    }
    
    return filtered
  }

  // Average mode - return all corners (aggregation will handle averaging)
  if (filter.type === 'average') {
    return corners
  }

  return corners
}

