'use client'

import React from 'react'
import TrendIndicator from './TrendIndicator'
import DeltaBadge from './DeltaBadge'

type MetricCardProps = {
  label: string
  value: string | number
  delta?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: string | React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  color?: string
  tooltip?: string
  unit?: string
  className?: string
}

export default function MetricCard({
  label,
  value,
  delta,
  trend,
  icon,
  size = 'md',
  color,
  tooltip,
  unit,
  className = '',
}: MetricCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const valueSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const displayValue = typeof value === 'number' 
    ? unit 
      ? `${value.toFixed(unit === 's' ? 3 : 1)}${unit}`
      : value.toString()
    : value

  return (
    <div
      className={`panel ${sizeClasses[size]} ${tooltip ? 'cursor-help' : ''} ${className}`}
      title={tooltip}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-xl flex-shrink-0">
              {typeof icon === 'string' ? icon : icon}
            </span>
          )}
          <span className="text-xs text-gray-400 font-medium">{label}</span>
        </div>
        {trend && <TrendIndicator direction={trend} size="sm" />}
      </div>
      <div
        className={`${valueSizeClasses[size]} font-bold text-gray-100 mb-1`}
        style={color ? { color } : undefined}
      >
        {displayValue}
      </div>
      {delta !== undefined && (
        <div className="mt-2">
          <DeltaBadge value={delta} unit={unit || 's'} variant="inline" />
        </div>
      )}
    </div>
  )
}

