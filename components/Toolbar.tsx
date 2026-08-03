'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getSeasonTeams } from '../lib/teamData'
import { getCountryFlagIcon } from '../lib/countryFlags'
import CustomSelect from './CustomSelect'
import { getAvailableDriversForTrack } from '../lib/trackDrivers'
import type { SessionPayload } from '../lib/sessionDataClient'
import { getDriverPhoto } from '../lib/driverPhotos'

type ToolbarProps = {
  mode?: 'race' | 'season'
  tracks: Array<{
    id: string
    name: string
    countryCode?: string
    disabled?: boolean
    status?: 'completed' | 'upcoming' | 'postponed'
    meta?: string
  }>
  selectedTrack: string
  onTrackChangeAction: (trackId: string) => void
  years: number[]
  selectedYear: number
  onYearChangeAction: (year: number) => void
  selectedDrivers: string[]
  onDriversChangeAction: (drivers: string[]) => void
  selectedSession: string
  onSessionChangeAction: (sessionCode: string) => void
  availableSessions?: string[]
  roundNumber?: number | null
  sessionData?: SessionPayload | null
}

export const sessionOptions = [
  { label: 'Qualifying', value: 'Q' },
  { label: 'Race', value: 'R' },
  { label: 'Sprint Qualifying', value: 'SQ' },
  { label: 'Sprint', value: 'S' },
]

function driverSetsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const setB = new Set(b.map((c) => c.toUpperCase()))
  return a.every((c) => setB.has(c.toUpperCase()))
}

// Driver profile picture component for dropdown
function DriverProfilePic({ driverCode, className = "w-8 h-8" }: { driverCode: string; className?: string }) {
  const photoSrc = getDriverPhoto(driverCode)
  
  return (
    <div className={`${className} rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 flex-shrink-0`}>
      <img
        src={photoSrc}
        alt={driverCode}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to placeholder on error
          e.currentTarget.src = '/logos/f1 car.png'
        }}
      />
    </div>
  )
}

export default function Toolbar({
  mode = 'race',
  tracks,
  selectedTrack,
  onTrackChangeAction,
  years,
  selectedYear,
  onYearChangeAction,
  selectedDrivers,
  onDriversChangeAction,
  selectedSession,
  onSessionChangeAction,
  availableSessions = [],
  roundNumber,
  sessionData,
}: ToolbarProps) {
  // Driver dropdown state
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const selectedSet = useMemo(
    () => new Set(selectedDrivers.map((code) => code.toUpperCase())),
    [selectedDrivers]
  )
  const seasonTeams = useMemo(() => getSeasonTeams(selectedYear), [selectedYear])

  // Get available drivers for the selected track
  const availableDriversForTrack = useMemo(() => {
    if (!selectedTrack || !selectedYear || roundNumber === null || roundNumber === undefined) {
      // If no track selected, show all drivers
      return new Set<string>()
    }
    
    const drivers = getAvailableDriversForTrack(selectedYear, roundNumber, sessionData ?? null)
    return new Set(drivers.map(d => d.driverCode.toUpperCase()))
  }, [selectedTrack, selectedYear, roundNumber, sessionData])

  // Filter teams to only show those with drivers who raced at this track
  const filteredTeams = useMemo(() => {
    if (availableDriversForTrack.size === 0) {
      // If no track selected or no available drivers, show all teams
      return seasonTeams
    }

    // Get team assignments for each available driver
    const driverTeamMap = new Map<string, string>()
    const driverInfoMap = new Map<string, { code: string; name: string; number: number }>()
    
    if (selectedTrack && selectedYear && roundNumber !== null && roundNumber !== undefined) {
      const drivers = getAvailableDriversForTrack(selectedYear, roundNumber, sessionData ?? null)
      for (const driver of drivers) {
        const driverCode = driver.driverCode.toUpperCase()
        if (driver.teamId) {
          driverTeamMap.set(driverCode, driver.teamId)
        }
        
        // Get driver info from teamData (has proper names) or session data
        let driverInfo: { code: string; name: string; number: number } | null = null
        
        // Try to find in teamData first (has proper names)
        for (const team of seasonTeams) {
          const teamDriver = team.drivers.find(d => d.code.toUpperCase() === driverCode)
          if (teamDriver) {
            driverInfo = teamDriver
            break
          }
        }
        
        // If not found in teamData, use session data
        if (!driverInfo && sessionData?.drivers?.[driverCode]) {
          const sessionDriver = sessionData.drivers[driverCode]
          driverInfo = {
            code: driverCode,
            name: driverCode, // Will use code as display name
            number: sessionDriver.number || 0
          }
        }
        
        // Fallback if still not found
        if (!driverInfo) {
          driverInfo = {
            code: driverCode,
            name: driverCode,
            number: 0
          }
        }
        
        driverInfoMap.set(driverCode, driverInfo)
      }
    }

    // Build teams dynamically based on actual drivers who raced
    type TeamWithDynamicDrivers = Omit<typeof seasonTeams[number], 'drivers'> & { 
      drivers: Array<{ code: string; name: string; number: number }> 
    }
    const teamsByTeamId = new Map<string, TeamWithDynamicDrivers>()
    
    // Initialize with all teams from f1Teams (to get team metadata)
    for (const team of seasonTeams) {
      teamsByTeamId.set(team.id, {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        color: team.color,
        logoPath: team.logoPath,
        aliases: team.aliases,
        drivers: []
      })
    }
    
    // Add drivers to their assigned teams based on actual race data
    for (const [driverCode, teamId] of driverTeamMap.entries()) {
      if (!teamId) continue
      
      const team = teamsByTeamId.get(teamId)
      if (!team) continue
      
      // Get driver info
      const driverInfo = driverInfoMap.get(driverCode) || {
        code: driverCode,
        name: driverCode,
        number: 0
      }
      
      // Only add if not already in the list
      if (!team.drivers.some(d => d.code.toUpperCase() === driverCode)) {
        team.drivers.push(driverInfo)
      }
    }
    
    // Convert to array and filter out teams with no drivers
    return Array.from(teamsByTeamId.values())
      .filter(team => team.drivers.length > 0)
      .sort((a, b) => {
        // Sort teams in a consistent order (use original f1Teams order)
        const aIndex = seasonTeams.findIndex(t => t.id === a.id)
        const bIndex = seasonTeams.findIndex(t => t.id === b.id)
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
      })
  }, [availableDriversForTrack, roundNumber, seasonTeams, selectedTrack, selectedYear, sessionData])

  // Position dropdown below button
  useEffect(() => {
    if (activeTeam && buttonRefs.current[activeTeam]) {
      const btn = buttonRefs.current[activeTeam]!
      const rect = btn.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      })
    } else {
      setDropdownPos(null)
    }
  }, [activeTeam])

  // Close on click outside
  useEffect(() => {
    if (!activeTeam) return

    const handleClick = (e: MouseEvent) => {
      const btn = buttonRefs.current[activeTeam]
      const dropdown = dropdownRef.current
      const target = e.target as Node

      if (btn && !btn.contains(target) && dropdown && !dropdown.contains(target)) {
        setActiveTeam(null)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [activeTeam])

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveTeam(null)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  // Toggle driver selection
  const toggleDriver = (code: string) => {
    const normalized = code.toUpperCase()
    if (selectedSet.has(normalized)) {
      onDriversChangeAction(selectedDrivers.filter((c) => c.toUpperCase() !== normalized))
    } else {
      onDriversChangeAction([...selectedDrivers.map((c) => c.toUpperCase()), normalized])
    }
  }

  const toggleTeamDrivers = (codes: string[]) => {
    const availableCodes = codes
      .map((code) => code.toUpperCase())
      .filter(
        (code) =>
          availableDriversForTrack.size === 0 || availableDriversForTrack.has(code)
      )
    if (availableCodes.length === 0) return

    const allSelected = availableCodes.every((c) => selectedSet.has(c))
    if (allSelected) {
      const remove = new Set(availableCodes)
      onDriversChangeAction(selectedDrivers.filter((c) => !remove.has(c.toUpperCase())))
    } else {
      const next = new Set(selectedDrivers.map((c) => c.toUpperCase()))
      for (const code of availableCodes) next.add(code)
      onDriversChangeAction(Array.from(next))
    }
  }

  /** Session classification order (P1 → last), used for Top N presets */
  const rankedDriverCodes = useMemo(() => {
    const isQualifying = selectedSession === 'Q' || selectedSession === 'SQ'
    const results = isQualifying
      ? sessionData?.qualifyingResults
      : sessionData?.raceResults

    if (results && results.length > 0) {
      return [...results]
        .filter((r) => r.driverCode && r.position != null && r.position > 0)
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
        .map((r) => r.driverCode.toUpperCase())
    }

    // Fallback when results aren't loaded yet: session drivers / track roster
    if (sessionData?.drivers) {
      return Object.keys(sessionData.drivers).map((c) => c.toUpperCase())
    }
    if (availableDriversForTrack.size > 0) {
      return Array.from(availableDriversForTrack)
    }
    return filteredTeams.flatMap((team) => team.drivers.map((d) => d.code.toUpperCase()))
  }, [
    availableDriversForTrack,
    filteredTeams,
    selectedSession,
    sessionData?.drivers,
    sessionData?.qualifyingResults,
    sessionData?.raceResults,
  ])

  const allDriverCodes = useMemo(() => {
    if (rankedDriverCodes.length > 0) return rankedDriverCodes
    return filteredTeams.flatMap((team) => team.drivers.map((d) => d.code.toUpperCase()))
  }, [filteredTeams, rankedDriverCodes])

  type DriverPresetId = 'all' | 'top3' | 'top5' | 'top10' | 'clear'

  const driverPresets = useMemo(() => {
    const presets: Array<{
      id: DriverPresetId
      label: string
      title: string
      disabled?: boolean
      codes: string[]
    }> = [
      {
        id: 'all',
        label: 'All',
        title: 'Select every driver in this session',
        disabled: allDriverCodes.length === 0,
        codes: allDriverCodes,
      },
      {
        id: 'top3',
        label: 'Top 3',
        title: 'Select podium finishers (P1–P3)',
        disabled: rankedDriverCodes.length === 0,
        codes: rankedDriverCodes.slice(0, 3),
      },
      {
        id: 'top5',
        label: 'Top 5',
        title: 'Select classification P1–P5',
        disabled: rankedDriverCodes.length === 0,
        codes: rankedDriverCodes.slice(0, 5),
      },
      {
        id: 'top10',
        label: 'Top 10',
        title: 'Select classification P1–P10',
        disabled: rankedDriverCodes.length === 0,
        codes: rankedDriverCodes.slice(0, 10),
      },
      {
        id: 'clear',
        label: 'Clear',
        title: 'Clear driver selection',
        disabled: selectedDrivers.length === 0,
        codes: [],
      },
    ]
    return presets
  }, [allDriverCodes, rankedDriverCodes, selectedDrivers.length])

  const activePresetId = useMemo((): DriverPresetId | null => {
    if (selectedDrivers.length === 0) return 'clear'
    for (const preset of driverPresets) {
      if (preset.id === 'clear') continue
      if (driverSetsEqual(selectedDrivers, preset.codes)) return preset.id
    }
    return null
  }, [driverPresets, selectedDrivers])

  // Select options
  const yearOptions = useMemo(
    () => [{ value: 0, label: 'Year' }, ...years.map((y) => ({ value: y, label: String(y) }))],
    [years]
  )

  const trackOptions = useMemo(
    () => [
      { value: '', label: 'Track' },
      ...tracks.map((t) => ({
        value: t.id,
        label: t.name,
        icon: getCountryFlagIcon(t.countryCode),
        meta: t.meta,
        disabled: t.disabled,
      })),
    ],
    [tracks]
  )

  const sessionPills = useMemo(() => {
    if (!selectedTrack) {
      return sessionOptions
    }

    if (availableSessions.length === 0) {
      return []
    }

    const hasSprint = availableSessions.some((s) => s === 'SQ' || s === 'S')
    return sessionOptions.filter((opt) => {
      if (!hasSprint && (opt.value === 'SQ' || opt.value === 'S')) return false
      return true
    })
  }, [availableSessions, selectedTrack])

  const chipClass = (active: boolean, disabled?: boolean) =>
    `
      px-2.5 py-1 rounded-md text-xs font-medium transition-colors border
      ${
        disabled
          ? 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
          : active
            ? 'border-accent bg-accent/20 text-accent'
            : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800/60'
      }
    `

  return (
    <div className="space-y-2">
      {/* Event: year + track */}
      <div className="panel px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="shrink-0 sm:border-r sm:border-gray-700/80 sm:pr-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Event</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {mode === 'season' ? 'Season' : 'Season and grand prix'}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <CustomSelect
            options={yearOptions}
            value={selectedYear}
            onChange={(v) => onYearChangeAction(Number(v))}
            placeholder="Select Year"
            placeholderValue={0}
            className="w-[88px] sm:w-[100px]"
            minWidth="88px"
          />
          {mode === 'race' && (
            <CustomSelect
              options={trackOptions}
              value={selectedTrack}
              onChange={(v) => onTrackChangeAction(String(v))}
              placeholder="Select Track"
              placeholderValue=""
              className="min-w-0 flex-1 lg:flex-none lg:w-[240px]"
              minWidth="160px"
            />
          )}
        </div>
      </div>

      {/* Session */}
      {mode === 'race' && (
      <div className="panel px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="shrink-0 sm:border-r sm:border-gray-700/80 sm:pr-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Session</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {selectedTrack
              ? availableSessions.length > 0
                ? 'Qualifying, race, or sprint'
                : 'No session data for this track yet'
              : 'Select a track first'}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          {sessionPills.length === 0 ? (
            <span className="text-xs text-gray-500">—</span>
          ) : (
            sessionPills.map((opt) => {
              const isAvailable = !selectedTrack || availableSessions.includes(opt.value)
              const isActive = selectedSession === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onSessionChangeAction(opt.value)}
                  className={chipClass(isActive, !isAvailable)}
                  title={
                    !isAvailable
                      ? `${opt.label} data not available for this track`
                      : opt.label
                  }
                >
                  {opt.label}
                </button>
              )
            })
          )}
        </div>
      </div>
      )}

      {/* Drivers: presets + team pickers */}
      <div className="panel px-3 py-2.5 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="shrink-0 sm:border-r sm:border-gray-700/80 sm:pr-4 min-w-[7.5rem]">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Drivers</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {selectedDrivers.length === 0
                ? 'None selected'
                : `${selectedDrivers.length} selected`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 mr-1 hidden sm:inline">
              Quick
            </span>
            {(mode === 'season'
              ? driverPresets.filter((preset) => preset.id === 'all' || preset.id === 'clear')
              : driverPresets
            ).map((preset) => {
              const active = activePresetId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={preset.disabled}
                  onClick={() => {
                    if (preset.disabled) return
                    onDriversChangeAction(preset.codes)
                  }}
                  className={chipClass(active, preset.disabled)}
                  title={
                    preset.disabled && preset.id !== 'clear'
                      ? 'Load a session first to use classification presets'
                      : preset.title
                  }
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-gray-800/80 pt-3">
          <div className="shrink-0 sm:pr-4 min-w-[7.5rem]">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">By team</div>
            <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">Click logo · pick drivers</div>
          </div>

          <div className="min-w-0 flex-1 flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto scrollbar-hide">
            {filteredTeams.length === 0 ? (
              <span className="text-xs text-gray-500">Select a track to see teams</span>
            ) : (
              filteredTeams.map((team) => {
                const codes = team.drivers.map((d) => d.code.toUpperCase())
                const availableCodes = codes.filter(
                  (c) =>
                    availableDriversForTrack.size === 0 || availableDriversForTrack.has(c)
                )
                const allSelected =
                  availableCodes.length > 0 && availableCodes.every((c) => selectedSet.has(c))
                const someSelected = availableCodes.some((c) => selectedSet.has(c))
                const isOpen = activeTeam === team.id

                return (
                  <div
                    key={team.id}
                    className="relative shrink min-w-[1.75rem] max-w-[2.75rem] basis-0 flex-1"
                  >
                    <button
                      ref={(el) => {
                        buttonRefs.current[team.id] = el
                      }}
                      type="button"
                      onClick={() => setActiveTeam(isOpen ? null : team.id)}
                      className="chip relative aspect-square w-full p-0 flex items-center justify-center"
                      style={{ backgroundColor: team.color }}
                      title={team.name}
                    >
                      <span
                        className={`absolute inset-0 rounded-full transition-all ${
                          allSelected
                            ? 'ring-2 ring-white'
                            : someSelected
                              ? 'ring-2 ring-white/50'
                              : ''
                        }`}
                      />
                      <img
                        src={team.logoPath}
                        alt={team.shortName}
                        className="relative z-10 h-full w-full object-contain"
                        style={
                          ['aston-martin', 'visa-rb', 'stake', 'cadillac', 'audi', 'racing-bulls'].includes(
                            team.id
                          )
                            ? { transform: 'scale(1.25)' }
                            : undefined
                        }
                      />
                    </button>

                    {isOpen &&
                      dropdownPos &&
                      typeof window !== 'undefined' &&
                      createPortal(
                        <div
                          ref={dropdownRef}
                          className="fixed z-[9999] w-48 rounded-lg border border-gray-700 bg-gray-900/95 backdrop-blur-md py-2 shadow-xl"
                          style={{
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="px-3 pb-2 mb-1 border-b border-gray-800 flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wide text-gray-500 truncate">
                              {team.shortName}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleTeamDrivers(codes)}
                              className="text-[10px] font-semibold text-accent hover:text-accent/80"
                            >
                              {allSelected
                                ? 'Deselect'
                                : availableCodes.length === 1
                                  ? 'Select'
                                  : 'Select team'}
                            </button>
                          </div>
                          {team.drivers.map((driver) => {
                            const driverCode = driver.code.toUpperCase()
                            const isSelected = selectedSet.has(driverCode)
                            const isAvailable =
                              availableDriversForTrack.size === 0 ||
                              availableDriversForTrack.has(driverCode)

                            return (
                              <button
                                key={driverCode}
                                type="button"
                                onClick={() => isAvailable && toggleDriver(driverCode)}
                                disabled={!isAvailable}
                                className={`
                                  w-full px-3 py-2 flex items-center gap-3 text-left transition-colors
                                  ${
                                    !isAvailable
                                      ? 'opacity-40 cursor-not-allowed text-gray-500'
                                      : isSelected
                                        ? 'bg-accent/20 text-accent'
                                        : 'text-gray-200 hover:bg-gray-800'
                                  }
                                `}
                                title={!isAvailable ? `Driver did not race at this track` : undefined}
                              >
                                <DriverProfilePic driverCode={driverCode} />
                                <span className="font-mono font-semibold text-sm">{driverCode}</span>
                                <span className="text-xs text-gray-400 tabular-nums">#{driver.number}</span>
                                {isSelected && (
                                  <svg
                                    className="w-4 h-4 ml-auto text-accent"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </button>
                            )
                          })}
                        </div>,
                        document.body
                      )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
