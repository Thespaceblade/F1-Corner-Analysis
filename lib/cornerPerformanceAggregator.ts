/**
 * Corner performance data aggregation utilities.
 * 
 * Aggregates corner metrics from session data into performance summaries
 * for display on track SVG overlays.
 */

import { CornerMetrics } from './sessionDataClient'

export type CornerPerformance = {
  cornerNumber: number
  cornerType: 'slow' | 'medium' | 'fast' | 'unknown'
  
  // Aggregated metrics
  avgSpeed: {
    entry: number
    apex: number
    exit: number
  }
  avgTime: number | null
  bestTime: number | null
  worstTime: number | null
  
  // Statistics
  sampleCount: number
  driverCount: number
  
  // Driver-specific performance (if multiple drivers)
  driverPerformance?: Record<string, {
    avgSpeed: number
    avgTime: number | null
    sampleCount: number
  }>
  
  // Time deltas (vs best)
  timeDelta?: number
}

/**
 * Aggregate corner performance data by corner number.
 * 
 * @param corners - Corner metrics by driver code
 * @param selectedDrivers - Optional filter for specific drivers
 * @param cornerInfo - Optional corner definitions from tracks.json (authoritative source for corner types)
 * @returns Aggregated performance data by corner number
 */
export function aggregateCornerPerformance(
  corners: Record<string, CornerMetrics[]>,
  selectedDrivers?: string[],
  cornerInfo?: Array<{ number: number; type: 'slow' | 'medium' | 'fast' }>
): Record<number, CornerPerformance> {
  const result: Record<number, CornerPerformance> = {}
  
  // Filter drivers if specified
  const driversToProcess = selectedDrivers && selectedDrivers.length > 0
    ? selectedDrivers.filter(driver => corners[driver])
    : Object.keys(corners)
  
  if (driversToProcess.length === 0) {
    return result
  }
  
  // Build a map of corner types from cornerInfo (authoritative source)
  const cornerTypeMap = new Map<number, 'slow' | 'medium' | 'fast'>()
  if (cornerInfo) {
    for (const corner of cornerInfo) {
      cornerTypeMap.set(corner.number, corner.type)
    }
  }
  
  // Group corners by corner number
  const cornersByNumber: Record<number, {
    metrics: CornerMetrics[]
    drivers: Set<string>
    cornerType: 'slow' | 'medium' | 'fast' | 'unknown'
  }> = {}
  
  for (const driver of driversToProcess) {
    const driverCorners = corners[driver] || []
    
    for (const corner of driverCorners) {
      const cornerNumber = corner.cornerNumber
      
      if (!cornerNumber) continue
      
      if (!cornersByNumber[cornerNumber]) {
        // Use cornerInfo type if available, otherwise use detected type from session data
        const authoritativeType = cornerTypeMap.get(cornerNumber)
        const detectedType = corner.cornerType || 'unknown'
        cornersByNumber[cornerNumber] = {
          metrics: [],
          drivers: new Set(),
          cornerType: authoritativeType || (detectedType !== 'unknown' ? detectedType : 'unknown'),
        }
      }
      
      cornersByNumber[cornerNumber].metrics.push(corner)
      cornersByNumber[cornerNumber].drivers.add(driver)
      // Only update type if we don't have authoritative type and detected type is not unknown
      if (!cornerTypeMap.has(cornerNumber) && corner.cornerType && corner.cornerType !== 'unknown') {
        cornersByNumber[cornerNumber].cornerType = corner.cornerType
      }
    }
  }
  
  // Aggregate metrics for each corner
  for (const [cornerNumberStr, data] of Object.entries(cornersByNumber)) {
    const cornerNumber = parseInt(cornerNumberStr, 10)
    const metrics = data.metrics
    
    if (metrics.length === 0) continue
    
    // Calculate average speeds
    const entrySpeeds = metrics.map(m => m.entrySpeed).filter(s => s > 0)
    const apexSpeeds = metrics.map(m => m.apexSpeed).filter(s => s > 0)
    const exitSpeeds = metrics.map(m => m.exitSpeed).filter(s => s > 0)
    
    const avgEntrySpeed = entrySpeeds.length > 0
      ? entrySpeeds.reduce((a, b) => a + b, 0) / entrySpeeds.length
      : 0
    const avgApexSpeed = apexSpeeds.length > 0
      ? apexSpeeds.reduce((a, b) => a + b, 0) / apexSpeeds.length
      : 0
    const avgExitSpeed = exitSpeeds.length > 0
      ? exitSpeeds.reduce((a, b) => a + b, 0) / exitSpeeds.length
      : 0
    
    // Calculate average and best times
    const times = metrics
      .map(m => m.cornerTime)
      .filter((t): t is number => t !== null && t > 0)
    
    const avgTime = times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : null
    const bestTime = times.length > 0 ? Math.min(...times) : null
    const worstTime = times.length > 0 ? Math.max(...times) : null
    
    // Calculate time delta (vs best)
    const timeDelta = avgTime !== null && bestTime !== null
      ? avgTime - bestTime
      : undefined
    
    // Calculate driver-specific performance
    const driverPerformance: Record<string, {
      avgSpeed: number
      avgTime: number | null
      sampleCount: number
    }> = {}
    
    for (const driver of data.drivers) {
      const driverCorners = metrics.filter(m => {
        // Match by driver - we need to track which driver each corner belongs to
        // For now, we'll aggregate all corners and note this limitation
        return true
      })
      
      // Group by driver code - we need to pass driver info with corners
      // For now, aggregate all drivers together
    }
    
    // If we have multiple drivers, calculate per-driver metrics
    if (driversToProcess.length > 1) {
      for (const driver of driversToProcess) {
        const driverCorners = corners[driver]?.filter(
          c => c.cornerNumber === cornerNumber
        ) || []
        
        if (driverCorners.length > 0) {
          const driverEntrySpeeds = driverCorners.map(c => c.entrySpeed).filter(s => s > 0)
          const driverApexSpeeds = driverCorners.map(c => c.apexSpeed).filter(s => s > 0)
          const driverExitSpeeds = driverCorners.map(c => c.exitSpeed).filter(s => s > 0)
          const driverTimes = driverCorners
            .map(c => c.cornerTime)
            .filter((t): t is number => t !== null && t > 0)
          
          const driverAvgSpeed = driverApexSpeeds.length > 0
            ? driverApexSpeeds.reduce((a, b) => a + b, 0) / driverApexSpeeds.length
            : 0
          const driverAvgTime = driverTimes.length > 0
            ? driverTimes.reduce((a, b) => a + b, 0) / driverTimes.length
            : null
          
          driverPerformance[driver] = {
            avgSpeed: driverAvgSpeed,
            avgTime: driverAvgTime,
            sampleCount: driverCorners.length,
          }
        }
      }
    }
    
    result[cornerNumber] = {
      cornerNumber,
      cornerType: data.cornerType,
      avgSpeed: {
        entry: avgEntrySpeed,
        apex: avgApexSpeed,
        exit: avgExitSpeed,
      },
      avgTime,
      bestTime,
      worstTime,
      sampleCount: metrics.length,
      driverCount: data.drivers.size,
      driverPerformance: Object.keys(driverPerformance).length > 0 ? driverPerformance : undefined,
      timeDelta,
    }
  }
  
  return result
}

/**
 * Calculate time delta between two drivers for a specific corner.
 * 
 * @param cornerPerformance - Aggregated corner performance data
 * @param driver1 - First driver code
 * @param driver2 - Second driver code
 * @returns Time delta (driver1 - driver2) in seconds, or null if not available
 */
export function getCornerTimeDelta(
  cornerPerformance: CornerPerformance,
  driver1: string,
  driver2: string
): number | null {
  if (!cornerPerformance.driverPerformance) {
    return null
  }
  
  const perf1 = cornerPerformance.driverPerformance[driver1]
  const perf2 = cornerPerformance.driverPerformance[driver2]
  
  if (!perf1?.avgTime || !perf2?.avgTime) {
    return null
  }
  
  return perf1.avgTime - perf2.avgTime
}

