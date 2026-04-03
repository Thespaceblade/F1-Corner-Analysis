/**
 * Season Data Loader
 * 
 * This file loads and converts your existing session data into the format
 * needed for the Season Review Panel.
 */

import {
  SeasonData,
  RoundResult,
  RaceResultEntry,
  QualifyingResultEntry,
  StandingsEntry,
  ConstructorStandingsEntry,
  calculatePoints,
} from './seasonTypes'
import { aggregateSeasonData } from './seasonAggregator'
import { SessionPayload } from './sessionDataClient'
import { getTeamForDriver } from './driverAssignments'
import { getTeamIdFromName } from './seasonMetadata'
import { isDatabaseEnabled } from './db'
import { loadCalendarRoundsFromDatabase, loadSessionPayloadFromDatabase } from './databaseData'
import fs from 'fs'
import path from 'path'

interface CalendarRound {
  round: number
  id: string
  name: string
  location: string
  date: string
  officialName: string
}

/**
 * Load season data from your existing session files
 */
export async function loadSeasonData(year: number): Promise<SeasonData> {
  const rounds = await loadRoundResults(year)
  return aggregateSeasonData(year, rounds)
}

/**
 * Load all round results for a season from your session files
 */
async function loadRoundResults(year: number): Promise<RoundResult[]> {
  try {
    if (isDatabaseEnabled()) {
      const calendarRounds = await loadCalendarRoundsFromDatabase(year)
      const rounds: RoundResult[] = []

      for (const round of calendarRounds) {
        try {
          const roundResult = await loadSingleRound(year, {
            round: round.round,
            id: round.id,
            name: round.name ?? round.id,
            location: round.location ?? '',
            date: round.date ?? '',
            officialName: round.official_name ?? round.name ?? round.id,
          })
          if (roundResult) {
            rounds.push(roundResult)
          }
        } catch (error) {
          console.error(`Error loading round ${round.round} (${round.id}) from database:`, error)
        }
      }

      addStandingsToRounds(rounds)
      return rounds
    }

    // Load calendar from filesystem (server-side)
    const calendarPath = path.join(process.cwd(), 'public', 'data', `calendar${year}.json`)
    if (!fs.existsSync(calendarPath)) {
      console.error(`Calendar not found for ${year} at ${calendarPath}`)
      return []
    }
    
    const calendarContent = fs.readFileSync(calendarPath, 'utf-8')
    const calendar = JSON.parse(calendarContent)
    const rounds: RoundResult[] = []
    
    // Load each round
    for (const round of calendar.rounds) {
      try {
        const roundResult = await loadSingleRound(year, round)
        if (roundResult) {
          rounds.push(roundResult)
        }
      } catch (error) {
        console.error(`Error loading round ${round.round} (${round.id}):`, error)
        // Continue with next round
      }
    }
    
    // Calculate championship standings after each round
    addStandingsToRounds(rounds)
    
    return rounds
  } catch (error) {
    console.error(`Error loading season data for ${year}:`, error)
    return []
  }
}

/**
 * Load a single round's results
 */
async function loadSingleRound(
  year: number,
  round: CalendarRound
): Promise<RoundResult | null> {
  // Load race and qualifying sessions (always present)
  const [raceData, qualiData] = await Promise.all([
    loadSessionData(year, round.id, 'R'),
    loadSessionData(year, round.id, 'Q'),
  ])
  
  if (!raceData) {
    console.warn(`No race data for ${round.name}`)
    return null
  }
  
  // Convert race results
  const raceResults = extractRaceResults(raceData, qualiData, year, round.round)
  
  // Load sprint data only for sprint weekends AND only if it has proper race results
  let sprintResults: RaceResultEntry[] = []
  const [sprintData, sprintQualiData] = await Promise.all([
    loadSessionData(year, round.id, 'S'),
    loadSessionData(year, round.id, 'SQ'),
  ])

  if (sprintData && sprintData.raceResults && sprintData.raceResults.length > 0) {
    sprintResults = extractRaceResults(sprintData, sprintQualiData, year, round.round)
    console.log(`[loadSingleRound] Sprint weekend at ${round.name}: loaded ${sprintResults.length} sprint results`)
  }
  
  // Combine race and sprint points
  const combinedResults = combineRaceAndSprintResults(raceResults, sprintResults)
  
  const qualifyingResults = qualiData ? extractQualifyingResults(qualiData, year, round.round) : []
  
  return {
    round: round.round,
    trackId: round.id,
    trackName: round.name,
    date: null, // Calendar dates are ranges, not specific
    results: combinedResults,
    qualifyingResults,
    driverStandings: [], // Will be calculated later
    constructorStandings: [], // Will be calculated later
  }
}

/**
 * Combine race and sprint results, summing points for each driver
 */
function combineRaceAndSprintResults(
  raceResults: RaceResultEntry[],
  sprintResults: RaceResultEntry[]
): RaceResultEntry[] {
  // Create a map of driver => combined result
  const driverMap = new Map<string, RaceResultEntry>()
  
  // Add race results first (use race position as primary position)
  for (const result of raceResults) {
    driverMap.set(result.driverCode, { ...result })
  }
  
  // Add sprint points to existing drivers or create new entries
  for (const sprintResult of sprintResults) {
    const existing = driverMap.get(sprintResult.driverCode)
    if (existing) {
      // Add sprint points to race points
      existing.points = (existing.points || 0) + (sprintResult.points || 0)
    } else {
      // Driver only in sprint (shouldn't happen, but handle it)
      driverMap.set(sprintResult.driverCode, { ...sprintResult })
    }
  }
  
  return Array.from(driverMap.values())
}

/**
 * Load session data from file (server-side)
 */
async function loadSessionData(
  year: number,
  trackId: string,
  session: string
): Promise<SessionPayload | null> {
  try {
    if (isDatabaseEnabled()) {
      return await loadSessionPayloadFromDatabase({
        year,
        round: trackId,
        session,
      })
    }

    const sessionPath = path.join(
      process.cwd(), 
      'public', 
      'data', 
      'sessions', 
      String(year), 
      trackId, 
      session, 
      'session.json'
    )
    
    if (!fs.existsSync(sessionPath)) {
      return null
    }
    
    const sessionContent = fs.readFileSync(sessionPath, 'utf-8')
    return JSON.parse(sessionContent) as SessionPayload
  } catch (error) {
    console.error(`Error loading session ${year}/${trackId}/${session}:`, error)
    return null
  }
}

/**
 * Extract race results from session data
 */
function extractRaceResults(
  raceData: SessionPayload,
  qualiData: SessionPayload | null,
  year: number,
  round: number
): RaceResultEntry[] {
  // Use FastF1 race results if available (preferred - official F1 data)
  if (raceData.raceResults && raceData.raceResults.length > 0) {
    console.log(`[extractRaceResults] Using FastF1 race results (${raceData.raceResults.length} drivers)`)
    
    // Find fastest lap time from all drivers' lap data
    let fastestLapTime: number | null = null
    const fastestLapDriver = new Set<string>()
    
    // Calculate fastest lap from lap data
    for (const lap of raceData.laps) {
      if (lap.isValid && lap.lapTimeSeconds !== null && lap.lapTimeSeconds > 0) {
        if (fastestLapTime === null || lap.lapTimeSeconds < fastestLapTime) {
          fastestLapTime = lap.lapTimeSeconds
          fastestLapDriver.clear()
          fastestLapDriver.add(lap.driver.toUpperCase())
        } else if (fastestLapTime !== null && Math.abs(lap.lapTimeSeconds - fastestLapTime) < 0.001) {
          // Same time (within 1ms tolerance) - multiple drivers can share fastest lap
          fastestLapDriver.add(lap.driver.toUpperCase())
        }
      }
    }
    
    return raceData.raceResults.map(result => {
      // Get team ID from driver assignments (handles mid-season swaps correctly)
      const teamId = getTeamForDriver(year, result.driverCode, round) || 
                     getTeamIdFromName(result.teamName, year)
      
      // Check if this driver set the fastest lap
      const hasFastestLap = fastestLapDriver.has(result.driverCode.toUpperCase())
      
      return {
        position: result.position || 999,
        driverCode: result.driverCode,
        teamId,
        points: result.points,
        lapsCompleted: result.lapsCompleted || 0,
        status: result.status as RaceResultEntry['status'],
        fastestLap: hasFastestLap,
        gridPosition: result.gridPosition || 0,
      }
    })
  }
  
  // FALLBACK: Calculate from lap data (less accurate)
  console.warn('[extractRaceResults] No FastF1 race results, falling back to lap-based calculation')
  
  const drivers = Object.keys(raceData.drivers)
  const results: Array<RaceResultEntry & { bestLap: number }> = []
  
  // Find fastest lap time across all drivers
  let fastestLapTime: number | null = null
  for (const lap of raceData.laps) {
    if (lap.isValid && lap.lapTimeSeconds !== null && lap.lapTimeSeconds > 0) {
      if (fastestLapTime === null || lap.lapTimeSeconds < fastestLapTime) {
        fastestLapTime = lap.lapTimeSeconds
      }
    }
  }
  
  // Calculate each driver's result from laps
  for (const driverCode of drivers) {
    const driverLaps = raceData.laps.filter(lap => 
      lap.driver === driverCode && 
      lap.isValid !== false &&
      lap.lapTimeSeconds !== null
    )
    
    if (driverLaps.length === 0) continue
    
    // Best lap time
    const bestLap = Math.min(...driverLaps.map(lap => lap.lapTimeSeconds!))
    
    // Check if this driver set the fastest lap (within 0.001s tolerance)
    const hasFastestLap = fastestLapTime !== null && 
                          Math.abs(bestLap - fastestLapTime) < 0.001
    
    // Laps completed
    const lapsCompleted = Math.max(...driverLaps.map(lap => lap.lapNumber || 0))
    
    // Determine status (simplified)
    const totalLaps = Math.max(...raceData.laps.map(lap => lap.lapNumber || 0))
    const status: RaceResultEntry['status'] = 
      lapsCompleted >= totalLaps - 1 ? 'Finished' : 'DNF'
    
    // Get team ID from driver assignments (correct for mid-season swaps)
    const driver = raceData.drivers[driverCode]
    const teamId = getTeamForDriver(year, driverCode, round) || 
                   getTeamIdFromName(driver.team || null, year)
    
    // Grid position from qualifying
    const gridPosition = qualiData ? getQualifyingPosition(qualiData, driverCode) : 0
    
    results.push({
      position: 0, // Will be set after sorting
      driverCode,
      teamId,
      points: 0, // Will be calculated after position is set
      lapsCompleted,
      status,
      fastestLap: hasFastestLap,
      gridPosition,
      bestLap, // Temporary for sorting
    })
  }
  
  // Sort by best lap time (NOT accurate for real race order)
  results.sort((a, b) => a.bestLap - b.bestLap)
  
  // Assign positions and calculate points
  const finalResults: RaceResultEntry[] = results.map((result, index) => {
    const position = index + 1
    const points = calculatePoints(position, result.fastestLap)
    
    // Remove temporary bestLap field
    const { bestLap, ...rest } = result
    
    return {
      ...rest,
      position,
      points,
    }
  })
  
  return finalResults
}

/**
 * Extract qualifying results from session data
 */
function extractQualifyingResults(
  qualiData: SessionPayload,
  year: number,
  round: number
): QualifyingResultEntry[] {
  // Use FastF1 qualifying results if available (preferred - official F1 data)
  if (qualiData.qualifyingResults && qualiData.qualifyingResults.length > 0) {
    console.log(`[extractQualifyingResults] Using FastF1 qualifying results (${qualiData.qualifyingResults.length} drivers)`)
    
    return qualiData.qualifyingResults.map(result => {
      // Get team ID from driver assignments (handles mid-season swaps correctly)
      const teamId = getTeamForDriver(year, result.driverCode, round) || 
                     getTeamIdFromName(result.teamName, year)
      
      // Use best time from Q3, Q2, or Q1 (in that order)
      const time = result.q3Time || result.q2Time || result.q1Time
      
      return {
        position: result.position || 999,
        driverCode: result.driverCode,
        teamId,
        time,
        q1Time: result.q1Time,
        q2Time: result.q2Time,
        q3Time: result.q3Time,
      }
    })
  }
  
  // FALLBACK: Calculate from lap data (less accurate)
  console.warn('[extractQualifyingResults] No FastF1 qualifying results, falling back to lap-based calculation')
  
  const drivers = Object.keys(qualiData.drivers)
  const results: Array<QualifyingResultEntry & { bestTime: number }> = []
  
  for (const driverCode of drivers) {
    const driverLaps = qualiData.laps.filter(lap => 
      lap.driver === driverCode && 
      lap.isValid !== false &&
      lap.lapTimeSeconds !== null
    )
    
    if (driverLaps.length === 0) continue
    
    // Best lap time
    const bestTime = Math.min(...driverLaps.map(lap => lap.lapTimeSeconds!))
    
    // Get team ID from driver assignments (correct for mid-season swaps)
    const driver = qualiData.drivers[driverCode]
    const teamId = getTeamForDriver(year, driverCode, round) || 
                   getTeamIdFromName(driver.team || null, year)
    
    results.push({
      position: 0, // Will be set after sorting
      driverCode,
      teamId,
      time: bestTime,
      bestTime, // Temporary for sorting
    })
  }
  
  // Sort by best time
  results.sort((a, b) => a.bestTime - b.bestTime)
  
  // Assign positions
  return results.map((result, index) => {
    const { bestTime, ...rest } = result
    return {
      ...rest,
      position: index + 1,
    }
  })
}

/**
 * Get driver's qualifying position
 */
function getQualifyingPosition(qualiData: SessionPayload, driverCode: string): number {
  const driverLaps = qualiData.laps.filter(lap => 
    lap.driver === driverCode && 
    lap.isValid !== false &&
    lap.lapTimeSeconds !== null
  )
  
  if (driverLaps.length === 0) return 20
  
  const bestTime = Math.min(...driverLaps.map(lap => lap.lapTimeSeconds!))
  
  // Find position by comparing to all drivers
  const allDrivers = Object.keys(qualiData.drivers)
  const times = allDrivers.map(driver => {
    const laps = qualiData.laps.filter(lap => 
      lap.driver === driver && 
      lap.isValid !== false &&
      lap.lapTimeSeconds !== null
    )
    return laps.length > 0 ? Math.min(...laps.map(l => l.lapTimeSeconds!)) : Infinity
  })
  
  times.sort((a, b) => a - b)
  return times.indexOf(bestTime) + 1
}


/**
 * Add championship standings to each round
 */
function addStandingsToRounds(rounds: RoundResult[]) {
  for (let i = 0; i < rounds.length; i++) {
    const standings = calculateStandings(rounds, i + 1)
    rounds[i].driverStandings = standings.drivers
    rounds[i].constructorStandings = standings.constructors
  }
}

/**
 * Helper: Calculate championship standings from race results
 */
export function calculateStandings(
  rounds: RoundResult[],
  upToRound: number
): { drivers: StandingsEntry[]; constructors: ConstructorStandingsEntry[] } {
  const driverPoints = new Map<string, number>()
  const teamPoints = new Map<string, number>()
  
  // Sum points up to specified round
  for (const round of rounds) {
    if (round.round > upToRound) break
    
    for (const result of round.results) {
      // Driver points
      driverPoints.set(
        result.driverCode,
        (driverPoints.get(result.driverCode) ?? 0) + result.points
      )
      
      // Team points
      if (result.teamId) {
        teamPoints.set(
          result.teamId,
          (teamPoints.get(result.teamId) ?? 0) + result.points
        )
      }
    }
  }
  
  // Sort and create standings
  const drivers = Array.from(driverPoints.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([driverCode, points], index) => ({
      position: index + 1,
      driverCode,
      points,
    }))
  
  const constructors = Array.from(teamPoints.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([teamId, points], index) => ({
      position: index + 1,
      teamId,
      points,
    }))
  
  return { drivers, constructors }
}

// No additional exports needed - everything is handled automatically
