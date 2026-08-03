'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AppNav from './AppNav'
import HeroTrackStage, { type HeroCorner } from './home/HeroTrackStage'

const TRACK_PREVIEWS = [
  { id: 'monaco', label: 'Monaco' },
  { id: 'spa', label: 'Spa' },
  { id: 'silverstone', label: 'Silverstone' },
  { id: 'monza', label: 'Monza' },
  { id: 'suzuka', label: 'Japan', file: 'japan' },
  { id: 'singapore', label: 'Singapore' },
  { id: 'interlagos', label: 'Brazil', file: 'brazil' },
  { id: 'bahrain', label: 'Bahrain' },
  { id: 'australia', label: 'Australia' },
  { id: 'austin', label: 'USA', file: 'usa' },
  { id: 'canada', label: 'Canada' },
  { id: 'hungary', label: 'Hungary' },
] as const

const INSTRUMENTS = [
  {
    code: 'ENT',
    title: 'Entry',
    body: 'Braking markers and approach speed into the corner.',
  },
  {
    code: 'APX',
    title: 'Apex',
    body: 'Minimum speed and commitment through the geometric apex.',
  },
  {
    code: 'EXT',
    title: 'Exit',
    body: 'Traction and drive onto the following straight.',
  },
  {
    code: 'ΔT',
    title: 'Delta',
    body: 'Where time is won or lost versus another driver.',
  },
] as const

const LATEST = {
  year: 2026,
  roundLabel: 'Round 11',
  name: 'Hungarian Grand Prix',
  location: 'Hungaroring',
  trackFile: 'hungary',
  sessions: [
    { label: 'Race', href: '/race/hungary?year=2026&session=R' },
    { label: 'Qualifying', href: '/race/hungary?year=2026&session=Q' },
    { label: 'Season view', href: '/season?year=2026' },
  ],
} as const

// Hungaroring corner markers for the hero stage. Coordinates already match the
// hungary.svg viewBox; one entry per unique turn (duplicates removed).
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
      { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

export default function HomePage() {
  const reducedMotion = usePrefersReducedMotion()
  const heroRef = useRef<HTMLElement | null>(null)
  const [pointer, setPointer] = useState({ x: 0.72, y: 0.42 })
  const latest = useScrollReveal<HTMLElement>()
  const paths = useScrollReveal<HTMLElement>()
  const instruments = useScrollReveal<HTMLElement>()
  const circuits = useScrollReveal<HTMLElement>()

  useEffect(() => {
    if (reducedMotion) return
    const el = heroRef.current
    if (!el) return

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      setPointer({
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      })
    }

    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [reducedMotion])

  const marqueeTracks = [...TRACK_PREVIEWS, ...TRACK_PREVIEWS]

  return (
    <div className="home-root">
      <AppNav variant="overlay" />

      <section ref={heroRef} className="home-hero">
        <div className="home-hero-atmosphere" aria-hidden="true">
          <div className="home-hero-grain" />
          <div className="home-hero-vignette" />
          <div className="home-hero-wash" />
        </div>

        <HeroTrackStage
          svgFile={`${LATEST.trackFile}.svg`}
          corners={HERO_CORNERS}
          href={LATEST.sessions[0].href}
          ctaLabel="Explore Hungarian GP"
          ariaLabel="Open Hungarian Grand Prix race analysis"
          pointer={pointer}
          reducedMotion={reducedMotion}
        />

        <div className="home-hero-inner">
          <p className="home-eyebrow home-enter" style={{ animationDelay: '0.04s' }}>
            FastF1 telemetry · corner geometry · season standings
          </p>

          <div className="home-brand home-enter" style={{ animationDelay: '0.1s' }}>
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

          <p className="home-headline home-enter" style={{ animationDelay: '0.2s' }}>
            See the lap where it bends.
          </p>

          <p className="home-lede home-enter" style={{ animationDelay: '0.3s' }}>
            Entry, apex, and exit for every corner. Then zoom out to the championship when the weekend is over.
          </p>

          <div className="home-cta-row home-enter" style={{ animationDelay: '0.4s' }}>
            <Link href="/race" className="home-cta home-cta-primary">
              Open Race Analysis
            </Link>
            <Link href="/season" className="home-cta home-cta-ghost">
              Season Review
            </Link>
          </div>
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
            <h2 className="home-section-title">Latest completed weekend</h2>
            <p className="home-section-lede">
              Start from the most recent race on the calendar, using the same path as the analysis tools once you pick year, track, and session.
            </p>
          </div>

          <div className="home-latest-board">
            <div className="home-latest-meta">
              <span className="home-mono">{LATEST.year}</span>
              <span className="home-mono">{LATEST.roundLabel}</span>
              <span className="home-latest-live">Completed</span>
            </div>
            <h3 className="home-latest-name">{LATEST.name}</h3>
            <p className="home-latest-loc">{LATEST.location}</p>
            <div className="home-latest-actions">
              {LATEST.sessions.map((session) => (
                <Link key={session.label} href={session.href} className="home-latest-chip">
                  {session.label}
                </Link>
              ))}
            </div>
            <div className="home-latest-silhouette" aria-hidden="true">
              <img src={`/Tracks/${LATEST.trackFile}.svg`} alt="" />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={paths.ref}
        className={`home-section home-paths ${paths.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner">
          <header className="home-section-header">
            <p className="home-kicker">Two paths</p>
            <h2 className="home-section-title">Pick the depth of the question</h2>
            <p className="home-section-lede">
              Race Analysis is for the lap. Season Review is for the year. Both read the same FastF1-backed sessions.
            </p>
          </header>

          <div className="home-path-split">
            <Link href="/race" className="home-path home-path-race">
              <div className="home-path-index home-mono">01</div>
              <h3>Race Analysis</h3>
              <p>
                Interactive circuits, corner deltas, entry and exit speed, sectors, stints, and consistency, filtered to the drivers you select.
              </p>
              <span className="home-path-go">
                Enter session tools <span aria-hidden="true">→</span>
              </span>
            </Link>

            <Link href="/season" className="home-path home-path-season">
              <div className="home-path-index home-mono">02</div>
              <h3>Season Review</h3>
              <p>
                Standings score tables mid-season, teammate head-to-heads, championship swing charts, and form track by track.
              </p>
              <span className="home-path-go">
                Open championship view <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>

          <div className="home-explore-links">
            <Link href="/teams" className="home-inline-link">
              Browse teams and per-circuit form
              <span aria-hidden="true"> →</span>
            </Link>
            <Link href="/drivers" className="home-inline-link">
              Browse drivers and per-circuit form
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={instruments.ref}
        className={`home-section home-instruments ${instruments.visible ? 'is-visible' : ''}`}
      >
        <div className="home-section-inner">
          <header className="home-section-header">
            <p className="home-kicker">Instruments</p>
            <h2 className="home-section-title">Built around the corner, not the highlight reel</h2>
            <p className="home-section-lede">
              Most telemetry tools stop at the trace. Here the circuit geometry is the frame, so you can read a lap the way an engineer talks about it.
            </p>
          </header>

          <div className="home-instrument-row">
            {INSTRUMENTS.map((item, index) => (
              <article
                key={item.code}
                className="home-instrument"
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <span className="home-instrument-code home-mono">{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
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
            <h2 className="home-section-title">Real track outlines, session after session</h2>
            <p className="home-section-lede">
              Corner overlays sit on the same geometry you see here, from street circuits to permanent high-speed layouts.
            </p>
          </header>
        </div>

        <div className="home-marquee" aria-hidden="true">
          <div className={`home-marquee-track ${reducedMotion ? 'is-static' : ''}`}>
            {marqueeTracks.map((track, index) => {
              const file = 'file' in track ? track.file : track.id
              return (
                <div key={`${track.id}-${index}`} className="home-marquee-item">
                  <img src={`/Tracks/${file}.svg`} alt="" className="home-marquee-svg" />
                  <span className="home-mono">{track.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="home-section-inner home-circuits-cta">
          <Link href="/race" className="home-inline-link">
            Open Race Analysis and choose a grand prix
            <span aria-hidden="true"> →</span>
          </Link>
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
                Unofficial fan project · not affiliated with Formula 1 · telemetry via FastF1
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
