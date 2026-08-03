'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import AppShell from './AppShell'
import CustomSelect from './CustomSelect'
import { getAvailableCalendarYears, getCalendarForYear } from '../lib/calendarData'
import { getSupportedSeasonYears } from '../lib/teamData'
import { getCountryFlagIcon } from '../lib/countryFlags'
import { getDriverPhoto } from '../lib/driverPhotos'
import { getDriverColor, getDriverName } from '../lib/teamData'
import { trackInfo } from '../lib/trackInfo'
import LoadingIndicator from './LoadingIndicator'
import RedTrackSilhouette from './RedTrackSilhouette'
import CircuitTrackStage, {
  getCircuitVisualScale,
  type CircuitTrackCorner,
} from './CircuitTrackStage'

const PREFERENCES_STORAGE_KEY = 'f1ca:user-preferences:v1'

const SESSION_ORDER = ['FP1', 'FP2', 'FP3', 'SQ', 'Q', 'S', 'R'] as const

const PODIUM_DISPLAY_ORDER = [2, 1, 3] as const

function TrackVisualiserPodium({
  codes,
  year,
}: {
  codes: string[]
  year: number
}) {
  const slots = PODIUM_DISPLAY_ORDER.map((position) => {
    const code = codes[position - 1]
    if (!code) return null
    return { position, code: code.toUpperCase() }
  }).filter(Boolean) as Array<{ position: 1 | 2 | 3; code: string }>

  if (slots.length === 0) return null

  return (
    <div className="track-visualiser-podium" aria-label="Race podium">
      <span className="track-visualiser-podium-label">Podium</span>
      <div className="track-visualiser-podium-steps">
        {slots.map(({ position, code }) => {
          const accent = getDriverColor(code, year) ?? '#e10600'
          const name = getDriverName(code) ?? code
          return (
            <div
              key={`${position}-${code}`}
              className={`track-visualiser-podium-slot is-p${position}`}
            >
              <div
                className="track-visualiser-podium-photo"
                style={{ borderColor: accent }}
              >
                <img
                  src={getDriverPhoto(code)}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.src = '/logos/f1 car.png'
                  }}
                />
              </div>
              <div className="track-visualiser-podium-meta">
                <span className="track-visualiser-podium-code">{code}</span>
              </div>
              <div className="track-visualiser-podium-block" aria-hidden="true">
                <span>{position}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type TracksJson = {
  tracks: Record<
    string,
    {
      id: string
      name: string
      svgFile: string
      corners?: CircuitTrackCorner[]
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

function trackHref(year: number, trackId: string, session?: string) {
  const query = new URLSearchParams({ year: String(year) })
  if (session) query.set('session', session)
  return `/race/${encodeURIComponent(trackId)}?${query.toString()}`
}

/** Sponsor / title prefix from official F1 name, e.g. CRYPTO.COM from Miami GP. */
function sponsorFromOfficial(officialName?: string, eventName?: string): string | null {
  if (!officialName) return null
  let s = officialName
    .replace(/^FORMULA\s*1\s+/i, '')
    .replace(/\s+\d{4}\s*$/, '')
    .trim()

  if (eventName) {
    const idx = s.toUpperCase().lastIndexOf(eventName.toUpperCase())
    if (idx >= 0) {
      const sponsor = s.slice(0, idx).trim()
      return sponsor.length > 0 ? sponsor.toUpperCase() : null
    }
  }

  const stripped = s
    .replace(
      /\s+(?:GRAND PRIX(?:\s+(?:DE|DU|DEL)\b.*)?|GRAN PREMIO\b.*|GRANDE PR[EÊ]MIO\b.*)$/i,
      '',
    )
    .trim()

  if (!stripped || stripped.toUpperCase() === s.toUpperCase()) return null

  if (eventName) {
    const loc = eventName.replace(/\s+Grand Prix$/i, '').trim().toUpperCase()
    if (stripped.toUpperCase() === loc) return null
  }

  return stripped.toUpperCase()
}

function visualiserKicker(track: TrackCard): string {
  if (track.disabled) {
    return track.round != null ? `Round ${track.round}` : 'Upcoming weekend'
  }
  const sponsor = sponsorFromOfficial(track.officialName, track.name)
  if (sponsor) return sponsor
  return track.round != null ? `Round ${track.round}` : 'Grand Prix'
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

function railLabel(track: TrackCard) {
  const raw = (track.location ?? track.name.replace(/\s+Grand Prix$/i, '')).toUpperCase()
  return raw.replace(/[^A-Z0-9\s]/g, '').trim() || track.id.toUpperCase()
}

/** Contoured frame path: left notch hugs the rail, BR pocket hugs the controls. */
function buildVisualiserFramePath(opts: {
  w: number
  h: number
  railW: number
  railH: number
  ctrlW: number
  ctrlH: number
}) {
  const { w, h } = opts
  if (w < 40 || h < 40) {
    return `M12 12H${Math.max(24, w - 12)}V${Math.max(24, h - 12)}H12Z`
  }

  // Keep stroke fully inside the box (overflow:hidden + 2px stroke).
  const inset = 10
  const r = 11
  const railW = Math.min(Math.max(opts.railW, inset + 36), w * 0.28)
  const railH = Math.min(Math.max(opts.railH, 96), h * 0.72)
  const ctrlW = Math.min(Math.max(opts.ctrlW, 44), w * 0.12)
  const ctrlH = Math.min(Math.max(opts.ctrlH, 88), h * 0.28)
  const nr = Math.min(20, Math.max(12, (railW - inset) * 0.28))

  const outer = inset
  const L = Math.max(railW, outer + 36)
  const tabEnd = railH
  const topY = inset
  const botY = h - inset
  const pocketLeft = Math.min(w - ctrlW, w - inset - 36)
  const pocketTop = Math.max(inset + 80, h - ctrlH)

  // Same silhouette language as Lando: title tab on the left, control dock BR.
  return [
    `M${L} ${topY + r}`,
    `V${Math.max(topY + r + 8, tabEnd - nr)}`,
    `C${L} ${tabEnd - nr * 0.35} ${L - nr * 0.35} ${tabEnd} ${Math.max(outer + nr, L - nr)} ${tabEnd}`,
    `L${outer + nr} ${tabEnd}`,
    `A${nr} ${nr} 0 0 0 ${outer} ${tabEnd + nr}`,
    `V${botY - r}`,
    `A${r} ${r} 0 0 0 ${outer + r} ${botY}`,
    `H${Math.max(outer + r * 2, pocketLeft - r)}`,
    `A${r} ${r} 0 0 0 ${pocketLeft} ${botY - r}`,
    `V${Math.min(botY - r - 8, pocketTop + r)}`,
    `C${pocketLeft} ${pocketTop + r * 0.25} ${pocketLeft + r * 0.7} ${pocketTop - r * 0.2} ${Math.min(w - inset - r, pocketLeft + ctrlW * 0.55)} ${pocketTop - r * 0.85}`,
    `L${w - inset - r} ${pocketTop - r * 1.6}`,
    `A${r} ${r} 0 0 0 ${w - inset} ${pocketTop - r * 2.4}`,
    `V${topY + r}`,
    `A${r} ${r} 0 0 0 ${w - inset - r} ${topY}`,
    `H${L + r}`,
    `A${r} ${r} 0 0 0 ${L} ${topY + r}`,
    'Z',
  ].join('')
}

/** Lando-style accent wipe when circuit content remounts. */
function WipeReveal({
  animKey,
  dir,
  className = '',
  vertical = false,
  children,
}: {
  animKey: string | number
  dir: 'next' | 'prev' | 'jump'
  className?: string
  vertical?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      key={animKey}
      className={`tv-wipe is-${dir}${vertical ? ' is-vertical' : ''} ${className}`.trim()}
    >
      <div className="tv-wipe-content">{children}</div>
      <span className="tv-wipe-bar" aria-hidden="true" />
    </div>
  )
}

export default function TrackSelectorPage() {
  const [selectedYear, setSelectedYear] = useState(0)
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
  const [reducedMotion, setReducedMotion] = useState(false)
  const [animTick, setAnimTick] = useState(0)
  const [animDir, setAnimDir] = useState<'next' | 'prev' | 'jump'>('jump')
  const [framePath, setFramePath] = useState('')
  const [frameViewBox, setFrameViewBox] = useState('0 0 1688 918')

  const visualiserRef = useRef<HTMLElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const railRef = useRef<HTMLDivElement | null>(null)
  const controlsRef = useRef<HTMLDivElement | null>(null)

  const availableYears = useMemo(
    () =>
      Array.from(new Set([...getSupportedSeasonYears(), ...getAvailableCalendarYears()])).sort(
        (a, b) => a - b,
      ),
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

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

  const progressPct =
    tracks.length > 0 ? Math.round((availableCount / tracks.length) * 100) : 0

  const info = selected ? trackInfo[selected.id] : undefined

  // Fit the contoured red frame snugly around the rail label + control dock.
  useEffect(() => {
    const frameEl = frameRef.current
    if (!frameEl || !selected) return

    const syncFrame = () => {
      const frame = frameRef.current
      const rail = railRef.current
      const controls = controlsRef.current
      if (!frame) return

      const fr = frame.getBoundingClientRect()
      const w = Math.max(1, Math.round(fr.width))
      const h = Math.max(1, Math.round(fr.height))

      let railW = w * (74 / 1688)
      let railH = h * (480 / 918)
      if (rail) {
        const rr = rail.getBoundingClientRect()
        // Slight padding so the stroke sits just outside the label/flag cluster
        railW = Math.max(36, rr.right - fr.left + 3)
        railH = Math.max(72, rr.bottom - fr.top + 6)
      }

      let ctrlW = w * (76 / 1688)
      let ctrlH = h * (128 / 918)
      if (controls) {
        const cr = controls.getBoundingClientRect()
        ctrlW = Math.max(40, fr.right - cr.left)
        ctrlH = Math.max(72, fr.bottom - cr.top)
      }

      frame.style.setProperty('--frame-left', `${railW}px`)
      frame.style.setProperty('--frame-rail-h', `${railH}px`)
      frame.style.setProperty('--frame-ctrl-w', `${ctrlW}px`)
      frame.style.setProperty('--frame-ctrl-h', `${ctrlH}px`)

      setFrameViewBox(`0 0 ${w} ${h}`)
      setFramePath(buildVisualiserFramePath({ w, h, railW, railH, ctrlW, ctrlH }))
    }

    const raf = requestAnimationFrame(() => {
      syncFrame()
      // Second pass after wipe/font layout settles
      requestAnimationFrame(syncFrame)
    })

    const ro = new ResizeObserver(() => syncFrame())
    ro.observe(frameEl)
    if (railRef.current) ro.observe(railRef.current)
    if (controlsRef.current) ro.observe(controlsRef.current)
    window.addEventListener('resize', syncFrame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', syncFrame)
    }
  }, [selected?.id, animTick, selected])

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

  const scrollToVisualiser = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        visualiserRef.current?.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        })
      })
    })
  }, [reducedMotion])

  const selectTrack = (track: TrackCard, dir?: 'next' | 'prev' | 'jump') => {
    if (selectedTrackId === track.id) {
      scrollToVisualiser()
      return
    }

    const list = tracks
    const currentIndex = list.findIndex((t) => t.id === selectedTrackId)
    const newIndex = list.findIndex((t) => t.id === track.id)

    let nextDir: 'next' | 'prev' | 'jump'
    if (dir) {
      nextDir = dir
    } else if (currentIndex >= 0 && newIndex >= 0) {
      nextDir = newIndex > currentIndex ? 'next' : newIndex < currentIndex ? 'prev' : 'jump'
    } else {
      nextDir = 'jump'
    }

    setAnimDir(nextDir)
    setAnimTick((t) => t + 1)
    setSelectedTrackId(track.id)
    rememberTrack(selectedYear, track.id)
    scrollToVisualiser()
  }

  const stepTrack = (delta: 1 | -1) => {
    const list = tracks
    if (!list.length) return

    const currentIndex = list.findIndex((t) => t.id === selectedTrackId)
    const nextIndex =
      currentIndex >= 0
        ? (currentIndex + delta + list.length) % list.length
        : delta > 0
          ? 0
          : list.length - 1

    selectTrack(list[nextIndex], delta > 0 ? 'next' : 'prev')
  }

  return (
    <AppShell
      headerVariant="hero"
      kicker="Race analysis"
      title={selectedYear > 0 ? `${selectedYear} Circuits` : 'Circuits'}
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
            <section
              ref={visualiserRef}
              className={`track-visualiser is-expanded is-anim-${animDir}`}
              aria-label="Track visualiser"
              data-anim={animTick}
            >
              <div className="track-visualiser-frame" ref={frameRef}>
                {/* Contoured border: left notch + BR pocket sized to live content */}
                <svg
                  className="track-visualiser-border"
                  viewBox={frameViewBox}
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  {framePath ? (
                    <path
                      d={framePath}
                      stroke="currentColor"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : null}
                </svg>

                <div className="track-visualiser-rail" ref={railRef}>
                  <WipeReveal
                    animKey={`rail-${selected.id}-${animTick}`}
                    dir={animDir}
                    vertical
                    className="track-visualiser-rail-wipe"
                  >
                    <span className="track-visualiser-rail-name">{railLabel(selected)}</span>
                  </WipeReveal>
                  {getCountryFlagIcon(selected.countryCode) && (
                    <WipeReveal
                      animKey={`flag-${selected.id}-${animTick}`}
                      dir={animDir}
                      className="track-visualiser-rail-flag-wipe"
                    >
                      <img
                        src={getCountryFlagIcon(selected.countryCode)!}
                        alt=""
                        className="track-visualiser-rail-flag"
                      />
                    </WipeReveal>
                  )}
                </div>

                <div className="track-visualiser-body">
                  <div className="track-visualiser-stage">
                    {selected.svgFile ? (
                      selected.disabled ? (
                        <div className="track-visualiser-still">
                          <RedTrackSilhouette svgFile={selected.svgFile} className="is-lg is-muted" />
                        </div>
                      ) : (
                        <WipeReveal
                          animKey={`stage-${selected.id}-${animTick}`}
                          dir={animDir}
                          className="track-visualiser-stage-wipe"
                        >
                          <div className="track-visualiser-stage-swap">
                            <CircuitTrackStage
                              svgFile={selected.svgFile}
                              corners={trackData.tracks[selected.id]?.corners}
                              reducedMotion={reducedMotion}
                              scaleFactor={getCircuitVisualScale(selected.id, tracks)}
                              autoSpin
                            />
                          </div>
                        </WipeReveal>
                      )
                    ) : (
                      <div className="track-selector-svg-fallback">No map</div>
                    )}
                  </div>

                  <WipeReveal
                    animKey={`hud-${selected.id}-${animTick}`}
                    dir={animDir}
                    className="track-visualiser-hud-wipe"
                  >
                    <div className="track-visualiser-hud">
                      <div className="track-visualiser-top">
                        <div className="track-visualiser-top-seg is-stats">
                          <div className="track-visualiser-stats">
                            <div className="track-visualiser-stat is-hero">
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
                                    <span className="track-visualiser-stat-note">
                                      {highlights.winnerTeam}
                                    </span>
                                  )}
                                </div>
                                <div className="track-visualiser-stat">
                                  <span className="track-visualiser-stat-label">Pole</span>
                                  <span className="track-visualiser-stat-value is-accent">
                                    {highlightsLoading ? '…' : highlights?.pole ?? 'N/A'}
                                  </span>
                                  {highlights?.poleTeam && (
                                    <span className="track-visualiser-stat-note">
                                      {highlights.poleTeam}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="track-visualiser-top-seg is-copy">
                          <p className="track-visualiser-kicker">{visualiserKicker(selected)}</p>
                          <h2 className="track-visualiser-title">{selected.name}</h2>
                          <p className="track-visualiser-blurb">
                            {[selected.location, selectedYear].filter(Boolean).join(' · ')}
                            {selected.round != null ? ` · R${selected.round}` : ''}
                          </p>
                          {selected.disabled && (
                            <p className="track-visualiser-blurb">
                              Session data is not available yet for this round.
                            </p>
                          )}
                        </div>

                        {!selected.disabled && highlights?.podium && highlights.podium.length > 0 && (
                          <div className="track-visualiser-top-seg is-podium">
                            <TrackVisualiserPodium codes={highlights.podium} year={selectedYear} />
                          </div>
                        )}

                        <div className="track-visualiser-top-seg is-actions">
                          <div className="track-visualiser-ctas" aria-label="Open session analysis">
                            {!selected.disabled && selected.sessions.includes('Q') ? (
                              <Link
                                href={trackHref(selectedYear, selected.id, 'Q')}
                                className="track-visualiser-cta is-secondary"
                                onClick={() => rememberTrack(selectedYear, selected.id)}
                              >
                                Qualifying
                              </Link>
                            ) : (
                              <div className="track-visualiser-cta is-secondary is-disabled" aria-disabled="true">
                                Qualifying
                              </div>
                            )}
                            {!selected.disabled && selected.sessions.includes('R') ? (
                              <Link
                                href={trackHref(selectedYear, selected.id, 'R')}
                                className="track-visualiser-cta"
                                onClick={() => rememberTrack(selectedYear, selected.id)}
                              >
                                Race
                              </Link>
                            ) : (
                              <div className="track-visualiser-cta is-disabled" aria-disabled="true">
                                Race
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </WipeReveal>
                </div>

                <div className="track-visualiser-controls" ref={controlsRef}>
                  <button
                    type="button"
                    className="track-visualiser-control"
                    aria-label="Previous circuit"
                    onClick={() => stepTrack(-1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="track-visualiser-control"
                    aria-label="Next circuit"
                    onClick={() => stepTrack(1)}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </section>
          )}

          <div className="track-selector-grid">
            {tracks.map((track) => {
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
                        weight="thin"
                        className={track.disabled ? 'is-muted' : undefined}
                      />
                    ) : (
                      <div className="track-selector-svg-fallback">No map</div>
                    )}
                    {track.round != null && (
                      <span className="track-selector-round">Round {track.round}</span>
                    )}
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

          {tracks.length === 0 && (
            <div className="panel p-10 text-center text-sm text-gray-400">
              No circuits available for {selectedYear}.
            </div>
          )}
        </>
      )}
    </AppShell>
  )
}
