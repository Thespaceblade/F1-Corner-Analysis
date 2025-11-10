'use client'

import React from 'react'

type CornerType = 'slow' | 'medium' | 'fast'

type CornerBadgeProps = {
  type: CornerType
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const typeColors: Record<CornerType, string> = {
  slow: '#ef4444',
  medium: '#eab308',
  fast: '#22c55e',
}

const typeLabels: Record<CornerType, string> = {
  slow: 'SLOW',
  medium: 'MEDIUM',
  fast: 'FAST',
}

export default function CornerBadge({
  type,
  showLabel = true,
  size = 'md',
  className = '',
}: CornerBadgeProps) {
  const color = typeColors[type]
  const label = typeLabels[type]

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  }

  const textSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`${sizeClasses[size]} rounded-full`}
        style={{ backgroundColor: color }}
        aria-label={`${type} corner`}
      />
      {showLabel && (
        <span
          className={`uppercase tracking-wide font-medium ${textSizeClasses[size]}`}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

