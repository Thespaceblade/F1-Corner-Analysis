'use client'

import React from 'react'
import { driverColorMap, f1Teams } from '../../lib/teamData'

type DriverBadgeProps = {
  code: string
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'chip' | 'pill'
  className?: string
}

const FALLBACK_COLOR = '#9aa4b2'

function getDriverName(code: string): string | null {
  const normalized = code.toUpperCase()
  for (const team of f1Teams) {
    const driver = team.drivers.find(d => d.code.toUpperCase() === normalized)
    if (driver) return driver.name
  }
  return null
}

function getDriverColor(code: string): string {
  const normalized = code.toUpperCase()
  return driverColorMap[normalized] || FALLBACK_COLOR
}

export default function DriverBadge({
  code,
  showName = false,
  size = 'md',
  variant = 'badge',
  className = '',
}: DriverBadgeProps) {
  const color = getDriverColor(code)
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

