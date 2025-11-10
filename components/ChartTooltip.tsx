'use client'

import React from 'react'
import { TooltipProps } from 'recharts'
import TyreCompoundIcon from './TyreCompoundIcon'
import { formatLapTime } from '../lib/formatting'
import TimeDisplay from './formatting/TimeDisplay'

type CustomTooltipProps = TooltipProps<number, string> & {
  compoundMap?: Map<number, Map<string, string | null>>
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
              <TimeDisplay 
                value={typeof lapTime === 'number' ? lapTime : undefined} 
                type="lap" 
                variant="default"
              />
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

