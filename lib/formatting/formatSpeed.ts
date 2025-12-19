/**
 * Speed formatting utilities for F1 data
 * Formats speed values with units (km/h or mph)
 */

export type SpeedUnit = 'km/h' | 'mph'

export interface FormatSpeedOptions {
  unit?: SpeedUnit
  precision?: number
  showUnit?: boolean
}

/**
 * Convert km/h to mph
 * @param kmh - Speed in km/h
 * @returns Speed in mph
 */
export function kmhToMph(kmh: number): number {
  return kmh * 0.621371
}

/**
 * Convert mph to km/h
 * @param mph - Speed in mph
 * @returns Speed in km/h
 */
export function mphToKmh(mph: number): number {
  return mph * 1.60934
}

/**
 * Format a speed value with unit
 * @param value - Speed value (assumed to be in km/h if unit not specified)
 * @param options - Formatting options
 * @returns Formatted speed string (e.g., "180.5 km/h")
 */
export function formatSpeed(
  value: number | null | undefined,
  options: FormatSpeedOptions = {}
): string {
  const { unit = 'km/h', precision = 1, showUnit = true } = options

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  // Convert if needed (assuming input is always in km/h)
  let displayValue = value
  if (unit === 'mph') {
    displayValue = kmhToMph(value)
  }

  const formatted = displayValue.toFixed(precision)
  return showUnit ? `${formatted} ${unit}` : formatted
}

/**
 * Format speed with rounding to nearest integer (common for F1)
 * @param value - Speed value in km/h
 * @param options - Formatting options
 * @returns Formatted speed string
 */
export function formatSpeedRounded(
  value: number | null | undefined,
  options: FormatSpeedOptions = {}
): string {
  return formatSpeed(value, { ...options, precision: 0 })
}







