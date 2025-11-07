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
  sessionTimeSeconds?: number | null
  sectorTimesSeconds: Array<number | null>
  isPersonalBest: boolean
  trackStatus?: string | null
  hasData?: boolean
  flags?: string[]
  isValid?: boolean
}

export type QualifyingBoundaries = {
  q1Start: number
  q1End: number | null
  q2Start: number | null
  q2End: number | null
  q3Start: number | null
  q3End: number | null
}

export type CornerMetrics = {
  cornerNumber: number
  detectedCornerIndex?: number
  lapNumber: number
  entrySpeed: number
  apexSpeed: number
  exitSpeed: number
  cornerTime: number | null
  brakingDistance: number
  accelerationDistance: number
  entryDistance: number
  apexDistance: number
  exitDistance: number
  minSpeed: number
  cornerType?: 'slow' | 'medium' | 'fast' | 'unknown'
}

export type SessionPayload = {
  meta: SessionMeta
  drivers: Record<string, SessionDriver>
  laps: SessionLap[]
  corners: Record<string, CornerMetrics[]>
  notes?: string[]
  qualifyingBoundaries?: QualifyingBoundaries
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
