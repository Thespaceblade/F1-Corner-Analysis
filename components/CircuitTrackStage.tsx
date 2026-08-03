'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { loadTrackSvg } from '../lib/trackSvgLoader'
import { parseLapGeometry, type LapGeometry } from '../lib/trackLapGeometry'

export type CircuitTrackCorner = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

export type CircuitTrackOrientation = '3d' | '2d'

type CircuitTrackStageProps = {
  svgFile: string
  corners?: CircuitTrackCorner[]
  className?: string
  autoSpin?: boolean
  reducedMotion?: boolean
  /** Multiplier on base plane scale (1 = default). */
  scaleFactor?: number
  /**
   * `3d` = pitched perspective ribbon (circuits visualiser default).
   * `2d` = flattened top-down. Transitions animate the plane in space.
   */
  orientation?: CircuitTrackOrientation
}

/** Dense identical slabs so the vertical face reads as one continuous ribbon. */
const EXTRUSION_STEPS = 32
const EXTRUSION_STEP_PX = 2
const VIEW_PAD = 28

/** Match CSS camera — yaw (rotateZ) is driven in JS for drag + auto-spin. */
const PITCH_3D = 68
const PITCH_2D = 8
const PLANE_SCALE = 1.4
const PLANE_SCALE_2D = 1.15
const AUTO_SPIN_MS = 110_000
const DRAG_SENSITIVITY = 0.28
const INERTIA_FRICTION = 0.965
/** Per-frame approach factor for pitch/scale (higher = snappier). */
const ORIENT_LERP = 0.085

/** Per-circuit visual size tweaks relative to the default stage scale. */
export function getCircuitVisualScale(
  trackId: string,
  calendarOrder: Array<{ id: string }> = [],
): number {
  if (trackId === 'japan' || trackId === 'miami' || trackId === 'austria') return 0.9
  const canadaIdx = calendarOrder.findIndex((t) => t.id === 'canada')
  const idx = calendarOrder.findIndex((t) => t.id === trackId)
  if (canadaIdx >= 0 && idx >= canadaIdx) return 1.1
  // Fallback when calendar list isn't available yet
  if (trackId === 'canada') return 1.1
  return 1
}

type FittedBox = {
  viewBox: string
  width: number
  height: number
}

function fitPathViewBox(lapD: string, fallback: string): FittedBox {
  const fallbackParts = fallback.split(/[\s,]+/).map(Number)
  const fbW = fallbackParts[2] || 620
  const fbH = fallbackParts[3] || 700

  if (typeof document === 'undefined') {
    return { viewBox: fallback, width: fbW, height: fbH }
  }

  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'
    svg.style.visibility = 'hidden'
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', lapD)
    svg.appendChild(path)
    document.body.appendChild(svg)
    const box = path.getBBox()
    document.body.removeChild(svg)

    if (!box.width || !box.height) {
      return { viewBox: fallback, width: fbW, height: fbH }
    }

    const x = box.x - VIEW_PAD
    const y = box.y - VIEW_PAD
    const width = box.width + VIEW_PAD * 2
    const height = box.height + VIEW_PAD * 2
    return {
      viewBox: `${x} ${y} ${width} ${height}`,
      width,
      height,
    }
  } catch {
    return { viewBox: fallback, width: fbW, height: fbH }
  }
}

function planeTransform(yawDeg: number, pitchDeg: number, scale: number) {
  return `perspective(1400px) rotateX(${pitchDeg}deg) scale(${scale}) rotateZ(${yawDeg}deg)`
}

function targetsForOrientation(orientation: CircuitTrackOrientation, scaleFactor: number) {
  if (orientation === '2d') {
    return { pitch: PITCH_2D, scale: PLANE_SCALE_2D * scaleFactor }
  }
  return { pitch: PITCH_3D, scale: PLANE_SCALE * scaleFactor }
}

/**
 * Circuits visualiser: extruded asphalt ribbon, translucent red walls,
 * slow auto-yaw, and click-drag spin on that same axis.
 * Orientation animates the plane between perspective 3D and flattened 2D.
 */
export default function CircuitTrackStage({
  svgFile,
  corners = [],
  className = '',
  autoSpin = true,
  reducedMotion = false,
  scaleFactor = 1,
  orientation = '3d',
}: CircuitTrackStageProps) {
  const [geometry, setGeometry] = useState<LapGeometry | null>(null)
  const [fitted, setFitted] = useState<FittedBox | null>(null)
  const [dragging, setDragging] = useState(false)

  const planeRef = useRef<HTMLDivElement>(null)
  const yawRef = useRef(0)
  const velocityRef = useRef(0)
  const draggingRef = useRef(false)
  const lastPointerRef = useRef<{ x: number; t: number } | null>(null)
  const autoSpinRef = useRef(autoSpin && !reducedMotion && orientation === '3d')
  const scaleFactorRef = useRef(scaleFactor)
  const orientationRef = useRef(orientation)
  const pitchRef = useRef(targetsForOrientation(orientation, scaleFactor).pitch)
  const scaleRef = useRef(targetsForOrientation(orientation, scaleFactor).scale)
  const initial = targetsForOrientation(orientation, scaleFactor)

  useEffect(() => {
    autoSpinRef.current = autoSpin && !reducedMotion && orientation === '3d'
    orientationRef.current = orientation
  }, [autoSpin, reducedMotion, orientation])

  useEffect(() => {
    scaleFactorRef.current = scaleFactor
  }, [scaleFactor])

  useEffect(() => {
    let active = true
    setFitted(null)
    loadTrackSvg(svgFile)
      .then((raw) => {
        if (!active) return
        const next = parseLapGeometry(raw)
        setGeometry(next)
        if (next.lapD) setFitted(fitPathViewBox(next.lapD, next.viewBox))
      })
      .catch(() => {
        /* decorative */
      })
    return () => {
      active = false
    }
  }, [svgFile])

  // Auto-spin + inertia + orientation tilt on the shared plane transform.
  useEffect(() => {
    const autoDegPerMs = 360 / AUTO_SPIN_MS
    let frame = 0
    let last = performance.now()

    const apply = () => {
      const el = planeRef.current
      if (el) {
        el.style.transform = planeTransform(yawRef.current, pitchRef.current, scaleRef.current)
      }
    }

    apply()

    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const lerp = 1 - Math.pow(1 - ORIENT_LERP, dt / 16)

      const target = targetsForOrientation(orientationRef.current, scaleFactorRef.current)
      pitchRef.current += (target.pitch - pitchRef.current) * lerp
      scaleRef.current += (target.scale - scaleRef.current) * lerp

      if (!draggingRef.current) {
        let v = velocityRef.current
        if (Math.abs(v) > 0.0008) {
          yawRef.current += v * dt
          v *= Math.pow(INERTIA_FRICTION, dt / 16)
          if (Math.abs(v) < autoDegPerMs * 0.35) {
            v = autoSpinRef.current ? autoDegPerMs * Math.sign(v || 1) : 0
          }
          velocityRef.current = v
        } else if (autoSpinRef.current) {
          yawRef.current += autoDegPerMs * dt
          velocityRef.current = autoDegPerMs
        } else {
          velocityRef.current = 0
        }
      }

      apply()
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current || !lastPointerRef.current) return
      const now = performance.now()
      const dx = event.clientX - lastPointerRef.current.x
      const dt = Math.max(8, now - lastPointerRef.current.t)
      const deltaYaw = dx * DRAG_SENSITIVITY
      yawRef.current += deltaYaw
      velocityRef.current = deltaYaw / dt
      lastPointerRef.current = { x: event.clientX, t: now }
      if (planeRef.current) {
        planeRef.current.style.transform = planeTransform(
          yawRef.current,
          pitchRef.current,
          scaleRef.current,
        )
      }
    }

    const onUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      lastPointerRef.current = null
      setDragging(false)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const uniqueCorners = useMemo(() => {
    const seen = new Set<number>()
    return corners.filter((corner) => {
      if (seen.has(corner.number)) return false
      seen.add(corner.number)
      return true
    })
  }, [corners])

  const extrusionHeight = EXTRUSION_STEPS * EXTRUSION_STEP_PX
  const viewBox = fitted?.viewBox ?? geometry?.viewBox ?? '0 0 620 700'
  const aspectW = fitted?.width ?? 620
  const aspectH = fitted?.height ?? 700

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    draggingRef.current = true
    velocityRef.current = 0
    lastPointerRef.current = { x: event.clientX, t: performance.now() }
    setDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  return (
    <div
      className={`circuit-track-stage is-interactive${dragging ? ' is-dragging' : ''}${reducedMotion ? '' : ' is-animated'} is-${orientation} ${className}`.trim()}
      role="img"
      aria-label="Circuit map — drag horizontally to spin"
      onPointerDown={onPointerDown}
    >
      <div className="circuit-track-stage-shadow" />

      <div
        ref={planeRef}
        className="circuit-track-stage-plane"
        style={{
          aspectRatio: `${aspectW} / ${aspectH}`,
          transform: planeTransform(0, initial.pitch, initial.scale),
        }}
      >
        {geometry && geometry.lapD ? (
          <div className="circuit-track-stage-extrude">
            {Array.from({ length: EXTRUSION_STEPS }, (_, i) => (
              <svg
                key={i}
                className="circuit-track-stage-slab"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ transform: `translateZ(${i * EXTRUSION_STEP_PX}px)` }}
              >
                <path className="stage-asphalt-edge stage-asphalt-wall-edge" d={geometry.lapD} />
                <path className="stage-asphalt stage-asphalt-wall" d={geometry.lapD} />
              </svg>
            ))}

            <svg
              className="circuit-track-stage-deck"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              style={{ transform: `translateZ(${extrusionHeight}px)` }}
            >
              <path className="stage-asphalt-edge" d={geometry.lapD} />
              <path className="stage-asphalt" d={geometry.lapD} />
              <path
                className="stage-line"
                d={geometry.lapD}
                fill="none"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="6 12"
              />

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
                  <circle cx={corner.x} cy={corner.y} r={9} />
                  <text x={corner.x} y={corner.y}>
                    {corner.number}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  )
}
