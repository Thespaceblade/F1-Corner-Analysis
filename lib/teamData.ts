import {
  DEFAULT_SEASON_YEAR,
  type Driver,
  type Team,
  getDriverColor,
  getDriverColorMap,
  getDriverName,
  getSeasonTeams,
  getSupportedSeasonYears,
  getTeamById,
  getTeamIdFromName,
  resolveSeasonYear,
} from './seasonMetadata'

export type { Driver, Team }

export const f1Teams: Team[] = getSeasonTeams(DEFAULT_SEASON_YEAR)
export const driverColorMap: Record<string, string> = getDriverColorMap(DEFAULT_SEASON_YEAR)

export {
  DEFAULT_SEASON_YEAR,
  getDriverColor,
  getDriverColorMap,
  getDriverName,
  getSeasonTeams,
  getSupportedSeasonYears,
  getTeamById,
  getTeamIdFromName,
  resolveSeasonYear,
}
