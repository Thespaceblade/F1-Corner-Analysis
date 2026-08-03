'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AppNav from './AppNav'
import RedTrackSilhouette from './RedTrackSilhouette'
import HeroTrackStage, { type HeroCorner } from './home/HeroTrackStage'
import { getSeasonTeams } from '../lib/seasonMetadata'

const HOME_YEAR = 2026

const HOME_DRIVERS = getSeasonTeams(HOME_YEAR)
  .flatMap((team) =>
    team.drivers
      .filter((driver) => Boolean(driver.photoPath))
      .map((driver) => ({
        code: driver.code,
        name: driver.name,
        photoPath: driver.photoPath as string,
        teamColor: team.color,
      })),
  )

/** 2026 calendar — route ids match /race/[trackId], svgs from tracks.json */
const TRACK_PREVIEWS = [
  { id: 'australia', label: 'Australia', svgFile: 'australia.svg' },
  { id: 'china', label: 'China', svgFile: 'china.svg' },
  { id: 'japan', label: 'Japan', svgFile: 'japan.svg' },
  { id: 'miami', label: 'Miami', svgFile: 'miami.svg' },
  { id: 'canada', label: 'Canada', svgFile: 'canada.svg' },
  { id: 'monaco', label: 'Monaco', svgFile: 'monaco.svg' },
  { id: 'barcelona-catalunya', label: 'Barcelona', svgFile: 'spain.svg' },
  { id: 'austria', label: 'Austria', svgFile: 'austria.svg' },
  { id: 'great-britain', label: 'Silverstone', svgFile: 'silverstone.svg' },
  { id: 'belgium', label: 'Spa', svgFile: 'spa.svg' },
  { id: 'hungary', label: 'Hungary', svgFile: 'hungary.svg' },
  { id: 'netherlands', label: 'Zandvoort', svgFile: 'netherlands.svg' },
  { id: 'italy', label: 'Monza', svgFile: 'monza.svg' },
  { id: 'madrid', label: 'Madrid', svgFile: null },
  { id: 'azerbaijan', label: 'Baku', svgFile: 'azerbaijan.svg' },
  { id: 'singapore', label: 'Singapore', svgFile: 'singapore.svg' },
  { id: 'united-states', label: 'Austin', svgFile: 'usa.svg' },
  { id: 'mexico', label: 'Mexico', svgFile: 'mexico.svg' },
  { id: 'brazil', label: 'Interlagos', svgFile: 'brazil.svg' },
  { id: 'las-vegas', label: 'Las Vegas', svgFile: 'las_vegas.svg' },
  { id: 'qatar', label: 'Qatar', svgFile: 'qatar.svg' },
  { id: 'abu-dhabi', label: 'Abu Dhabi', svgFile: 'abudhabi.svg' },
] as const

function trackHref(trackId: string, session?: string) {
  const query = new URLSearchParams({ year: String(HOME_YEAR) })
  if (session) query.set('session', session)
  return `/race/${encodeURIComponent(trackId)}?${query.toString()}`
}

function driverHref(driverCode: string) {
  return `/drivers/${encodeURIComponent(driverCode)}?year=${HOME_YEAR}`
}

const CAPABILITIES = [
  {
    code: '01',
    title: 'Corner telemetry',
    body: 'Entry, apex, and exit speeds on the circuit map — not just a flat speed trace.',
    href: '/race',
  },
  {
    code: '02',
    title: 'Driver compare',
    body: 'Stack teammates or rivals on the same lap and see where time is won or lost.',
    href: '/race',
  },
  {
    code: '03',
    title: 'Sectors & stints',
    body: 'Break a session into sectors, tyre stints, and consistency across the run.',
    href: '/race',
  },
  {
    code: '04',
    title: 'Season view',
    body: 'Standings mid-season, head-to-heads, and form track by track for the year.',
    href: `/season?year=${HOME_YEAR}`,
  },
] as const

const FLOW = [
  { step: '01', title: 'Pick year', detail: '2024–2026 sessions', href: '/race' },
  { step: '02', title: 'Choose circuit', detail: 'Full calendar maps', href: '/race' },
  { step: '03', title: 'Select session', detail: 'Race or qualifying', href: '/race' },
  { step: '04', title: 'Read the corner', detail: 'Deltas on the track', href: '/race' },
] as const

const HERO_MODES = [
  { code: 'Race', detail: 'corner deltas', href: '/race' },
  { code: 'Quali', detail: 'lap compare', href: '/race' },
  { code: 'Season', detail: 'standings', href: `/season?year=${HOME_YEAR}` },
] as const

const LATEST = {
  year: HOME_YEAR,
  roundLabel: 'Round 11',
  name: 'Hungarian Grand Prix',
  location: 'Hungaroring · Budapest',
  trackFile: 'hungary',
  href: trackHref('hungary', 'R'),
  sessions: [
    { label: 'Race', href: trackHref('hungary', 'R') },
    { label: 'Qualifying', href: trackHref('hungary', 'Q') },
    { label: 'Season', href: `/season?year=${HOME_YEAR}` },
  ],
} as const

const HERO_CORNERS: HeroCorner[] = [
  { number: 1, type: 'medium', x: 17.7, y: 380.6 },
  { number: 2, type: 'fast', x: 253.4, y: 471.4 },
  { number: 3, type: 'fast', x: 236.9, y: 380.6 },
  { number: 4, type: 'medium', x: 364.2, y: 153.2 },
  { number: 5, type: 'fast', x: 358.3, y: 22.4 },
  { number: 6, type: 'fast', x: 487.9, y: 119.0 },
  { number: 7, type: 'medium', x: 476.2, y: 136.7 },
  { number: 8, type: 'fast', x: 499.7, y: 226.3 },
  { number: 9, type: 'medium', x: 568.1, y: 251.0 },
  { number: 10, type: 'medium', x: 563.4, y: 352.4 },
  { number: 11, type: 'fast', x: 603.4, y: 439.6 },
  { number: 12, type: 'slow', x: 449.1, y: 615.2 },
  { number: 13, type: 'medium', x: 344.2, y: 550.3 },
  { number: 14, type: 'medium', x: 398.4, y: 671.7 },
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

export default function HomePage() {
  const reducedMotion = usePrefersReducedMotion()
  const heroRef = useRef<HTMLElement | null>(null)
  const latest = useScrollReveal<HTMLElement>()
  const caps = useScrollReveal<HTMLElement>()
  const drivers = useScrollReveal<HTMLElement>()
  const flow = useScrollReveal<HTMLElement>()
  const paths = useScrollReveal<HTMLElement>()
  const circuits = useScrollReveal<HTMLElement>()
  const close = useScrollReveal<HTMLElement>()

  const marqueeTracks = [...TRACK_PREVIEWS, ...TRACK_PREVIEWS]

  return (
    <div className="home-root">
      <AppNav variant="overlay" />

      <section ref={heroRef} className="home-hero">
        <div className="home-hero-atmosphere" aria-hidden="true">
          <div className="home-hero-grid" />
          <div className="home-hero-flare home-hero-flare-a" />
          <div className="home-hero-flare home-hero-flare-b" />
          <div className="home-hero-beam" />
          <div className="home-hero-grain" />
          <div className="home-hero-vignette" />
          <div className="home-hero-wash" />
          {!reducedMotion && (
            <>
              <svg className="home-hero-speedlines" viewBox="0 0 1200 800" preserveAspectRatio="none">
                <path d="M-80 120 L1320 40" />
                <path d="M-80 210 L1320 150" />
                <path d="M-80 320 L1320 280" />
                <path d="M-80 540 L1320 470" />
                <path d="M-80 640 L1320 590" />
                <path d="M-40 400 L900 360" />
              </svg>
              <div className="home-hero-sparks">
                <span /><span /><span /><span /><span /><span />
              </div>
            </>
          )}
        </div>

        <HeroTrackStage
          svgFile={`${LATEST.trackFile}.svg`}
          corners={HERO_CORNERS}
          href={LATEST.href}
          ctaLabel="Open Hungarian GP"
          ariaLabel="Open Hungarian Grand Prix race analysis"
          raceName="Hungarian GP"
          roundLabel={LATEST.roundLabel}
          heroRef={heroRef}
          reducedMotion={reducedMotion}
        />

        <div className="home-hero-inner">
          <p className="home-watermark home-mono" aria-hidden="true">
            {LATEST.year}
          </p>

          <div className="home-brand home-enter" style={{ animationDelay: '0.06s' }}>
            <span className="home-brand-mark" aria-hidden="true">
              <Image
                src="/logos/f1-corner-analysis.png"
                alt=""
                width={72}
                height={72}
                className="object-contain p-1"
                priority
              />
            </span>
            <h1 className="home-brand-name">
              <span className="home-brand-accent">F1 Corner</span>
              <span className="home-brand-rest"> Analysis</span>
            </h1>
          </div>

          <p className="home-headline home-enter" style={{ animationDelay: '0.16s' }}>
            See the lap <span className="home-headline-dim">where it bends.</span>
          </p>

          <div className="home-cta-row home-enter" style={{ animationDelay: '0.28s' }}>
            <Link href="/race" className="home-cta home-cta-primary">
              Race Analysis
            </Link>
            <Link href="/season" className="home-cta home-cta-ghost">
              Season Review
            </Link>
          </div>

          <ul className="home-hero-modes home-enter" style={{ animationDelay: '0.4s' }}>
            {HERO_MODES.map((mode) => (
              <li key={mode.code}>
                <Link href={mode.href} className="home-hero-mode">
                  <span className="home-mono">{mode.code}</span>
                  {mode.detail}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {!reducedMotion && (
          <a href="#latest" className="home-scroll-cue" aria-label="Scroll to latest weekend">
            <span className="home-scroll-cue-bar" />
            Scroll
          </a>
        )}
      </section>

      <section
        id="latest"
        ref={latest.ref}
        className={`home-section home-latest ${latest.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner home-latest-grid">
          <div className="home-latest-copy">
            <p className="home-kicker">Jump in</p>
            <h2 className="home-section-title">Latest weekend</h2>
            <p className="home-section-lede">
              Open the most recent completed grand prix with the same year, track, and session tools used in analysis.
            </p>
          </div>

          <div className="home-latest-board">
            <div className="home-latest-board-grid" aria-hidden="true" />
            <div className="home-latest-board-body">
              <div className="home-latest-meta">
                <span className="home-mono">{LATEST.year}</span>
                <span className="home-mono">{LATEST.roundLabel}</span>
                <span className="home-latest-live">
                  <span className="home-latest-live-dot" aria-hidden="true" />
                  Completed
                </span>
              </div>
              <h3 className="home-latest-name">
                <Link href={LATEST.href} className="home-latest-name-link">
                  {LATEST.name}
                </Link>
              </h3>
              <p className="home-latest-loc">{LATEST.location}</p>
              <div className="home-latest-actions">
                {LATEST.sessions.map((session) => (
                  <Link key={session.label} href={session.href} className="home-latest-chip">
                    {session.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href={LATEST.href}
              className="home-latest-silhouette"
              aria-label={`Open ${LATEST.name} race analysis`}
            >
              <RedTrackSilhouette
                svgFile={`${LATEST.trackFile}.svg`}
                weight="thin"
                className="home-latest-sil"
              />
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={caps.ref}
        className={`home-section home-caps ${caps.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner">
          <header className="home-section-header">
            <p className="home-kicker">Capabilities</p>
            <h2 className="home-section-title">What you can do here</h2>
            <p className="home-section-lede">
              FastF1-backed session data, framed on real circuit geometry so you can read a lap the way an engineer talks about it.
            </p>
          </header>

          <div className="home-caps-grid">
            {CAPABILITIES.map((item, index) => (
              <Link
                key={item.code}
                href={item.href}
                className="home-cap"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <span className="home-cap-code home-mono">{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={drivers.ref}
        className={`home-section home-drivers ${drivers.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner">
          <header className="home-section-header">
            <p className="home-kicker">Drivers</p>
            <h2 className="home-section-title">The {HOME_YEAR} grid</h2>
            <p className="home-section-lede">
              Open a driver for championship form and how they stack up circuit by circuit.
            </p>
          </header>

          <ul className="home-driver-grid">
            {HOME_DRIVERS.map((driver, index) => (
              <li key={driver.code} style={{ transitionDelay: `${Math.min(index, 11) * 35}ms` }}>
                <Link
                  href={driverHref(driver.code)}
                  className="home-driver"
                  style={{ ['--driver-team' as string]: driver.teamColor }}
                  aria-label={`Open ${driver.name} driver page`}
                >
                  <span className="home-driver-face">
                    <Image
                      src={driver.photoPath}
                      alt=""
                      width={128}
                      height={128}
                      className="home-driver-img"
                    />
                  </span>
                  <span className="home-driver-code home-mono">{driver.code}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="home-drivers-cta">
            <Link href={`/drivers?year=${HOME_YEAR}`} className="home-inline-link">
              Browse all drivers
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={flow.ref}
        className={`home-section home-flow ${flow.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner">
          <header className="home-section-header">
            <p className="home-kicker">Workflow</p>
            <h2 className="home-section-title">From calendar to corner</h2>
          </header>

          <ol className="home-flow-rail">
            {FLOW.map((item, index) => (
              <li key={item.step}>
                <Link
                  href={item.href}
                  className="home-flow-step"
                  style={{ transitionDelay: `${index * 110}ms` }}
                >
                  <span className="home-flow-step-num home-mono">{item.step}</span>
                  <span className="home-flow-step-title">{item.title}</span>
                  <span className="home-flow-step-detail">{item.detail}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        ref={paths.ref}
        className={`home-section home-paths ${paths.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner">
          <header className="home-section-header home-header-on-paper">
            <p className="home-kicker home-kicker-on-paper">Two tools</p>
            <h2 className="home-section-title home-title-on-paper">Pick your depth</h2>
          </header>

          <div className="home-path-split">
            <Link href="/race" className="home-path home-path-race">
              <div className="home-path-index home-mono">01</div>
              <h3>Race Analysis</h3>
              <p>
                Interactive circuits, corner deltas, sectors, stints, and driver filters for one session.
              </p>
              <ul className="home-path-tags">
                <li>Track map</li>
                <li>Lap delta</li>
                <li>Stints</li>
              </ul>
              <span className="home-path-go">
                Open Race Analysis <span aria-hidden="true">→</span>
              </span>
            </Link>

            <Link href="/season" className="home-path home-path-season">
              <div className="home-path-index home-mono">02</div>
              <h3>Season Review</h3>
              <p>
                Championship tables, teammate battles, and form charts across the year so far.
              </p>
              <ul className="home-path-tags">
                <li>Standings</li>
                <li>H2H</li>
                <li>Form</li>
              </ul>
              <span className="home-path-go">
                Open Season Review <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>

          <div className="home-explore-links">
            <Link href={`/teams?year=${HOME_YEAR}`} className="home-inline-link">
              Browse teams and per-circuit form
              <span aria-hidden="true"> →</span>
            </Link>
            <Link href={`/drivers?year=${HOME_YEAR}`} className="home-inline-link">
              Browse drivers and per-circuit form
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={circuits.ref}
        className={`home-section home-circuits ${circuits.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner">
          <header className="home-section-header">
            <p className="home-kicker">Circuits</p>
            <h2 className="home-section-title">Every track on the calendar</h2>
            <p className="home-section-lede">
              The same outlines used in analysis — street circuits to permanent high-speed layouts.
            </p>
          </header>
        </div>

        <div className="home-marquee">
          <div className={`home-marquee-track ${reducedMotion ? 'is-static' : ''}`}>
            {marqueeTracks.map((track, index) => {
              const isDuplicate = !reducedMotion && index >= TRACK_PREVIEWS.length
              return (
                <Link
                  key={`${track.id}-${index}`}
                  href={trackHref(track.id)}
                  className="home-marquee-item"
                  aria-label={`Open ${track.label} race analysis`}
                  tabIndex={isDuplicate ? -1 : undefined}
                  aria-hidden={isDuplicate || undefined}
                >
                  {track.svgFile ? (
                    <RedTrackSilhouette
                      svgFile={track.svgFile}
                      weight="thin"
                      className="home-marquee-sil"
                    />
                  ) : (
                    <span className="home-marquee-sil home-marquee-sil-empty" aria-hidden="true" />
                  )}
                  <span className="home-mono">{track.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="home-section-inner home-circuits-cta">
          <Link href="/race" className="home-inline-link">
            Choose a grand prix
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </section>

      <section
        ref={close.ref}
        className={`home-close ${close.visible ? 'is-visible' : ''}`}
      >
        <div className="home-close-inner">
          <h2 className="home-close-title">Open a session.</h2>
          <div className="home-close-actions">
            <Link href="/race" className="home-cta home-cta-on-signal">
              Race Analysis
            </Link>
            <Link href="/season" className="home-cta home-cta-ghost-on-signal">
              Season Review
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <Image
              src="/logos/f1-corner-analysis.png"
              alt=""
              width={36}
              height={36}
              className="object-contain"
            />
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">F1 Corner Analysis</div>
              <p className="home-footer-disclaimer">
                Unofficial fan project · not affiliated with Formula 1
              </p>
            </div>
          </div>
          <p className="home-footer-copy">
            Made by{' '}
            <a href="https://jasonindata.vercel.app" target="_blank" rel="noopener noreferrer">
              Jason Charwin
            </a>
            {' · '}
            <a
              href="https://github.com/Thespaceblade/F1-Corner-Analysis"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
