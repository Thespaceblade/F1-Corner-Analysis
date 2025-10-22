'use client'

import React, { useEffect, useState } from 'react'
import Toolbar from './Toolbar'
import TrackPanel from './TrackPanel'
import ChartPanel from './ChartPanel'
import CornerTable from './CornerTable'

type CalendarTrack = {
  id: string
  name: string
  location: string
  date: string
  officialName: string
  round: number
}

type Calendar = {
  year: number
  rounds: CalendarTrack[]
}

type TrackData = {
  id: string
  name: string
  svgFile: string
  corners: Array<{
    number: number
    type: 'slow' | 'medium' | 'fast'
    x: number
    y: number
  }>
}

type TracksData = {
  tracks: {
    [key: string]: TrackData
  }
}

export default function ClientPage(){
  const [selectedTrack, setSelectedTrack] = useState<string>('')
  const [trackData, setTrackData] = useState<TracksData | null>(null)

  useEffect(() => {
    fetch('/data/tracks.json').then(r => r.json()).then(setTrackData)
  }, [])

  const [calendarData, setCalendarData] = useState<Calendar | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  useEffect(() => {
    // Load calendar data
    fetch('/data/calendar2025.json').then(r => r.json()).then(setCalendarData)
  }, [])

  const currentTrack = trackData?.tracks[selectedTrack]
  const currentCalendarTrack = calendarData?.rounds.find(t => t.id === selectedTrack)

  if(!trackData || !calendarData) return <div>Loading...</div>

  const trackList = calendarData.rounds.map(round => ({
    id: round.id,
    name: round.name
  }))

  return (
    <main className="max-w-6xl mx-auto px-4">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">F1 Corner Analysis</h1>
        <p className="text-sm text-subtext-clr">inspired by F1Tempo</p>
      </header>

      <Toolbar 
        tracks={trackList}
        selectedTrack={selectedTrack}
        onTrackChangeAction={setSelectedTrack}
      />

      {currentTrack && currentCalendarTrack && (
        <>
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <div className="panel p-4">
              <TrackPanel 
                svgFile={currentTrack.svgFile}
                corners={currentTrack.corners}
              />
            </div>
            <div className="panel p-4">
              <div className="text-lg font-bold">
                {currentCalendarTrack.officialName}
              </div>
              <div className="text-gray-600">
                {currentCalendarTrack.date}
              </div>
              {/* ChartPanel will be updated once we have session data */}
            </div>
          </div>

          <div className="mt-6 panel p-4">
            <CornerTable 
              corners={[]} 
              cornerInfo={currentTrack.corners}
            />
          </div>
        </>
      )}
    </main>
  )
}