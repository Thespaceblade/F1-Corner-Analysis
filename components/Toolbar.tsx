'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { f1Teams, driverColorMap } from '../lib/teamData'
import CustomSelect from './CustomSelect'
import { getAvailableDriversForTrack, didDriverRaceAtTrack } from '../lib/trackDrivers'
import type { SessionPayload } from '../lib/sessionDataClient'
import { getDriverPhoto } from '../lib/driverPhotos'

type ToolbarProps = {
  tracks: Array<{ id: string; name: string }>
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

const SPRINT_WEEKEND_TRACKS = new Set([
  'china', 'miami', 'belgium', 'united-states', 'brazil', 'qatar'
])

// Map track IDs to their SVG filenames
const getTrackIconPath = (trackId: string): string => {
  const trackSvgMap: Record<string, string> = {
    'australia': 'australia.svg',
    'china': 'china.svg',
    'japan': 'japan.svg',
    'bahrain': 'bahrain.svg',
    'saudi-arabia': 'saudi_arabia.svg',
    'miami': 'miami.svg',
    'emilia-romagna': 'imola.svg',
    'monaco': 'monaco.svg',
    'spain': 'spain.svg',
    'canada': 'canada.svg',
    'austria': 'austria.svg',
    'great-britain': 'silverstone.svg',
    'belgium': 'spa.svg',
    'hungary': 'hungary.svg',
    'netherlands': 'netherlands.svg',
    'italy': 'monza.svg',
    'azerbaijan': 'azerbaijan.svg',
    'singapore': 'singapore.svg',
    'united-states': 'usa.svg',
    'mexico': 'mexico.svg',
    'brazil': 'brazil.svg',
    'las-vegas': 'las_vegas.svg',
    'qatar': 'qatar.svg',
    'abu-dhabi': 'abudhabi.svg',
  }
  
  const svgFile = trackSvgMap[trackId]
  return svgFile ? `/Tracks/${svgFile}` : ''
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

  const selectedSet = useMemo(() => new Set(selectedDrivers), [selectedDrivers])

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
      return f1Teams
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
        for (const team of f1Teams) {
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
    type TeamWithDynamicDrivers = Omit<typeof f1Teams[0], 'drivers'> & { 
      drivers: Array<{ code: string; name: string; number: number }> 
    }
    const teamsByTeamId = new Map<string, TeamWithDynamicDrivers>()
    
    // Initialize with all teams from f1Teams (to get team metadata)
    for (const team of f1Teams) {
      teamsByTeamId.set(team.id, {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        color: team.color,
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
        const aIndex = f1Teams.findIndex(t => t.id === a.id)
        const bIndex = f1Teams.findIndex(t => t.id === b.id)
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
      })
  }, [availableDriversForTrack, selectedTrack, selectedYear, roundNumber, sessionData])

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
    if (selectedSet.has(code)) {
      onDriversChangeAction(selectedDrivers.filter(c => c !== code))
    } else {
      onDriversChangeAction([...selectedDrivers, code])
    }
  }

  // Select options
  const yearOptions = useMemo(() => [
    { value: 0, label: 'Year' },
    ...years.map(y => ({ value: y, label: String(y) }))
  ], [years])

  const trackOptions = useMemo(() => [
    { value: '', label: 'Track' },
    ...tracks.map(t => ({ 
      value: t.id, 
      label: t.name,
      icon: getTrackIconPath(t.id)
    }))
  ], [tracks])

  const sessionOptionsList = useMemo(() => {
    const options = [{ value: '', label: 'Session' }]
    
    if (!selectedTrack || availableSessions.length === 0) {
      return [...options, ...sessionOptions.map(o => ({ value: o.value, label: o.label }))]
    }
    
    if (SPRINT_WEEKEND_TRACKS.has(selectedTrack)) {
      return [...options, ...sessionOptions.map(o => ({ value: o.value, label: o.label }))]
    }
    
    const hasQR = availableSessions.some(s => s === 'Q' || s === 'R')
    const hasSprint = availableSessions.some(s => s === 'SQ' || s === 'S')
    
    if (hasQR && !hasSprint) {
      return [
        ...options,
        ...sessionOptions
          .filter(o => o.value !== 'SQ' && o.value !== 'S')
          .map(o => ({ value: o.value, label: o.label }))
      ]
    }
    
    return [...options, ...sessionOptions.map(o => ({ value: o.value, label: o.label }))]
  }, [availableSessions, selectedTrack])

  return (
    <div className="panel p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Selects row */}
      <div className="flex items-center gap-3">
        <CustomSelect
          options={yearOptions}
          value={selectedYear}
          onChange={(v) => onYearChangeAction(Number(v))}
          placeholder="Select Year"
          placeholderValue={0}
          className="w-[100px]"
          minWidth="100px"
        />
        
        <CustomSelect
          options={trackOptions}
          value={selectedTrack}
          onChange={(v) => onTrackChangeAction(String(v))}
          placeholder="Select Track"
          placeholderValue=""
          className="flex-1"
          minWidth="240px"
        />

        <CustomSelect
          options={sessionOptionsList}
          value={selectedSession}
          onChange={(v) => onSessionChangeAction(String(v))}
          placeholder="Select Session"
          placeholderValue=""
          className="flex-1"
          minWidth="180px"
        />
      </div>

      {/* Team buttons */}
      <div className="flex-1 flex items-center justify-end gap-2 flex-wrap">
        {filteredTeams.map(team => {
          const codes = team.drivers.map(d => d.code)
          const allSelected = codes.every(c => selectedSet.has(c))
          const someSelected = codes.some(c => selectedSet.has(c))
          const isOpen = activeTeam === team.id

          return (
            <div key={team.id} className="relative">
              {/* Team button */}
              <button
                ref={el => { buttonRefs.current[team.id] = el }}
                type="button"
                onClick={() => setActiveTeam(isOpen ? null : team.id)}
                className="chip relative h-11 w-11 p-0 flex items-center justify-center"
                style={{ backgroundColor: team.color }}
                title={team.name}
              >
                {/* Selection ring */}
                <span
                  className={`absolute inset-0 rounded-full transition-all ${
                    allSelected ? 'ring-2 ring-white' : someSelected ? 'ring-2 ring-white/50' : ''
                  }`}
                />
                {/* Team logo */}
                <img
                  src={`/team-logos/${team.id}.png`}
                  alt={team.shortName}
                  className={`relative z-10 h-full w-full object-contain ${
                    ['aston-martin', 'visa-rb', 'stake'].includes(team.id)
                      ? 'scale-130'
                      : ''
                  }`}
                  style={
                    ['aston-martin', 'visa-rb', 'stake'].includes(team.id)
                      ? { transform: 'scale(1.3)' }
                      : undefined
                  }
                />
              </button>

              {/* Driver dropdown */}
              {isOpen && dropdownPos && typeof window !== 'undefined' && createPortal(
                <div
                  ref={dropdownRef}
                  className="fixed z-[9999] w-44 rounded-lg border border-gray-700 bg-gray-900/95 backdrop-blur-md py-2 shadow-xl"
                  style={{
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {team.drivers.map(driver => {
                    const isSelected = selectedSet.has(driver.code)
                    const isAvailable = availableDriversForTrack.size === 0 || availableDriversForTrack.has(driver.code.toUpperCase())
                    
                    return (
                      <button
                        key={driver.code}
                        type="button"
                        onClick={() => isAvailable && toggleDriver(driver.code)}
                        disabled={!isAvailable}
                        className={`
                          w-full px-3 py-2 flex items-center gap-3 text-left transition-colors
                          ${!isAvailable 
                            ? 'opacity-40 cursor-not-allowed text-gray-500' 
                            : isSelected 
                            ? 'bg-accent/20 text-accent' 
                            : 'text-gray-200 hover:bg-gray-800'
                          }
                        `}
                        title={!isAvailable ? `Driver did not race at this track` : undefined}
                      >
                        {/* Driver profile picture */}
                        <DriverProfilePic driverCode={driver.code} />
                        
                        {/* Driver code */}
                        <span className="font-mono font-semibold text-sm">
                          {driver.code}
                        </span>
                        
                        {/* Driver number */}
                        <span className="text-xs text-gray-400 tabular-nums">
                          #{driver.number}
                        </span>
                        
                        {/* Checkmark */}
                        {isSelected && (
                          <svg className="w-4 h-4 ml-auto text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
        })}
      </div>
    </div>
  )
}
