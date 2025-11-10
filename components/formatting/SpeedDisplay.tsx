'use client'

import React from 'react'
import { formatSpeed, type SpeedUnit, type FormatSpeedOptions } from '../../lib/formatting'

type SpeedDisplayProps = {
  value: number | null | undefined
  unit?: SpeedUnit
  precision?: number
  showUnit?: boolean
  rounded?: boolean
  className?: string
  variant?: 'default' | 'mono' | 'bold'
}

export default function SpeedDisplay({
  value,
  unit = 'km/h',
  precision = 1,
  showUnit = true,
  rounded = false,
  className = '',
  variant = 'default',
}: SpeedDisplayProps) {
  const options: FormatSpeedOptions = {
    unit,
    precision: rounded ? 0 : precision,
    showUnit,
  }

  const formatted = formatSpeed(value, options)

  const variantClasses = {
    default: 'text-gray-200',
    mono: 'font-mono text-gray-200',
    bold: 'font-mono font-bold text-gray-100',
  }

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {formatted}
    </span>
  )
}

