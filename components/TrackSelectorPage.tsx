'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AppShell from './AppShell'
import CustomSelect from './CustomSelect'
import { getAvailableCalendarYears, getCalendarForYear } from '../lib/calendarData'
import { getSupportedSeasonYears } from '../lib/teamData'
import { getCountryFlagIcon } from '../lib/countryFlags'
import LoadingIndicator from './LoadingIndicator'

const Track3DPanel = dynamic(() => import('./Track3DPanel'), {
  ssr: false,
  loading: () => <LoadingIndicator label="Loading 3D..." className="py-10" />,
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

export default function TrackSelectorPage() {
  const [selectedYear, setSelectedYear] = useState(0)
  const [filter, setFilter] = useState<FilterId>('all')
  const [preferencesHydrated, setPreferencesHydrated] = useState(false)
  const [trackData, setTrackData] = useState<TracksJson>({ tracks: {} })
  const [trackDataLoading, setTrackDataLoading] = useState(true)
  const [availableRoundsByYear, setAvailableRoundsByYear] = useState<Record<string, string[]>>({})
  const [sessionsByRound, setSessionsByRound] = useState<Record<string, Record<string, string[]>>>({})
  const [sessionIndexLoading, setSessionIndexLoading] = useState(true)
  const [indexError, setIndexError] = useState<string | null>(null)

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
        const parsed = JSON.parse(saved) as { selectedYear?: number }
        if (typeof parsed.selectedYear === 'number') setSelectedYear(parsed.selectedYear)
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

  const featured = useMemo(
    () => [...tracks].reverse().find((t) => !t.disabled) ?? null,
    [tracks],
  )

  const nextUp = useMemo(
    () => tracks.find((t) => t.disabled && t.status !== 'postponed') ?? null,
    [tracks],
  )

  const filteredTracks = useMemo(() => {
    if (filter === 'ready') return tracks.filter((t) => !t.disabled)
    if (filter === 'upcoming') return tracks.filter((t) => t.disabled)
    return tracks
  }, [filter, tracks])

  const progressPct =
    tracks.length > 0 ? Math.round((availableCount / tracks.length) * 100) : 0

  return (
    <AppShell
      kicker="Race analysis"
      title="Circuits"
      description="Pick a grand prix to open corner telemetry, lap charts, and session analysis for that weekend."
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
          {(featured || nextUp) && (
            <section className="track-selector-spotlight" aria-label="Season highlights">
              {featured && (
                <article className="track-selector-featured">
                  <Link
                    href={trackHref(selectedYear, featured.id, preferredSession(featured.sessions))}
                    className="track-selector-featured-hit"
                    onClick={() => rememberTrack(selectedYear, featured.id)}
                  >
                    <div className="track-selector-featured-map">
                      {featured.svgFile ? (
                        <Track3DPanel
                          svgFile={featured.svgFile}
                          compact
                          autoRotate
                          showCorners={false}
                          className="track-selector-featured-3d"
                        />
                      ) : (
                        <div className="track-selector-svg-fallback">No map</div>
                      )}
                    </div>
                    <div className="track-selector-featured-body">
                      <div className="track-selector-featured-eyebrow">
                        <span className="track-selector-chip is-live">Latest weekend</span>
                        {featured.round != null && (
                          <span className="track-selector-mono-meta">
                            R{featured.round}
                            {featured.date ? ` · ${featured.date}` : ''}
                          </span>
                        )}
                      </div>
                      <div className="track-selector-featured-title-row">
                        {getCountryFlagIcon(featured.countryCode) && (
                          <img
                            src={getCountryFlagIcon(featured.countryCode)!}
                            alt=""
                            className="track-selector-flag is-lg"
                          />
                        )}
                        <h2 className="track-selector-featured-name">{featured.name}</h2>
                      </div>
                      <p className="track-selector-featured-sub">
                        {[featured.location, selectedYear].filter(Boolean).join(' · ')}
                      </p>
                      <span className="track-selector-featured-cta">
                        Open analysis
                        <span aria-hidden="true"> →</span>
                      </span>
                    </div>
                  </Link>
                  {featured.sessions.length > 0 && (
                    <div className="track-selector-featured-sessions" aria-label="Available sessions">
                      {featured.sessions.map((session) => (
                        <Link
                          key={session}
                          href={trackHref(selectedYear, featured.id, session)}
                          className="track-selector-session is-on is-link"
                          onClick={() => rememberTrack(selectedYear, featured.id)}
                        >
                          {SESSION_LABELS[session] ?? session}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              )}

              {nextUp && (
                <div className="track-selector-next" aria-label="Next on calendar">
                  <div className="track-selector-next-map">
                    {nextUp.svgFile ? (
                      <img
                        src={`/Tracks/${nextUp.svgFile}`}
                        alt=""
                        className="track-selector-featured-svg is-muted"
                      />
                    ) : (
                      <div className="track-selector-svg-fallback">No map</div>
                    )}
                  </div>
                  <div className="track-selector-next-body">
                    <div className="track-selector-featured-eyebrow">
                      <span className="track-selector-chip is-upcoming">Next up</span>
                      {nextUp.round != null && (
                        <span className="track-selector-mono-meta">
                          R{nextUp.round}
                          {nextUp.date ? ` · ${nextUp.date}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="track-selector-featured-title-row">
                      {getCountryFlagIcon(nextUp.countryCode) && (
                        <img
                          src={getCountryFlagIcon(nextUp.countryCode)!}
                          alt=""
                          className="track-selector-flag"
                        />
                      )}
                      <h2 className="track-selector-next-name">{nextUp.name}</h2>
                    </div>
                    <p className="track-selector-featured-sub">
                      {[nextUp.location, nextUp.meta ?? 'Upcoming'].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              )}
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
              Session chips open Qualifying, Race, or Sprint when available.
            </p>
          </div>

          <div className="track-selector-grid">
            {filteredTracks.map((track) => {
              const flag = getCountryFlagIcon(track.countryCode)
              const session = preferredSession(track.sessions)
              const mainHref = trackHref(selectedYear, track.id, session)
              const cardInner = (
                <>
                  <div className="track-selector-svg-wrap">
                    {track.svgFile ? (
                      <img
                        src={`/Tracks/${track.svgFile}`}
                        alt=""
                        className="track-selector-svg"
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
                </>
              )

              if (track.disabled) {
                return (
                  <div
                    key={track.id}
                    className="track-selector-card is-disabled"
                    aria-disabled="true"
                    title={track.meta ?? 'Not available yet'}
                  >
                    {cardInner}
                    <div className="track-selector-card-footer">
                      <span className="track-selector-session is-off">No data yet</span>
                    </div>
                  </div>
                )
              }

              return (
                <article key={track.id} className="track-selector-card">
                  <Link
                    href={mainHref}
                    className="track-selector-card-hit"
                    onClick={() => rememberTrack(selectedYear, track.id)}
                  >
                    {cardInner}
                    <span className="track-selector-card-cta">
                      Open analysis
                      <span aria-hidden="true"> →</span>
                    </span>
                  </Link>
                  {track.sessions.length > 0 && (
                    <div className="track-selector-card-footer" aria-label="Sessions">
                      <div className="track-selector-sessions">
                        {track.sessions.map((code) => (
                          <Link
                            key={code}
                            href={trackHref(selectedYear, track.id, code)}
                            className="track-selector-session is-on is-link"
                            onClick={() => rememberTrack(selectedYear, track.id)}
                          >
                            {SESSION_LABELS[code] ?? code}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
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
