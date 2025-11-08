'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
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
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false)
  const [cursorCoords, setCursorCoords] = useState<{x: number, y: number} | null>(null)
  const [screenCoords, setScreenCoords] = useState<{x: number, y: number} | null>(null)
  const [hoveredCorner, setHoveredCorner] = useState<number | null>(null)
  const svgContainerRef = React.useRef<HTMLDivElement>(null)
  const reqIdRef = React.useRef(0)
  
  // Use refs to avoid stale closures in event handlers
  const showCoordinatesRef = useRef(false)
  const viewBoxRef = useRef<{minX:number,minY:number,w:number,h:number} | null>(null)
  const svgContainerRefRef = useRef<HTMLDivElement | null>(null)
  const cursorCoordsRef = useRef<{x: number, y: number} | null>(null)
  const mouseMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null)
  const clickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null)

  // Keep refs in sync with state
  useEffect(() => {
    showCoordinatesRef.current = showCoordinates
  }, [showCoordinates])

  useEffect(() => {
    viewBoxRef.current = viewBox
  }, [viewBox])

  useEffect(() => {
    svgContainerRefRef.current = svgContainerRef.current
  }, [svgContent])

  useEffect(() => {
    cursorCoordsRef.current = cursorCoords
  }, [cursorCoords])

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

  // Calculate SVG coordinates from screen coordinates
  const calculateSVGCoords = useCallback((clientX: number, clientY: number) => {
    const viewBox = viewBoxRef.current
    const container = svgContainerRefRef.current
    
    if (!viewBox || !container) {
      return null
    }

    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    // Get SVG element
    const svgElement = container.querySelector('svg[viewBox]') as SVGSVGElement | null
    if (!svgElement) {
      // Fallback: calculate relative to viewBox based on container size
      const relativeX = (x / rect.width) * viewBox.w + viewBox.minX
      const relativeY = (y / rect.height) * viewBox.h + viewBox.minY
      return {
        x: Math.round(relativeX * 10) / 10,
        y: Math.round(relativeY * 10) / 10,
      }
    }

    try {
      const svgRect = svgElement.getBoundingClientRect()
      const svgX = clientX - svgRect.left
      const svgY = clientY - svgRect.top
      
      let svgCoordX: number
      let svgCoordY: number
      
      if (svgRect.width > 0 && svgRect.height > 0) {
        const normalizedX = svgX / svgRect.width
        const normalizedY = svgY / svgRect.height
        svgCoordX = viewBox.minX + normalizedX * viewBox.w
        svgCoordY = viewBox.minY + normalizedY * viewBox.h
      } else {
        const normalizedX = x / rect.width
        const normalizedY = y / rect.height
        svgCoordX = viewBox.minX + normalizedX * viewBox.w
        svgCoordY = viewBox.minY + normalizedY * viewBox.h
      }
      
      return {
        x: Math.round(svgCoordX * 10) / 10,
        y: Math.round(svgCoordY * 10) / 10,
      }
    } catch (error) {
      // Fallback
      const relativeX = (x / rect.width) * viewBox.w + viewBox.minX
      const relativeY = (y / rect.height) * viewBox.h + viewBox.minY
      return {
        x: Math.round(relativeX * 10) / 10,
        y: Math.round(relativeY * 10) / 10,
      }
    }
  }, [])

  // Set up global mouse tracking and cursor hiding when coordinate mode is enabled
  useEffect(() => {
    if (!showCoordinates) {
      // Reset when disabled
      setCursorCoords(null)
      setScreenCoords(null)
      // Force cursor to show using style tag to override any CSS
      const style = document.createElement('style')
      style.id = 'coordinate-tracker-cursor-reset'
      style.textContent = 'body, body * { cursor: auto !important; }'
      document.head.appendChild(style)
      setTimeout(() => {
        const existingStyle = document.getElementById('coordinate-tracker-cursor-reset')
        if (existingStyle) {
          document.head.removeChild(existingStyle)
        }
        document.body.style.cursor = ''
        // Remove cursor style from all elements
        const allElements = document.querySelectorAll('*')
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement
          if (htmlEl.style.cursor === 'none') {
            htmlEl.style.cursor = ''
          }
        })
      }, 0)
      return
    }

    // Force hide cursor using style tag with !important to override any CSS
    const hideCursorStyle = document.createElement('style')
    hideCursorStyle.id = 'coordinate-tracker-cursor-hide'
    hideCursorStyle.textContent = 'body, body * { cursor: none !important; }'
    document.head.appendChild(hideCursorStyle)

    // Initialize screenCoords immediately with current mouse position or center
    const initCoords = {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
    }
    setScreenCoords(initCoords)

    // Global mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!showCoordinatesRef.current) return
      
      // Always update screen coordinates
      setScreenCoords({ x: e.clientX, y: e.clientY })
      
      // Calculate SVG coordinates if we have viewBox and container
      const svgCoords = calculateSVGCoords(e.clientX, e.clientY)
      if (svgCoords) {
        setCursorCoords(svgCoords)
      }
    }

    // Global click handler
    const handleClick = (e: MouseEvent) => {
      if (!showCoordinatesRef.current) return
      
      const coords = cursorCoordsRef.current
      if (!coords) return
      
      const container = svgContainerRefRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const padding = 50
      const isNearContainer = 
        e.clientX >= rect.left - padding &&
        e.clientX <= rect.right + padding &&
        e.clientY >= rect.top - padding &&
        e.clientY <= rect.bottom + padding
      
      if (!isNearContainer) return
      
      e.preventDefault()
      e.stopPropagation()
      
      const text = `${coords.x}, ${coords.y}`
      navigator.clipboard.writeText(text).then(() => {
        const display = document.getElementById('coords-display')
        if (display) {
          const originalHTML = display.innerHTML
          display.innerHTML = `<span class="text-green-400 font-bold text-base">✓ Copied: ${text}</span>`
          setTimeout(() => {
            display.innerHTML = originalHTML
          }, 2000)
        }
      }).catch(() => {
        console.log(`Coordinates: ${text}`)
        alert(`Coordinates: ${text}`)
      })
    }

    // Store handlers in refs for cleanup
    mouseMoveHandlerRef.current = handleMouseMove
    clickHandlerRef.current = handleClick

    // Add event listeners with capture phase to ensure we get events first
    document.addEventListener('mousemove', handleMouseMove, { passive: true, capture: true })
    document.addEventListener('click', handleClick, { capture: true })

    // Cleanup function
    return () => {
      // Remove cursor hiding style
      const style = document.getElementById('coordinate-tracker-cursor-hide')
      if (style && style.parentNode) {
        document.head.removeChild(style)
      }
      
      // Remove event listeners
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener('mousemove', mouseMoveHandlerRef.current, { capture: true } as EventListenerOptions)
      }
      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current, { capture: true } as EventListenerOptions)
      }
      
      // Clear refs
      mouseMoveHandlerRef.current = null
      clickHandlerRef.current = null
      
      // Reset state
      setCursorCoords(null)
      setScreenCoords(null)
      
      // Force cursor to show
      document.body.style.cursor = ''
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement
        if (htmlEl.style.cursor === 'none') {
          htmlEl.style.cursor = ''
        }
      })
    }
  }, [showCoordinates, calculateSVGCoords])

  // Handle container mouse move (optional optimization)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // This is handled by the global listener, but we can use it for optimization
    if (!showCoordinates) return
  }, [showCoordinates])

  const handleMouseLeave = useCallback(() => {
    // Coordinates continue to update via global handler
  }, [])

  // Handle container click
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // This is handled by the global listener
    if (!showCoordinates) return
  }, [showCoordinates])

  // Ensure screenCoords is always set when coordinate mode is enabled
  const displayScreenCoords = screenCoords || (showCoordinates && typeof window !== 'undefined' ? {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  } : null)

  return (
    <>
      {/* Global crosshair overlay - rendered in screen coordinates so it works everywhere */}
      {showCoordinates && displayScreenCoords && (
        <div
          id="coordinate-tracker-overlay"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2147483647, // Maximum z-index
            pointerEvents: 'none',
            isolation: 'isolate',
          }}
        >
          {/* Horizontal line across entire screen */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: `${displayScreenCoords.y}px`,
              width: '100vw',
              height: '3px',
              background: 'linear-gradient(to right, transparent, #a855f7 20%, #a855f7 80%, transparent)',
              opacity: 0.75,
              pointerEvents: 'none',
              transform: 'translateY(-50%)',
            }}
          />
          {/* Vertical line across entire screen */}
          <div
            style={{
              position: 'absolute',
              left: `${displayScreenCoords.x}px`,
              top: 0,
              width: '3px',
              height: '100vh',
              background: 'linear-gradient(to bottom, transparent, #a855f7 20%, #a855f7 80%, transparent)',
              opacity: 0.75,
              pointerEvents: 'none',
              transform: 'translateX(-50%)',
            }}
          />
          {/* Center point */}
          <div
            style={{
              position: 'absolute',
              left: `${displayScreenCoords.x}px`,
              top: `${displayScreenCoords.y}px`,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#1f2937',
              border: '3px solid #a855f7',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              boxShadow: '0 0 8px rgba(168, 85, 247, 0.5)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#a855f7',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
          {/* Coordinate label */}
          {cursorCoords ? (
            <div
              style={{
                position: 'absolute',
                left: `${typeof window !== 'undefined' && displayScreenCoords.x > window.innerWidth - 150 ? displayScreenCoords.x - 150 : displayScreenCoords.x + 20}px`,
                top: `${Math.max(displayScreenCoords.y - 40, 10)}px`,
                backgroundColor: '#1f2937',
                border: '1.5px solid #a855f7',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#a855f7',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              ({cursorCoords.x.toFixed(1)}, {cursorCoords.y.toFixed(1)})
            </div>
          ) : (
            <div
              style={{
                position: 'absolute',
                left: `${displayScreenCoords.x + 20}px`,
                top: `${displayScreenCoords.y - 40}px`,
                backgroundColor: '#1f2937',
                border: '1.5px solid #a855f7',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#a855f7',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              Loading coordinates...
            </div>
          )}
        </div>
      )}
      <div>
        <div className="subpanel p-3" style={{width:'100%'}}>
          <div className="relative">
          {error && (
            <div className="p-3 mb-2 text-sm text-red-400 bg-red-900/20 rounded">{error}</div>
          )}

          <div className="flex items-center justify-between mb-2">
            {svgContent && (
              <div className="p-2 text-xs text-gray-300">Loaded track: <code>{svgFile}</code></div>
            )}
            <button
              onClick={() => {
                setShowCoordinates(!showCoordinates)
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              title="Toggle coordinate display - Click anywhere to copy coordinates"
            >
              {showCoordinates ? '📍 Exit Coords' : '📍 Show Coords'}
            </button>
          </div>

          {/* Coordinate display */}
          {showCoordinates && (
            <div className="mb-2 p-2 bg-purple-900/30 border border-purple-700 rounded text-xs">
              {cursorCoords ? (
                <div>
                  <div 
                    id="coords-display" 
                    className="text-purple-300 font-mono font-semibold text-sm"
                  >
                    X: {cursorCoords.x.toFixed(1)} | Y: {cursorCoords.y.toFixed(1)}
                  </div>
                  <div className="mt-1 text-purple-400 text-xs">
                    Click anywhere near track to copy coordinates: <span className="font-mono text-purple-300">{cursorCoords.x.toFixed(1)}, {cursorCoords.y.toFixed(1)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-purple-400 text-xs">
                  Move mouse over track to see coordinates • Click to copy to clipboard
                </div>
              )}
            </div>
          )}

          {/* Inline SVG when available so it renders reliably. Also show a fallback placeholder while fetching. */}
          {/* Show the inlined SVG only after it's fetched to avoid flashes */}
          <div 
            ref={svgContainerRef}
            className="relative w-full max-w-[460px] mx-auto aspect-square"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
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
                className="absolute inset-0 w-full h-full"
                style={{ 
                  pointerEvents: showCoordinates ? 'none' : 'auto',
                  zIndex: 10,
                }}
              >
                {cornerPerformance ? (
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
                ) : (
                  // Fallback: simple markers without performance data
                  corners.map(corner => (
                    <g key={corner.number}>
                      <circle
                        cx={corner.x}
                        cy={corner.y}
                        r={Math.max(4, Math.min(viewBox.w, viewBox.h) * 0.01)}
                        fill={corner.type === 'slow' ? '#ef4444' : corner.type === 'medium' ? '#f59e0b' : '#10b981'}
                        opacity={0.85}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      />
                      <text
                        x={corner.x}
                        y={corner.y - (viewBox.h * 0.02)}
                        fontSize={Math.max(10, Math.round(viewBox.h * 0.03))}
                        fill="#ffffff"
                        textAnchor="middle"
                        style={{ pointerEvents: 'none' }}
                      >
                        {corner.number}
                      </text>
                    </g>
                  ))
                )}
              </svg>
            )}
          </div>

        </div>
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
    </>
  )
}
