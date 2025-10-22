'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'
import { SessionPayload } from '../lib/sessionDataClient'
import { driverColorMap } from '../lib/teamData'

type ChartPanelProps = {
  sessionData: SessionPayload | null
  selectedDrivers: string[]
  loading: boolean
  showOutliers: boolean
}

type ChartDatum = {
  lapNumber: number
  [driverCode: string]: number | null | number[]
}

const FALLBACK_COLORS = [
  '#7cc7ff',
  '#22c55e',
  '#facc15',
  '#f97316',
  '#a855f7',
  '#f87171'
]

const getDriverColor = (code: string, index: number) => {
  const normalized = code.toUpperCase()
  return driverColorMap[normalized] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

const buildChartData = (
  sessionData: SessionPayload | null,
  driverCodes: string[],
  showOutliers: boolean,
): ChartDatum[] => {
  if (!sessionData || !driverCodes.length) return []

  const driversSet = new Set(driverCodes.map(code => code.toUpperCase()))
  const lapsByNumber = new Map<number, ChartDatum>()

  for (const lap of sessionData.laps) {
    if (!lap || lap.lapNumber == null) continue
    if (!showOutliers && lap.isValid === false) continue
    const normalizedDriver = lap.driver?.toUpperCase()
    if (!driversSet.has(normalizedDriver)) continue

    const lapNumber = Number(lap.lapNumber)
    if (Number.isNaN(lapNumber)) continue

    const existing = lapsByNumber.get(lapNumber) ?? { lapNumber }
    existing[normalizedDriver] = typeof lap.lapTimeSeconds === 'number' ? lap.lapTimeSeconds : null
    lapsByNumber.set(lapNumber, existing)
  }

  return Array.from(lapsByNumber.values()).sort((a, b) => a.lapNumber - b.lapNumber)
}

const computeYDomain = (data: ChartDatum[], drivers: string[]): [number, number] | undefined => {
  let min = Infinity
  let max = -Infinity

  data.forEach(entry => {
    drivers.forEach(code => {
      const value = entry[code.toUpperCase()]
      if (typeof value === 'number' && !Number.isNaN(value)) {
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    })
  })

  if (min === Infinity || max === -Infinity) {
    return undefined
  }

  const padding = Math.max((max - min) * 0.05, 0.3)
  return [Math.max(min - padding, 0), max + padding]
}

const formatLapTime = (value: unknown): string => {
  if (value == null || value === '') return '-'
  if (Array.isArray(value)) {
    return value.map(item => formatLapTime(item)).join(', ')
  }
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return '-'
  return `${numeric.toFixed(3)} s`
}

export default function ChartPanel({ sessionData, selectedDrivers, loading, showOutliers }: ChartPanelProps) {
  const normalizedSelectedDrivers = useMemo(
    () => selectedDrivers.map(code => code.toUpperCase()),
    [selectedDrivers]
  )

  const availableDrivers = useMemo(() => {
    if (!sessionData) return []
    const driversFromData = Object.keys(sessionData.drivers ?? {})
    return driversFromData.map(code => code.toUpperCase())
  }, [sessionData])

  const driversToDisplay = useMemo(() => {
    if (!sessionData) return []
    const filtered = normalizedSelectedDrivers.filter(code => sessionData.drivers?.[code])

    if (filtered.length > 0) {
      return filtered
    }

    return availableDrivers.slice(0, 4)
  }, [availableDrivers, normalizedSelectedDrivers, sessionData])

  const chartData = useMemo(
    () => buildChartData(sessionData, driversToDisplay, showOutliers),
    [sessionData, driversToDisplay, showOutliers]
  )

  const yDomain = useMemo(
    () => computeYDomain(chartData, driversToDisplay),
    [chartData, driversToDisplay]
  )

  const showNoSelectionMessage =
    !normalizedSelectedDrivers.length ||
    (normalizedSelectedDrivers.length > 0 &&
      !driversToDisplay.some(code => normalizedSelectedDrivers.includes(code)))

  return (
    <div className="mt-6 panel p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Lap Time Comparison</h2>
          <p className="text-xs text-gray-500">
            Lap times pulled from FastF1 telemetry. Values plotted in seconds.
          </p>
        </div>
        {sessionData?.meta?.event?.name && (
          <div className="text-right text-xs text-gray-400">
            <div>{sessionData.meta.event.name}</div>
            {sessionData.meta.event.country && <div>{sessionData.meta.event.country}</div>}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Loading session telemetry…
        </div>
      )}

      {!loading && !sessionData && (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Select a track and session to load telemetry.
        </div>
      )}

      {!loading && sessionData && showNoSelectionMessage && (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-gray-400">
          <span>
            Telemetry for the selected drivers is not available in the current dataset. Choose
            another driver or regenerate data.
          </span>
          {availableDrivers.length > 0 && (
            <span className="text-xs text-gray-500">
              Available drivers: {availableDrivers.join(', ')}
            </span>
          )}
        </div>
      )}

      {!loading && sessionData && !chartData.length && !showNoSelectionMessage && (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          No lap times to display for the current selection.
        </div>
      )}

      {!loading && sessionData && chartData.length > 0 && !showNoSelectionMessage && (
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 12, left: 6, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 6" className="chart-grid" />
              <XAxis
                dataKey="lapNumber"
                stroke="#9aa4b2"
                label={{ value: 'Lap', position: 'insideBottomRight', offset: -4 }}
              />
              <YAxis
                stroke="#9aa4b2"
                domain={yDomain}
                width={60}
                tickFormatter={(value: number) => value.toFixed(1)}
              />
              <Tooltip
                wrapperClassName="panel p-2"
                formatter={(value, name) =>
                  [formatLapTime(value), String(name)] as [string, string]
                }
                labelFormatter={(label) => `Lap ${label}`}
              />
              <Legend />
              {driversToDisplay.map((code, index) => (
                <Line
                  key={code}
                  name={code}
                  type="monotone"
                  dataKey={code}
                  stroke={getDriverColor(code, index)}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
