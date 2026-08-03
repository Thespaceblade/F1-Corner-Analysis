'use client'

// TODO: Add error boundaries for better error handling
// TODO: Add loading states for all async operations

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Toolbar, { sessionOptions } from './Toolbar'
import CircuitTrackStage, { getCircuitVisualScale } from './CircuitTrackStage'
import ChartPanel from './ChartPanel'
import AnalysisPanel from './AnalysisPanel'
import TableOfContents from './TableOfContents'
import Chatbot from './Chatbot'
import AppNav from './AppNav'
import { loadSessionData, SessionPayload } from '../lib/sessionDataClient'
import { aggregateCornerPerformance } from '../lib/cornerPerformanceAggregator'
import { trackInfo } from '../lib/trackInfo'
import { filterDriversForTrack } from '../lib/trackDrivers'
import { getAvailableCalendarYears, getCalendarForYear, type SeasonCalendar } from '../lib/calendarData'
import { getSupportedSeasonYears } from '../lib/teamData'

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

type ClientPageProps = {
  trackId: string
}

export default function ClientPage({ trackId }: ClientPageProps){
  const PREFERENCES_STORAGE_KEY = 'f1ca:user-preferences:v1'
  const [selectedTrack, setSelectedTrack] = useState<string>(trackId)
  // Initialize with empty object so page can render immediately
  const [trackData, setTrackData] = useState<TracksData>({ tracks: {} })
  const [tracksLoading, setTracksLoading] = useState<boolean>(true)
  const [tracksError, setTracksError] = useState<string | null>(null)
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(true)
  const [pageContentVisible, setPageContentVisible] = useState<boolean>(false)
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [sessionData, setSessionData] = useState<SessionPayload | null>(null)
  const [sessionLoading, setSessionLoading] = useState<boolean>(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [showOutliers, setShowOutliers] = useState<boolean>(true)
  const [preferencesHydrated, setPreferencesHydrated] = useState<boolean>(false)
  const [trackMapMode, setTrackMapMode] = useState<'2d' | '3d'>('3d')

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    let timeoutCleared = false
    
    // Safety timeout - ensure page always renders after max 3 seconds
    const safetyTimeoutId = setTimeout(() => {
      if (!cancelled && !timeoutCleared) {
        console.warn('Safety timeout: Forcing page render after 3 seconds')
        setTracksLoading(false)
        timeoutCleared = true
        
        // Smooth transition on timeout
        setTimeout(() => {
          setShowLoadingScreen(false)
          setTimeout(() => {
            setPageContentVisible(true)
          }, 150)
        }, 300)
      }
    }, 3000)
    
    // Fetch timeout for error reporting
    const fetchTimeoutId = setTimeout(() => {
      if (!cancelled && !timeoutCleared) {
        console.warn('Tracks fetch taking longer than expected (>3s)')
        setTracksError('Loading is taking longer than expected')
      }
    }, 3000)
    
    console.log('[ClientPage] Starting tracks fetch...')
    const startTime = Date.now()
    
    fetch('/data/tracks.json', { signal: controller.signal })
      .then(r => {
        const elapsed = Date.now() - startTime
        console.log(`[ClientPage] Fetch response received after ${elapsed}ms, status:`, r.status)
        
        if (cancelled) return null
        if (!r.ok) {
          throw new Error(`Failed to load tracks: ${r.status} ${r.statusText}`)
        }
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        if (!data) return
        
        const elapsed = Date.now() - startTime
        console.log(`[ClientPage] Tracks loaded after ${elapsed}ms:`, Object.keys(data?.tracks || {}).length, 'tracks')
        
        if (typeof data !== 'object' || !data.tracks) {
          throw new Error('Invalid tracks data format')
        }
        
        clearTimeout(safetyTimeoutId)
        clearTimeout(fetchTimeoutId)
        timeoutCleared = true
        
        setTrackData(data as TracksData)
        setTracksLoading(false)
        setTracksError(null)
        
        // Smooth transition: fade out loading, fade in content
        setTimeout(() => {
          setShowLoadingScreen(false)
          // Small delay before showing content for smooth transition
          setTimeout(() => {
            setPageContentVisible(true)
          }, 150)
        }, 300)
      })
      .catch((error) => {
        const elapsed = Date.now() - startTime
        if (cancelled || error.name === 'AbortError') {
          console.log(`[ClientPage] Fetch cancelled/aborted after ${elapsed}ms`)
          return
        }
        
        console.error(`[ClientPage] Error loading tracks after ${elapsed}ms:`, error)
        clearTimeout(safetyTimeoutId)
        clearTimeout(fetchTimeoutId)
        timeoutCleared = true
        
        setTracksError(error instanceof Error ? error.message : 'Failed to load tracks')
        setTracksLoading(false)
        
        // Smooth transition even on error
        setTimeout(() => {
          setShowLoadingScreen(false)
          setTimeout(() => {
            setPageContentVisible(true)
          }, 150)
        }, 300)
      })
    
    return () => {
      console.log('[ClientPage] Cleanup: cancelling fetch')
      cancelled = true
      clearTimeout(safetyTimeoutId)
      clearTimeout(fetchTimeoutId)
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const query = new URLSearchParams(window.location.search)
      const queryYear = Number(query.get('year'))
      const querySession = query.get('session')?.toUpperCase()
      const queryDrivers = query
        .get('drivers')
        ?.split(',')
        .map((driver) => driver.trim().toUpperCase())
        .filter(Boolean)

      const saved = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      const parsed = (saved ? JSON.parse(saved) : {}) as {
        selectedYear?: number
        selectedTrack?: string
        selectedSession?: string
        selectedDrivers?: string[]
        showOutliers?: boolean
      }

      if (typeof parsed.selectedYear === 'number') setSelectedYear(parsed.selectedYear)
      // Track comes from the route (/race/[trackId]); do not override from prefs
      if (typeof parsed.selectedSession === 'string') setSelectedSession(parsed.selectedSession)
      if (Array.isArray(parsed.selectedDrivers)) {
        setSelectedDrivers(parsed.selectedDrivers.filter((d): d is string => typeof d === 'string'))
      }
      if (typeof parsed.showOutliers === 'boolean') setShowOutliers(parsed.showOutliers)

      // Explicit share-link parameters take precedence over saved preferences.
      if (Number.isInteger(queryYear) && queryYear > 0) setSelectedYear(queryYear)
      if (querySession && sessionOptions.some((option) => option.value === querySession)) {
        setSelectedSession(querySession)
      }
      if (queryDrivers?.length) setSelectedDrivers(Array.from(new Set(queryDrivers)))
    } catch (error) {
      console.warn('[ClientPage] Failed to restore saved preferences:', error)
    } finally {
      setPreferencesHydrated(true)
    }
  }, [])

  const [selectedYear, setSelectedYear] = useState<number>(0)
  const [availableRoundsByYear, setAvailableRoundsByYear] = useState<Record<string, string[]>>({})
  const [sessionsByRound, setSessionsByRound] = useState<Record<string, Record<string, string[]>>>({})
  const [sessionsLoadError, setSessionsLoadError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedTrack(trackId)
  }, [trackId])

  const seasonYears = useMemo(() => getSupportedSeasonYears(), [])
  const calendarYears = useMemo(() => getAvailableCalendarYears(), [])
  const availableYears = useMemo(
    () =>
      Array.from(
        new Set([
          ...seasonYears,
          ...calendarYears,
          ...Object.keys(availableRoundsByYear).map(Number),
        ]),
      ).sort((a, b) => a - b),
    [availableRoundsByYear, calendarYears, seasonYears],
  )

  const calendarData = useMemo<SeasonCalendar | null>(
    () => (selectedYear === 0 ? null : getCalendarForYear(selectedYear)),
    [selectedYear],
  )

  useEffect(() => {
    // Discover available sessions (years/rounds) via server-side index
    fetch('/api/sessions/index')
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load sessions index: ${r.statusText}`)
        return r.json()
      })
      .then((idx) => {
        if (idx?.error) {
          throw new Error(idx.error)
        }
        setSessionsLoadError(null)

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
      .catch((error) => {
        console.error('Error loading sessions index:', error)
        setSessionsLoadError(error instanceof Error ? error.message : 'Failed to load sessions')
        setAvailableRoundsByYear({})
        setSessionsByRound({})
      })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !preferencesHydrated) return

    try {
      const existing = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      const parsed = existing ? JSON.parse(existing) : {}
      window.localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          selectedYear,
          selectedTrack,
          selectedSession,
          selectedDrivers,
          showOutliers,
        }),
      )
    } catch (error) {
      console.warn('[ClientPage] Failed to persist user preferences:', error)
    }
  }, [preferencesHydrated, selectedYear, selectedTrack, selectedSession, selectedDrivers, showOutliers])

  useEffect(() => {
    if (!selectedTrack || !selectedSession || selectedYear === 0) {
      setSessionData(null)
      setSessionError(null)
      setSessionLoading(false)
      return
    }

    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let isCancelled = false
    
    setSessionLoading(true)
    setSessionError(null)

    // Set a timeout to abort the request if it takes too long (60 seconds)
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        console.warn(`[ClientPage] Session data load timeout after 60s for ${selectedYear}/${selectedTrack}/${selectedSession}`)
        controller.abort()
        setSessionError('Request timed out. The session data may be very large. Please try selecting fewer drivers.')
        setSessionLoading(false)
        isCancelled = true
      }
    }, 60000)

    const startTime = Date.now()
    loadSessionData(
      {
        year: selectedYear,
        round: selectedTrack,
        session: selectedSession,
        drivers: selectedDrivers.length > 0 ? selectedDrivers : undefined // Pass undefined to load all drivers
      },
      { signal: controller.signal }
    )
      .then(data => {
        if (isCancelled || controller.signal.aborted) return
        
        const elapsed = Date.now() - startTime
        console.log(`[ClientPage] Session data loaded in ${elapsed}ms for ${selectedYear}/${selectedTrack}/${selectedSession}: ${Object.keys(data?.drivers ?? {}).length} drivers, ${data?.laps?.length ?? 0} laps`)
        
        if (timeoutId) clearTimeout(timeoutId)
        setSessionData(data)
        setSessionLoading(false)
      })
      .catch(error => {
        if (isCancelled || controller.signal.aborted) {
          console.log('[ClientPage] Session data load cancelled')
          return
        }
        
        const elapsed = Date.now() - startTime
        console.error(`[ClientPage] Error loading session data after ${elapsed}ms:`, error)
        
        if (timeoutId) clearTimeout(timeoutId)
        setSessionData(null)
        setSessionError(error instanceof Error ? error.message : String(error))
        setSessionLoading(false)
      })

    return () => {
      isCancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      controller.abort()
    }
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
  
  // Aggregate corner performance data
  // When selectedDrivers is empty, we want to show all drivers (pass undefined to aggregateCornerPerformance)
  const cornerPerformance = useMemo(() => {
    if (!sessionData?.corners) return undefined
    // If selectedDrivers is empty, process all drivers (pass undefined)
    // Otherwise, pass the selected drivers
    const driversToUse = selectedDrivers.length > 0 ? selectedDrivers : undefined
    // Pass cornerInfo from currentTrack to use authoritative corner types from tracks.json
    const cornerInfo = currentTrack?.corners?.map(c => ({ number: c.number, type: c.type }))
    return aggregateCornerPerformance(sessionData.corners, driversToUse, cornerInfo)
  }, [sessionData?.corners, selectedDrivers, currentTrack])
  
  // Get available sessions for the selected track
  const availableSessions = useMemo(() => {
    if (!selectedTrack || selectedYear === 0) return []
    const yearSessions = sessionsByRound[String(selectedYear)]
    if (!yearSessions) return []
    return yearSessions[selectedTrack] ?? []
  }, [selectedTrack, selectedYear, sessionsByRound])

  useEffect(() => {
    if (!preferencesHydrated || availableYears.length === 0) return
    if (selectedYear !== 0 && availableYears.includes(selectedYear)) return

    const latestYear = Math.max(...availableYears)
    setSelectedYear(latestYear)
  }, [preferencesHydrated, selectedYear, availableYears])

  // Reset selected session if it's not available for the selected track
  // Use a ref to track the current session to avoid stale closures
  const selectedSessionRef = useRef(selectedSession)
  useEffect(() => {
    selectedSessionRef.current = selectedSession
  }, [selectedSession])

  useEffect(() => {
    // Only run this effect when track or available sessions change
    // Use ref to get current session value to avoid dependency issues
    if (!selectedTrack || availableSessions.length === 0) {
      return
    }

    const currentSession = selectedSessionRef.current
    // Check if current session is available
    if (!availableSessions.includes(currentSession)) {
      // Reset to first available session (prefer Q, then R, then first available)
      const preferredOrder = ['Q', 'R', 'SQ', 'S']
      const preferred = preferredOrder.find(s => availableSessions.includes(s))
      const newSession = preferred || availableSessions[0]
      if (newSession && newSession !== currentSession) {
        console.log(`[ClientPage] Session ${currentSession} not available for ${selectedTrack}, switching to ${newSession}`)
        setSelectedSession(newSession)
      }
    }
  }, [selectedTrack, availableSessions]) // Removed selectedSession from deps to prevent loops

  const indexedRoundIdsForYear = useMemo(() => {
    if (selectedYear === 0) return []
    return availableRoundsByYear[String(selectedYear)] ?? []
  }, [availableRoundsByYear, selectedYear])

  const roundNumberMap = useMemo(() => {
    const map = new Map<string, number>()
    calendarData?.rounds.forEach((round) => {
      map.set(round.id, round.round)
    })
    indexedRoundIdsForYear.forEach((roundId, index) => {
      if (!map.has(roundId)) {
        map.set(roundId, index + 1)
      }
    })
    return map
  }, [calendarData, indexedRoundIdsForYear])

  const selectedRoundNumber = useMemo(() => {
    if (!selectedTrack) return null
    return roundNumberMap.get(selectedTrack) ?? null
  }, [roundNumberMap, selectedTrack])

  // Filter selected drivers when track changes - only keep drivers who raced at this track
  useEffect(() => {
    if (!selectedTrack || selectedYear === 0 || selectedRoundNumber === null) {
      return
    }

    // Filter drivers based on assignments and session data
    const filtered = filterDriversForTrack(
      selectedYear,
      selectedRoundNumber,
      selectedDrivers,
      sessionData
    )

    // Only update if the list actually changed (to avoid infinite loops)
    if (filtered.length !== selectedDrivers.length || 
        !filtered.every((d, i) => d.toUpperCase() === selectedDrivers[i]?.toUpperCase())) {
      console.log(`[ClientPage] Filtering drivers for track ${selectedTrack} (round ${selectedRoundNumber}): ${selectedDrivers.length} -> ${filtered.length}`)
      if (filtered.length > 0) {
        setSelectedDrivers(filtered)
      } else {
        // If no selected drivers are available, clear selection
        // User can select new drivers from the toolbar
        setSelectedDrivers([])
      }
    }
  }, [selectedTrack, selectedYear, selectedRoundNumber]) // Note: intentionally not including selectedDrivers or sessionData to avoid loops

  const sessionLabel = useMemo(() => {
    const found = sessionOptions.find(option => option.value === selectedSession)
    return found?.label ?? selectedSession
  }, [selectedSession])

  const trackList = useMemo(() => {
    if (selectedYear === 0) return []

    const seenRounds = new Set<string>()
    const indexedRoundSet = new Set(indexedRoundIdsForYear)
    const tracks: Array<{
      id: string
      name: string
      countryCode?: string
      disabled?: boolean
      status?: 'completed' | 'upcoming' | 'postponed'
      meta?: string
    }> = []

    const formatFallbackLabel = (roundId: string) =>
      roundId
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')

    for (const round of calendarData?.rounds ?? []) {
      seenRounds.add(round.id)
      const hasSessionData = indexedRoundSet.has(round.id)
      const status = round.status ?? (hasSessionData ? 'completed' : 'upcoming')
      const disabled = status !== 'completed' || !hasSessionData

      let meta: string | undefined
      if (status === 'postponed') {
        meta = 'Postponed'
      } else if (status === 'upcoming') {
        meta = 'Upcoming'
      } else if (!hasSessionData) {
        meta = 'Data pending'
      }

      tracks.push({
        id: round.id,
        name: round.name,
        countryCode: round.countryCode,
        disabled,
        status,
        meta,
      })
    }

    for (const roundId of indexedRoundIdsForYear) {
      if (seenRounds.has(roundId)) continue
      tracks.push({
        id: roundId,
        name: trackData.tracks[roundId]?.name ?? formatFallbackLabel(roundId),
      })
    }

    return tracks.sort((a, b) => {
      const roundA = roundNumberMap.get(a.id)
      const roundB = roundNumberMap.get(b.id)
      if (roundA !== undefined && roundB !== undefined) {
        return roundA - roundB
      }
      if (roundA !== undefined) return -1
      if (roundB !== undefined) return 1
      return a.name.localeCompare(b.name)
    })
  }, [calendarData, indexedRoundIdsForYear, roundNumberMap, selectedYear, trackData])

  const selectableTrackIds = useMemo(
    () => trackList.filter((track) => !track.disabled).map((track) => track.id),
    [trackList],
  )

  const trackAvailableForYear = useMemo(() => {
    if (!selectedTrack || selectedYear === 0) return false
    return selectableTrackIds.includes(selectedTrack)
  }, [selectableTrackIds, selectedTrack, selectedYear])

  // Define TOC sections
  const tocSections = useMemo(() => {
    if (!currentTrack) return []
    return [
      { id: 'track-visualization', label: 'Track Visualization', level: 1 },
      { id: 'track-information', label: 'Track Information', level: 1 },
      { id: 'lap-time-comparison', label: 'Lap Time Comparison', level: 1 },
      { id: 'analysis-panel', label: 'Analysis Panel', level: 1 },
    ]
  }, [currentTrack])

  // Always render page content, loading screen overlays it
  const isLoading = showLoadingScreen && (tracksLoading || Object.keys(trackData.tracks).length === 0)
  
  return (
    <div className="relative pb-8">
      {/* Loading screen overlay with smooth fade transition */}
      {showLoadingScreen && (
        <div className={`loading-screen-wrapper ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
            <div className="flex flex-col items-center gap-6">
              {/* Logo with rotating spinner around it */}
              <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 loading-spinner-container">
                {/* Outer glow effect */}
                <div className="absolute inset-[-24px] bg-accent/6 rounded-full blur-2xl animate-pulse-slow" />
                
                {/* Optimized rotating spinner - single clean arc */}
                <div className="absolute inset-[-8px] spinner-wrapper">
                  <svg 
                    className="w-full h-full spinner-svg" 
                    viewBox="0 0 100 100" 
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Subtle static background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(225, 6, 0, 0.08)"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Smooth animated progress arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(225, 6, 0, 0.85)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="65 283"
                      strokeDashoffset="0"
                      className="spinner-ring"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                
                {/* Logo container */}
                <div className="relative flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-full border border-accent/30 bg-transparent z-10 loading-logo">
                  <Image
                    src="/logos/f1-corner-analysis.png"
                    alt="F1 Corner Analysis logo"
                    width={128}
                    height={128}
                    className="object-contain p-3 animate-logo-enter"
                    priority
                  />
                </div>
              </div>
              
              {/* Loading text */}
              <p className="text-subtext-clr text-sm font-medium animate-pulse mt-2 loading-text">
                Loading tracks...
              </p>
            </div>
          </div>
        </div>
      )}

      <AppNav contextLabel={currentTrack?.name} />

      {/* Page content - rendered behind loading screen for smooth transition */}
      <main className={`max-w-6xl mx-auto px-4 pt-6 page-content ${pageContentVisible ? 'page-content-visible' : 'page-content-hidden'}`}>
      <div className="relative">
        {currentTrack && tocSections.length > 0 && (
          <div
            className="absolute top-0 right-0 hidden lg:block"
            style={{ zIndex: 200, overflow: 'visible' }}
          >
            <TableOfContents
              sections={tocSections}
              isVisible={!!currentTrack}
              variant="header"
            />
          </div>
        )}
      </div>

      {tracksError && (
        <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 page-section page-section-1">
          <div className="font-semibold mb-1">Error: Could not load track data</div>
          <div className="text-red-400/80">{tracksError}</div>
          <div className="text-red-400/60 text-xs mt-1">The page may have limited functionality.</div>
        </div>
      )}

      {sessionsLoadError && (
        <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300 page-section page-section-1">
          <div className="font-semibold mb-1">Warning: Could not load session data</div>
          <div className="text-yellow-400/80">{sessionsLoadError}</div>
          <div className="text-yellow-400/60 text-xs mt-1">The page will still function, but you may not see available tracks and sessions.</div>
        </div>
      )}

      <div className="page-section page-section-2">
        <Toolbar 
          mode="race"
          years={availableYears.length > 0 ? availableYears : [selectedYear]}
          selectedYear={selectedYear}
          onYearChangeAction={setSelectedYear}
          selectedDrivers={selectedDrivers}
          onDriversChangeAction={setSelectedDrivers}
          selectedSession={selectedSession}
          onSessionChangeAction={setSelectedSession}
          availableSessions={availableSessions}
          roundNumber={selectedRoundNumber}
          sessionData={sessionData}
          selectedTrack={selectedTrack}
        />
      </div>

      {!currentTrack && preferencesHydrated && !tracksLoading && (
        <section className="mt-6 page-section page-section-3">
          <div className="panel p-8 text-center">
            <p className="text-sm text-gray-300">Circuit not found for “{selectedTrack}”.</p>
            <Link href="/race" className="mt-3 inline-block text-sm text-accent no-underline hover:underline">
              Back to circuit selector
            </Link>
          </div>
        </section>
      )}

      {currentTrack && !trackAvailableForYear && selectedYear > 0 && (
        <section className="mt-4">
          <div className="rounded border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            This circuit has no completed session data for {selectedYear}. Pick another year, or{' '}
            <Link href="/race" className="text-accent underline-offset-2 hover:underline">
              choose a different track
            </Link>
            .
          </div>
        </section>
      )}

      {currentTrack && (
        <>
          <section id="track-visualization" className="mt-6 grid lg:grid-cols-2 gap-6 page-section page-section-3">
            <div className="panel p-4">
              <div className="track-map-mode-bar" role="tablist" aria-label="Circuit map mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={trackMapMode === '3d'}
                  className={`track-map-mode-btn${trackMapMode === '3d' ? ' is-active' : ''}`}
                  onClick={() => setTrackMapMode('3d')}
                >
                  3D
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={trackMapMode === '2d'}
                  className={`track-map-mode-btn${trackMapMode === '2d' ? ' is-active' : ''}`}
                  onClick={() => setTrackMapMode('2d')}
                >
                  2D
                </button>
              </div>
              <div className="race-circuit-stage-host">
                <CircuitTrackStage
                  svgFile={currentTrack.svgFile}
                  corners={currentTrack.corners}
                  orientation={trackMapMode}
                  autoSpin={trackMapMode === '3d'}
                  scaleFactor={getCircuitVisualScale(currentTrack.id)}
                />
              </div>
            </div>
            <div id="track-information" className="panel p-4">
              <div className="text-lg font-bold">{currentTrack.name}</div>
              <div className="text-gray-600">{selectedYear}</div>
              <div className="mt-2 text-sm text-gray-400">
                Session: {sessionLabel}
              </div>
              
              {/* Track Information Section */}
              {trackInfo[selectedTrack] && (
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="font-semibold uppercase tracking-wide text-xs text-gray-400 mb-1">
                      Location
                    </div>
                    <div className="text-gray-300">{trackInfo[selectedTrack].location}</div>
                  </div>
                  
                  {trackInfo[selectedTrack].trackLength && (
                    <div>
                      <div className="font-semibold uppercase tracking-wide text-xs text-gray-400 mb-1">
                        Track Length
                      </div>
                      <div className="text-gray-300">{trackInfo[selectedTrack].trackLength}</div>
                    </div>
                  )}
                  
                  {trackInfo[selectedTrack].elevationChange && (
                    <div>
                      <div className="font-semibold uppercase tracking-wide text-xs text-gray-400 mb-1">
                        Elevation Change
                      </div>
                      <div className="text-gray-300">{trackInfo[selectedTrack].elevationChange}</div>
                    </div>
                  )}
                  
                  {trackInfo[selectedTrack].firstGrandPrix && (
                    <div>
                      <div className="font-semibold uppercase tracking-wide text-xs text-gray-400 mb-1">
                        First Grand Prix
                      </div>
                      <div className="text-gray-300">{trackInfo[selectedTrack].firstGrandPrix}</div>
                    </div>
                  )}
                  
                  {trackInfo[selectedTrack].funFacts && trackInfo[selectedTrack].funFacts!.length > 0 && (
                    <div>
                      <div className="font-semibold uppercase tracking-wide text-xs text-gray-400 mb-2">
                        Fun Facts
                      </div>
                      <ul className="space-y-1.5 text-gray-300">
                        {trackInfo[selectedTrack].funFacts!.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-accent mt-0.5">•</span>
                            <span className="text-xs leading-relaxed">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-300">
                <div className="font-semibold uppercase tracking-wide text-xs text-gray-400 mb-2">
                  Selected Drivers
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDrivers.length
                    ? selectedDrivers.map(code => (
                        <span
                          key={code}
                          className="inline-flex items-center justify-center rounded-full border border-gray-700 bg-gray-800/70 px-2 py-0.5 text-xs font-medium text-gray-200"
                        >
                          {code}
                        </span>
                      ))
                    : <span className="text-gray-500">None. Use Drivers presets or team logos above.</span>
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
          </section>

          <section id="lap-time-comparison" className="page-section page-section-4">
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
          </section>

          <section id="analysis-panel" className="page-section page-section-5">
            <AnalysisPanel
            sessionData={sessionData}
            cornerPerformance={cornerPerformance}
            selectedDrivers={selectedDrivers}
            currentTrack={currentTrack}
            cornerFilter={cornerFilter}
          />
          </section>
        </>
      )}
      </main>
      <Chatbot 
        context={{
          track: selectedTrack,
          year: selectedYear,
          session: selectedSession,
          drivers: selectedDrivers,
        }}
      />
    </div>
  )
}
