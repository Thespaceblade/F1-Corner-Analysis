'use client'

import React from 'react'
import { formatDelta, getDeltaColor, type FormatDeltaOptions } from '../../lib/formatting'

type DeltaBadgeProps = {
  value: number | null | undefined
  unit?: string
  showSign?: boolean
  precision?: number
  inverted?: boolean
  variant?: 'badge' | 'text' | 'inline'
  className?: string
}

export default function DeltaBadge({
  value,
  unit = 's',
  showSign = true,
  precision = 3,
  inverted = false,
  variant = 'badge',
  className = '',
}: DeltaBadgeProps) {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className={`text-gray-500 ${className}`}>N/A</span>
  }

  const options: FormatDeltaOptions = {
    unit,
    showSign,
    precision,
    inverted,
  }

  const formattedValue = formatDelta(value, options)
  const color = getDeltaColor(value, inverted)

  if (variant === 'text') {
    return (
      <span className={className} style={{ color }}>
        {formattedValue}
      </span>
    )
  }

  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono ${className}`}
        style={{
          color,
          backgroundColor: `${color}20`,
        }}
      >
        {formattedValue}
      </span>
    )
  }

  // Default: badge variant
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-mono font-medium ${className}`}
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}40`,
      }}
    >
      {formattedValue}
    </span>
  )
}

