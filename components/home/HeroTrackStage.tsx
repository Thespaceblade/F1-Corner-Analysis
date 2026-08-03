'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import Link from 'next/link'
import { loadTrackSvg } from '../../lib/trackSvgLoader'
import { parseLapGeometry, type LapGeometry } from '../../lib/trackLapGeometry'

export type HeroCorner = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

type HeroTrackStageProps = {
  svgFile: string
  corners: HeroCorner[]
  href: string
  ctaLabel: string
  ariaLabel: string
  /** Short GP name shown at the geometric center of the track. */
  raceName: string
  roundLabel?: string
  heroRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

// Three phase-offset cars looping the centerline. Slightly different lap
// durations let them spread out and re-form instead of moving in lockstep.
type CarConfig = {
  color: string
  duration: number
  phase: number
  lead?: boolean
}

const CARS: CarConfig[] = [
  { color: '#ff8a3d', duration: 8.4, phase: 0, lead: true },
  { color: '#f5f2ea', duration: 9.6, phase: 0.4 },
  { color: '#5bd1ff', duration: 11.2, phase: 0.72 },
]

// Match CircuitTrackStage ribbon — dense identical red slabs read as one wall.
const EXTRUSION_STEPS = 32
const EXTRUSION_STEP_PX = 2.4

// Top-down F1 planform, nose toward +X (matches path-tangent rotation).
const F1_BODY_D =
  'M 11 0 L 8.6 -1.7 L 7.2 -2.1 L 6.6 -5.6 L 4.7 -5.6 L 4.7 -2.35 L 2.2 -2.55 L -0.6 -3.35 L -4.8 -3.15 L -6.8 -2.3 L -7.9 -5.1 L -10.6 -5.1 L -10.6 5.1 L -7.9 5.1 L -6.8 2.3 L -4.8 3.15 L -0.6 3.35 L 2.2 2.55 L 4.7 2.35 L 4.7 5.6 L 6.6 5.6 L 7.2 2.1 L 8.6 1.7 Z'

const CAR_HEIGHT_STEPS = 5
const CAR_HEIGHT_STEP_PX = 1.65

function shadeCarColor(hex: string, amount: number) {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return hex
  const n = Number.parseInt(raw, 16)
  const channel = (shift: number) =>
    Math.min(255, Math.max(0, Math.round((((n >> shift) & 255) / 255) * amount * 255)))
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}

function HeroCarMesh({ color, lead }: { color: string; lead?: boolean }) {
  const topZ = CAR_HEIGHT_STEPS * CAR_HEIGHT_STEP_PX
  return (
    <>
      {lead && <ellipse className="stage-car-glow" cx={1} cy={0} rx={13} ry={7} />}
      {Array.from({ length: CAR_HEIGHT_STEPS }, (_, z) => {
        const t = z / Math.max(1, CAR_HEIGHT_STEPS - 1)
        return (
          <g
            key={z}
            className="stage-car-slab"
            style={{ transform: `translateZ(${z * CAR_HEIGHT_STEP_PX}px)` }}
          >
            <path d={F1_BODY_D} fill={shadeCarColor(color, 0.28 + t * 0.35)} />
          </g>
        )
      })}
      <g className="stage-car-deck" style={{ transform: `translateZ(${topZ}px)` }}>
        <path className="stage-car-body" d={F1_BODY_D} fill={color} />
        <path d="M 6.5 -5.4 H 4.9 V 5.4 H 6.5 Z" fill={shadeCarColor(color, 0.82)} />
        <path d="M -10.4 -4.9 H -8.1 V 4.9 H -10.4 Z" fill={shadeCarColor(color, 0.75)} />
        <path
          d="M 5.2 0 L 1.2 -1.15 L -6.4 -0.9 L -6.4 0.9 L 1.2 1.15 Z"
          fill={shadeCarColor(color, 1.08)}
          opacity={0.55}
        />
        <ellipse cx={0.2} cy={0} rx={2.35} ry={1.55} fill="rgba(8, 9, 12, 0.82)" />
        <ellipse
          cx={0.2}
          cy={0}
          rx={2.75}
          ry={1.85}
          fill="none"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth={0.55}
        />
        <path d="M 10.4 0 L 7.4 -0.85 L 7.4 0.85 Z" fill="rgba(255, 255, 255, 0.22)" />
      </g>
    </>
  )
}

function samplePathPoints(path: SVGPathElement, count = 96) {
  const total = path.getTotalLength()
  if (!total) return [] as { x: number; y: number }[]
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    const p = path.getPointAtLength((i / count) * total)
    pts.push({ x: p.x, y: p.y })
  }
  return pts
}

/** Shoelace centroid of a (roughly) closed loop — usually lands in the infield. */
function polygonCentroid(pts: { x: number; y: number }[]) {
  if (pts.length < 3) return null
  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const cross = a.x * b.y - b.x * a.y
    area += cross
    cx += (a.x + b.x) * cross
    cy += (a.y + b.y) * cross
  }
  if (Math.abs(area) < 1e-6) return null
  area *= 0.5
  return { x: cx / (6 * area), y: cy / (6 * area) }
}

function pointInPolygon(x: number, y: number, pts: { x: number; y: number }[]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x
    const yi = pts[i].y
    const xj = pts[j].x
    const yj = pts[j].y
    const hit =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi
    if (hit) inside = !inside
  }
  return inside
}

function minDistToSamples(x: number, y: number, pts: { x: number; y: number }[]) {
  let best = Infinity
  for (const p of pts) {
    const dx = p.x - x
    const dy = p.y - y
    const d = dx * dx + dy * dy
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

/**
 * Find a label anchor in the track infield: prefer the sample with the
 * largest clearance from the asphalt centerline that still sits inside the loop.
 */
function findInfieldAnchor(path: SVGPathElement) {
  const pts = samplePathPoints(path, 120)
  if (pts.length < 3) return null

  const box = path.getBBox()
  const centroid = polygonCentroid(pts)
  let best = centroid
  let bestClearance = centroid
    ? minDistToSamples(centroid.x, centroid.y, pts)
    : -1

  // Grid search the bbox for a deeper infield pocket than the pure centroid.
  const cols = 18
  const rows = 18
  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      const x = box.x + (box.width * col) / cols
      const y = box.y + (box.height * row) / rows
      if (!pointInPolygon(x, y, pts)) continue
      const clearance = minDistToSamples(x, y, pts)
      if (clearance > bestClearance) {
        bestClearance = clearance
        best = { x, y }
      }
    }
  }

  if (!best) return null

  // Keep type size proportional to the infield pocket, not the full bbox.
  const maxWidth = Math.min(box.width * 0.42, Math.max(90, bestClearance * 2.4))
  return { x: best.x, y: best.y, maxWidth, clearance: bestClearance }
}

export default function HeroTrackStage({
  svgFile,
  corners,
  href,
  ctaLabel,
  ariaLabel,
  raceName,
  roundLabel,
  heroRef,
  reducedMotion,
}: HeroTrackStageProps) {
  const [geometry, setGeometry] = useState<LapGeometry | null>(null)
  const [hot, setHot] = useState(false)
  const [trackCenter, setTrackCenter] = useState<{
    x: number
    y: number
    titleSize: number
    kickerSize: number
    maxWidth: number
  } | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const planeRef = useRef<HTMLDivElement | null>(null)
  const calloutRef = useRef<HTMLSpanElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const carRefs = useRef<(SVGGElement | null)[]>([])
  const trackHoverDepth = useRef(0)
  const pointerTarget = useRef({ x: 0.72, y: 0.42 })
  const pointerCurrent = useRef({ x: 0.72, y: 0.42 })

  useEffect(() => {
    let active = true
    loadTrackSvg(svgFile)
      .then((raw) => {
        if (active) setGeometry(parseLapGeometry(raw))
      })
      .catch(() => {
        // Hero visual is decorative; failing to load simply shows the wash.
      })
    return () => {
      active = false
    }
  }, [svgFile])

  const uniqueCorners = useMemo(() => {
    const seen = new Set<number>()
    return corners.filter((corner) => {
      if (seen.has(corner.number)) return false
      seen.add(corner.number)
      return true
    })
  }, [corners])

  // Parallax via DOM only — never setState on pointermove (that re-renders 32 SVGs).
  useEffect(() => {
    const plane = planeRef.current
    if (!plane) return

    const base = 'perspective(1400px) rotateX(52deg) scale(1.0125) rotateZ(-12deg)'
    if (reducedMotion) {
      plane.style.transform = base
      return
    }

    const apply = (x: number, y: number) => {
      plane.style.transform = `perspective(1400px) rotateX(${
        52 - (y - 0.5) * 3
      }deg) scale(1.0125) rotateZ(${-12 + (x - 0.5) * 5}deg) translate3d(${
        (x - 0.5) * 14
      }px, ${(y - 0.5) * 8}px, 0)`
    }

    apply(pointerCurrent.current.x, pointerCurrent.current.y)

    const hero = heroRef.current
    if (!hero) return

    const onMove = (event: PointerEvent) => {
      // Freeze camera while the cursor is on asphalt so hover callout stays stable.
      if (trackHoverDepth.current > 0) return
      const rect = hero.getBoundingClientRect()
      pointerTarget.current = {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      }
    }

    let raf = 0
    const tick = () => {
      const cur = pointerCurrent.current
      const tgt = pointerTarget.current
      cur.x += (tgt.x - cur.x) * 0.08
      cur.y += (tgt.y - cur.y) * 0.08
      apply(cur.x, cur.y)
      raf = requestAnimationFrame(tick)
    }

    hero.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      hero.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [heroRef, reducedMotion, geometry])

  useEffect(() => {
    const path = pathRef.current
    if (!geometry || !path) return

    try {
      const anchor = findInfieldAnchor(path)
      if (anchor) {
        const titleSize = Math.min(
          34,
          Math.max(15, anchor.maxWidth / Math.max(6, raceName.length * 0.58)),
        )
        const kickerSize = Math.max(10, titleSize * 0.36)
        setTrackCenter({
          x: anchor.x,
          y: anchor.y,
          titleSize,
          kickerSize,
          maxWidth: anchor.maxWidth,
        })
      }
    } catch {
      setTrackCenter(null)
    }

    let total = 0
    try {
      total = path.getTotalLength()
    } catch {
      return
    }
    if (!total) return

    const place = (car: SVGGElement, t: number) => {
      const len = (((t % 1) + 1) % 1) * total
      const point = path.getPointAtLength(len)
      const ahead = path.getPointAtLength((len + 3) % total)
      const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI
      car.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`)
    }

    // Seed initial positions so cars never flash at the origin.
    CARS.forEach((car, i) => {
      const node = carRefs.current[i]
      if (node) place(node, car.phase)
    })

    if (reducedMotion) return

    let raf = 0
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000
      CARS.forEach((car, i) => {
        const node = carRefs.current[i]
        if (node) place(node, car.phase + elapsed / car.duration)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [geometry, reducedMotion, raceName])

  const moveCalloutToPointer = (event: ReactPointerEvent) => {
    const stage = stageRef.current
    const callout = calloutRef.current
    if (!stage || !callout) return
    const rect = stage.getBoundingClientRect()
    callout.style.left = `${event.clientX - rect.left}px`
    callout.style.top = `${event.clientY - rect.top}px`
  }

  const onTrackEnter = (event: ReactPointerEvent) => {
    trackHoverDepth.current += 1
    moveCalloutToPointer(event)
    setHot(true)
  }

  const onTrackMove = (event: ReactPointerEvent) => {
    moveCalloutToPointer(event)
    setHot(true)
  }

  const onTrackLeave = () => {
    trackHoverDepth.current = Math.max(0, trackHoverDepth.current - 1)
    if (trackHoverDepth.current === 0) setHot(false)
  }

  const extrusionHeight = EXTRUSION_STEPS * EXTRUSION_STEP_PX
  // Hit strips along the extruded wall so the vertical face also counts as "on track".
  const wallHitLevels = [0, Math.floor(EXTRUSION_STEPS / 3), Math.floor((EXTRUSION_STEPS * 2) / 3)]

  return (
    <div
      ref={stageRef}
      className={`home-hero-stage${hot ? ' is-hot' : ''}`}
    >
      <div className="home-hero-stage-shadow" aria-hidden="true" />

      <Link
        href={href}
        className="home-hero-stage-hit"
        aria-label={ariaLabel}
        onFocus={() => {
          const stage = stageRef.current
          const callout = calloutRef.current
          if (!stage || !callout) return
          callout.style.left = `${stage.clientWidth * 0.55}px`
          callout.style.top = `${stage.clientHeight * 0.42}px`
          setHot(true)
        }}
        onBlur={() => {
          trackHoverDepth.current = 0
          setHot(false)
        }}
      >
        <div
          ref={planeRef}
          className="home-hero-stage-plane"
          style={
            {
              transform: 'perspective(1400px) rotateX(52deg) scale(1.0125) rotateZ(-12deg)',
            } as CSSProperties
          }
        >
          {geometry && geometry.lapD && (
            <div className="home-hero-stage-extrude">
              {Array.from({ length: EXTRUSION_STEPS }, (_, i) => {
                const isHitLayer = wallHitLevels.includes(i)
                return (
                  <svg
                    key={i}
                    className="home-hero-stage-slab"
                    viewBox={geometry.viewBox}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ transform: `translateZ(${i * EXTRUSION_STEP_PX}px)` }}
                  >
                    <path className="stage-asphalt-edge stage-asphalt-wall-edge" d={geometry.lapD} />
                    <path className="stage-asphalt stage-asphalt-wall" d={geometry.lapD} />
                    {isHitLayer && (
                      <path
                        className="stage-hit"
                        d={geometry.lapD}
                        onPointerEnter={onTrackEnter}
                        onPointerMove={onTrackMove}
                        onPointerLeave={onTrackLeave}
                      />
                    )}
                  </svg>
                )
              })}

              <svg
                className="home-hero-stage-svg home-hero-stage-deck"
                viewBox={geometry.viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ transform: `translateZ(${extrusionHeight}px)` }}
              >
                <path className="stage-asphalt-edge" d={geometry.lapD} />
                <path className="stage-asphalt" d={geometry.lapD} />
                <path ref={pathRef} className="stage-line" d={geometry.lapD} />

                {geometry.start && (
                  <circle
                    className="stage-start"
                    cx={geometry.start.x}
                    cy={geometry.start.y}
                    r={9}
                  />
                )}

                {trackCenter && (
                  <g
                    className="stage-last-race"
                    transform={`translate(${trackCenter.x} ${trackCenter.y})`}
                  >
                    <text
                      className="stage-last-race-kicker"
                      y={-trackCenter.titleSize * 0.72}
                      style={{ fontSize: trackCenter.kickerSize }}
                    >
                      Last race
                    </text>
                    <text
                      className="stage-last-race-title"
                      style={{ fontSize: trackCenter.titleSize }}
                    >
                      {raceName}
                    </text>
                  </g>
                )}

                {uniqueCorners.map((corner) => (
                  <g key={corner.number} className={`stage-corner is-${corner.type}`}>
                    <title>{`Turn ${corner.number} · ${corner.type}`}</title>
                    <circle cx={corner.x} cy={corner.y} r={9} />
                    <text x={corner.x} y={corner.y}>
                      {corner.number}
                    </text>
                  </g>
                ))}

                <path
                  className="stage-hit"
                  d={geometry.lapD}
                  onPointerEnter={onTrackEnter}
                  onPointerMove={onTrackMove}
                  onPointerLeave={onTrackLeave}
                />
              </svg>

              {/* Separate from deck so CSS drop-shadow doesn't flatten car height. */}
              <svg
                className="home-hero-stage-svg home-hero-stage-cars"
                viewBox={geometry.viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ transform: `translateZ(${extrusionHeight}px)` }}
              >
                {CARS.map((car, i) => (
                  <g
                    key={i}
                    ref={(node) => {
                      carRefs.current[i] = node
                    }}
                    className={`stage-car${car.lead ? ' is-lead' : ''}`}
                  >
                    <HeroCarMesh color={car.color} lead={car.lead} />
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        <span
          ref={calloutRef}
          className="home-hero-stage-callout"
          style={{ left: 0, top: 0 } as CSSProperties}
        >
          <span className="home-hero-stage-callout-rule" aria-hidden="true" />
          <span className="home-hero-stage-callout-body">
            <span className="home-hero-stage-callout-kicker">
              Last race{roundLabel ? ` · ${roundLabel}` : ''}
            </span>
            <span className="home-hero-stage-callout-title">{ctaLabel}</span>
          </span>
          <span className="home-hero-stage-callout-go" aria-hidden="true">
            →
          </span>
        </span>
      </Link>
    </div>
  )
}
