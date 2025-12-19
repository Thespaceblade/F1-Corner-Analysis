'use client'

import React from 'react'

type TrendIndicatorProps = {
  direction: 'up' | 'down' | 'neutral'
  value?: number
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const directionColors = {
  up: '#22c55e', // Green
  down: '#ef4444', // Red
  neutral: '#9aa4b2', // Gray
}

const directionIcons = {
  up: '↗️',
  down: '↘️',
  neutral: '→',
}

export default function TrendIndicator({
  direction,
  value,
  showValue = false,
  size = 'md',
  className = '',
}: TrendIndicatorProps) {
  const color = directionColors[direction]
  const icon = directionIcons[direction]

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${className}`}
      style={{ color }}
      aria-label={`Trend: ${direction}`}
    >
      <span>{icon}</span>
      {showValue && value !== undefined && (
        <span className="font-mono">{Math.abs(value).toFixed(3)}</span>
      )}
    </span>
  )
}







