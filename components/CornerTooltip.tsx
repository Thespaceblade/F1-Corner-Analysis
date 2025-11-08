'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CornerPerformance } from '../lib/cornerPerformanceAggregator'

type CornerTooltipProps = {
  cornerPerformance: CornerPerformance
  x: number
  y: number
  viewBox: { minX: number; minY: number; w: number; h: number }
  selectedDrivers?: string[]
  svgContainerRef?: React.RefObject<HTMLDivElement>
}

export default function CornerTooltip({
  cornerPerformance,
  x,
  y,
  viewBox,
  selectedDrivers = [],
  svgContainerRef,
}: CornerTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, visible: false })
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Calculate which driver is fastest
  const getSortedDrivers = () => {
    if (!cornerPerformance.driverPerformance || selectedDrivers.length === 0) {
      return []
    }

    // Get all drivers with valid times
    const driversWithTimes = selectedDrivers
      .map(driver => ({
        driver,
        performance: cornerPerformance.driverPerformance?.[driver],
      }))
      .filter(item => item.performance?.avgTime !== null && item.performance?.avgTime !== undefined)
      .sort((a, b) => {
        const timeA = a.performance!.avgTime!
        const timeB = b.performance!.avgTime!
        return timeA - timeB
      })

    if (driversWithTimes.length === 0) return []

    const fastestTime = driversWithTimes[0].performance!.avgTime!

    // Add delta calculations
    return driversWithTimes.map(item => ({
      driver: item.driver,
      time: item.performance!.avgTime!,
      delta: item.performance!.avgTime! - fastestTime,
    }))
  }

  const sortedDrivers = getSortedDrivers()

  // Update tooltip position based on SVG coordinates and viewport
  useEffect(() => {
    if (!svgContainerRef?.current || sortedDrivers.length === 0) {
      setTooltipPosition({ x: 0, y: 0, visible: false })
      return
    }

    const updatePosition = () => {
      const container = svgContainerRef.current
      if (!container) return

      const svgElement = container.querySelector('svg[viewBox]') as SVGSVGElement | null
      if (!svgElement) return

      try {
        // Convert SVG coordinates to screen coordinates
        const point = svgElement.createSVGPoint()
        point.x = x
        point.y = y
        
        const ctm = svgElement.getScreenCTM()
        if (!ctm) return

        const screenPoint = point.matrixTransform(ctm)
        
        // Get tooltip dimensions for positioning
        const tooltipWidth = 160
        const tooltipHeight = 38 + (sortedDrivers.length * 20)

        // Calculate offset from corner
        const offsetX = 25
        const offsetY = -tooltipHeight - 15

        // Check if tooltip would go off screen
        let finalX = screenPoint.x + offsetX
        let finalY = screenPoint.y + offsetY

        // Adjust if tooltip goes off right edge
        if (finalX + tooltipWidth > window.innerWidth - 15) {
          finalX = screenPoint.x - tooltipWidth - offsetX
        }

        // Adjust if tooltip goes off left edge
        if (finalX < 15) {
          finalX = 15
        }

        // Adjust if tooltip goes off top edge
        if (finalY < 15) {
          finalY = screenPoint.y + 40
        }

        // Adjust if tooltip goes off bottom edge
        if (finalY + tooltipHeight > window.innerHeight - 15) {
          finalY = window.innerHeight - tooltipHeight - 15
        }

        setTooltipPosition({
          x: finalX,
          y: finalY,
          visible: true,
        })
      } catch (error) {
        console.error('Error calculating tooltip position:', error)
        setTooltipPosition({ x: 0, y: 0, visible: false })
      }
    }

    updatePosition()
    
    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [x, y, viewBox, svgContainerRef, sortedDrivers.length])

  // Corner type styling
  const typeConfig = {
    slow: { label: 'Slow', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
    medium: { label: 'Medium', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
    fast: { label: 'Fast', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    unknown: { label: 'Unknown', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
  }

  const type = typeConfig[cornerPerformance.cornerType] || typeConfig.unknown

  if (!tooltipPosition.visible || sortedDrivers.length === 0) {
    return null
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed pointer-events-none z-[10000]"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        minWidth: '140px',
        maxWidth: '160px',
      }}
    >
      <div
        className="rounded-md border shadow-xl backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: type.color,
          borderWidth: '1.5px',
          boxShadow: `0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px ${type.color}30`,
        }}
      >
        {/* Corner Type Header */}
        <div
          className="px-2.5 py-1 border-b"
          style={{
            borderBottomColor: `${type.color}40`,
            backgroundColor: type.bgColor,
          }}
        >
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: type.color }}
            />
            <span
              className="font-bold text-[11px] uppercase tracking-wide"
              style={{ color: type.color }}
            >
              {type.label}
            </span>
          </div>
        </div>

        {/* Driver Times */}
        <div className="px-2.5 py-1.5">
          {sortedDrivers.map((item, index) => {
            const isFastest = index === 0
            const deltaColor = item.delta === 0 
              ? '#22c55e' // Green for fastest
              : item.delta < 0.1 
                ? '#fbbf24' // Yellow for close
                : '#ef4444' // Red for slower

            return (
              <div
                key={item.driver}
                className="flex items-center justify-between"
                style={{
                  paddingBottom: index < sortedDrivers.length - 1 ? '4px' : '0',
                  marginBottom: index < sortedDrivers.length - 1 ? '4px' : '0',
                  borderBottom: index < sortedDrivers.length - 1 
                    ? '1px solid rgba(75, 85, 99, 0.25)' 
                    : 'none',
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-white text-[11px]">
                    {item.driver}
                  </span>
                  {isFastest && (
                    <span
                      className="text-[9px] px-1 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        fontWeight: 'bold',
                        lineHeight: '1',
                      }}
                    >
                      FASTEST
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isFastest ? (
                    <span className="font-mono font-bold text-white text-[11px]">
                      {item.time.toFixed(3)}s
                    </span>
                  ) : (
                    <>
                      <span className="font-mono text-gray-400 text-[9px]">
                        {item.time.toFixed(3)}s
                      </span>
                      <span
                        className="font-mono font-bold text-[11px]"
                        style={{ color: deltaColor }}
                      >
                        +{item.delta.toFixed(3)}s
                      </span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
