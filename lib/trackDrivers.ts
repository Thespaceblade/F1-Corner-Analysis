/**
 * Track-specific driver utilities
 * 
 * Gets available drivers for a specific track/round by checking:
 * 1. Driver assignments (from driverAssignments.ts)
 * 2. Actual session data (drivers who actually raced)
 */

import { getDriversForRound, didDriverRaceAtRound } from './driverAssignments'
import { getTeamIdFromName } from './seasonMetadata'
import type { SessionPayload } from './sessionDataClient'

/**
 * Get available drivers for a specific track/round
 * This combines driver assignments with actual session data
 */
export function getAvailableDriversForTrack(
  year: number,
  round: number,
  sessionData: SessionPayload | null
): Array<{ driverCode: string; teamId: string | null }> {
  // Start with drivers from assignments
  const assignmentDrivers = getDriversForRound(year, round)
  const driverMap = new Map<string, { driverCode: string; teamId: string | null }>()

  // Add drivers from assignments
  for (const driver of assignmentDrivers) {
    driverMap.set(driver.driverCode, {
      driverCode: driver.driverCode,
      teamId: driver.teamId
    })
  }

  // Override with actual session data if available (more accurate)
  if (sessionData?.drivers) {
    for (const [driverCode, driverInfo] of Object.entries(sessionData.drivers)) {
      // Get team ID from assignments or use team from session data
      const teamId = getTeamIdFromName(driverInfo.team, year)
      
      driverMap.set(driverCode, {
        driverCode,
        teamId
      })
    }
  }

  return Array.from(driverMap.values()).sort((a, b) => 
    a.driverCode.localeCompare(b.driverCode)
  )
}

/**
 * Check if a driver raced at a specific track/round
 */
export function didDriverRaceAtTrack(
  year: number,
  round: number,
  driverCode: string,
  sessionData: SessionPayload | null
): boolean {
  // Check assignments first
  if (didDriverRaceAtRound(year, driverCode, round)) {
    return true
  }

  // Check actual session data
  if (sessionData?.drivers?.[driverCode]) {
    return true
  }

  return false
}

/**
 * Filter driver codes to only those who raced at the track
 */
export function filterDriversForTrack(
  year: number,
  round: number,
  driverCodes: string[],
  sessionData: SessionPayload | null
): string[] {
  const availableDrivers = getAvailableDriversForTrack(year, round, sessionData)
  const availableSet = new Set(availableDrivers.map(d => d.driverCode.toUpperCase()))

  return driverCodes.filter(code => 
    availableSet.has(code.toUpperCase())
  )
}
