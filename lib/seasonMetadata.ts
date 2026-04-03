import rawSeasonMetadata from './seasonMetadata.json'

type MetadataDriver = {
  name: string
  photoPath: string | null
}

type MetadataSeasonDriver = {
  code: string
  number: number
  startRound?: number
  endRound?: number
}

type MetadataTeam = {
  id: string
  name: string
  shortName: string
  color: string
  logoPath: string
  aliases?: string[]
  drivers: MetadataSeasonDriver[]
}

type MetadataSeason = {
  teams: MetadataTeam[]
}

type MetadataFile = {
  defaultYear: number
  drivers: Record<string, MetadataDriver>
  seasons: Record<string, MetadataSeason>
}

const seasonMetadata = rawSeasonMetadata as MetadataFile

export const DEFAULT_SEASON_YEAR = seasonMetadata.defaultYear

export interface Driver {
  code: string
  name: string
  number: number
  photoPath: string | null
  startRound?: number
  endRound?: number
}

export interface Team {
  id: string
  name: string
  shortName: string
  color: string
  logoPath: string
  aliases: string[]
  drivers: Driver[]
}

const supportedYears = Object.keys(seasonMetadata.seasons)
  .map(Number)
  .sort((a, b) => a - b)

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getSupportedSeasonYears(): number[] {
  return [...supportedYears]
}

export function resolveSeasonYear(year?: number): number {
  if (typeof year !== 'number' || Number.isNaN(year) || year <= 0) {
    return DEFAULT_SEASON_YEAR
  }

  if (supportedYears.includes(year)) {
    return year
  }

  const fallback = [...supportedYears]
    .reverse()
    .find((candidate) => candidate <= year)

  return fallback ?? supportedYears[0] ?? DEFAULT_SEASON_YEAR
}

function getMetadataSeason(year?: number): MetadataSeason {
  const resolvedYear = resolveSeasonYear(year)
  return seasonMetadata.seasons[String(resolvedYear)]
}

export function getDriverProfile(code: string): MetadataDriver | null {
  const normalized = code.toUpperCase()
  return seasonMetadata.drivers[normalized] ?? null
}

export function getSeasonTeams(year?: number): Team[] {
  const season = getMetadataSeason(year)

  return season.teams.map((team) => ({
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    color: team.color,
    logoPath: team.logoPath,
    aliases: team.aliases ?? [],
    drivers: team.drivers.map((driver) => {
      const profile = getDriverProfile(driver.code)
      return {
        code: driver.code.toUpperCase(),
        name: profile?.name ?? driver.code.toUpperCase(),
        number: driver.number,
        photoPath: profile?.photoPath ?? null,
        startRound: driver.startRound,
        endRound: driver.endRound,
      }
    }),
  }))
}

export function getTeamById(teamId: string, year?: number): Team | null {
  return getSeasonTeams(year).find((team) => team.id === teamId) ?? null
}

export function getDriverName(code: string): string | null {
  return getDriverProfile(code)?.name ?? null
}

export function getDriverPhotoPath(code: string): string | null {
  return getDriverProfile(code)?.photoPath ?? null
}

function isDriverEntryActive(driver: Driver, round?: number): boolean {
  if (typeof round !== 'number' || Number.isNaN(round)) {
    return true
  }

  const startRound = driver.startRound ?? 1
  const endRound = driver.endRound ?? Number.POSITIVE_INFINITY
  return round >= startRound && round <= endRound
}

export function getSeasonDriverEntry(
  code: string,
  year?: number,
  round?: number,
): { team: Team; driver: Driver } | null {
  const normalized = code.toUpperCase()

  for (const team of getSeasonTeams(year)) {
    const matchingDriver = team.drivers.find(
      (driver) => driver.code === normalized && isDriverEntryActive(driver, round),
    )

    if (matchingDriver) {
      return { team, driver: matchingDriver }
    }
  }

  for (const team of getSeasonTeams(year)) {
    const matchingDriver = team.drivers.find((driver) => driver.code === normalized)
    if (matchingDriver) {
      return { team, driver: matchingDriver }
    }
  }

  return null
}

export function getDriverColor(code: string, year?: number, round?: number): string | null {
  return getSeasonDriverEntry(code, year, round)?.team.color ?? null
}

export function getDriverNumber(code: string, year?: number, round?: number): number | null {
  return getSeasonDriverEntry(code, year, round)?.driver.number ?? null
}

export function getDriverColorMap(year?: number): Record<string, string> {
  const map: Record<string, string> = {}

  for (const team of getSeasonTeams(year)) {
    for (const driver of team.drivers) {
      map[driver.code] = team.color
    }
  }

  return map
}

export function getTeamIdFromName(teamName: string | null | undefined, year?: number): string | null {
  if (!teamName) {
    return null
  }

  const normalized = normalizeLabel(teamName)

  for (const team of getSeasonTeams(year)) {
    const candidates = [team.name, team.shortName, ...team.aliases]
      .filter(Boolean)
      .map(normalizeLabel)

    if (candidates.includes(normalized)) {
      return team.id
    }
  }

  for (const supportedYear of supportedYears) {
    for (const team of getSeasonTeams(supportedYear)) {
      const candidates = [team.name, team.shortName, ...team.aliases]
        .filter(Boolean)
        .map(normalizeLabel)

      if (candidates.includes(normalized)) {
        return team.id
      }
    }
  }

  return null
}
