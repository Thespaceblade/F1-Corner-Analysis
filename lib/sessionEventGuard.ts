/**
 * Guard against silent FastF1 slug mismatches (e.g. great-britain → Austrian GP).
 * Shared by season aggregation and the session API proxy.
 */

export type EventMatchRound = {
  id: string
  name: string
  location: string
}

export type EventMatchSession = {
  meta?: {
    event?: {
      name?: string | null
      officialName?: string | null
      country?: string | null
    } | null
    status?: string | null
  } | null
}

/** Tokens used to verify a session.json actually belongs to the expected round. */
export const ROUND_EVENT_ALIASES: Record<string, string[]> = {
  australia: ['australian', 'melbourne'],
  china: ['chinese', 'shanghai'],
  japan: ['japanese', 'suzuka'],
  bahrain: ['bahrain', 'sakhir', 'sepang', 'malaysia', 'kuala lumpur'],
  'saudi-arabia': ['saudi', 'jeddah'],
  miami: ['miami'],
  canada: ['canadian', 'montreal', 'canada'],
  monaco: ['monaco', 'monte carlo'],
  'barcelona-catalunya': ['barcelona', 'catalunya'],
  spain: ['spanish', 'barcelona', 'catalunya'],
  austria: ['austrian', 'spielberg', 'austria'],
  'great-britain': ['british', 'silverstone', 'great britain'],
  belgium: ['belgian', 'spa'],
  hungary: ['hungarian', 'budapest'],
  netherlands: ['dutch', 'zandvoort', 'netherlands'],
  italy: ['italian', 'monza'],
  madrid: ['madrid', 'spanish'],
  azerbaijan: ['azerbaijan', 'baku'],
  singapore: ['singapore'],
  'united-states': ['united states', 'austin', 'americas'],
  mexico: ['mexico', 'méxico', 'mexico city'],
  brazil: ['brazil', 'são paulo', 'sao paulo'],
  'las-vegas': ['las vegas', 'vegas'],
  qatar: ['qatar', 'lusail'],
  'abu-dhabi': ['abu dhabi', 'yas marina'],
  'emilia-romagna': ['emilia', 'romagna', 'imola'],
}

/**
 * Return true when session event metadata looks like it belongs to `round`.
 * Catches silent data bugs (e.g. British GP files that still say Austrian GP).
 */
export function sessionMatchesRound(
  session: EventMatchSession,
  round: EventMatchRound
): boolean {
  const eventName = (session.meta?.event?.name || '').trim()
  const officialName = (session.meta?.event?.officialName || '').trim()
  const haystack = `${eventName} ${officialName}`.toLowerCase()
  if (!haystack.trim()) return true

  const aliases = ROUND_EVENT_ALIASES[round.id] ?? []
  const tokens = [
    ...aliases,
    round.name.replace(/ grand prix$/i, ''),
    round.location,
    round.id.replace(/-/g, ' '),
  ]
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length >= 3)

  // Word-boundary match so "austria" does not hit "australian".
  return tokens.some((token) => {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack)
  })
}

export function describeSessionEvent(session: EventMatchSession): string {
  return (
    session.meta?.event?.name ||
    session.meta?.event?.officialName ||
    'unknown event'
  )
}
