'use client'

import React, { useState, useEffect } from 'react'

const years = [2025]
const drivers = ['VER','LEC','NOR','HAM']

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

  const toggle = (d:string) => {
    setSelected(s => s.includes(d) ? s.filter(x=>x!==d) : [...s,d])
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
        {drivers.map(d=> (
          <button key={d} onClick={()=>toggle(d)} className={`chip ${selected.includes(d)?'ring-1 ring-accent':''}`}>
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
