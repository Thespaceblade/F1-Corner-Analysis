'use client'

import React from 'react'
import { getDriverColor, getDriverName } from '../../lib/teamData'

type DriverBadgeProps = {
  code: string
  year?: number
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'chip' | 'pill'
  className?: string
}

const FALLBACK_COLOR = '#9aa4b2'

export default function DriverBadge({
  code,
  year,
  showName = false,
  size = 'md',
  variant = 'badge',
  className = '',
}: DriverBadgeProps) {
  const color = getDriverColor(code, year) ?? FALLBACK_COLOR
  const driverName = showName ? getDriverName(code) : null
  const normalizedCode = code.toUpperCase()

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const variantClasses = {
    badge: 'rounded-md',
    chip: 'rounded-full',
    pill: 'rounded-full px-4',
  }

  const baseClasses = `inline-flex items-center justify-center font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

  return (
    <span
      className={baseClasses}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
      title={driverName || normalizedCode}
    >
      {normalizedCode}
      {showName && driverName && (
        <span className="ml-2 opacity-80">{driverName}</span>
      )}
    </span>
  )
}
