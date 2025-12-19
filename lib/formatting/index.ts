/**
 * Formatting utilities index
 * Central export for all formatting functions
 */

// Time formatting
export {
  formatTime,
  formatLapTime,
  formatCornerTime,
  formatSectorTime,
  parseTime,
  type TimeType,
  type FormatTimeOptions,
} from './formatTime'

// Delta formatting
export {
  formatDelta,
  formatDeltaWithColor,
  getDeltaColor,
  getDeltaDirection,
  type FormatDeltaOptions,
} from './formatDelta'

// Speed formatting
export {
  formatSpeed,
  formatSpeedRounded,
  kmhToMph,
  mphToKmh,
  type SpeedUnit,
  type FormatSpeedOptions,
} from './formatSpeed'

// Number formatting
export {
  formatPercentage,
  formatNumber,
  formatInteger,
  formatDecimal,
  type FormatNumberOptions,
} from './formatNumber'







