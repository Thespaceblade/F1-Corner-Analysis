'use client'

import React, { useMemo } from 'react'
import CustomSelect from './CustomSelect'
import { getSeasonTeams, getDriverColor } from '../lib/teamData'

type SeasonControlsProps = {
  years: number[]
  selectedYear: number
  onYearChange: (year: number) => void
  /** When true, show the compact driver focus controls */
  showDriverFocus?: boolean
  selectedDrivers: string[]
  onDriversChange: (drivers: string[]) => void
  /** Optional ranked codes for Top 5 preset (championship order) */
  rankedDriverCodes?: string[]
}

/**
 * Single season control bar: championship year + optional driver focus.
 * Driver focus only matters for compare / form views, not standings.
 */
export default function SeasonControls({
  years,
  selectedYear,
  onYearChange,
  showDriverFocus = false,
  selectedDrivers,
  onDriversChange,
  rankedDriverCodes = [],
}: SeasonControlsProps) {
  const yearOptions = useMemo(
    () => years.map((y) => ({ label: String(y), value: y })),
    [years],
  )

  const seasonTeams = useMemo(() => getSeasonTeams(selectedYear), [selectedYear])

  const allCodes = useMemo(
    () => seasonTeams.flatMap((t) => t.drivers.map((d) => d.code.toUpperCase())),
    [seasonTeams],
  )

  const selectedSet = useMemo(
    () => new Set(selectedDrivers.map((c) => c.toUpperCase())),
    [selectedDrivers],
  )

  const topFive = useMemo(() => {
    if (rankedDriverCodes.length > 0) return rankedDriverCodes.slice(0, 5)
    return allCodes.slice(0, 5)
  }, [rankedDriverCodes, allCodes])

  const toggleDriver = (code: string) => {
    const normalized = code.toUpperCase()
    if (selectedSet.has(normalized)) {
      onDriversChange(selectedDrivers.filter((c) => c.toUpperCase() !== normalized))
    } else {
      onDriversChange([...selectedDrivers.map((c) => c.toUpperCase()), normalized])
    }
  }

  return (
    <div className="panel px-3 py-2.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-semibold">
            Championship
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Season year</div>
        </div>
        <CustomSelect
          options={yearOptions}
          value={selectedYear}
          onChange={(v) => onYearChange(Number(v))}
          placeholder="Year"
          placeholderValue={0}
          className="w-[108px]"
          minWidth="108px"
        />
      </div>

      {showDriverFocus && (
        <>
          <div className="hidden sm:block h-8 w-px bg-gray-800" aria-hidden="true" />

          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-semibold">
                  Compare
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {selectedDrivers.length === 0
                    ? 'Defaults to championship leaders'
                    : `${selectedDrivers.length} focused`}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onDriversChange(topFive)}
                  className="rounded-md border border-gray-700 px-2 py-1 text-[11px] font-medium text-gray-400 transition hover:border-accent/40 hover:text-accent"
                >
                  Top 5
                </button>
                <button
                  type="button"
                  onClick={() => onDriversChange(allCodes)}
                  className="rounded-md border border-gray-700 px-2 py-1 text-[11px] font-medium text-gray-400 transition hover:border-accent/40 hover:text-accent"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => onDriversChange([])}
                  className="rounded-md border border-gray-700 px-2 py-1 text-[11px] font-medium text-gray-400 transition hover:border-accent/40 hover:text-accent"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {allCodes.map((code) => {
                const active = selectedSet.has(code)
                const color = getDriverColor(code, selectedYear) ?? '#e10600'
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleDriver(code)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                      active
                        ? 'text-gray-100'
                        : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                    style={
                      active
                        ? { backgroundColor: `${color}22`, borderColor: `${color}88` }
                        : undefined
                    }
                  >
                    {code}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
