'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Toolbar, { sessionOptions } from './Toolbar'
import TrackPanel from './TrackPanel'
import ChartPanel from './ChartPanel'
import CornerTable from './CornerTable'
import CornerDeltaChart from './CornerDeltaChart'
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
  coordinates?: {
    latitude: number
    longitude: number
  }
  city?: string
  country?: string
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

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [availableRoundsByYear, setAvailableRoundsByYear] = useState<Record<string, string[]>>({})
  const [sessionsByRound, setSessionsByRound] = useState<Record<string, Record<string, string[]>>>({})
  const [calendarData, setCalendarData] = useState<Calendar | null>(null)

  useEffect(() => {
    // Discover available sessions (years/rounds) via server-side index
    fetch('/api/sessions/index')
      .then(r => r.json())
      .then((idx) => {
        const years = Object.keys(idx?.years ?? {}).map(Number).sort((a,b) => a - b)
        setAvailableYears(years)
        if (years.length) {
          const latest = years[years.length - 1]
          setSelectedYear(latest)
        }

        const map: Record<string, string[]> = {}
        const sessionsMap: Record<string, Record<string, string[]>> = {}
        for (const [year, payload] of Object.entries(idx?.years ?? {})) {
          const rounds = (payload as any)?.rounds
          map[year] = Array.isArray(rounds) ? rounds.map((r: any) => r.id) : []
          
          // Store sessions per round per year
          sessionsMap[year] = {}
          if (Array.isArray(rounds)) {
            for (const round of rounds) {
              if (round.id && Array.isArray(round.sessions)) {
                sessionsMap[year][round.id] = round.sessions
              }
            }
          }
        }
        setAvailableRoundsByYear(map)
        setSessionsByRound(sessionsMap)
      })
      .catch(() => {
        // leave empty on failure
      })
  }, [])

  useEffect(() => {
    // Load calendar data for the selected year to get round ordering
    fetch(`/data/calendar${selectedYear}.json`)
      .then(r => r.json())
      .then(setCalendarData)
      .catch(() => {
        // If calendar file doesn't exist for this year, that's okay
        setCalendarData(null)
      })
  }, [selectedYear])

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
  
  // Get available sessions for the selected track
  const availableSessions = useMemo(() => {
    if (!selectedTrack || !selectedYear) return []
    const yearSessions = sessionsByRound[String(selectedYear)]
    if (!yearSessions) return []
    return yearSessions[selectedTrack] ?? []
  }, [selectedTrack, selectedYear, sessionsByRound])

  // Reset selected session if it's not available for the selected track
  useEffect(() => {
    if (selectedTrack && availableSessions.length > 0) {
      if (!availableSessions.includes(selectedSession)) {
        // Reset to first available session (prefer Q, then R, then first available)
        const preferredOrder = ['Q', 'R', 'SQ', 'S']
        const preferred = preferredOrder.find(s => availableSessions.includes(s))
        const newSession = preferred || availableSessions[0]
        if (newSession !== selectedSession) {
          setSelectedSession(newSession)
        }
      }
    }
  }, [selectedTrack, availableSessions, selectedSession])

  const sessionLabel = useMemo(() => {
    const found = sessionOptions.find(option => option.value === selectedSession)
    return found?.label ?? selectedSession
  }, [selectedSession])

  const roundIds = availableRoundsByYear[String(selectedYear)] ?? []
  
  // Create a map of round ID to round number from calendar data for sorting
  const roundNumberMap = useMemo(() => {
    if (!calendarData?.rounds) return new Map<string, number>()
    const map = new Map<string, number>()
    calendarData.rounds.forEach(round => {
      map.set(round.id, round.round)
    })
    return map
  }, [calendarData])

  const trackList = useMemo(() => {
    if (!trackData) return []
    const tracks = roundIds
      .filter(id => !!trackData.tracks[id])
      .map(id => {
        const trackInfo = trackData.tracks[id]
        return {
          id,
          name: trackInfo.name,
        }
      })
    
    // Sort by round number if calendar data is available, otherwise keep original order
    if (roundNumberMap.size > 0) {
      tracks.sort((a, b) => {
        const roundA = roundNumberMap.get(a.id) ?? 999
        const roundB = roundNumberMap.get(b.id) ?? 999
        return roundA - roundB
      })
    }
    
    return tracks
  }, [roundIds, trackData, roundNumberMap])

  if(!trackData || !availableYears.length) return <div>Loading...</div>

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
        years={availableYears}
        selectedYear={selectedYear}
        onYearChangeAction={(y) => {
          setSelectedYear(y)
          setSelectedTrack('')
        }}
        selectedDrivers={selectedDrivers}
        onDriversChangeAction={setSelectedDrivers}
        selectedSession={selectedSession}
        onSessionChangeAction={setSelectedSession}
        availableSessions={availableSessions}
      />

      {currentTrack && (
        <>
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <div className="panel p-4">
              <TrackPanel 
                svgFile={currentTrack.svgFile}
                corners={currentTrack.corners}
              />
            </div>
            <div className="panel p-4">
              <div className="text-lg font-bold">{trackData.tracks[selectedTrack]?.name}</div>
              <div className="text-gray-600">{selectedYear}</div>
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

          {selectedDrivers.length >= 2 && (
            <CornerDeltaChart
              corners={sessionData?.corners ?? {}}
              cornerInfo={currentTrack.corners}
              selectedDrivers={selectedDrivers}
            />
          )}
        </>
      )}
    </main>
  )
}
