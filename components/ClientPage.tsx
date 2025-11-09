'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Toolbar, { sessionOptions } from './Toolbar'
import TrackPanel from './TrackPanel'
import ChartPanel from './ChartPanel'
import CornerTable from './CornerTable'
import CornerDeltaChart from './CornerDeltaChart'
import { loadSessionData, SessionPayload } from '../lib/sessionDataClient'
import { aggregateCornerPerformance } from '../lib/cornerPerformanceAggregator'

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
  const [showOutliers, setShowOutliers] = useState<boolean>(true)

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
  
  // Filter state for corner performance
  const [cornerFilter, setCornerFilter] = useState<{
    type: 'all' | 'qualifying-segment' | 'lap' | 'average'
    segment?: 'Q1' | 'Q2' | 'Q3'
    lapNumber?: number
  }>({ type: 'all' })
  
  // Check if this is a qualifying session
  const isQualifyingSession = useMemo(() => {
    if (!sessionData) return false
    const sessionCode = sessionData.meta?.session?.toUpperCase()
    return sessionCode === 'Q' || sessionCode === 'SQ'
  }, [sessionData])
  
  // Check if this is a race session
  const isRaceSession = useMemo(() => {
    if (!sessionData) return false
    const sessionCode = sessionData.meta?.session?.toUpperCase()
    return sessionCode === 'R'
  }, [sessionData])
  
  // Reset filter when session changes
  useEffect(() => {
    if (isQualifyingSession) {
      setCornerFilter({ type: 'all' })
    } else if (isRaceSession) {
      setCornerFilter({ type: 'average' })
    } else {
      setCornerFilter({ type: 'all' })
    }
  }, [selectedSession, isQualifyingSession, isRaceSession])
  
  // Build corner filter for aggregator
  const cornerPerformanceFilter = useMemo(() => {
    if (cornerFilter.type === 'qualifying-segment' && cornerFilter.segment && sessionData?.qualifyingBoundaries) {
      return {
        type: 'qualifying-segment' as const,
        segment: cornerFilter.segment,
        boundaries: sessionData.qualifyingBoundaries,
        laps: sessionData.laps,
      }
    } else if (cornerFilter.type === 'lap' && cornerFilter.lapNumber !== undefined) {
      return {
        type: 'lap' as const,
        lapNumber: cornerFilter.lapNumber,
      }
    } else if (cornerFilter.type === 'average') {
      return { type: 'average' as const }
    }
    return { type: 'all' as const }
  }, [cornerFilter, sessionData])
  
  // Aggregate corner performance data
  const cornerPerformance = useMemo(() => {
    if (!sessionData?.corners || !selectedDrivers.length) return undefined
    return aggregateCornerPerformance(sessionData.corners, selectedDrivers)
  }, [sessionData?.corners, selectedDrivers])
  
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
      <header className="relative mb-8 overflow-visible">
        {/* Animated gradient background - behind text/logo, text will obscure edges */}
        <div className="absolute inset-0 bg-gradient-radial-header animate-pulse-slow pointer-events-none" style={{ zIndex: 0 }} />
        
        {/* Extended fade-out gradient at bottom to blend seamlessly with page */}
        <div className="absolute -bottom-8 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[var(--page-bg)]/80 to-[var(--page-bg)] pointer-events-none" style={{ zIndex: 1 }} />
        
        {/* Content container - positioned above gradient */}
        <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center md:justify-start gap-5 md:gap-10 py-10 md:py-12 px-6 md:px-12" style={{ zIndex: 2 }}>
          
          {/* Logo container - clean and minimal */}
          <div className="relative group flex-shrink-0" style={{ zIndex: 2 }}>
            {/* Subtle glow - minimal and clean */}
            <div className="absolute inset-[-8px] bg-accent/10 rounded-full blur-xl group-hover:bg-accent/15 transition-all duration-300" style={{ zIndex: -1 }} />
            
            {/* Logo container - clean, no glass effects */}
            <div className="relative flex h-24 w-24 md:h-36 md:w-36 items-center justify-center rounded-full border border-accent/40 bg-transparent group-hover:scale-105 group-hover:border-accent/60 transition-all duration-300">
              <Image
                src="/logos/logo-transparent.png"
                alt="F1 Corner Analysis logo"
                width={160}
                height={160}
                className="object-contain p-1.5 md:p-2.5 animate-logo-enter"
                priority
              />
            </div>
          </div>
          
          {/* Text content - clean and clear, no gradient interference */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2.5 md:space-y-3 min-w-0 flex-1 w-full relative" style={{ zIndex: 2 }}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.02em] animate-text-enter leading-tight break-words px-2 md:px-0 relative">
              <span className="text-[#7cc7ff] drop-shadow-[0_0_20px_rgba(124,199,255,0.4),0_2px_8px_rgba(0,0,0,0.5)]">
                F1 Corner
              </span>
              <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {' '}Analysis
              </span>
            </h1>
            <div className="flex items-center gap-3 md:gap-4 animate-text-enter flex-wrap justify-center md:justify-start relative" style={{ animationDelay: '0.4s', animationFillMode: 'both', zIndex: 2 }}>
              <div className="h-px w-10 md:w-12 bg-gradient-to-r from-transparent via-[#7cc7ff]/60 to-transparent hidden sm:block" />
              <p className="text-base md:text-lg text-subtext-clr font-medium tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
                with data from FastF1
              </p>
              <div className="h-px w-10 md:w-12 bg-gradient-to-r from-transparent via-[#7cc7ff]/60 to-transparent hidden sm:block" />
            </div>
            
            {/* Attribution and links - no underlines */}
            <div className="flex items-center gap-3 md:gap-4 animate-text-enter justify-center md:justify-start relative mt-2" style={{ animationDelay: '0.6s', animationFillMode: 'both', zIndex: 2 }}>
              <span className="text-xs md:text-sm text-subtext-clr/70 font-normal">
                Made by{' '}
                <a 
                  href="https://jasonindata.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent/80 hover:text-accent transition-colors duration-200 no-underline"
                >
                  Jason Charwin
                </a>
              </span>
              <span className="text-subtext-clr/40">•</span>
              <a 
                href="https://github.com/Thespaceblade/F1-Corner-Analysis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs md:text-sm text-subtext-clr/70 hover:text-accent/90 transition-all duration-200 group no-underline"
                aria-label="View on GitHub"
              >
                <svg 
                  className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span className="transition-colors duration-200">
                  Source
                </span>
              </a>
              <a 
                href="https://jasonindata.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs md:text-sm text-subtext-clr/70 hover:text-accent/90 transition-all duration-200 group no-underline"
                aria-label="Visit personal website"
              >
                <svg 
                  className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="transition-colors duration-200">
                  Portfolio
                </span>
              </a>
            </div>
          </div>
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
                cornerPerformance={cornerPerformance}
                selectedDrivers={selectedDrivers}
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
              cornerFilter={cornerFilter}
              onCornerFilterChange={setCornerFilter}
              isQualifyingSession={isQualifyingSession}
              isRaceSession={isRaceSession}
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
