/**
 * Time formatting utilities for F1 data
 * Formats lap times, corner times, and sector times consistently
 */

export type TimeType = 'lap' | 'corner' | 'sector'

export interface FormatTimeOptions {
  precision?: number
  showUnit?: boolean
  includeMinutes?: boolean
}

/**
 * Format a time value based on type
 * @param value - Time value in seconds (or null)
 * @param type - Type of time (lap, corner, sector)
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(
  value: number | null | undefined,
  type: TimeType = 'lap',
  options: FormatTimeOptions = {}
): string {
  const { precision = 3, showUnit = false, includeMinutes } = options

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  switch (type) {
    case 'lap': {
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      const secondsInt = Math.floor(seconds)
      const milliseconds = Math.round((seconds - secondsInt) * 1000)

      // Always show minutes for lap times if > 60 seconds, or if explicitly requested
      if (minutes > 0 || includeMinutes) {
        const msStr = milliseconds.toString().padStart(3, '0')
        const result = `${minutes}:${secondsInt.toString().padStart(2, '0')}.${msStr}`
        return showUnit ? `${result} s` : result
      }

      // Format: SS.mmm (no minutes)
      const msStr = milliseconds.toString().padStart(3, '0')
      const result = `${secondsInt}.${msStr}`
      return showUnit ? `${result} s` : result
    }

    case 'corner':
    case 'sector': {
      // Format: S.mmm (always in seconds)
      const result = value.toFixed(precision)
      return showUnit ? `${result}s` : result
    }

    default:
      return value.toFixed(precision)
  }
}

/**
 * Format a lap time with minutes and seconds
 * @param value - Time value in seconds
 * @param options - Formatting options
 * @returns Formatted lap time string (M:SS.mmm)
 */
export function formatLapTime(
  value: number | null | undefined,
  options: FormatTimeOptions = {}
): string {
  return formatTime(value, 'lap', { ...options, includeMinutes: true })
}

/**
 * Format a corner time
 * @param value - Time value in seconds
 * @param options - Formatting options
 * @returns Formatted corner time string (S.mmm)
 */
export function formatCornerTime(
  value: number | null | undefined,
  options: FormatTimeOptions = {}
): string {
  return formatTime(value, 'corner', options)
}

/**
 * Format a sector time
 * @param value - Time value in seconds
 * @param options - Formatting options
 * @returns Formatted sector time string (S.mmm)
 */
export function formatSectorTime(
  value: number | null | undefined,
  options: FormatTimeOptions = {}
): string {
  return formatTime(value, 'sector', options)
}

/**
 * Parse a formatted time string back to seconds
 * Handles formats: M:SS.mmm, SS.mmm, S.mmm
 * @param timeString - Formatted time string
 * @returns Time in seconds, or null if invalid
 */
export function parseTime(timeString: string): number | null {
  if (!timeString || timeString === 'N/A') return null

  try {
    // Handle M:SS.mmm format
    if (timeString.includes(':')) {
      const [minutes, seconds] = timeString.split(':')
      return parseFloat(minutes) * 60 + parseFloat(seconds)
    }

    // Handle SS.mmm or S.mmm format
    return parseFloat(timeString)
  } catch {
    return null
  }
}

