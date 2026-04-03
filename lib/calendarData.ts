import calendar2025 from '../public/data/calendar2025.json'
import calendar2026 from '../public/data/calendar2026.json'

export type CalendarRoundStatus = 'completed' | 'upcoming' | 'postponed'

export type CalendarRound = {
  round: number
  id: string
  name: string
  location: string
  date: string
  officialName: string
  country?: string
  countryCode?: string
  status?: CalendarRoundStatus
}

export type SeasonCalendar = {
  year: number
  rounds: CalendarRound[]
}

const CALENDARS: Record<number, SeasonCalendar> = {
  2025: calendar2025 as SeasonCalendar,
  2026: calendar2026 as SeasonCalendar,
}

export function getAvailableCalendarYears(): number[] {
  return Object.keys(CALENDARS)
    .map(Number)
    .sort((a, b) => a - b)
}

export function getCalendarForYear(year: number): SeasonCalendar | null {
  return CALENDARS[year] ?? null
}

export function getCalendarRound(
  year: number,
  roundId: string,
): CalendarRound | null {
  const calendar = getCalendarForYear(year)
  return calendar?.rounds.find((round) => round.id === roundId) ?? null
}
