/**
 * Delta formatting utilities for F1 data
 * Formats time/speed deltas with color coding and signs
 */

export interface FormatDeltaOptions {
  unit?: string
  showSign?: boolean
  precision?: number
  inverted?: boolean // Invert color logic (positive = good)
}

/**
 * Get color for delta value
 * Green for negative (faster/better), red for positive (slower/worse)
 * @param value - Delta value
 * @param inverted - If true, invert the color logic (positive = green)
 * @returns Color hex code
 */
export function getDeltaColor(value: number, inverted: boolean = false): string {
  if (value === 0) return '#9aa4b2' // Gray for neutral

  if (inverted) {
    // Positive = good (green), negative = bad (red)
    return value > 0 ? '#22c55e' : '#ef4444'
  } else {
    // Negative = good (faster, green), positive = bad (slower, red)
    return value < 0 ? '#22c55e' : '#ef4444'
  }
}

/**
 * Format a delta value with sign and unit
 * @param value - Delta value
 * @param options - Formatting options
 * @returns Formatted delta string (e.g., "+0.123s" or "-0.045s")
 */
export function formatDelta(
  value: number | null | undefined,
  options: FormatDeltaOptions = {}
): string {
  const {
    unit = 's',
    showSign = true,
    precision = 3,
    inverted = false,
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  const sign = value > 0 && showSign ? '+' : ''
  const formattedValue = value.toFixed(precision)
  return `${sign}${formattedValue}${unit}`
}

/**
 * Format delta with color information
 * @param value - Delta value
 * @param options - Formatting options
 * @returns Object with formatted string and color
 */
export function formatDeltaWithColor(
  value: number | null | undefined,
  options: FormatDeltaOptions = {}
): { text: string; color: string } {
  const text = formatDelta(value, options)
  const color =
    value !== null && value !== undefined && !isNaN(value)
      ? getDeltaColor(value, options.inverted)
      : '#9aa4b2'

  return { text, color }
}

/**
 * Get delta indicator (up/down/neutral arrow)
 * @param value - Delta value
 * @param inverted - If true, invert the direction logic
 * @returns Arrow direction
 */
export function getDeltaDirection(
  value: number | null | undefined,
  inverted: boolean = false
): 'up' | 'down' | 'neutral' {
  if (value === null || value === undefined || isNaN(value) || value === 0) {
    return 'neutral'
  }

  if (inverted) {
    return value > 0 ? 'up' : 'down'
  } else {
    // Negative delta (faster) is good = up, positive (slower) is bad = down
    return value < 0 ? 'up' : 'down'
  }
}

