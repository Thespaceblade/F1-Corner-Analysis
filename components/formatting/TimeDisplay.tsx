'use client'

import React from 'react'
import { formatTime, type TimeType, type FormatTimeOptions } from '../../lib/formatting'

type TimeDisplayProps = {
  value: number | null | undefined
  type?: TimeType
  precision?: number
  showUnit?: boolean
  className?: string
  variant?: 'default' | 'mono' | 'bold'
}

export default function TimeDisplay({
  value,
  type = 'lap',
  precision = 3,
  showUnit = false,
  className = '',
  variant = 'mono',
}: TimeDisplayProps) {
  const options: FormatTimeOptions = {
    precision,
    showUnit,
  }

  const formatted = formatTime(value, type, options)

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

