'use client'

import React, { useState, useEffect } from 'react'
import { f1Teams, Team, Driver } from '../lib/teamData'

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
}

export default function Toolbar({ tracks, selectedTrack, onTrackChangeAction }: ToolbarProps) {
  const [selected, setSelected] = useState<string[]>(['VER','NOR'])
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)

  const toggle = (driverCode: string) => {
    setSelected(s => s.includes(driverCode) ? s.filter(x => x !== driverCode) : [...s, driverCode])
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

      <div className="flex-1 flex items-center justify-end gap-2">
        {f1Teams.map(team => (
          <div
            key={team.id}
            className="relative"
            onMouseEnter={() => setHoveredTeam(team.id)}
            onMouseLeave={() => setHoveredTeam(null)}
          >
            <button
              className="chip h-8 w-8 flex items-center justify-center"
              style={{ backgroundColor: team.color }}
              title={team.name}
            >
              {team.shortName.substring(0, 2)}
            </button>
            
            {hoveredTeam === team.id && (
              <div className="absolute top-full mt-1 bg-gray-800 rounded-lg shadow-lg p-2 z-50 min-w-[120px]">
                {team.drivers.map(driver => (
                  <button
                    key={driver.code}
                    onClick={() => toggle(driver.code)}
                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${
                      selected.includes(driver.code) ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className={`inline-block w-12 ${selected.includes(driver.code) ? 'text-accent' : ''}`}>
                      {driver.code}
                    </span>
                    <span className="text-sm text-gray-300">{driver.number}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
