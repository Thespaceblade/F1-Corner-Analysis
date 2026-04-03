/**
 * Driver assignments and swaps tracking derived from season metadata.
 */

import { getSeasonTeams } from './seasonMetadata'

export interface DriverAssignment {
  driverCode: string
  teamId: string
  startRound?: number  // Round when this assignment starts (inclusive)
  endRound?: number    // Round when this assignment ends (inclusive, undefined = continues to end)
}

/**
 * Get driver assignments for a specific year
 */
export function getDriverAssignments(year: number): Record<string, DriverAssignment[]> {
  return getSeasonTeams(year).reduce<Record<string, DriverAssignment[]>>((acc, team) => {
    acc[team.id] = team.drivers.map((driver) => ({
      driverCode: driver.code,
      teamId: team.id,
      startRound: driver.startRound,
      endRound: driver.endRound,
    }))
    return acc
  }, {})
}

/**
 * Get all drivers who raced at a specific round
 */
export function getDriversForRound(
  year: number,
  round: number
): Array<{ driverCode: string; teamId: string }> {
  const assignments = getDriverAssignments(year)
  const drivers: Array<{ driverCode: string; teamId: string }> = []

  for (const teamAssignments of Object.values(assignments)) {
    for (const assignment of teamAssignments) {
      const startRound = assignment.startRound ?? 1
      const endRound = assignment.endRound ?? Infinity

      if (round >= startRound && round <= endRound) {
        drivers.push({
          driverCode: assignment.driverCode,
          teamId: assignment.teamId
        })
      }
    }
  }

  return drivers
}

/**
 * Get driver code for a specific team and round
 */
export function getDriverForTeam(
  year: number,
  teamId: string,
  round: number,
  position: 0 | 1 = 0
): string | null {
  const assignments = getDriverAssignments(year)
  const teamAssignments = assignments[teamId]
  if (!teamAssignments) return null

  const activeDrivers = teamAssignments.filter(a => {
    const startRound = a.startRound ?? 1
    const endRound = a.endRound ?? Infinity
    return round >= startRound && round <= endRound
  })

  return activeDrivers[position]?.driverCode ?? null
}

/**
 * Get team ID for a driver at a specific round
 */
export function getTeamForDriver(
  year: number,
  driverCode: string,
  round: number
): string | null {
  const assignments = getDriverAssignments(year)
  
  for (const [teamId, teamAssignments] of Object.entries(assignments)) {
    for (const assignment of teamAssignments) {
      if (assignment.driverCode === driverCode) {
        const startRound = assignment.startRound ?? 1
        const endRound = assignment.endRound ?? Infinity
        
        if (round >= startRound && round <= endRound) {
          return teamId
        }
      }
    }
  }

  return null
}

/**
 * Check if a driver raced at a specific round
 */
export function didDriverRaceAtRound(
  year: number,
  driverCode: string,
  round: number
): boolean {
  return getTeamForDriver(year, driverCode, round) !== null
}

/**
 * Get all unique driver codes that raced in a year
 */
export function getAllDriversForYear(year: number): string[] {
  const assignments = getDriverAssignments(year)
  const driverSet = new Set<string>()

  for (const teamAssignments of Object.values(assignments)) {
    for (const assignment of teamAssignments) {
      driverSet.add(assignment.driverCode)
    }
  }

  return Array.from(driverSet).sort()
}
