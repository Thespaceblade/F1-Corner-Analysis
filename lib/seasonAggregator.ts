/**
 * Season data aggregation and calculation logic
 * 
 * This module handles aggregating session data across an entire F1 season
 * and calculating comprehensive statistics for drivers and teams.
 */

import { getDriverAssignments, getTeamForDriver } from './driverAssignments'
import {
  SeasonData,
  DriverSeasonStats,
  TeamSeasonStats,
  RoundResult,
  ChampionshipProgression,
  HeadToHeadStats,
  getTrackType,
  ChampionshipPoint,
} from './seasonTypes'

// ==================== Main Aggregation Function ====================

/**
 * Aggregate all session data for a season
 */
export function aggregateSeasonData(year: number, rounds: RoundResult[]): SeasonData {
  
  // Get all drivers who raced this year
  const assignments = getDriverAssignments(year)
  const allDrivers = new Set<string>()
  const allTeams = new Set<string>()
  
  for (const [teamId, teamAssignments] of Object.entries(assignments)) {
    allTeams.add(teamId)
    for (const assignment of teamAssignments) {
      allDrivers.add(assignment.driverCode)
    }
  }
  
  // Calculate driver statistics
  const drivers: Record<string, DriverSeasonStats> = {}
  for (const driverCode of allDrivers) {
    drivers[driverCode] = calculateDriverStats(driverCode, rounds, year)
  }
  
  // Calculate team statistics
  const teams: Record<string, TeamSeasonStats> = {}
  for (const teamId of allTeams) {
    teams[teamId] = calculateTeamStats(teamId, rounds, year)
  }
  
  // Build championship progression
  const championshipProgression = buildChampionshipProgression(rounds)
  
  // Determine champions
  const driverStandings = Object.entries(drivers)
    .sort((a, b) => b[1].totalPoints - a[1].totalPoints)
  const constructorStandings = Object.entries(teams)
    .sort((a, b) => b[1].totalPoints - a[1].totalPoints)
  
  return {
    year,
    drivers,
    teams,
    rounds,
    championshipProgression,
    totalRaces: rounds.length,
    completedRaces: rounds.length,
    champion: {
      driver: driverStandings[0]?.[0] ?? null,
      constructor: constructorStandings[0]?.[0] ?? null,
    },
  }
}

// ==================== Driver Statistics Calculation ====================

export function calculateDriverStats(
  driverCode: string,
  rounds: RoundResult[],
  year: number
): DriverSeasonStats {
  const driverResults = rounds.map(round => {
    const raceResult = round.results.find(r => r.driverCode === driverCode)
    const qualiResult = round.qualifyingResults.find(q => q.driverCode === driverCode)
    return { round, raceResult, qualiResult }
  }).filter(r => r.raceResult || r.qualiResult)
  
  // Basic stats
  const raceStarts = driverResults.filter(r => r.raceResult).length
  const finishedRaces = driverResults.filter(r => r.raceResult?.status === 'Finished')
  const dnfs = driverResults.filter(r => r.raceResult?.status === 'DNF').length
  
  const totalPoints = driverResults.reduce((sum, r) => sum + (r.raceResult?.points ?? 0), 0)
  const raceWins = driverResults.filter(r => r.raceResult?.position === 1).length
  const podiums = driverResults.filter(r => r.raceResult && r.raceResult.position <= 3).length
  const polePositions = driverResults.filter(r => r.qualiResult?.position === 1).length
  const fastestLaps = driverResults.filter(r => r.raceResult?.fastestLap).length
  
  // Finish positions
  const finishPositions = finishedRaces.map(r => r.raceResult!.position)
  const averageFinishPosition = finishPositions.length > 0
    ? finishPositions.reduce((a, b) => a + b, 0) / finishPositions.length
    : null
  const bestFinish = finishPositions.length > 0 ? Math.min(...finishPositions) : null
  const worstFinish = finishPositions.length > 0 ? Math.max(...finishPositions) : null
  
  // Qualifying stats
  const qualiPositions = driverResults
    .filter(r => r.qualiResult?.position)
    .map(r => r.qualiResult!.position)
  const averageQualifyingPosition = qualiPositions.length > 0
    ? qualiPositions.reduce((a, b) => a + b, 0) / qualiPositions.length
    : null
  const bestQualifyingPosition = qualiPositions.length > 0 ? Math.min(...qualiPositions) : null
  const worstQualifyingPosition = qualiPositions.length > 0 ? Math.max(...qualiPositions) : null
  const q3Appearances = qualiPositions.filter(p => p <= 10).length
  
  // Laps completed
  const totalLapsCompleted = driverResults.reduce(
    (sum, r) => sum + (r.raceResult?.lapsCompleted ?? 0),
    0
  )
  
  // Teammate comparison
  const teammateComparison = calculateTeammateComparison(driverCode, rounds, year)
  
  // Consistency
  const finishingPositionStdDev = calculateStdDev(finishPositions)
  const pointScoringRaces = driverResults.filter(r => (r.raceResult?.points ?? 0) > 0).length
  const pointScoringRate = raceStarts > 0 ? (pointScoringRaces / raceStarts) * 100 : 0
  
  // Positions gained
  const positionsGainedPerRace = driverResults
    .filter(r => r.raceResult?.status === 'Finished' && r.raceResult.gridPosition)
    .map(r => (r.raceResult!.gridPosition! - r.raceResult!.position))
  const averagePositionsGained = positionsGainedPerRace.length > 0
    ? positionsGainedPerRace.reduce((a, b) => a + b, 0) / positionsGainedPerRace.length
    : null
  
  // Performance by track type
  const performanceByTrackType = calculateTrackTypePerformance(driverCode, rounds)
  
  // Team ID (primary team for the season)
  const teamId = getTeamForDriver(year, driverCode, 1) // Get team for first round
  
  return {
    driverCode,
    teamId,
    totalPoints,
    raceWins,
    podiums,
    polePositions,
    fastestLaps,
    dnfs,
    raceStarts,
    racesFinished: finishedRaces.length,
    averageFinishPosition,
    bestFinish,
    worstFinish,
    totalLapsCompleted,
    averageQualifyingPosition,
    bestQualifyingPosition,
    worstQualifyingPosition,
    q3Appearances,
    teammateHeadToHeadQualifying: teammateComparison.qualifying,
    teammateHeadToHeadRace: teammateComparison.race,
    averageQualifyingGapToTeammate: teammateComparison.avgQualiGap,
    averageRaceGapToTeammate: teammateComparison.avgRaceGap,
    pointsVsTeammate: teammateComparison.pointsDifference,
    finishingPositionStdDev,
    pointScoringRate,
    averagePositionsGained,
    overtakingRate: averagePositionsGained, // Same as positions gained for now
    performanceByTrackType,
    averageStintLength: null, // TODO: Calculate from stint data
    tyreDegradationRate: null, // TODO: Calculate from tyre data
  }
}

// ==================== Team Statistics Calculation ====================

export function calculateTeamStats(
  teamId: string,
  rounds: RoundResult[],
  year: number
): TeamSeasonStats {
  // Get team drivers (might change mid-season)
  const assignments = getDriverAssignments(year)[teamId] || []
  const teamDrivers = new Set(assignments.map(a => a.driverCode))
  
  let totalPoints = 0
  let totalPodiums = 0
  let totalWins = 0
  let oneTwo = 0
  let doublePodium = 0
  let doublePoints = 0
  let doubleDNF = 0
  const finishPositions: number[] = []
  
  for (const round of rounds) {
    const teamResults = round.results.filter(r => teamDrivers.has(r.driverCode))
    
    totalPoints += teamResults.reduce((sum, r) => sum + r.points, 0)
    totalPodiums += teamResults.filter(r => r.position <= 3).length
    totalWins += teamResults.filter(r => r.position === 1).length
    
    // Check for special results
    if (teamResults.length === 2) {
      const positions = teamResults.map(r => r.position).sort((a, b) => a - b)
      const statuses = teamResults.map(r => r.status)
      
      if (positions[0] === 1 && positions[1] === 2) oneTwo++
      if (positions[0] <= 3 && positions[1] <= 3) doublePodium++
      if (teamResults.every(r => r.points > 0)) doublePoints++
      if (statuses.every(s => s === 'DNF')) doubleDNF++
      
      finishPositions.push(...positions)
    } else if (teamResults.length === 1) {
      const pos = teamResults[0].position
      if (teamResults[0].status === 'Finished') {
        finishPositions.push(pos)
      }
    }
  }
  
  const averageFinishingPosition = finishPositions.length > 0
    ? finishPositions.reduce((a, b) => a + b, 0) / finishPositions.length
    : null
  
  // Get primary drivers (most races for the team)
  const driverRaces = new Map<string, number>()
  for (const assignment of assignments) {
    const count = rounds.filter(round => {
      const result = round.results.find(r => r.driverCode === assignment.driverCode)
      return result && result.teamId === teamId
    }).length
    driverRaces.set(assignment.driverCode, count)
  }
  
  const sortedDrivers = Array.from(driverRaces.entries())
    .sort((a, b) => b[1] - a[1])
  
  const driver1 = sortedDrivers[0]?.[0] ?? null
  const driver2 = sortedDrivers[1]?.[0] ?? null
  
  // Calculate points difference
  const driver1Points = rounds.reduce((sum, r) => {
    const result = r.results.find(res => res.driverCode === driver1 && res.teamId === teamId)
    return sum + (result?.points ?? 0)
  }, 0)
  
  const driver2Points = rounds.reduce((sum, r) => {
    const result = r.results.find(res => res.driverCode === driver2 && res.teamId === teamId)
    return sum + (result?.points ?? 0)
  }, 0)
  
  return {
    teamId,
    totalPoints,
    constructorPosition: null, // Calculated later from standings
    oneTwo,
    doublePodium,
    doublePoints,
    doubleDNF,
    totalPodiums,
    totalWins,
    averageFinishingPosition,
    driver1,
    driver2,
    pointsDifference: driver1Points - driver2Points,
  }
}

// ==================== Championship Progression ====================

export function buildChampionshipProgression(
  rounds: RoundResult[]
): ChampionshipProgression {
  const drivers: Record<string, ChampionshipPoint[]> = {}
  const constructors: Record<string, ChampionshipPoint[]> = {}
  
  for (const round of rounds) {
    // Driver standings
    for (const standing of round.driverStandings) {
      if (!drivers[standing.driverCode]) {
        drivers[standing.driverCode] = []
      }
      drivers[standing.driverCode].push({
        round: round.round,
        points: standing.points,
        position: standing.position,
      })
    }
    
    // Constructor standings
    for (const standing of round.constructorStandings) {
      if (!constructors[standing.teamId]) {
        constructors[standing.teamId] = []
      }
      constructors[standing.teamId].push({
        round: round.round,
        points: standing.points,
        position: standing.position,
      })
    }
  }
  
  return { drivers, constructors }
}

// ==================== Head-to-Head Comparison ====================

export function calculateHeadToHead(
  driver1: string,
  driver2: string,
  rounds: RoundResult[]
): HeadToHeadStats {
  const raceByRace: HeadToHeadStats['raceByRace'] = []
  let qualiWins1 = 0
  let qualiWins2 = 0
  let qualiTotal = 0
  let raceWins1 = 0
  let raceWins2 = 0
  let raceTotal = 0
  let points1 = 0
  let points2 = 0
  
  const qualiGaps: number[] = []
  const raceGaps: number[] = []
  
  let bestFinish1: number | null = null
  let bestFinish2: number | null = null
  let worstFinish1: number | null = null
  let worstFinish2: number | null = null
  
  for (const round of rounds) {
    const result1 = round.results.find(r => r.driverCode === driver1)
    const result2 = round.results.find(r => r.driverCode === driver2)
    const quali1 = round.qualifyingResults.find(q => q.driverCode === driver1)
    const quali2 = round.qualifyingResults.find(q => q.driverCode === driver2)
    
    // Qualifying comparison
    if (quali1 && quali2 && quali1.position && quali2.position) {
      qualiTotal++
      if (quali1.position < quali2.position) {
        qualiWins1++
      } else if (quali2.position < quali1.position) {
        qualiWins2++
      }
      
      // Time gap (if available)
      if (quali1.time && quali2.time) {
        qualiGaps.push(quali1.time - quali2.time)
      }
    }
    
    // Race comparison
    if (result1?.status === 'Finished' && result2?.status === 'Finished') {
      raceTotal++
      if (result1.position < result2.position) {
        raceWins1++
      } else if (result2.position < result1.position) {
        raceWins2++
      }
      
      // Position gap
      raceGaps.push(result1.position - result2.position)
    }
    
    // Points
    points1 += result1?.points ?? 0
    points2 += result2?.points ?? 0
    
    // Best/worst finishes
    if (result1?.status === 'Finished') {
      bestFinish1 = bestFinish1 === null ? result1.position : Math.min(bestFinish1, result1.position)
      worstFinish1 = worstFinish1 === null ? result1.position : Math.max(worstFinish1, result1.position)
    }
    if (result2?.status === 'Finished') {
      bestFinish2 = bestFinish2 === null ? result2.position : Math.min(bestFinish2, result2.position)
      worstFinish2 = worstFinish2 === null ? result2.position : Math.max(worstFinish2, result2.position)
    }
    
    // Race-by-race
    raceByRace.push({
      round: round.round,
      trackName: round.trackName,
      driver1Quali: quali1?.position ?? null,
      driver2Quali: quali2?.position ?? null,
      driver1Race: result1?.position ?? null,
      driver2Race: result2?.position ?? null,
      driver1Points: result1?.points ?? 0,
      driver2Points: result2?.points ?? 0,
    })
  }
  
  const avgQualiGap = qualiGaps.length > 0
    ? qualiGaps.reduce((a, b) => a + b, 0) / qualiGaps.length
    : null
  
  const avgRaceGap = raceGaps.length > 0
    ? raceGaps.reduce((a, b) => a + b, 0) / raceGaps.length
    : null
  
  return {
    driver1,
    driver2,
    qualifyingWins: { driver1: qualiWins1, driver2: qualiWins2, total: qualiTotal },
    raceWins: { driver1: raceWins1, driver2: raceWins2, total: raceTotal },
    pointsScored: { driver1: points1, driver2: points2 },
    pointsDifference: points1 - points2,
    avgQualifyingGap: avgQualiGap,
    avgRaceGap: avgRaceGap,
    driver1BestFinish: bestFinish1,
    driver2BestFinish: bestFinish2,
    driver1WorsFinish: worstFinish1,
    driver2WorstFinish: worstFinish2,
    raceByRace,
  }
}

// ==================== Helper Functions ====================

function calculateTeammateComparison(
  driverCode: string,
  rounds: RoundResult[],
  year: number
) {
  let qualiWins = 0
  let qualiTotal = 0
  let raceWins = 0
  let raceTotal = 0
  const qualiGaps: number[] = []
  const raceGaps: number[] = []
  let driverPoints = 0
  let teammatePoints = 0
  
  for (const round of rounds) {
    const teamId = getTeamForDriver(year, driverCode, round.round)
    if (!teamId) continue
    
    // Find teammate
    const assignments = getDriverAssignments(year)[teamId] || []
    const activeDrivers = assignments.filter(a => {
      const start = a.startRound ?? 1
      const end = a.endRound ?? Infinity
      return round.round >= start && round.round <= end
    })
    
    const teammate = activeDrivers.find(a => a.driverCode !== driverCode)?.driverCode
    if (!teammate) continue
    
    const driverQuali = round.qualifyingResults.find(q => q.driverCode === driverCode)
    const teammateQuali = round.qualifyingResults.find(q => q.driverCode === teammate)
    
    if (driverQuali?.position && teammateQuali?.position) {
      qualiTotal++
      if (driverQuali.position < teammateQuali.position) qualiWins++
      
      if (driverQuali.time && teammateQuali.time) {
        qualiGaps.push(driverQuali.time - teammateQuali.time)
      }
    }
    
    const driverRace = round.results.find(r => r.driverCode === driverCode)
    const teammateRace = round.results.find(r => r.driverCode === teammate)
    
    if (driverRace?.status === 'Finished' && teammateRace?.status === 'Finished') {
      raceTotal++
      if (driverRace.position < teammateRace.position) raceWins++
      raceGaps.push(driverRace.position - teammateRace.position)
    }
    
    driverPoints += driverRace?.points ?? 0
    teammatePoints += teammateRace?.points ?? 0
  }
  
  return {
    qualifying: { wins: qualiWins, total: qualiTotal },
    race: { wins: raceWins, total: raceTotal },
    avgQualiGap: qualiGaps.length > 0 ? qualiGaps.reduce((a, b) => a + b, 0) / qualiGaps.length : null,
    avgRaceGap: raceGaps.length > 0 ? raceGaps.reduce((a, b) => a + b, 0) / raceGaps.length : null,
    pointsDifference: driverPoints - teammatePoints,
  }
}

function calculateTrackTypePerformance(
  driverCode: string,
  rounds: RoundResult[]
): DriverSeasonStats['performanceByTrackType'] {
  const byType: Record<string, { positions: number[]; races: number }> = {
    street: { positions: [], races: 0 },
    traditional: { positions: [], races: 0 },
    highSpeed: { positions: [], races: 0 },
  }
  
  for (const round of rounds) {
    const trackType = getTrackType(round.trackId)
    const result = round.results.find(r => r.driverCode === driverCode)
    
    if (result?.status === 'Finished') {
      byType[trackType].positions.push(result.position)
      byType[trackType].races++
    }
  }
  
  return {
    street: {
      avgPosition: byType.street.positions.length > 0
        ? byType.street.positions.reduce((a, b) => a + b, 0) / byType.street.positions.length
        : null,
      races: byType.street.races,
    },
    traditional: {
      avgPosition: byType.traditional.positions.length > 0
        ? byType.traditional.positions.reduce((a, b) => a + b, 0) / byType.traditional.positions.length
        : null,
      races: byType.traditional.races,
    },
    highSpeed: {
      avgPosition: byType.highSpeed.positions.length > 0
        ? byType.highSpeed.positions.reduce((a, b) => a + b, 0) / byType.highSpeed.positions.length
        : null,
      races: byType.highSpeed.races,
    },
  }
}

function calculateStdDev(values: number[]): number | null {
  if (values.length < 2) return null
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  
  return Math.sqrt(variance)
}
