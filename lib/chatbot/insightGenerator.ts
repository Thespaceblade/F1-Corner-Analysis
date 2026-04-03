/**
 * Insight generator for concise, bullet-point responses
 * Analyzes data and generates key insights instead of raw data dumps
 */

import { f1Teams } from '../teamData'

type CornerDelta = {
  cornerNumber: number
  timeDelta: number | null
  speedDelta?: number
  cornerType?: 'slow' | 'medium' | 'fast'
}

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

type CornerPerformanceData = {
  driverCode: string
  cornerTime: number | null
  entrySpeed?: number
  apexSpeed?: number
  exitSpeed?: number
  cornerNumber?: number
}

/**
 * Generate concise comparison insights
 */
export function generateComparisonInsights(
  comparisonData: {
    driver1: DriverCornerStats[]
    driver2: DriverCornerStats[]
    deltas: CornerDelta[]
  },
  driver1Code: string,
  driver2Code: string
): string[] {
  const insights: string[] = []
  const deltas = comparisonData.deltas.filter(d => d.timeDelta !== null)

  if (deltas.length === 0) {
    return ['No time data available for comparison']
  }

  // Calculate overall delta (driver1 - driver2)
  // Positive = driver1 slower, Negative = driver1 faster
  const validDeltas = deltas.map(d => d.timeDelta!).filter(d => d !== null)
  const overallDelta = validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length

  const fasterDriver = overallDelta > 0 ? driver2Code : driver1Code
  const delta = Math.abs(overallDelta)

  // Overall comparison (use driver names)
  const fasterDriverName = getDriverName(fasterDriver)
  insights.push(`**${fasterDriverName} (${fasterDriver})** faster by \`${delta.toFixed(3)}s\` overall`)

  // Find significant corners (deltas > 0.05s)
  const SIGNIFICANT_THRESHOLD = 0.05
  const significantDeltas = deltas
    .filter(d => Math.abs(d.timeDelta!) > SIGNIFICANT_THRESHOLD)
    .sort((a, b) => Math.abs(b.timeDelta!) - Math.abs(a.timeDelta!))

  // Group by which driver lost time
  const driver1LostCorners = significantDeltas
    .filter(d => d.timeDelta! > SIGNIFICANT_THRESHOLD)
    .slice(0, 5) // Top 5 most significant

  const driver2LostCorners = significantDeltas
    .filter(d => d.timeDelta! < -SIGNIFICANT_THRESHOLD)
    .slice(0, 5) // Top 5 most significant

  // Driver 1 lost time at specific corners (use driver names)
  if (driver1LostCorners.length > 0) {
    const corners = driver1LostCorners.map(d => d.cornerNumber).join(', ')
    const totalLoss = driver1LostCorners.reduce((sum, d) => sum + d.timeDelta!, 0)
    const driver1Name = getDriverName(driver1Code)
    insights.push(`**${driver1Name} (${driver1Code})** lost time at corners ${corners} (+${totalLoss.toFixed(3)}s total)`)
  }

  // Driver 2 lost time at specific corners (use driver names)
  if (driver2LostCorners.length > 0) {
    const corners = driver2LostCorners.map(d => d.cornerNumber).join(', ')
    const totalLoss = driver2LostCorners.reduce((sum, d) => sum + Math.abs(d.timeDelta!), 0)
    const driver2Name = getDriverName(driver2Code)
    insights.push(`**${driver2Name} (${driver2Code})** lost time at corners ${corners} (+${totalLoss.toFixed(3)}s total)`)
  }

  // Find patterns by corner type (if corner type data is available)
  const deltasWithType = deltas.filter(d => d.cornerType !== undefined)
  if (deltasWithType.length > 0) {
    const cornerTypePatterns = findCornerTypePatterns(deltasWithType, driver1Code, driver2Code)
    cornerTypePatterns.forEach(pattern => {
      const advantage = pattern.avgDelta > 0 ? pattern.driver2 : pattern.driver1
      const advantageName = getDriverName(advantage)
      const delta = Math.abs(pattern.avgDelta)
      if (delta > 0.03) {
        insights.push(`**${advantageName} (${advantage})** stronger in **${pattern.type}** corners (avg \`${pattern.avgDelta > 0 ? '+' : ''}${delta.toFixed(3)}s\` advantage)`)
      }
    })
  }

  // Detect anomalies (outliers) - use driver names
  const anomalies = detectAnomalies(deltas, driver1Code, driver2Code)
  anomalies.forEach(anomaly => {
    const driverName = getDriverName(anomaly.driver)
    insights.push(`**${driverName} (${anomaly.driver})** unusually slow at corner ${anomaly.cornerNumber} (+${anomaly.delta.toFixed(3)}s)`)
  })

  // TODO: Add tyre compound insights if available
  // TODO: Add lap trend insights if available
  // TODO: Add qualifying segment insights if available

  return insights.slice(0, 7) // Max 7 insights
}

/**
 * Generate concise corner performance insights
 */
export function generateCornerPerformanceInsights(
  cornerData: CornerPerformanceData[]
): string[] {
  const insights: string[] = []

  if (cornerData.length === 0) {
    return ['No corner performance data available']
  }

  // Group by driver and calculate averages
  const driverData: Record<string, {
    times: number[]
    speeds: number[]
    entrySpeeds: number[]
    exitSpeeds: number[]
  }> = {}

  cornerData.forEach(data => {
    if (!driverData[data.driverCode]) {
      driverData[data.driverCode] = {
        times: [],
        speeds: [],
        entrySpeeds: [],
        exitSpeeds: [],
      }
    }
    if (data.cornerTime !== null) {
      driverData[data.driverCode].times.push(data.cornerTime)
    }
    if (data.apexSpeed) {
      driverData[data.driverCode].speeds.push(data.apexSpeed)
    }
    if (data.entrySpeed) {
      driverData[data.driverCode].entrySpeeds.push(data.entrySpeed)
    }
    if (data.exitSpeed) {
      driverData[data.driverCode].exitSpeeds.push(data.exitSpeed)
    }
  })

  // Calculate best average time per driver
  const driverAverages: Array<{
    driverCode: string
    avgTime: number
    bestTime: number
    avgSpeed: number
  }> = []

  Object.entries(driverData).forEach(([driverCode, data]) => {
    if (data.times.length > 0) {
      const avgTime = data.times.reduce((a, b) => a + b, 0) / data.times.length
      const bestTime = Math.min(...data.times)
      const avgSpeed = data.speeds.length > 0
        ? data.speeds.reduce((a, b) => a + b, 0) / data.speeds.length
        : 0

      driverAverages.push({
        driverCode,
        avgTime,
        bestTime,
        avgSpeed,
      })
    }
  })

  if (driverAverages.length === 0) {
    return ['No time data available']
  }

  // Find fastest (by best time)
  driverAverages.sort((a, b) => a.bestTime - b.bestTime)
  const fastest = driverAverages[0]
  const fastestName = getDriverName(fastest.driverCode)

  insights.push(`🏆 **${fastestName} (${fastest.driverCode})** fastest: \`${fastest.bestTime.toFixed(3)}s\``)

  // Find other drivers with significant differences
  const otherDrivers = driverAverages
    .slice(1)
    .map(driver => ({
      driverCode: driver.driverCode,
      time: driver.bestTime,
      delta: driver.bestTime - fastest.bestTime,
    }))
    .filter(d => d.delta > 0.001) // Only show if different
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3) // Top 3 closest

  otherDrivers.forEach(driver => {
    const driverName = getDriverName(driver.driverCode)
    insights.push(`**${driverName} (${driver.driverCode})** +\`${driver.delta.toFixed(3)}s\``)
  })

  // Speed insights if available
  if (fastest.avgSpeed > 0) {
    const avgSpeed = driverAverages
      .filter(d => d.avgSpeed > 0)
      .reduce((sum, d) => sum + d.avgSpeed, 0) / driverAverages.filter(d => d.avgSpeed > 0).length

    const speedDiff = fastest.avgSpeed - avgSpeed
    if (Math.abs(speedDiff) > 2) {
      insights.push(`**${fastestName} (${fastest.driverCode})** carried \`${Math.abs(speedDiff).toFixed(0)} km/h\` more speed through apex`)
    }
  }

  return insights
}

/**
 * Generate concise driver performance insights
 */
export function generateDriverPerformanceInsights(
  stats: DriverCornerStats[],
  _driverCode: string
): string[] {
  const insights: string[] = []

  if (stats.length === 0) {
    return ['No performance data available']
  }

  const validStats = stats.filter(s => s.avgTime !== null)
  if (validStats.length === 0) {
    return ['No time data available']
  }

  // Find strongest corner (fastest relative to field average)
  // For now, use best time as proxy for strength
  const strongest = validStats.reduce((best, current) => {
    if (!best.avgTime) return current
    if (!current.avgTime) return best
    return current.avgTime < best.avgTime ? current : best
  })

  const weakest = validStats.reduce((worst, current) => {
    if (!worst.avgTime) return current
    if (!current.avgTime) return worst
    return current.avgTime > worst.avgTime ? current : worst
  })

  insights.push(`✅ **Strongest:** Corner ${strongest.cornerNumber} (\`${strongest.avgTime!.toFixed(3)}s\`)`)
  insights.push(`⚠️ **Weakest:** Corner ${weakest.cornerNumber} (\`${weakest.avgTime!.toFixed(3)}s\`)`)

  // Find patterns by corner type
  const cornerTypeStats = groupByCornerType(validStats)
  
  Object.entries(cornerTypeStats).forEach(([type, typeStats]) => {
    if (typeStats.length > 0) {
      const avgTime = typeStats.reduce((sum, s) => sum + s.avgTime!, 0) / typeStats.length
      insights.push(`Avg **${type}** corners: \`${avgTime.toFixed(3)}s\``)
    }
  })

  // TODO: Add lap trend insights if available
  // TODO: Add qualifying segment insights if available

  return insights.slice(0, 5) // Max 5 insights
}

/**
 * Find patterns by corner type
 */
function findCornerTypePatterns(
  deltas: CornerDelta[],
  driver1: string,
  driver2: string
): Array<{ type: string; driver1: string; driver2: string; avgDelta: number }> {
  const patterns: Record<string, number[]> = {}

  deltas.forEach(delta => {
    if (delta.timeDelta !== null && delta.cornerType) {
      if (!patterns[delta.cornerType]) {
        patterns[delta.cornerType] = []
      }
      patterns[delta.cornerType].push(delta.timeDelta)
    }
  })

  return Object.entries(patterns)
    .filter(([_, typeDeltas]) => typeDeltas.length > 0)
    .map(([type, typeDeltas]) => {
      const avgDelta = typeDeltas.reduce((a, b) => a + b, 0) / typeDeltas.length
      return {
        type,
        driver1,
        driver2,
        avgDelta,
      }
    })
    .filter(p => Math.abs(p.avgDelta) > 0.02) // Only significant patterns
}

/**
 * Detect anomalies (outliers) in performance
 */
function detectAnomalies(
  deltas: CornerDelta[],
  driver1: string,
  driver2: string
): Array<{ driver: string; cornerNumber: number; delta: number }> {
  const anomalies: Array<{ driver: string; cornerNumber: number; delta: number }> = []

  if (deltas.length === 0) return anomalies

  // Calculate mean and standard deviation
  const validDeltas = deltas.map(d => d.timeDelta!).filter(d => d !== null)
  const mean = validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length
  const variance = validDeltas.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / validDeltas.length
  const stdDev = Math.sqrt(variance)

  // Find outliers (more than 2 standard deviations from mean)
  const threshold = 2 * stdDev
  deltas.forEach(delta => {
    if (delta.timeDelta !== null) {
      const deviation = Math.abs(delta.timeDelta - mean)
      if (deviation > threshold && Math.abs(delta.timeDelta) > 0.1) {
        const driver = delta.timeDelta > 0 ? driver1 : driver2
        anomalies.push({
          driver,
          cornerNumber: delta.cornerNumber,
          delta: Math.abs(delta.timeDelta),
        })
      }
    }
  })

  return anomalies.slice(0, 2) // Max 2 anomalies
}

/**
 * Group stats by corner type
 */
function groupByCornerType(stats: DriverCornerStats[]): Record<string, DriverCornerStats[]> {
  const grouped: Record<string, DriverCornerStats[]> = {
    slow: [],
    medium: [],
    fast: [],
  }

  stats.forEach(stat => {
    if (stat.cornerType) {
      grouped[stat.cornerType] = grouped[stat.cornerType] || []
      grouped[stat.cornerType].push(stat)
    }
  })

  return grouped
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
 * Format insights as markdown bullet points
 */
export function formatInsightsAsBullets(insights: string[], header?: string): string {
  const bullets = insights.map(insight => `- ${insight}`).join('\n')
  return header ? `**${header}**\n\n${bullets}` : bullets
}
