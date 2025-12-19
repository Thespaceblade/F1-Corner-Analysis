'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { f1Teams, driverColorMap } from '../lib/teamData'
import CustomSelect from './CustomSelect'

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

// Simple F1 car icon component for dropdown
function DriverCarIcon({ driverCode }: { driverCode: string }) {
  const color = driverColorMap[driverCode.toUpperCase()] || '#888888'
  
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simple F1 car silhouette */}
      <path
        d="M2 14h2l1-2h3l1 2h6l1-2h3l1 2h2v2H2v-2z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M5 12h4l1-3h4l1 3h4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Wheels */}
      <circle cx="6" cy="16" r="1.5" fill={color} />
      <circle cx="18" cy="16" r="1.5" fill={color} />
    </svg>
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
}: ToolbarProps) {
  // Driver dropdown state
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const selectedSet = useMemo(() => new Set(selectedDrivers), [selectedDrivers])

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
  const yearOptions = useMemo(() => 
    years.map(y => ({ value: y, label: String(y) })), 
    [years]
  )

  const trackOptions = useMemo(() => [
    { value: '', label: 'Select Track' },
    ...tracks.map(t => ({ value: t.id, label: t.name }))
  ], [tracks])

  const sessionOptionsList = useMemo(() => {
    if (!selectedTrack || availableSessions.length === 0) {
      return sessionOptions.map(o => ({ value: o.value, label: o.label }))
    }
    
    if (SPRINT_WEEKEND_TRACKS.has(selectedTrack)) {
      return sessionOptions.map(o => ({ value: o.value, label: o.label }))
    }
    
    const hasQR = availableSessions.some(s => s === 'Q' || s === 'R')
    const hasSprint = availableSessions.some(s => s === 'SQ' || s === 'S')
    
    if (hasQR && !hasSprint) {
      return sessionOptions
        .filter(o => o.value !== 'SQ' && o.value !== 'S')
        .map(o => ({ value: o.value, label: o.label }))
    }
    
    return sessionOptions.map(o => ({ value: o.value, label: o.label }))
  }, [availableSessions, selectedTrack])

  return (
    <div className="panel p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Selects row */}
      <div className="flex items-center gap-3">
        <CustomSelect
          options={yearOptions}
          value={selectedYear}
          onChange={(v) => onYearChangeAction(Number(v))}
          className="w-[100px]"
          minWidth="100px"
        />
        
        <CustomSelect
          options={trackOptions}
          value={selectedTrack}
          onChange={(v) => onTrackChangeAction(String(v))}
          placeholder="Select Track"
          className="flex-1"
          minWidth="240px"
        />

        <CustomSelect
          options={sessionOptionsList}
          value={selectedSession}
          onChange={(v) => onSessionChangeAction(String(v))}
          className="flex-1"
          minWidth="180px"
        />
      </div>

      {/* Team buttons */}
      <div className="flex-1 flex items-center justify-end gap-2 flex-wrap">
        {f1Teams.map(team => {
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
                  className="relative z-10 h-full w-full object-contain"
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
                    
                    return (
                      <button
                        key={driver.code}
                        type="button"
                        onClick={() => toggleDriver(driver.code)}
                        className={`
                          w-full px-3 py-2 flex items-center gap-3 text-left transition-colors
                          ${isSelected 
                            ? 'bg-accent/20 text-accent' 
                            : 'text-gray-200 hover:bg-gray-800'
                          }
                        `}
                      >
                        {/* Car icon */}
                        <DriverCarIcon driverCode={driver.code} />
                        
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
