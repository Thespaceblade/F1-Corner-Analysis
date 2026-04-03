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

export type RaceResult = {
  position: number | null
  driverCode: string
  driverNumber: number | null
  teamName: string | null
  gridPosition: number | null
  status: string
  points: number
  classifiedPosition: string | null
  time: number | null
  lapsCompleted: number | null
}

export type QualifyingResult = {
  position: number | null
  driverCode: string
  driverNumber: number | null
  teamName: string | null
  q1Time: number | null
  q2Time: number | null
  q3Time: number | null
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
  raceResults?: RaceResult[]        // FastF1 race classification
  qualifyingResults?: QualifyingResult[]  // FastF1 qualifying results
}

export type DriverDataRequest = SessionIdentifier & {
  drivers?: string[]
}

type SessionRequestErrorPayload = {
  error?: string
  details?: string
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const SESSION_REQUEST_MAX_ATTEMPTS = 3

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function createDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function createResponseError(res: Response): Promise<Error> {
  let payload: SessionRequestErrorPayload | null = null

  try {
    payload = (await res.clone().json()) as SessionRequestErrorPayload
  } catch {
    payload = null
  }

  const message = payload?.details || payload?.error || `Failed to load session data (${res.status})`
  return new Error(message)
}

export async function loadSessionData(
  request: DriverDataRequest,
  init?: RequestInit
): Promise<SessionPayload> {
  const { year, round, session, drivers } = request
  const signal = init?.signal ?? undefined
  const params = new URLSearchParams()

  if (drivers?.length) {
    params.set('drivers', drivers.join(','))
  }

  const url = `/api/sessions/${year}/${round}/${session}${params.toString() ? `?${params}` : ''}`

  for (let attempt = 1; attempt <= SESSION_REQUEST_MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url, {
        cache: 'no-cache',
        ...init,
      })

      if (!res.ok) {
        const error = await createResponseError(res)

        if (!RETRYABLE_STATUS_CODES.has(res.status) || attempt === SESSION_REQUEST_MAX_ATTEMPTS) {
          throw error
        }

        await createDelay(attempt * 400, signal)
        continue
      }

      return res.json()
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }

      if (attempt === SESSION_REQUEST_MAX_ATTEMPTS) {
        throw error instanceof Error ? error : new Error(String(error))
      }

      await createDelay(attempt * 400, signal)
    }
  }

  throw new Error('Failed to load session data')
}
