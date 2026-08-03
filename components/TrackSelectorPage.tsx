'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AppShell from './AppShell'
import CustomSelect from './CustomSelect'
import { getAvailableCalendarYears, getCalendarForYear } from '../lib/calendarData'
import { getSupportedSeasonYears } from '../lib/teamData'
import { getCountryFlagIcon } from '../lib/countryFlags'
import { trackInfo } from '../lib/trackInfo'
import LoadingIndicator from './LoadingIndicator'

const LazyTrack3D = dynamic(() => import('./LazyTrack3D'), {
  ssr: false,
  loading: () => <div className="lazy-track-3d-placeholder" aria-hidden="true" />,
})

const PREFERENCES_STORAGE_KEY = 'f1ca:user-preferences:v1'

const SESSION_ORDER = ['FP1', 'FP2', 'FP3', 'SQ', 'Q', 'S', 'R'] as const
const SESSION_LABELS: Record<string, string> = {
  FP1: 'FP1',
  FP2: 'FP2',
  FP3: 'FP3',
  SQ: 'SQ',
  Q: 'Q',
  S: 'S',
  R: 'R',
}

type FilterId = 'all' | 'ready' | 'upcoming'

type TracksJson = {
  tracks: Record<
    string,
    {
      id: string
      name: string
      svgFile: string
    }
  >
}

type TrackCard = {
  id: string
  name: string
  officialName?: string
  location?: string
  date?: string
  round?: number
  countryCode?: string
  svgFile: string | null
  disabled: boolean
  status?: 'completed' | 'upcoming' | 'postponed'
  meta?: string
  sessions: string[]
}

type RaceHighlights = {
  winner?: string
  winnerTeam?: string
  pole?: string
  poleTeam?: string
  podium?: string[]
}

function sortSessions(sessions: string[]) {
  return [...sessions].sort(
    (a, b) =>
      SESSION_ORDER.indexOf(a as (typeof SESSION_ORDER)[number]) -
      SESSION_ORDER.indexOf(b as (typeof SESSION_ORDER)[number]),
  )
}

function preferredSession(sessions: string[]) {
  if (sessions.includes('R')) return 'R'
  if (sessions.includes('Q')) return 'Q'
  return sessions[0]
}

function trackHref(year: number, trackId: string, session?: string) {
  const query = new URLSearchParams({ year: String(year) })
  if (session) query.set('session', session)
  return `/race/${encodeURIComponent(trackId)}?${query.toString()}`
}

function rememberTrack(year: number, trackId: string) {
  try {
    const existing = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
    const parsed = existing ? JSON.parse(existing) : {}
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        ...parsed,
        selectedYear: year,
        selectedTrack: trackId,
      }),
    )
  } catch {
    // ignore
  }
}

function statusTone(status?: TrackCard['status'], disabled?: boolean) {
  if (status === 'postponed') return 'is-postponed'
  if (status === 'upcoming' || disabled) return 'is-upcoming'
  return 'is-ready'
}

function statusLabel(track: TrackCard) {
  if (track.meta) return track.meta
  if (track.status === 'postponed') return 'Postponed'
  if (track.status === 'upcoming' || track.disabled) return 'Upcoming'
  return 'Ready'
}

function railLabel(track: TrackCard) {
  const raw = (track.location ?? track.name.replace(/\s+Grand Prix$/i, '')).toUpperCase()
  return raw.replace(/[^A-Z0-9\s]/g, '').trim() || track.id.toUpperCase()
}

function RedTrackSilhouette({
  svgFile,
  className = '',
}: {
  svgFile: string
  className?: string
}) {
  const url = `/Tracks/${svgFile}`
  return (
    <div
      className={`track-red-sil ${className}`.trim()}
      style={{
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
      }}
      aria-hidden="true"
    />
  )
}

export default function TrackSelectorPage() {
  const [selectedYear, setSelectedYear] = useState(0)
  const [filter, setFilter] = useState<FilterId>('all')
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [preferencesHydrated, setPreferencesHydrated] = useState(false)
  const [trackData, setTrackData] = useState<TracksJson>({ tracks: {} })
  const [trackDataLoading, setTrackDataLoading] = useState(true)
  const [availableRoundsByYear, setAvailableRoundsByYear] = useState<Record<string, string[]>>({})
  const [sessionsByRound, setSessionsByRound] = useState<Record<string, Record<string, string[]>>>({})
  const [sessionIndexLoading, setSessionIndexLoading] = useState(true)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [highlights, setHighlights] = useState<RaceHighlights | null>(null)
  const [highlightsLoading, setHighlightsLoading] = useState(false)

  const availableYears = useMemo(
    () =>
      Array.from(new Set([...getSupportedSeasonYears(), ...getAvailableCalendarYears()])).sort(
        (a, b) => a - b,
      ),
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { selectedYear?: number; selectedTrack?: string }
        if (typeof parsed.selectedYear === 'number') setSelectedYear(parsed.selectedYear)
        if (typeof parsed.selectedTrack === 'string') setSelectedTrackId(parsed.selectedTrack)
      }
    } catch {
      // ignore
    } finally {
      setPreferencesHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!preferencesHydrated || availableYears.length === 0) return
    if (selectedYear !== 0 && availableYears.includes(selectedYear)) return
    setSelectedYear(Math.max(...availableYears))
  }, [preferencesHydrated, selectedYear, availableYears])

  useEffect(() => {
    if (typeof window === 'undefined' || !preferencesHydrated || selectedYear === 0) return
    try {
      const existing = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
      const parsed = existing ? JSON.parse(existing) : {}
      window.localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({ ...parsed, selectedYear }),
      )
    } catch {
      // ignore
    }
  }, [preferencesHydrated, selectedYear])

  useEffect(() => {
    fetch('/data/tracks.json')
      .then((r) => r.json())
      .then((data: TracksJson) => setTrackData(data))
      .catch(() => setTrackData({ tracks: {} }))
      .finally(() => setTrackDataLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/sessions/index')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then((idx) => {
        const map: Record<string, string[]> = {}
        const sessionMap: Record<string, Record<string, string[]>> = {}
        for (const [year, payload] of Object.entries(idx?.years ?? {})) {
          const rounds = (payload as { rounds?: Array<{ id: string; sessions?: string[] }> })?.rounds
          map[year] = Array.isArray(rounds) ? rounds.map((r) => r.id) : []
          sessionMap[year] = Object.fromEntries(
            (rounds ?? []).map((round) => [round.id, round.sessions ?? []]),
          )
        }
        setAvailableRoundsByYear(map)
        setSessionsByRound(sessionMap)
        setIndexError(null)
      })
      .catch((error) => {
        setIndexError(error instanceof Error ? error.message : 'Failed to load sessions')
        setAvailableRoundsByYear({})
        setSessionsByRound({})
      })
      .finally(() => setSessionIndexLoading(false))
  }, [])

  const tracks = useMemo((): TrackCard[] => {
    if (selectedYear === 0) return []

    const calendar = getCalendarForYear(selectedYear)
    const indexed = new Set(availableRoundsByYear[String(selectedYear)] ?? [])
    const yearSessions = sessionsByRound[String(selectedYear)] ?? {}
    const seen = new Set<string>()
    const cards: TrackCard[] = []

    const resolveSvg = (id: string) => trackData.tracks[id]?.svgFile ?? null
    const formatFallback = (id: string) =>
      id
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')

    for (const round of calendar?.rounds ?? []) {
      seen.add(round.id)
      const hasData = indexed.has(round.id)
      const status = round.status ?? (hasData ? 'completed' : 'upcoming')
      const disabled = status !== 'completed' || !hasData
      let meta: string | undefined
      if (status === 'postponed') meta = 'Postponed'
      else if (status === 'upcoming') meta = 'Upcoming'
      else if (!hasData) meta = 'Data pending'

      cards.push({
        id: round.id,
        name: round.name,
        officialName: round.officialName,
        location: round.location,
        date: round.date,
        round: round.round,
        countryCode: round.countryCode,
        svgFile: resolveSvg(round.id),
        disabled,
        status,
        meta,
        sessions: sortSessions(yearSessions[round.id] ?? []),
      })
    }

    for (const id of indexed) {
      if (seen.has(id)) continue
      cards.push({
        id,
        name: trackData.tracks[id]?.name ?? formatFallback(id),
        svgFile: resolveSvg(id),
        disabled: false,
        status: 'completed',
        sessions: sortSessions(yearSessions[id] ?? []),
      })
    }

    return cards.sort((a, b) => (a.round ?? 999) - (b.round ?? 999) || a.name.localeCompare(b.name))
  }, [availableRoundsByYear, selectedYear, sessionsByRound, trackData])

  const yearOptions = useMemo(
    () => [{ value: 0, label: 'Year' }, ...availableYears.map((y) => ({ value: y, label: String(y) }))],
    [availableYears],
  )

  const availableCount = tracks.filter((t) => !t.disabled).length
  const upcomingCount = tracks.filter((t) => t.disabled).length
  const dataLoading = !preferencesHydrated || trackDataLoading || sessionIndexLoading

  const previousYearRef = useRef<number | null>(null)

  useEffect(() => {
    if (!preferencesHydrated || selectedYear === 0) return
    if (previousYearRef.current === null) {
      previousYearRef.current = selectedYear
      return
    }
    if (previousYearRef.current !== selectedYear) {
      previousYearRef.current = selectedYear
      setSelectedTrackId(null)
    }
  }, [selectedYear, preferencesHydrated])

  useEffect(() => {
    if (!tracks.length) {
      setSelectedTrackId(null)
      return
    }
    // Keep flat card grid until the user clicks a circuit into the big view.
    if (selectedTrackId && !tracks.some((t) => t.id === selectedTrackId)) {
      setSelectedTrackId(null)
    }
  }, [tracks, selectedTrackId])

  const selected = useMemo(
    () => tracks.find((t) => t.id === selectedTrackId) ?? null,
    [tracks, selectedTrackId],
  )

  const filteredTracks = useMemo(() => {
    if (filter === 'ready') return tracks.filter((t) => !t.disabled)
    if (filter === 'upcoming') return tracks.filter((t) => t.disabled)
    return tracks
  }, [filter, tracks])

  const progressPct =
    tracks.length > 0 ? Math.round((availableCount / tracks.length) * 100) : 0

  const info = selected ? trackInfo[selected.id] : undefined

  useEffect(() => {
    if (!selected || selected.disabled || selectedYear === 0) {
      setHighlights(null)
      return
    }

    let cancelled = false
    setHighlightsLoading(true)

    const load = async () => {
      try {
        const raceRes = await fetch(`/data/sessions/${selectedYear}/${selected.id}/R/session.json`)
        const raceData = raceRes.ok ? await raceRes.json() : null

        let qualiData = null
        if (selected.sessions.includes('Q')) {
          const qualiRes = await fetch(`/data/sessions/${selectedYear}/${selected.id}/Q/session.json`)
          qualiData = qualiRes.ok ? await qualiRes.json() : null
        }

        if (cancelled) return

        const raceResults = Array.isArray(raceData?.raceResults) ? raceData.raceResults : []
        const qualiResults = Array.isArray(qualiData?.qualifyingResults)
          ? qualiData.qualifyingResults
          : Array.isArray(raceData?.qualifyingResults)
            ? raceData.qualifyingResults
            : []

        const winner = raceResults.find((r: { position?: number }) => r.position === 1)
        const pole =
          qualiResults.find((r: { position?: number }) => r.position === 1) ??
          raceResults.find((r: { gridPosition?: number }) => r.gridPosition === 1)
        const podium = raceResults
          .filter((r: { position?: number }) => typeof r.position === 'number' && r.position <= 3)
          .sort(
            (a: { position: number }, b: { position: number }) => a.position - b.position,
          )
          .map((r: { driverCode?: string }) => r.driverCode)
          .filter(Boolean)

        setHighlights({
          winner: winner?.driverCode,
          winnerTeam: winner?.teamName,
          pole: pole?.driverCode,
          poleTeam: pole?.teamName,
          podium,
        })
      } catch {
        if (!cancelled) setHighlights(null)
      } finally {
        if (!cancelled) setHighlightsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [selected, selectedYear])

  const selectTrack = (track: TrackCard) => {
    setSelectedTrackId(track.id)
    rememberTrack(selectedYear, track.id)
  }

  return (
    <AppShell
      kicker="Race analysis"
      title="Circuits"
      description="Select a grand prix below. The visualiser frames circuit stats, then open Qualifying or Race analysis when you are ready."
      headerAside={
        <div className="track-selector-header-aside">
          <CustomSelect
            options={yearOptions}
            value={selectedYear}
            onChange={(v) => setSelectedYear(Number(v))}
            placeholder="Select Year"
            placeholderValue={0}
            className="w-[110px]"
            minWidth="100px"
          />
          {selectedYear > 0 && !dataLoading && (
            <div className="track-selector-season-stat" aria-label="Season coverage">
              <div className="track-selector-season-stat-row">
                <span className="track-selector-season-stat-label">Season coverage</span>
                <span className="track-selector-season-stat-value">
                  {availableCount}
                  <span className="track-selector-season-stat-muted"> / {tracks.length}</span>
                </span>
              </div>
              <div className="track-selector-progress" role="presentation">
                <div className="track-selector-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      }
    >
      {indexError && (
        <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          Could not load session index: {indexError}
        </div>
      )}

      {dataLoading ? (
        <div className="panel">
          <LoadingIndicator label="Loading circuits and available sessions..." className="py-20" />
        </div>
      ) : selectedYear === 0 ? (
        <div className="panel p-10 text-center text-sm text-gray-400">
          Select a year to browse circuits.
        </div>
      ) : (
        <>
          {selected && (
            <section className="track-visualiser" aria-label="Track visualiser">
              <div className="track-visualiser-rail" aria-hidden="true">
                <span className="track-visualiser-rail-name">{railLabel(selected)}</span>
                {getCountryFlagIcon(selected.countryCode) && (
                  <img
                    src={getCountryFlagIcon(selected.countryCode)!}
                    alt=""
                    className="track-visualiser-rail-flag"
                  />
                )}
              </div>

              <div className="track-visualiser-stage">
                {selected.svgFile ? (
                  selected.disabled ? (
                    <div className="track-visualiser-still">
                      <RedTrackSilhouette svgFile={selected.svgFile} className="is-lg is-muted" />
                    </div>
                  ) : (
                    <LazyTrack3D
                      svgFile={selected.svgFile}
                      variant="neon"
                      autoRotate
                      autoRotateSpeed={0.32}
                      className="track-visualiser-3d"
                      rootMargin="400px 0px"
                    />
                  )
                ) : (
                  <div className="track-selector-svg-fallback">No map</div>
                )}
              </div>

              <div className="track-visualiser-side">
                <div className="track-visualiser-stats">
                  <div className="track-visualiser-stat">
                    <span className="track-visualiser-stat-label">When</span>
                    <span className="track-visualiser-stat-value is-accent">
                      {selected.date ?? selectedYear}
                    </span>
                  </div>
                  <div className="track-visualiser-stat">
                    <span className="track-visualiser-stat-label">Length</span>
                    <span className="track-visualiser-stat-value is-accent">
                      {info?.trackLength ?? 'N/A'}
                    </span>
                  </div>
                  <div className="track-visualiser-stat">
                    <span className="track-visualiser-stat-label">First raced</span>
                    <span className="track-visualiser-stat-value is-accent">
                      {info?.firstGrandPrix ?? 'N/A'}
                    </span>
                  </div>
                  <div className="track-visualiser-stat">
                    <span className="track-visualiser-stat-label">Elevation</span>
                    <span className="track-visualiser-stat-value is-accent">
                      {info?.elevationChange ?? 'N/A'}
                    </span>
                  </div>
                  {!selected.disabled && (
                    <>
                      <div className="track-visualiser-stat">
                        <span className="track-visualiser-stat-label">Winner</span>
                        <span className="track-visualiser-stat-value is-accent">
                          {highlightsLoading ? '…' : highlights?.winner ?? 'N/A'}
                        </span>
                        {highlights?.winnerTeam && (
                          <span className="track-visualiser-stat-note">{highlights.winnerTeam}</span>
                        )}
                      </div>
                      <div className="track-visualiser-stat">
                        <span className="track-visualiser-stat-label">Pole</span>
                        <span className="track-visualiser-stat-value is-accent">
                          {highlightsLoading ? '…' : highlights?.pole ?? 'N/A'}
                        </span>
                        {highlights?.poleTeam && (
                          <span className="track-visualiser-stat-note">{highlights.poleTeam}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="track-visualiser-copy">
                  <p className="track-visualiser-kicker">
                    {selected.disabled ? 'Upcoming weekend' : 'Track visualiser'}
                    {selected.round != null ? ` · R${selected.round}` : ''}
                  </p>
                  <h2 className="track-visualiser-title">{selected.name}</h2>
                  <p className="track-visualiser-blurb">
                    {[selected.location, selectedYear].filter(Boolean).join(' · ')}
                  </p>
                  {!selected.disabled && highlights?.podium && highlights.podium.length > 0 && (
                    <p className="track-visualiser-podium">
                      Podium {highlights.podium.join(' · ')}
                    </p>
                  )}
                  {selected.disabled && (
                    <p className="track-visualiser-blurb">
                      Session data is not available yet for this round.
                    </p>
                  )}
                </div>

                {!selected.disabled && selected.sessions.length > 0 && (
                  <div className="track-visualiser-sessions" aria-label="Available sessions">
                    {selected.sessions.map((session) => (
                      <Link
                        key={session}
                        href={trackHref(selectedYear, selected.id, session)}
                        className={`track-visualiser-session${session === 'R' ? ' is-race' : ''}`}
                        onClick={() => rememberTrack(selectedYear, selected.id)}
                      >
                        <span>{SESSION_LABELS[session] ?? session}</span>
                        <span className="track-visualiser-session-open">Open</span>
                      </Link>
                    ))}
                  </div>
                )}

                {!selected.disabled ? (
                  <Link
                    href={trackHref(selectedYear, selected.id, preferredSession(selected.sessions))}
                    className="track-visualiser-cta"
                    onClick={() => rememberTrack(selectedYear, selected.id)}
                  >
                    Open analysis
                    <span aria-hidden="true"> →</span>
                  </Link>
                ) : (
                  <div className="track-visualiser-cta is-disabled" aria-disabled="true">
                    Data pending
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="track-selector-toolbar">
            <div className="track-selector-filters" role="tablist" aria-label="Filter circuits">
              {(
                [
                  { id: 'all', label: 'All', count: tracks.length },
                  { id: 'ready', label: 'Ready', count: availableCount },
                  { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                  className={`track-selector-filter${filter === item.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                  <span className="track-selector-filter-count">{item.count}</span>
                </button>
              ))}
            </div>
            <p className="track-selector-toolbar-hint">
              Click a circuit to load it in the visualiser.
            </p>
          </div>

          <div className="track-selector-grid">
            {filteredTracks.map((track) => {
              const flag = getCountryFlagIcon(track.countryCode)
              const isActive = track.id === selected?.id
              return (
                <button
                  key={track.id}
                  type="button"
                  className={`track-selector-card is-button${track.disabled ? ' is-disabled' : ''}${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  title={track.disabled ? track.meta ?? 'Not available yet' : `View ${track.name}`}
                  onClick={() => selectTrack(track)}
                >
                  <div className="track-selector-svg-wrap">
                    {track.svgFile ? (
                      <RedTrackSilhouette
                        svgFile={track.svgFile}
                        className={track.disabled ? 'is-muted' : undefined}
                      />
                    ) : (
                      <div className="track-selector-svg-fallback">No map</div>
                    )}
                    {track.round != null && (
                      <span className="track-selector-round">R{track.round}</span>
                    )}
                    <span className={`track-selector-status ${statusTone(track.status, track.disabled)}`}>
                      {statusLabel(track)}
                    </span>
                  </div>
                  <div className="track-selector-meta">
                    <div className="track-selector-name-row">
                      {flag && <img src={flag} alt="" className="track-selector-flag" />}
                      <h2 className="track-selector-name">{track.name}</h2>
                    </div>
                    {(track.location || track.date) && (
                      <p className="track-selector-sub">
                        {[track.location, track.date].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {filteredTracks.length === 0 && (
            <div className="panel p-10 text-center text-sm text-gray-400">
              No circuits match this filter for {selectedYear}.
            </div>
          )}
        </>
      )}
    </AppShell>
  )
}
