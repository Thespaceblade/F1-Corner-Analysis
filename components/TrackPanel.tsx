'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { loadTrackSvg } from '../lib/trackSvgLoader'
import { CornerPerformance } from '../lib/cornerPerformanceAggregator'
import CornerPerformanceOverlay, { CornerTooltipPortal } from './CornerPerformanceOverlay'

type Corner = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

type TrackPanelProps = {
  svgFile: string
  corners: Corner[]
  cornerPerformance?: Record<number, CornerPerformance>
  selectedDrivers?: string[]
  onCornerHover?: (cornerNumber: number | null) => void
  onCornerClick?: (cornerNumber: number) => void
}

export default function TrackPanel({
  svgFile,
  corners,
  cornerPerformance,
  selectedDrivers = [],
  onCornerHover,
  onCornerClick,
}: TrackPanelProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [viewBox, setViewBox] = useState<{minX:number,minY:number,w:number,h:number} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [hoveredCorner, setHoveredCorner] = useState<number | null>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const reqIdRef = React.useRef(0)

  useEffect(() => {
    if(!svgFile) return
    // clear previous content immediately to avoid flashing the wrong track
    setSvgContent(null)
    setViewBox(null)
    setError(null)
    setIsReady(false)

    const localReqId = reqIdRef.current + 1
    reqIdRef.current = localReqId

    loadTrackSvg(svgFile)
      .then(text => {
        // ignore if this is not the latest request
        if (localReqId !== reqIdRef.current) return

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
          // Prepare SVG: adjust dimensions and disable pointer events so overlay can receive them
          const prepared = text
            .replace(/<svg([\s\S]*?)>/i, (_match, attrs) => {
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

              // Add pointer-events: none to SVG root so overlay markers can receive events
              if (/style=/i.test(adjusted)) {
                // Append pointer-events: none to existing style
                adjusted = adjusted.replace(/style\s*=\s*["']([^"']*)["']/i, (match, styles) => {
                  const cleanStyles = styles.replace(/pointer-events\s*:\s*[^;]+;?/gi, '').trim()
                  return `style="${cleanStyles}${cleanStyles && !cleanStyles.endsWith(';') ? '; ' : ''}pointer-events: none;"`
                })
              } else {
                adjusted += ' style="pointer-events: none;"'
              }

              return `<svg${adjusted}>`
            })
            // Remove pointer-events from all child elements to ensure events pass through
            .replace(/\s+pointer-events\s*=\s*["'][^"']*["']/gi, '')
            .replace(/style\s*=\s*["']([^"']*)pointer-events\s*:\s*[^;]+;?\s*([^"']*)["']/gi, (match, before, after) => {
              const cleaned = (before + after).trim().replace(/;\s*;/g, ';')
              return `style="${cleaned}"`
            })
          setSvgContent(prepared)
        }
      })
      .catch(err => {
        // ignore if superseded
        if (localReqId !== reqIdRef.current) return
        console.error('Failed to load SVG', svgFile, err)
        setError(`Failed to load ${svgFile}: ${err.message}`)
        setSvgContent(null)
        setIsReady(true)
      })
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

          {svgContent && (
            <div className="p-2 mb-2 text-xs text-gray-300">Loaded track: <code>{svgFile}</code></div>
          )}

          {/* Inline SVG when available so it renders reliably. Also show a fallback placeholder while fetching. */}
          {/* Show the inlined SVG only after it's fetched to avoid flashes */}
          <div ref={svgContainerRef} className="relative w-full max-w-[460px] mx-auto aspect-square">
            {svgContent && isReady ? (
              <div 
                className="track-svg absolute inset-0" 
                style={{ pointerEvents: 'none' }}
                dangerouslySetInnerHTML={{ __html: svgContent }} 
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                Loading track...
              </div>
            )}

            {/* overlay markers if we know the viewBox (coords should be in viewBox units) */}
            {viewBox && corners.length > 0 && (
              <svg
                viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.w} ${viewBox.h}`}
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                {/* Always render CornerPerformanceOverlay - it handles rendering all corners */}
                <CornerPerformanceOverlay
                  corners={corners}
                  cornerPerformance={cornerPerformance}
                  viewBox={viewBox}
                  selectedDrivers={selectedDrivers}
                  onCornerHover={(cornerNumber) => {
                    setHoveredCorner(cornerNumber)
                    if (onCornerHover) {
                      onCornerHover(cornerNumber)
                    }
                  }}
                  onCornerClick={onCornerClick}
                  svgContainerRef={svgContainerRef}
                />
              </svg>
            )}
          </div>
          
          {/* Render tooltip portal outside SVG to avoid z-index issues */}
          {typeof window !== 'undefined' && cornerPerformance && viewBox && createPortal(
            <CornerTooltipPortal
              hoveredCorner={hoveredCorner}
              corners={corners}
              cornerPerformance={cornerPerformance}
              viewBox={viewBox}
              selectedDrivers={selectedDrivers}
              svgContainerRef={svgContainerRef}
            />,
            document.body
          )}

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
      
      {/* Corner coordinates info */}
      {corners.length > 0 && (
        <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
          <p className="font-semibold mb-1">Corner Coordinates:</p>
          <p className="text-xs">
            To update corner positions, edit <code className="text-gray-300">public/data/tracks.json</code>
          </p>
          <div className="mt-2 max-h-32 overflow-y-auto">
            {corners.map(corner => (
              <div key={corner.number} className="text-xs font-mono">
                Corner {corner.number}: ({corner.x}, {corner.y})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
