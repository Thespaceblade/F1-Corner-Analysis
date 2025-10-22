'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { f1Teams } from '../lib/teamData'

const years = [2025]

type Track = {
  id: string
  name: string
  location: string
  date: string
  officialName: string
  round: number
}

type Calendar = {
  year: number
  rounds: Track[]
}

type ToolbarProps = {
  tracks: Array<{
    id: string
    name: string
  }>
  selectedTrack: string
  onTrackChangeAction: (trackId: string) => void
  selectedDrivers: string[]
  onDriversChangeAction: (drivers: string[]) => void
}

export default function Toolbar({ tracks, selectedTrack, onTrackChangeAction, selectedDrivers, onDriversChangeAction }: ToolbarProps) {
  const [openTeamId, setOpenTeamId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentSelection = useMemo(() => new Set(selectedDrivers), [selectedDrivers])
  
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = (teamId: string) => {
    cancelClose()
    closeTimer.current = setTimeout(() => {
      setOpenTeamId(prev => (prev === teamId ? null : prev))
      closeTimer.current = null
    }, 120)
  }

  const openTeam = (teamId: string) => {
    cancelClose()
    setOpenTeamId(teamId)
  }

  useEffect(() => () => cancelClose(), [])

  const toggleDriver = (driverCode: string) => {
    onDriversChangeAction(
      currentSelection.has(driverCode)
        ? selectedDrivers.filter(code => code !== driverCode)
        : [...selectedDrivers, driverCode]
    )
  }

  const toggleTeam = (teamDriverCodes: string[]) => {
    const allSelected = teamDriverCodes.every(code => currentSelection.has(code))

    if (allSelected) {
      onDriversChangeAction(selectedDrivers.filter(code => !teamDriverCodes.includes(code)))
    } else {
      const merged = new Set(selectedDrivers)
      teamDriverCodes.forEach(code => merged.add(code))
      onDriversChangeAction(Array.from(merged))
    }
  }

  return (
    <div className="panel p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <select 
          className="input-slim min-w-[120px]"
          value={2025}
          disabled
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        
        <select 
          className="input-slim min-w-[240px]"
          value={selectedTrack}
          onChange={e => onTrackChangeAction(e.target.value)}
        >
          <option value="">Select Track</option>
          {tracks.map(track => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>

        <select className="input-slim min-w-[120px]">
          <option value="Q">Qualifying</option>
          <option value="R">Race</option>
        </select>
      </div>

      <div className="flex-1 flex items-center justify-end gap-2 flex-wrap">
        {f1Teams.map(team => {
          const teamDriverCodes = team.drivers.map(driver => driver.code)
          const allSelected = teamDriverCodes.every(code => currentSelection.has(code))
          const anySelected = allSelected || teamDriverCodes.some(code => currentSelection.has(code))

          return (
            <div
              key={team.id}
              className="relative"
              data-team-wrapper="true"
              onMouseEnter={() => openTeam(team.id)}
              onMouseLeave={() => scheduleClose(team.id)}
            >
              <button
                type="button"
                className="chip relative flex h-10 w-10 items-center justify-center p-[4px]"
                style={{ backgroundColor: team.color }}
                title={team.name}
                aria-pressed={allSelected}
                aria-expanded={openTeamId === team.id}
                aria-controls={`team-menu-${team.id}`}
                onClick={() => {
                  openTeam(team.id)
                  toggleTeam(teamDriverCodes)
                }}
                onFocus={() => openTeam(team.id)}
                onBlur={(event) => {
                  const next = event.relatedTarget as Node | null
                  const wrapper = event.currentTarget.parentElement
                  if (next && wrapper && wrapper.contains(next)) return
                  scheduleClose(team.id)
                }}
              >
                <span
                  className={`absolute inset-0 rounded-full transition-all duration-150 ${allSelected ? 'ring-2 ring-white/90' : anySelected ? 'ring-2 ring-white/40' : 'ring-0'}`}
                  aria-hidden="true"
                />
                <span className="relative z-10 flex h-full w-full items-center justify-center">
                  {['red-bull', 'mercedes', 'ferrari', 'mclaren', 'alpine', 'williams', 'aston-martin', 'visa-rb', 'stake', 'haas'].includes(team.id) ? (
                    <img 
                      src={`/team-logos/${team.id}.png`} 
                      alt={`${team.shortName} logo`}
                      className="h-[70%] w-[70%] object-contain"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{team.shortName.substring(0, 2)}</span>
                  )}
                </span>
              </button>

              {openTeamId === team.id && (
                <div
                  id={`team-menu-${team.id}`}
                  role="menu"
                  className="absolute top-full left-1/2 z-50 min-w-[140px] -translate-x-1/2 translate-y-2 rounded-lg border border-gray-700/70 bg-gray-900/95 p-2 shadow-2xl backdrop-blur"
                  onMouseEnter={() => openTeam(team.id)}
                  onMouseLeave={() => scheduleClose(team.id)}
                >
                  {team.drivers.map(driver => {
                    const isSelected = currentSelection.has(driver.code)
                    return (
                      <button
                        key={driver.code}
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={isSelected}
                        onClick={() => toggleDriver(driver.code)}
                        className={`w-full rounded px-2 py-1 text-left transition-colors ${
                          isSelected ? 'bg-gray-700 text-accent' : 'text-gray-200 hover:bg-gray-700'
                        }`}
                        onFocus={() => openTeam(team.id)}
                        onBlur={(event) => {
                          const next = event.relatedTarget as Node | null
                          const parent = event.currentTarget.closest('[data-team-wrapper]')
                          if (next && parent && parent.contains(next)) return
                          scheduleClose(team.id)
                        }}
                      >
                        <span className="inline-flex w-16 items-center gap-2 font-mono text-sm">
                          <span
                            className={`inline-flex h-2.5 w-2.5 items-center justify-center rounded-full border border-gray-500 ${
                              isSelected ? 'border-accent bg-accent' : 'bg-transparent'
                            }`}
                            aria-hidden="true"
                          />
                          {driver.code}
                        </span>
                        <span className="text-sm text-gray-400">{driver.number}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
