/**
 * Type definitions for Season Review functionality
 */

// ==================== Driver Season Statistics ====================

export interface DriverSeasonStats {
  driverCode: string
  teamId: string | null
  
  // Basic Stats
  totalPoints: number
  raceWins: number
  podiums: number              // Total podiums (1st, 2nd, 3rd)
  polePositions: number
  fastestLaps: number
  dnfs: number
  raceStarts: number
  racesFinished: number
  averageFinishPosition: number | null
  bestFinish: number | null
  worstFinish: number | null
  totalLapsCompleted: number
  
  // Qualifying Stats
  averageQualifyingPosition: number | null
  bestQualifyingPosition: number | null
  worstQualifyingPosition: number | null
  q3Appearances: number
  
  // Advanced Stats - Teammate Comparison
  teammateHeadToHeadQualifying: { wins: number; total: number }
  teammateHeadToHeadRace: { wins: number; total: number }
  averageQualifyingGapToTeammate: number | null  // in seconds
  averageRaceGapToTeammate: number | null       // in seconds when both finish
  pointsVsTeammate: number                      // point differential
  
  // Consistency Metrics
  finishingPositionStdDev: number | null
  pointScoringRate: number                      // % of races where points scored (0-100)
  
  // Race Performance
  averagePositionsGained: number | null         // Start pos - finish pos (positive = gained)
  overtakingRate: number | null                 // Avg positions gained per race
  
  // Performance by Track Type
  performanceByTrackType: {
    street: { avgPosition: number | null; races: number }
    traditional: { avgPosition: number | null; races: number }
    highSpeed: { avgPosition: number | null; races: number }
  }
  
  // Tyre Management
  averageStintLength: number | null
  tyreDegradationRate: number | null
}

// ==================== Team Season Statistics ====================

export interface TeamSeasonStats {
  teamId: string
  totalPoints: number
  constructorPosition: number | null
  
  // Race Performance
  oneTwo: number                    // 1-2 finishes
  doublePodium: number             // Both drivers on podium
  doublePoints: number             // Both drivers in points
  doubleDNF: number                // Both drivers DNF
  
  // Combined Stats
  totalPodiums: number
  totalWins: number
  averageFinishingPosition: number | null
  
  // Driver Comparison
  driver1: string | null            // Primary driver code
  driver2: string | null            // Secondary driver code (or null if multiple swaps)
  pointsDifference: number          // driver1 points - driver2 points
}

// ==================== Round Results ====================

export interface RoundResult {
  round: number
  trackId: string
  trackName: string
  date: string | null
  
  // Race Results
  results: RaceResultEntry[]
  
  // Qualifying Results
  qualifyingResults: QualifyingResultEntry[]
  
  // Championship Standings after this round
  driverStandings: StandingsEntry[]
  constructorStandings: ConstructorStandingsEntry[]
}

export interface RaceResultEntry {
  position: number
  driverCode: string
  teamId: string | null
  points: number
  lapsCompleted: number
  status: 'Finished' | 'DNF' | 'DNS' | 'DSQ'
  fastestLap: boolean
  gridPosition?: number            // Starting position
  timeGap?: number | null         // Gap to winner in seconds
}

export interface QualifyingResultEntry {
  position: number
  driverCode: string
  teamId: string | null            // Team ID (handles mid-season swaps)
  time: number | null              // Best qualifying time in seconds
  q1Time?: number | null
  q2Time?: number | null
  q3Time?: number | null
}

export interface StandingsEntry {
  position: number
  driverCode: string
  points: number
}

export interface ConstructorStandingsEntry {
  position: number
  teamId: string
  points: number
}

// ==================== Championship Progression ====================

export interface ChampionshipProgression {
  drivers: Record<string, ChampionshipPoint[]>
  constructors: Record<string, ChampionshipPoint[]>
}

export interface ChampionshipPoint {
  round: number
  points: number
  position: number
}

// ==================== Season Data (Main Container) ====================

export interface SeasonData {
  year: number
  drivers: Record<string, DriverSeasonStats>
  teams: Record<string, TeamSeasonStats>
  rounds: RoundResult[]
  championshipProgression: ChampionshipProgression
  
  // Metadata
  totalRaces: number
  completedRaces: number
  champion: {
    driver: string | null
    constructor: string | null
  }
}

// ==================== Head-to-Head Comparison ====================

export interface HeadToHeadStats {
  driver1: string
  driver2: string
  
  // Overall comparison
  qualifyingWins: { driver1: number; driver2: number; total: number }
  raceWins: { driver1: number; driver2: number; total: number }
  
  // Points
  pointsScored: { driver1: number; driver2: number }
  pointsDifference: number
  
  // Averages
  avgQualifyingGap: number | null   // Positive = driver1 faster
  avgRaceGap: number | null         // Positive = driver1 faster
  
  // Best/Worst
  driver1BestFinish: number | null
  driver2BestFinish: number | null
  driver1WorsFinish: number | null
  driver2WorstFinish: number | null
  
  // Race-by-race breakdown
  raceByRace: Array<{
    round: number
    trackName: string
    driver1Quali: number | null
    driver2Quali: number | null
    driver1Race: number | null
    driver2Race: number | null
    driver1Points: number
    driver2Points: number
  }>
}

// ==================== Track Performance ====================

export interface PerformanceByTrackType {
  street: TrackTypePerformance
  traditional: TrackTypePerformance
  highSpeed: TrackTypePerformance
}

export interface TrackTypePerformance {
  avgFinishPosition: number | null
  avgQualifyingPosition: number | null
  races: number
  wins: number
  podiums: number
  points: number
  dnfs: number
}

// ==================== Track Type Mapping ====================

export type TrackType = 'street' | 'traditional' | 'highSpeed'

export const trackTypeMapping: Record<string, TrackType> = {
  // Street Circuits
  'monaco': 'street',
  'singapore': 'street',
  'baku': 'street',
  'jeddah': 'street',
  'miami': 'street',
  'las-vegas': 'street',
  
  // High-Speed Circuits
  'monza': 'highSpeed',
  'spa': 'highSpeed',
  'silverstone': 'highSpeed',
  'bahrain': 'highSpeed',
  'saudi-arabia': 'highSpeed',
  
  // Traditional/Technical Circuits (default for most)
  // Everything else defaults to traditional
}

export function getTrackType(trackId: string): TrackType {
  return trackTypeMapping[trackId] ?? 'traditional'
}

// ==================== Points System ====================

export const POINTS_SYSTEM: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
}

// Calculate points based on position only (no fastest lap bonus)
export function calculatePoints(position: number, fastestLap: boolean): number {
  return POINTS_SYSTEM[position] ?? 0
}

// ==================== Utility Types ====================

export interface SeasonSummary {
  year: number
  totalRaces: number
  completedRaces: number
  driverChampion: string | null
  constructorChampion: string | null
  mostWins: { driver: string; wins: number }
  mostPoles: { driver: string; poles: number }
  mostFastestLaps: { driver: string; count: number }
  rookieOfYear: string | null
}
