import { SeasonData } from './seasonTypes'

/**
 * Derives per-track (per-round) performance rows for a single driver or a single
 * team from an already-loaded {@link SeasonData}. Keeps the teams/drivers pages
 * thin and avoids duplicating the filtering logic that lives in the season
 * track-by-track view.
 */

export interface DriverTrackRow {
  round: number
  trackId: string
  trackName: string
  qualiPosition: number | null
  racePosition: number | null
  points: number
  status: string
  positionsGained: number | null
  fastestLap: boolean
}

export function getDriverTrackRows(
  seasonData: SeasonData,
  driverCode: string,
): DriverTrackRow[] {
  const code = driverCode.toUpperCase()

  return seasonData.rounds.map((round) => {
    const qualiResult = round.qualifyingResults.find((q) => q.driverCode === code)
    const raceResult = round.results.find((r) => r.driverCode === code)

    const positionsGained =
      raceResult?.gridPosition && raceResult.position
        ? raceResult.gridPosition - raceResult.position
        : null

    return {
      round: round.round,
      trackId: round.trackId,
      trackName: round.trackName,
      qualiPosition: qualiResult?.position ?? null,
      racePosition: raceResult?.position ?? null,
      points: raceResult?.points ?? 0,
      status: raceResult?.status ?? 'N/A',
      positionsGained,
      fastestLap: raceResult?.fastestLap ?? false,
    }
  })
}

export interface TeamTrackDriverCell {
  driverCode: string
  qualiPosition: number | null
  racePosition: number | null
  points: number
  status: string
  fastestLap: boolean
}

export interface TeamTrackRow {
  round: number
  trackId: string
  trackName: string
  drivers: TeamTrackDriverCell[]
  totalPoints: number
  bestFinish: number | null
  oneTwo: boolean
  doublePoints: boolean
  doublePodium: boolean
}

export function getTeamTrackRows(
  seasonData: SeasonData,
  teamId: string,
): TeamTrackRow[] {
  return seasonData.rounds.map((round) => {
    const raceEntries = round.results.filter((r) => r.teamId === teamId)

    const drivers: TeamTrackDriverCell[] = raceEntries
      .map((entry) => {
        const qualiResult = round.qualifyingResults.find(
          (q) => q.driverCode === entry.driverCode,
        )
        return {
          driverCode: entry.driverCode,
          qualiPosition: qualiResult?.position ?? null,
          racePosition: entry.position ?? null,
          points: entry.points ?? 0,
          status: entry.status,
          fastestLap: entry.fastestLap,
        }
      })
      .sort((a, b) => (a.racePosition ?? 999) - (b.racePosition ?? 999))

    const totalPoints = drivers.reduce((sum, d) => sum + d.points, 0)

    const finishes = drivers
      .map((d) => d.racePosition)
      .filter((p): p is number => p != null)
    const bestFinish = finishes.length > 0 ? Math.min(...finishes) : null

    const finishedPositions = drivers
      .filter((d) => d.status === 'Finished' && d.racePosition != null)
      .map((d) => d.racePosition as number)
    const oneTwo =
      finishedPositions.includes(1) && finishedPositions.includes(2)

    const inPoints = drivers.filter(
      (d) => d.racePosition != null && d.racePosition <= 10,
    )
    const doublePoints = inPoints.length >= 2

    const onPodium = drivers.filter(
      (d) => d.racePosition != null && d.racePosition <= 3,
    )
    const doublePodium = onPodium.length >= 2

    return {
      round: round.round,
      trackId: round.trackId,
      trackName: round.trackName,
      drivers,
      totalPoints,
      bestFinish,
      oneTwo,
      doublePoints,
      doublePodium,
    }
  })
}
