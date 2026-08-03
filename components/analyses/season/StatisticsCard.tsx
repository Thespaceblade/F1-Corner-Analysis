'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import TrendIndicator from '../../formatting/TrendIndicator'

type StatisticsCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'highlight' | 'muted'
}

export default function StatisticsCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  color = '#e10600',
  size = 'md',
  variant = 'default',
}: StatisticsCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const variantClasses = {
    default: 'border-gray-700 bg-gray-800/30',
    highlight: 'border-accent/40 bg-accent/5',
    muted: 'border-gray-800 bg-gray-900/30',
  }

  return (
    <div 
      className={`rounded-lg border backdrop-blur-sm transition-all duration-200 hover:border-accent/40 ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div 
              className="p-1.5 rounded"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon 
                className="w-4 h-4" 
                style={{ color }}
              />
            </div>
          )}
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {label}
          </div>
        </div>
        
        {trend && (
          <TrendIndicator 
            direction={trend} 
            size="sm"
          />
        )}
      </div>

      {/* Value */}
      <div className={`font-bold text-gray-100 ${valueSizeClasses[size]}`}>
        {value}
      </div>

      {/* Description or Trend Value */}
      {(description || trendValue) && (
        <div className="mt-2 text-xs text-gray-500">
          {trendValue && (
            <span className="font-medium">{trendValue}</span>
          )}
          {trendValue && description && <span> • </span>}
          {description}
        </div>
      )}
    </div>
  )
}

// ==================== Specialized Variants ====================

type ComparisonStatCardProps = {
  label: string
  value: string | number
  comparisonValue: string | number
  comparisonLabel: string
  icon?: LucideIcon
  betterWhen?: 'higher' | 'lower'
}

export function ComparisonStatCard({
  label,
  value,
  comparisonValue,
  comparisonLabel,
  icon: Icon,
  betterWhen = 'higher',
}: ComparisonStatCardProps) {
  // Determine if value is better than comparison
  const numValue = typeof value === 'number' ? value : parseFloat(String(value))
  const numComparison = typeof comparisonValue === 'number' ? comparisonValue : parseFloat(String(comparisonValue))
  
  let trend: 'up' | 'down' | 'neutral' = 'neutral'
  if (!isNaN(numValue) && !isNaN(numComparison)) {
    if (numValue > numComparison) {
      trend = betterWhen === 'higher' ? 'up' : 'down'
    } else if (numValue < numComparison) {
      trend = betterWhen === 'higher' ? 'down' : 'up'
    }
  }

  return (
    <StatisticsCard
      label={label}
      value={value}
      icon={Icon}
      trend={trend}
      description={`${comparisonLabel}: ${comparisonValue}`}
    />
  )
}

type RankingStatCardProps = {
  label: string
  value: string | number
  rank: number
  totalRanks: number
  icon?: LucideIcon
}

export function RankingStatCard({
  label,
  value,
  rank,
  totalRanks,
  icon: Icon,
}: RankingStatCardProps) {
  const getRankSuffix = (n: number) => {
    if (n === 1) return 'st'
    if (n === 2) return 'nd'
    if (n === 3) return 'rd'
    return 'th'
  }

  const rankColor = 
    rank === 1 ? '#FFD700' : // Gold
    rank === 2 ? '#C0C0C0' : // Silver
    rank === 3 ? '#CD7F32' : // Bronze
    '#e10600'

  return (
    <StatisticsCard
      label={label}
      value={value}
      icon={Icon}
      description={`${rank}${getRankSuffix(rank)} of ${totalRanks}`}
      color={rankColor}
      variant={rank <= 3 ? 'highlight' : 'default'}
    />
  )
}

type PercentageStatCardProps = {
  label: string
  numerator: number
  denominator: number
  icon?: LucideIcon
  description?: string
}

export function PercentageStatCard({
  label,
  numerator,
  denominator,
  icon: Icon,
  description,
}: PercentageStatCardProps) {
  const percentage = denominator > 0 
    ? ((numerator / denominator) * 100).toFixed(1)
    : '0.0'

  return (
    <StatisticsCard
      label={label}
      value={`${percentage}%`}
      icon={Icon}
      description={description || `${numerator} / ${denominator}`}
    />
  )
}
