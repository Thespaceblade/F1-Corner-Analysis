'use client'

import React, { useEffect, useState } from 'react'

type Corner = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

type TrackPanelProps = {
  svgFile: string
  corners: Corner[]
}

export default function TrackPanel({ svgFile, corners }: TrackPanelProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [viewBox, setViewBox] = useState<{minX:number,minY:number,w:number,h:number} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const reqIdRef = React.useRef(0)

  useEffect(() => {
    if(!svgFile) return
    const url = `/Tracks/${encodeURIComponent(svgFile)}`
    // clear previous content immediately to avoid flashing the wrong track
    setSvgContent(null)
    setViewBox(null)
    setStatus(null)
    setError(null)
    setIsReady(false)

    const controller = new AbortController()
    const signal = controller.signal
    const localReqId = ++reqIdRef.current

    fetch(url, { signal })
      .then(async res => {
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        if (signal.aborted) return
        // ignore if this is not the latest request
        if (localReqId !== reqIdRef.current) return
        setStatus(res.status)

        // try extract viewBox
        const vbMatch = text.match(/viewBox\s*=\s*"([^"]+)"/) || text.match(/viewBox\s*=\s*'([^']+)'/)
        if(vbMatch && vbMatch[1]){
          const parts = vbMatch[1].trim().split(/\s+/).map(Number)
          if(parts.length === 4 && parts.every(p => !Number.isNaN(p))){
            // only set if still latest
            if (localReqId === reqIdRef.current) {
              setViewBox({ minX: parts[0], minY: parts[1], w: parts[2], h: parts[3] })
            }
          }
        }

        if (localReqId === reqIdRef.current) {
          const prepared = text.replace(/<svg([\s\S]*?)>/i, (_match, attrs) => {
            let adjusted = attrs
            if (/width=/i.test(adjusted)) {
              adjusted = adjusted.replace(/width\s*=\s*(["']).*?\1/i, 'width="100%"')
            } else {
              adjusted += ' width="100%"'
            }

            if (/height=/i.test(adjusted)) {
              adjusted = adjusted.replace(/height\s*=\s*(["']).*?\1/i, 'height="100%"')
            } else {
              adjusted += ' height="100%"'
            }

            if (/preserveAspectRatio=/i.test(adjusted)) {
              adjusted = adjusted.replace(/preserveAspectRatio\s*=\s*(["']).*?\1/i, 'preserveAspectRatio="xMidYMid meet"')
            } else {
              adjusted += ' preserveAspectRatio="xMidYMid meet"'
            }

            return `<svg${adjusted}>`
          })
          setSvgContent(prepared)
        }
      })
      .catch(err => {
        if (signal.aborted) return
        // ignore if superseded
        if (localReqId !== reqIdRef.current) return
        console.error('Failed to load SVG', url, err)
        setError(`Failed to load ${svgFile}: ${err.message}`)
        setSvgContent(null)
        setIsReady(true)
      })
    return () => {
      controller.abort()
    }
  }, [svgFile])

  // Once the raw SVG is loaded we can flip the ready flag
  useEffect(() => {
    if (!svgContent) return
    setIsReady(true)
  }, [svgContent])

  return (
    <div>
      <div className="subpanel p-3" style={{width:'100%'}}>
        <div className="relative">
          {error && (
            <div className="p-3 mb-2 text-sm text-red-400 bg-red-900/20 rounded">{error}</div>
          )}

          {/* debug status */}
          {status !== null && (
            <div className="p-2 mb-2 text-xs text-gray-300">Requested: <code>{`/Tracks/${svgFile}`}</code> — status: {status}</div>
          )}

          {/* Inline SVG when available so it renders reliably. Also show a fallback placeholder while fetching. */}
          {/* Show the inlined SVG only after it's fetched to avoid flashes */}
          <div className="relative w-full max-w-[460px] mx-auto aspect-square">
            {svgContent && isReady ? (
              <div className="track-svg absolute inset-0" dangerouslySetInnerHTML={{ __html: svgContent }} />
            ) : (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                Loading track...
              </div>
            )}

            {/* overlay markers if we know the viewBox (coords should be in viewBox units) */}
            {viewBox && (
              <svg
                viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.w} ${viewBox.h}`}
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                {corners.map(corner => (
                  <g key={corner.number}>
                    <circle
                      cx={corner.x}
                      cy={corner.y}
                      r={Math.max(4, Math.min(viewBox.w, viewBox.h) * 0.01)}
                      fill={corner.type === 'slow' ? '#ef4444' : corner.type === 'medium' ? '#f59e0b' : '#10b981'}
                      opacity={0.85}
                    />
                    <text
                      x={corner.x}
                      y={corner.y - (viewBox.h * 0.02)}
                      fontSize={Math.max(10, Math.round(viewBox.h * 0.03))}
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      {corner.number}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>

        </div>
      </div>

      <div className="mt-2 flex gap-2 justify-center text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-75" />
          Slow
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-75" />
          Medium
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-75" />
          Fast
        </div>
      </div>
    </div>
  )
}
