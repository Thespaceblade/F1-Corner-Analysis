'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Toolbar, { sessionOptions } from './Toolbar'
import TrackPanel from './TrackPanel'
import ChartPanel from './ChartPanel'
import CornerTable from './CornerTable'
import { loadSessionData, SessionPayload } from '../lib/sessionDataClient'

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
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(['VER','NOR'])
  const [selectedSession, setSelectedSession] = useState<string>('Q')
  const [sessionData, setSessionData] = useState<SessionPayload | null>(null)
  const [sessionLoading, setSessionLoading] = useState<boolean>(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [showOutliers, setShowOutliers] = useState<boolean>(false)

  useEffect(() => {
    fetch('/data/tracks.json').then(r => r.json()).then(setTrackData)
  }, [])

  const [calendarData, setCalendarData] = useState<Calendar | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  useEffect(() => {
    // Load calendar data
    fetch('/data/calendar2025.json').then(r => r.json()).then(setCalendarData)
  }, [])

  useEffect(() => {
    if (!selectedTrack) {
      setSessionData(null)
      setSessionError(null)
      setSessionLoading(false)
      return
    }

    const controller = new AbortController()
    setSessionLoading(true)
    setSessionError(null)

    loadSessionData(
      {
        year: selectedYear,
        round: selectedTrack,
        session: selectedSession,
        drivers: selectedDrivers
      },
      { signal: controller.signal }
    )
      .then(data => {
        if (controller.signal.aborted) return
        setSessionData(data)
        setSessionLoading(false)
      })
      .catch(error => {
        if (controller.signal.aborted) return
        setSessionData(null)
        setSessionError(error instanceof Error ? error.message : String(error))
        setSessionLoading(false)
      })

    return () => controller.abort()
  }, [selectedTrack, selectedSession, selectedDrivers, selectedYear])

  const currentTrack = trackData?.tracks[selectedTrack]
  const currentCalendarTrack = calendarData?.rounds.find(t => t.id === selectedTrack)
  const sessionLabel = useMemo(() => {
    const found = sessionOptions.find(option => option.value === selectedSession)
    return found?.label ?? selectedSession
  }, [selectedSession])

  if(!trackData || !calendarData) return <div>Loading...</div>

  const trackList = calendarData.rounds.map(round => ({
    id: round.id,
    name: round.name
  }))

  return (
    <main className="max-w-6xl mx-auto px-4">
      <header className="mb-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-accent/40 bg-gray-900/40">
          <Image
            src="/logos/logo-transparent.png"
            alt="F1 Corner Analysis logo"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            F1 Corner Analysis
          </h1>
          <p className="mt-2 text-sm text-subtext-clr md:text-base">with data from FastF1</p>
        </div>
      </header>

      <Toolbar 
        tracks={trackList}
        selectedTrack={selectedTrack}
        onTrackChangeAction={setSelectedTrack}
        selectedDrivers={selectedDrivers}
        onDriversChangeAction={setSelectedDrivers}
        selectedSession={selectedSession}
        onSessionChangeAction={setSelectedSession}
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
              <div className="mt-2 text-sm text-gray-400">
                Session: {sessionLabel}
              </div>
              <div className="mt-4 text-sm text-gray-300">
                <div className="font-semibold uppercase tracking-wide text-xs text-gray-400">
                  Selected Drivers
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedDrivers.length
                    ? selectedDrivers.map(code => (
                        <span
                          key={code}
                          className="inline-flex items-center justify-center rounded-full border border-gray-700 bg-gray-800/70 px-2 py-0.5 text-xs font-medium text-gray-200"
                        >
                          {code}
                        </span>
                      ))
                    : <span className="text-gray-500">No drivers selected</span>
                  }
                </div>
              </div>
              {sessionData?.meta && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>
                    {sessionData.meta.validLapCount ?? sessionData.meta.totalLapCount ?? 0} valid laps
                    {typeof sessionData.meta.totalLapCount === 'number' && typeof sessionData.meta.validLapCount === 'number'
                      ? ` / ${sessionData.meta.totalLapCount}`
                      : ''}
                  </span>
                  {typeof sessionData.meta.outlierLapCount === 'number' && sessionData.meta.outlierLapCount > 0 && (
                    <span className="text-[11px] text-gray-400">
                      {sessionData.meta.outlierLapCount} flagged as outliers
                    </span>
                  )}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-300">
                <button
                  type="button"
                  onClick={() => setShowOutliers(prev => !prev)}
                  className={`rounded border px-2 py-1 transition ${
                    showOutliers
                      ? 'border-accent text-accent'
                      : 'border-gray-600 text-gray-400 hover:border-accent/40 hover:text-accent'
                  }`}
                >
                  {showOutliers ? 'Hide outlier laps' : 'Show outlier laps'}
                </button>
                <span className="text-[11px] text-gray-500">
                  Outliers include out/in laps, safety car laps, yellow flag laps, etc.
                </span>
              </div>
              {sessionError && (
                <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {sessionError}
                </div>
              )}
              {sessionData?.notes?.length ? (
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  {sessionData.notes.map((note, idx) => (
                    <div key={idx}>• {note}</div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <ChartPanel 
            sessionData={sessionData}
            selectedDrivers={selectedDrivers}
            loading={sessionLoading}
            showOutliers={showOutliers}
          />

          <CornerTable 
            corners={sessionData?.corners ?? {}} 
            cornerInfo={currentTrack.corners}
            selectedDrivers={selectedDrivers}
          />
        </>
      )}
    </main>
  )
}
