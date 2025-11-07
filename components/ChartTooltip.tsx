'use client'

import React from 'react'
import { TooltipProps } from 'recharts'
import TyreCompoundIcon from './TyreCompoundIcon'

type CustomTooltipProps = TooltipProps<number, string> & {
  compoundMap?: Map<number, Map<string, string | null>>
}

const formatLapTime = (value: unknown): string => {
  if (value == null || value === '') return '-'
  if (Array.isArray(value)) {
    return value.map(item => formatLapTime(item)).join(', ')
  }
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return '-'
  
  const minutes = Math.floor(numeric / 60)
  const seconds = numeric % 60
  const secondsInt = Math.floor(seconds)
  const milliseconds = Math.round((seconds - secondsInt) * 1000)
  
  if (minutes > 0) {
    // Format: M:SS.mmm
    return `${minutes}:${secondsInt.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }
  // Format: SS.mmm (no minutes)
  return `${secondsInt}.${milliseconds.toString().padStart(3, '0')}`
}

export default function ChartTooltip({ active, payload, label, compoundMap }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const lapNumber = typeof label === 'number' ? label : Number(label)

  return (
    <div className="panel p-2 min-w-[120px]">
      <div className="mb-1 text-xs font-semibold text-gray-300">Lap {lapNumber}</div>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const driverCode = String(entry.name || '')
          const lapTime = entry.value
          const compound = compoundMap?.get(lapNumber)?.get(driverCode.toUpperCase()) || null

          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span
                className="font-medium"
                style={{ color: entry.color || '#9aa4b2' }}
              >
                {driverCode}:
              </span>
              <span className="text-gray-200">{formatLapTime(lapTime)}</span>
              {compound && (
                <TyreCompoundIcon compound={compound} size={16} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

