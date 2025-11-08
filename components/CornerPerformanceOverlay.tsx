'use client'

import React, { useState, useCallback, useRef } from 'react'
import { CornerPerformance } from '../lib/cornerPerformanceAggregator'
import CornerTooltip from './CornerTooltip'

type Corner = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

type CornerPerformanceOverlayProps = {
  corners: Corner[]
  cornerPerformance?: Record<number, CornerPerformance>
  viewBox: { minX: number; minY: number; w: number; h: number }
  selectedDrivers?: string[]
  onCornerHover?: (cornerNumber: number | null) => void
  onCornerClick?: (cornerNumber: number) => void
  svgContainerRef?: React.RefObject<HTMLDivElement>
}

export default function CornerPerformanceOverlay({
  corners,
  cornerPerformance,
  viewBox,
  selectedDrivers = [],
  onCornerHover,
  onCornerClick,
  svgContainerRef,
}: CornerPerformanceOverlayProps) {
  const [hoveredCorner, setHoveredCorner] = useState<number | null>(null)
  
  // Calculate marker size based on viewBox
  const markerRadius = Math.max(10, Math.min(viewBox.w, viewBox.h) * 0.018)
  const fontSize = Math.max(13, Math.round(viewBox.h * 0.028))
  
  // Color functions
  const getCornerTypeColor = (type: string) => {
    switch (type) {
      case 'slow':
        return '#ef4444'
      case 'medium':
        return '#f59e0b'
      case 'fast':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }
  
  const getPerformanceColor = (performance: CornerPerformance | undefined, cornerType: string) => {
    // If no performance data, use corner type color
    if (!performance || !performance.driverPerformance || selectedDrivers.length === 0) {
      return getCornerTypeColor(cornerType)
    }
    
    // Get all driver times
    const driversWithTimes = selectedDrivers
      .map(driver => ({
        driver,
        time: performance.driverPerformance?.[driver]?.avgTime,
      }))
      .filter((item): item is { driver: string; time: number } => 
        item.time !== null && item.time !== undefined
      )
    
    if (driversWithTimes.length === 0) return getCornerTypeColor(cornerType)
    
    // Sort by time
    driversWithTimes.sort((a, b) => a.time - b.time)
    const fastestTime = driversWithTimes[0].time
    
    // Calculate average delta from fastest
    const avgDelta = driversWithTimes.reduce((sum, item) => sum + (item.time - fastestTime), 0) / driversWithTimes.length
    
    // Color based on how close drivers are to fastest (lighter colors = closer competition)
    // We use a more subtle color scheme since we're showing individual driver data in tooltip
    if (avgDelta < 0.03) return '#22c55e' // Very close competition
    if (avgDelta < 0.08) return '#4ade80' // Close competition
    if (avgDelta < 0.15) return '#fbbf24' // Moderate spread
    return '#f97316' // Larger spread
  }
  
  const handleCornerHover = useCallback((cornerNumber: number | null) => {
    setHoveredCorner(cornerNumber)
    if (onCornerHover) {
      onCornerHover(cornerNumber)
    }
  }, [onCornerHover])
  
  const handleCornerClick = useCallback((cornerNumber: number) => {
    if (onCornerClick) {
      onCornerClick(cornerNumber)
    }
  }, [onCornerClick])

  // Prevent hover flickering with ref-based timeout
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  const handleMouseEnter = useCallback((cornerNumber: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    handleCornerHover(cornerNumber)
  }, [handleCornerHover])
  
  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      handleCornerHover(null)
      hoverTimeoutRef.current = null
    }, 150) // Small delay to prevent flickering when moving between elements
  }, [handleCornerHover])
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      {corners.map(corner => {
        const perf = cornerPerformance?.[corner.number]
        const isHovered = hoveredCorner === corner.number
        const hasPerformance = perf !== undefined && perf.driverPerformance && selectedDrivers.length > 0
        
        // Performance-based border color (subtle indicator, detailed data in tooltip)
        const borderColor = hasPerformance
          ? getPerformanceColor(perf, corner.type)
          : getCornerTypeColor(corner.type)
        
        // Background color based on type
        const backgroundColor = getCornerTypeColor(corner.type)
        
        return (
          <g key={corner.number}>
            {/* Outer ring for performance indicator */}
            {hasPerformance && (
              <circle
                cx={corner.x}
                cy={corner.y}
                r={markerRadius + 4}
                fill="none"
                stroke={borderColor}
                strokeWidth={isHovered ? 3.5 : 2.5}
                opacity={isHovered ? 1.0 : 0.7}
                style={{ 
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.15s ease-out',
                }}
                onMouseEnter={() => handleMouseEnter(corner.number)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleCornerClick(corner.number)}
              />
            )}
            
            {/* Main corner marker */}
            <circle
              cx={corner.x}
              cy={corner.y}
              r={markerRadius}
              fill={backgroundColor}
              opacity={isHovered ? 1.0 : 0.9}
              stroke="#ffffff"
              strokeWidth={isHovered ? 2.5 : 2}
              style={{ 
                cursor: 'pointer',
                pointerEvents: 'auto',
                transition: 'all 0.15s ease-out',
              }}
              onMouseEnter={() => handleMouseEnter(corner.number)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleCornerClick(corner.number)}
            />
            
            {/* Corner number */}
            <text
              x={corner.x}
              y={corner.y + fontSize * 0.38}
              fontSize={fontSize}
              fill="#ffffff"
              textAnchor="middle"
              fontWeight="bold"
              style={{ 
                pointerEvents: 'none',
                userSelect: 'none',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
              }}
            >
              {corner.number}
            </text>
          </g>
        )
      })}
      
    </>
  )
}

// Separate component to render tooltip outside SVG using portal
export function CornerTooltipPortal({
  hoveredCorner,
  corners,
  cornerPerformance,
  viewBox,
  selectedDrivers,
  svgContainerRef,
}: {
  hoveredCorner: number | null
  corners: Corner[]
  cornerPerformance?: Record<number, CornerPerformance>
  viewBox: { minX: number; minY: number; w: number; h: number }
  selectedDrivers: string[]
  svgContainerRef?: React.RefObject<HTMLDivElement>
}) {
  if (hoveredCorner === null || !cornerPerformance?.[hoveredCorner] || selectedDrivers.length === 0) {
    return null
  }

  const corner = corners.find(c => c.number === hoveredCorner)
  if (!corner) return null

  return (
    <CornerTooltip
      cornerPerformance={cornerPerformance[hoveredCorner]}
      x={corner.x}
      y={corner.y}
      viewBox={viewBox}
      selectedDrivers={selectedDrivers}
      svgContainerRef={svgContainerRef}
    />
  )
}
