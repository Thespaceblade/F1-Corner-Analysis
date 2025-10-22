export type SessionIdentifier = {
  year: number
  round: string
  session: string
}

export type SessionMeta = {
  year: number
  round: string
  session: string
  generatedAt?: string
  requestedDrivers?: string[] | null
  filteredDrivers?: string[]
  missingDrivers?: string[]
  status?: string
  event?: {
    name?: string | null
    country?: string | null
    officialName?: string | null
  }
  availableDrivers?: string[]
  totalLapCount?: number
  validLapCount?: number
  outlierLapCount?: number
}

export type SessionDriver = {
  code: string
  team?: string | null
  number?: number | null
  defaultCompound?: string | null
}

export type SessionLap = {
  driver: string
  lapNumber: number | null
  stint: number | null
  compound?: string | null
  tyreLife?: number | null
  lapTimeSeconds: number | null
  sectorTimesSeconds: Array<number | null>
  isPersonalBest: boolean
  trackStatus?: string | null
  hasData?: boolean
  flags?: string[]
  isValid?: boolean
}

export type SessionPayload = {
  meta: SessionMeta
  drivers: Record<string, SessionDriver>
  laps: SessionLap[]
  corners: Record<string, unknown[]>
  notes?: string[]
}

export type DriverDataRequest = SessionIdentifier & {
  drivers?: string[]
}

export async function loadSessionData(
  request: DriverDataRequest,
  init?: RequestInit
): Promise<SessionPayload> {
  const { year, round, session, drivers } = request
  const params = new URLSearchParams()

  if (drivers?.length) {
    params.set('drivers', drivers.join(','))
  }

  const url = `/api/sessions/${year}/${round}/${session}${params.toString() ? `?${params}` : ''}`
  const res = await fetch(url, {
    cache: 'no-cache',
    ...init,
  })

  if (!res.ok) {
    throw new Error(`Failed to load session data (${res.status})`)
  }

  return res.json()
}
