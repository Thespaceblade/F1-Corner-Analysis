'use client'

import React from 'react'
import TimeDisplay from '../formatting/TimeDisplay'
import SpeedDisplay from '../formatting/SpeedDisplay'
import DeltaBadge from '../formatting/DeltaBadge'
import DriverBadge from '../formatting/DriverBadge'
import CornerBadge from '../formatting/CornerBadge'
import MetricCard from '../formatting/MetricCard'

type ChatbotStructuredDataProps = {
  data?: any
}

export default function ChatbotStructuredData({ data }: ChatbotStructuredDataProps) {
  if (!data) return null

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border-clr)] space-y-3">
      {/* Corner Number */}
      {data.cornerNumber !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Corner:</span>
          <span className="text-sm font-semibold text-gray-200">#{data.cornerNumber}</span>
          {data.cornerType && (
            <CornerBadge type={data.cornerType} size="sm" />
          )}
        </div>
      )}

      {/* Driver Code(s) */}
      {data.driverCode && typeof data.driverCode === 'string' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Driver:</span>
          <DriverBadge code={data.driverCode} size="sm" variant="badge" />
        </div>
      )}

      {Array.isArray(data.driverCodes) && data.driverCodes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Drivers:</span>
          {data.driverCodes.map((code: string, idx: number) => (
            <DriverBadge key={`${code}-${idx}`} code={code} size="sm" variant="badge" />
          ))}
        </div>
      )}

      {/* Track Info */}
      {(data.track || data.year || data.session) && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
          {data.track && <span>{data.track}</span>}
          {data.year && <span>{data.year}</span>}
          {data.session && <span>{data.session}</span>}
        </div>
      )}

      {/* Metrics */}
      {data.metrics && (
        <div className="space-y-2">
          {/* Corner Time */}
          {data.metrics.cornerTime !== undefined && (
            <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
              <span className="text-xs text-gray-400">Corner Time:</span>
              <TimeDisplay
                value={data.metrics.cornerTime}
                type="corner"
                variant="mono"
                showUnit
                className="text-sm font-semibold"
              />
            </div>
          )}

          {/* Best Time */}
          {data.metrics.best !== undefined && (
            <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
              <span className="text-xs text-gray-400">Best:</span>
              <TimeDisplay
                value={data.metrics.best}
                type="corner"
                variant="mono"
                showUnit
                className="text-sm font-semibold text-green-400"
              />
            </div>
          )}

          {/* Average Time */}
          {data.metrics.average !== undefined && (
            <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
              <span className="text-xs text-gray-400">Average:</span>
              <TimeDisplay
                value={data.metrics.average}
                type="corner"
                variant="mono"
                showUnit
                className="text-sm font-semibold"
              />
            </div>
          )}

          {/* Delta */}
          {data.metrics.delta !== undefined && (
            <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
              <span className="text-xs text-gray-400">Delta:</span>
              <DeltaBadge
                value={data.metrics.delta}
                unit="s"
                variant="inline"
              />
            </div>
          )}

          {/* Speeds */}
          {data.metrics.speeds && (
            <div className="space-y-1.5 p-2 rounded bg-gray-800/50">
              <div className="text-xs text-gray-400 mb-1.5">Speeds:</div>
              <div className="space-y-1 text-xs">
                {data.metrics.speeds.entry !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Entry:</span>
                    <SpeedDisplay
                      value={data.metrics.speeds.entry}
                      rounded
                      variant="default"
                      className="text-xs"
                    />
                  </div>
                )}
                {data.metrics.speeds.apex !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Apex:</span>
                    <SpeedDisplay
                      value={data.metrics.speeds.apex}
                      rounded
                      variant="default"
                      className="text-xs"
                    />
                  </div>
                )}
                {data.metrics.speeds.exit !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Exit:</span>
                    <SpeedDisplay
                      value={data.metrics.speeds.exit}
                      rounded
                      variant="default"
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

