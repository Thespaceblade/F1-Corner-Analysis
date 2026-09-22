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
  reducedMotion: boolean
}

type LapGeometry = {
  viewBox: string
  lapD: string
  start: { x: number; y: number } | null
}

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

const EXTRUSION_STEPS = 42
const EXTRUSION_STEP_PX = 3.4

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

function planeTransformFor(nx: number, ny: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return 'perspective(1200px) rotateX(58deg) rotateZ(-12deg)'
  }
  return `perspective(1200px) rotateX(${58 - (ny - 0.5) * 5}deg) rotateZ(${
    -12 + (nx - 0.5) * 6
  }deg) translate3d(${(nx - 0.5) * 18}px, ${(ny - 0.5) * 10}px, 0)`
}

export default function HeroTrackStage({
  svgFile,
  corners,
  href,
  ctaLabel,
  ariaLabel,
  reducedMotion,
}: HeroTrackStageProps) {
  const [geometry, setGeometry] = useState<LapGeometry | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const hitRef = useRef<HTMLAnchorElement | null>(null)
  const planeRef = useRef<HTMLDivElement | null>(null)
  const calloutRef = useRef<HTMLSpanElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const hotRef = useRef(false)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const carRefs = useRef<(SVGGElement | null)[]>([])
  // #region agent log
  const renderCountRef = useRef(0)
  const moveCountRef = useRef(0)
  const hotToggleRef = useRef(0)
  const rafTickRef = useRef(0)
  const lastPointerLogRef = useRef(0)
  renderCountRef.current += 1
  if (renderCountRef.current <= 5 || renderCountRef.current % 30 === 0) {
    fetch('http://127.0.0.1:7575/ingest/4fe3a13a-965f-4e19-a81b-b5d06141cbd9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d00f57'},body:JSON.stringify({sessionId:'d00f57',runId:'post-fix-2',hypothesisId:'F',location:'HeroTrackStage.tsx:render',message:'HeroTrackStage render',data:{renderCount:renderCountRef.current,hotDom:hotRef.current,hasGeometry:!!geometry,extrusionSteps:EXTRUSION_STEPS},timestamp:Date.now()})}).catch(()=>{})
  }
  // #endregion

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

  // Parallax via DOM only. Freeze while hot so transform doesn't yank the
  // hit stroke out from under the cursor (which thrashed enter/leave).
  useEffect(() => {
    const stage = stageRef.current
    const plane = planeRef.current
    if (!stage || !plane) return

    plane.style.transform = planeTransformFor(0.72, 0.42, reducedMotion)
    if (reducedMotion) return

    const onMove = (event: PointerEvent) => {
      if (hotRef.current) return
      const rect = stage.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const nx = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      const ny = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
      plane.style.transform = planeTransformFor(nx, ny, false)
      // #region agent log
      moveCountRef.current += 1
      const now = Date.now()
      if (now - lastPointerLogRef.current > 400) {
        lastPointerLogRef.current = now
        fetch('http://127.0.0.1:7575/ingest/4fe3a13a-965f-4e19-a81b-b5d06141cbd9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d00f57'},body:JSON.stringify({sessionId:'d00f57',runId:'post-fix-2',hypothesisId:'F',location:'HeroTrackStage.tsx:parallaxDom',message:'DOM parallax',data:{moveCount:moveCountRef.current,renderCount:renderCountRef.current,hot:hotRef.current,nx:Number(nx.toFixed(3)),ny:Number(ny.toFixed(3))},timestamp:now})}).catch(()=>{})
      }
      // #endregion
    }

    stage.addEventListener('pointermove', onMove)
    return () => stage.removeEventListener('pointermove', onMove)
  }, [reducedMotion, geometry])

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

    CARS.forEach((car, i) => {
      const node = carRefs.current[i]
      if (node) place(node, car.phase)
    })

    if (reducedMotion) return

    let raf = 0
    const startTime = performance.now()
    const tick = (now: number) => {
      rafTickRef.current += 1
      // #region agent log
      if (rafTickRef.current === 1 || rafTickRef.current % 180 === 0) {
        fetch('http://127.0.0.1:7575/ingest/4fe3a13a-965f-4e19-a81b-b5d06141cbd9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d00f57'},body:JSON.stringify({sessionId:'d00f57',runId:'post-fix-2',hypothesisId:'F',location:'HeroTrackStage.tsx:carRaf',message:'Car RAF tick health',data:{tick:rafTickRef.current,pathAlive:!!pathRef.current?.isConnected,carsAlive:carRefs.current.filter((n)=>n&&n.isConnected).length,renderCount:renderCountRef.current,hotToggles:hotToggleRef.current},timestamp:Date.now()})}).catch(()=>{})
      }
      // #endregion
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

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    }
  }, [])

  // Toggle hover via DOM class only — never React setState (avoids remounting 42 SVGs).
  const setTrackHot = (next: boolean) => {
    if (hotRef.current === next) return
    hotRef.current = next
    hotToggleRef.current += 1
    stageRef.current?.classList.toggle('is-hot', next)
    hitRef.current?.classList.toggle('is-hot-cursor', next)
    // #region agent log
    fetch('http://127.0.0.1:7575/ingest/4fe3a13a-965f-4e19-a81b-b5d06141cbd9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d00f57'},body:JSON.stringify({sessionId:'d00f57',runId:'post-fix-2',hypothesisId:'F',location:'HeroTrackStage.tsx:setTrackHot',message:'Hover hot toggled (DOM only)',data:{hot:next,hotToggles:hotToggleRef.current,renderCount:renderCountRef.current},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
  }

  const placeCallout = (clientX: number, clientY: number) => {
    const host = hitRef.current
    const callout = calloutRef.current
    if (!host || !callout) return
    const rect = host.getBoundingClientRect()
    callout.style.left = `${clientX - rect.left}px`
    callout.style.top = `${clientY - rect.top}px`
  }

  const onTrackPointerEnter = (event: React.PointerEvent<SVGPathElement>) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    placeCallout(event.clientX, event.clientY)
    setTrackHot(true)
  }

  const onTrackPointerMove = (event: React.PointerEvent<SVGPathElement>) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    placeCallout(event.clientX, event.clientY)
    if (!hotRef.current) setTrackHot(true)
  }

  const onTrackPointerLeave = () => {
    // Debounce leave — parallax/subpixel gaps briefly fire leave while still on ribbon.
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null
      setTrackHot(false)
    }, 80)
  }

  const extrusionHeight = EXTRUSION_STEPS * EXTRUSION_STEP_PX

  return (
    <div ref={stageRef} className="home-hero-stage">
      <div className="home-hero-stage-shadow" aria-hidden="true" />

      <Link
        ref={hitRef}
        href={href}
        className="home-hero-stage-hit"
        aria-label={ariaLabel}
        onClick={(event) => {
          if (!hotRef.current) event.preventDefault()
        }}
        onBlur={() => setTrackHot(false)}
      >
        <div ref={planeRef} className="home-hero-stage-plane" aria-hidden="true">
          {geometry && (
            <div className="home-hero-stage-extrude">
              {Array.from({ length: EXTRUSION_STEPS }, (_, i) => {
                const lift = i / Math.max(1, EXTRUSION_STEPS - 1)
                const wall = `rgb(${Math.round(10 + lift * 22)}, ${Math.round(12 + lift * 24)}, ${Math.round(16 + lift * 28)})`
                return (
                  <svg
                    key={i}
                    className="home-hero-stage-slab"
                    viewBox={geometry.viewBox}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ transform: `translateZ(${i * EXTRUSION_STEP_PX}px)` }}
                  >
                    <path
                      className="stage-asphalt-edge stage-asphalt-wall-edge"
                      d={geometry.lapD}
                      style={{ stroke: `rgba(0, 0, 0, ${0.92 - lift * 0.25})` }}
                    />
                    <path
                      className="stage-asphalt stage-asphalt-wall"
                      d={geometry.lapD}
                      style={{ stroke: wall }}
                    />
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

                <path
                  className="stage-track-hit"
                  d={geometry.lapD}
                  onPointerEnter={onTrackPointerEnter}
                  onPointerMove={onTrackPointerMove}
                  onPointerLeave={onTrackPointerLeave}
                />
              </svg>
            </div>
          )}
        </div>

        <span ref={calloutRef} className="home-hero-stage-callout">
          <span className="home-hero-stage-callout-rule" aria-hidden="true" />
          <span className="home-hero-stage-callout-body">
            <span className="home-hero-stage-callout-kicker">Hungaroring · R11</span>
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
