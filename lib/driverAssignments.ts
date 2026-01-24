/**
 * Driver assignments and swaps tracking
 * 
 * This module tracks which drivers raced at which tracks, handling
 * mid-season driver swaps and ensuring driver data is properly linked
 * to teams and races.
 */

export interface DriverAssignment {
  driverCode: string
  teamId: string
  startRound?: number  // Round when this assignment starts (inclusive)
  endRound?: number    // Round when this assignment ends (inclusive, undefined = continues to end)
}

export interface DriverSwap {
  teamId: string
  fromDriver: string
  toDriver: string
  round: number
  roundName: string
}

/**
 * Driver swaps for the 2025 season
 */
export const driverSwaps2025: DriverSwap[] = [
  {
    teamId: 'red-bull',
    fromDriver: 'LAW',
    toDriver: 'TSU',
    round: 3,
    roundName: 'Japanese Grand Prix'
  },
  {
    teamId: 'alpine',
    fromDriver: 'DOO',
    toDriver: 'COL',  // Franco Colapinto
    round: 7,
    roundName: 'Emilia-Romagna Grand Prix'
  }
]

/**
 * Base driver assignments (before swaps)
 * These represent the starting lineup for the season
 */
const baseAssignments2025: Record<string, DriverAssignment[]> = {
  'red-bull': [
    { driverCode: 'VER', teamId: 'red-bull', startRound: 1 },
    { driverCode: 'LAW', teamId: 'red-bull', startRound: 1, endRound: 2 },  // Liam Lawson races rounds 1-2
    { driverCode: 'TSU', teamId: 'red-bull', startRound: 3 }  // Yuki Tsunoda replaces LAW from round 3
  ],
  'mclaren': [
    { driverCode: 'NOR', teamId: 'mclaren', startRound: 1 },
    { driverCode: 'PIA', teamId: 'mclaren', startRound: 1 }
  ],
  'mercedes': [
    { driverCode: 'RUS', teamId: 'mercedes', startRound: 1 },
    { driverCode: 'ANT', teamId: 'mercedes', startRound: 1 }
  ],
  'ferrari': [
    { driverCode: 'LEC', teamId: 'ferrari', startRound: 1 },
    { driverCode: 'HAM', teamId: 'ferrari', startRound: 1 }
  ],
  'aston-martin': [
    { driverCode: 'ALO', teamId: 'aston-martin', startRound: 1 },
    { driverCode: 'STR', teamId: 'aston-martin', startRound: 1 }
  ],
  'alpine': [
    { driverCode: 'GAS', teamId: 'alpine', startRound: 1 },
    { driverCode: 'DOO', teamId: 'alpine', startRound: 1, endRound: 6 },  // Jack Doohan rounds 1-6
    { driverCode: 'COL', teamId: 'alpine', startRound: 7 }  // Franco Colapinto replaces DOO from round 7
  ],
  'williams': [
    { driverCode: 'ALB', teamId: 'williams', startRound: 1 },
    { driverCode: 'SAI', teamId: 'williams', startRound: 1 }
  ],
  'visa-rb': [
    { driverCode: 'TSU', teamId: 'visa-rb', startRound: 1, endRound: 2 },  // Tsunoda moves to Red Bull at round 3
    { driverCode: 'HAD', teamId: 'visa-rb', startRound: 1 }
  ],
  'stake': [
    { driverCode: 'HUL', teamId: 'stake', startRound: 1 },
    { driverCode: 'BOR', teamId: 'stake', startRound: 1 }
  ],
  'haas': [
    { driverCode: 'OCO', teamId: 'haas', startRound: 1 },
    { driverCode: 'BEA', teamId: 'haas', startRound: 1 }
  ]
}

/**
 * Apply driver swaps to base assignments
 */
function applySwaps(
  base: Record<string, DriverAssignment[]>,
  swaps: DriverSwap[]
): Record<string, DriverAssignment[]> {
  const assignments = JSON.parse(JSON.stringify(base)) as Record<string, DriverAssignment[]>

  for (const swap of swaps) {
    const teamAssignments = assignments[swap.teamId]
    if (!teamAssignments) continue

    // Find and update the driver being replaced
    const fromAssignment = teamAssignments.find(a => a.driverCode === swap.fromDriver)
    if (fromAssignment) {
      // End the previous driver's assignment before the swap round
      fromAssignment.endRound = swap.round - 1
    }

    // Add the new driver assignment starting at the swap round
    teamAssignments.push({
      driverCode: swap.toDriver,
      teamId: swap.teamId,
      startRound: swap.round
    })
  }

  return assignments
}

/**
 * Get driver assignments for a specific year
 */
export function getDriverAssignments(year: number): Record<string, DriverAssignment[]> {
  if (year === 2025) {
    return applySwaps(baseAssignments2025, driverSwaps2025)
  }
  
  // For other years, return base assignments (no swaps defined yet)
  // This can be extended for other years
  return baseAssignments2025
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
