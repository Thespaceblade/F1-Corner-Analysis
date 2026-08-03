'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { loadTrackSvg } from '../../lib/trackSvgLoader'

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
  pointer: { x: number; y: number }
  reducedMotion: boolean
}

type LapGeometry = {
  viewBox: string
  lapD: string
  start: { x: number; y: number } | null
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

/**
 * Pull the thick asphalt segments (stroke #374151) out of a track SVG and
 * concatenate them into one continuous lap path we can sample for animation.
 */
function parseLapGeometry(raw: string): LapGeometry {
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 620 700'
  const pathTags = raw.match(/<path\b[^>]*>/g) ?? []
  const segments: string[] = []

  for (const tag of pathTags) {
    const stroke = tag.match(/\bstroke="([^"]+)"/)?.[1]?.toLowerCase()
    const d = tag.match(/\bd="([^"]+)"/)?.[1]
    if (d && stroke === '#374151') {
      segments.push(d.trim())
    }
  }

  const lapD = segments.join(' ')
  const startMatch = segments[0]?.match(/M\s*([\d.]+)[ ,]+([\d.]+)/)
  const start = startMatch
    ? { x: Number(startMatch[1]), y: Number(startMatch[2]) }
    : null

  return { viewBox, lapD, start }
}

export default function HeroTrackStage({
  svgFile,
  corners,
  href,
  ctaLabel,
  ariaLabel,
  pointer,
  reducedMotion,
}: HeroTrackStageProps) {
  const [geometry, setGeometry] = useState<LapGeometry | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const carRefs = useRef<(SVGGElement | null)[]>([])

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

  useEffect(() => {
    const path = pathRef.current
    if (!geometry || !path) return

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
  }, [geometry, reducedMotion])

  const planeTransform = reducedMotion
    ? 'perspective(1200px) rotateX(50deg) rotateZ(-11deg)'
    : `perspective(1200px) rotateX(${52 - (pointer.y - 0.5) * 6}deg) rotateZ(${
        -12 + (pointer.x - 0.5) * 6
      }deg) translate3d(${(pointer.x - 0.5) * 18}px, ${(pointer.y - 0.5) * 10}px, 0)`

  return (
    <div className="home-hero-stage">
      <div className="home-hero-stage-shadow" aria-hidden="true" />
      <div className="home-hero-stage-plane" style={{ transform: planeTransform }} aria-hidden="true">
        {geometry && (
          <svg
            className="home-hero-stage-svg"
            viewBox={geometry.viewBox}
            preserveAspectRatio="xMidYMid meet"
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

            {uniqueCorners.map((corner) => (
              <g key={corner.number} className={`stage-corner is-${corner.type}`}>
                <title>{`Turn ${corner.number} · ${corner.type}`}</title>
                <circle cx={corner.x} cy={corner.y} r={9} />
                <text x={corner.x} y={corner.y}>
                  {corner.number}
                </text>
              </g>
            ))}

            {CARS.map((car, i) => (
              <g
                key={i}
                ref={(node) => {
                  carRefs.current[i] = node
                }}
                className={`stage-car${car.lead ? ' is-lead' : ''}`}
              >
                {car.lead && <ellipse className="stage-car-glow" rx={16} ry={9} />}
                <rect x={-10} y={-4} width={20} height={8} rx={3.5} fill={car.color} />
                <rect x={-2.5} y={-2.4} width={5} height={4.8} rx={1.4} fill="rgba(9,9,11,0.6)" />
              </g>
            ))}
          </svg>
        )}
      </div>

      <Link href={href} className="home-hero-stage-cta" aria-label={ariaLabel}>
        <span className="home-hero-stage-cta-pulse" aria-hidden="true" />
        {ctaLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
