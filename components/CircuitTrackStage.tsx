'use client'

import { useEffect, useMemo, useState } from 'react'
import { loadTrackSvg } from '../lib/trackSvgLoader'
import { parseLapGeometry, type LapGeometry } from '../lib/trackLapGeometry'

export type CircuitTrackCorner = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

type CircuitTrackStageProps = {
  svgFile: string
  corners?: CircuitTrackCorner[]
  className?: string
  /** Soft continuous yaw — same idea as the previous Three.js autoRotate. */
  autoSpin?: boolean
  reducedMotion?: boolean
}

/** 3 wall slabs + deck ≈ 4 layered tracks (hero uses 42). */
const EXTRUSION_STEPS = 3
const EXTRUSION_STEP_PX = 8
/** Padding around path bbox so thick asphalt strokes aren't clipped. */
const VIEW_PAD = 48

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

/**
 * Circuits visualiser: hero-style extruded asphalt, ~4 layers tall,
 * with the red dashed centerline and a slow spin. Per-track viewBox
 * fitting keeps elongated circuits (Spa, Austria, China, Silverstone) framed.
 */
export default function CircuitTrackStage({
  svgFile,
  corners = [],
  className = '',
  autoSpin = true,
  reducedMotion = false,
}: CircuitTrackStageProps) {
  const [geometry, setGeometry] = useState<LapGeometry | null>(null)
  const [fitted, setFitted] = useState<FittedBox | null>(null)

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
        /* decorative — empty stage is fine */
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

  const extrusionHeight = EXTRUSION_STEPS * EXTRUSION_STEP_PX
  const spin = autoSpin && !reducedMotion
  const viewBox = fitted?.viewBox ?? geometry?.viewBox ?? '0 0 620 700'
  const aspectW = fitted?.width ?? 620
  const aspectH = fitted?.height ?? 700

  return (
    <div
      className={`circuit-track-stage${spin ? ' is-spin' : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="circuit-track-stage-shadow" />

      <div
        className="circuit-track-stage-plane"
        style={{ aspectRatio: `${aspectW} / ${aspectH}` }}
      >
        {geometry && geometry.lapD ? (
          <div className="circuit-track-stage-extrude">
            {Array.from({ length: EXTRUSION_STEPS }, (_, i) => {
              const lift = i / Math.max(1, EXTRUSION_STEPS - 1)
              const wall = `rgb(${Math.round(10 + lift * 22)}, ${Math.round(12 + lift * 24)}, ${Math.round(16 + lift * 28)})`
              return (
                <svg
                  key={i}
                  className="circuit-track-stage-slab"
                  viewBox={viewBox}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ transform: `translateZ(${i * EXTRUSION_STEP_PX}px)` }}
                >
                  <path
                    className="stage-asphalt-edge stage-asphalt-wall-edge"
                    d={geometry.lapD}
                    style={{ stroke: `rgba(0, 0, 0, ${0.92 - lift * 0.22})` }}
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
                stroke="#e10600"
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
