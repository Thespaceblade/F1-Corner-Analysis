/**
 * Number formatting utilities for F1 data
 * Formats percentages, decimals, and other numeric values
 */

export interface FormatNumberOptions {
  precision?: number
  showSign?: boolean
  showUnit?: boolean
  unit?: string
  useGrouping?: boolean // Thousands separator
}

/**
 * Format a percentage value
 * @param value - Percentage value (0-100 or 0-1)
 * @param options - Formatting options
 * @returns Formatted percentage string (e.g., "12.5%")
 */
export function formatPercentage(
  value: number | null | undefined,
  options: FormatNumberOptions = {}
): string {
  const { precision = 1, showUnit = true } = options

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  // If value is between 0 and 1, assume it's a decimal (0.125 = 12.5%)
  const percentage = value > 1 ? value : value * 100
  const formatted = percentage.toFixed(precision)
  return showUnit ? `${formatted}%` : formatted
}

/**
 * Format a number with optional sign and unit
 * @param value - Number value
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | null | undefined,
  options: FormatNumberOptions = {}
): string {
  const {
    precision = 2,
    showSign = false,
    showUnit = false,
    unit = '',
    useGrouping = false,
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  let formatted = value.toFixed(precision)

  // Add thousands separator if requested
  if (useGrouping) {
    const parts = formatted.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    formatted = parts.join('.')
  }

  // Add sign if requested and value is positive
  if (showSign && value > 0) {
    formatted = `+${formatted}`
  }

  // Add unit if requested
  if (showUnit && unit) {
    formatted = `${formatted} ${unit}`
  }

  return formatted
}

/**
 * Format a integer value
 * @param value - Integer value
 * @param options - Formatting options
 * @returns Formatted integer string
 */
export function formatInteger(
  value: number | null | undefined,
  options: Omit<FormatNumberOptions, 'precision'> = {}
): string {
  return formatNumber(value, { ...options, precision: 0 })
}

/**
 * Format a decimal value with specific precision
 * @param value - Decimal value
 * @param precision - Decimal places
 * @returns Formatted decimal string
 */
export function formatDecimal(
  value: number | null | undefined,
  precision: number = 2
): string {
  return formatNumber(value, { precision, showUnit: false })
}







