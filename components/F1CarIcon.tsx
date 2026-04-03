import React from 'react'
import { getDriverColor } from '../lib/teamData'

type F1CarIconProps = {
  driverCode: string
  year?: number
  color?: string // Optional team color, will be looked up if not provided
  size?: number
  className?: string
}

/**
 * F1 car icon with team-colored glow
 */
export default function F1CarIcon({ driverCode, year, color, size = 16, className = '' }: F1CarIconProps) {
  // Get team color from driver code
  const teamColor = color || getDriverColor(driverCode, year) || '#888888'
  
  // Create unique filter ID based on driver code AND color to avoid conflicts
  // Use React.useId() to ensure uniqueness per component instance
  const uniqueId = React.useId().replace(/:/g, '-')
  const filterId = `car-glow-${driverCode.toUpperCase()}-${teamColor.replace('#', '').replace(/[^a-zA-Z0-9]/g, '')}-${uniqueId}`
  
  return (
    <g className={className}>
      <defs>
        {/* Team-colored glow filter */}
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          {/* Create glow from the car's alpha channel */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          {/* Color the glow with team color */}
          <feFlood floodColor={teamColor} result="glowColor"/>
          <feComposite in="glowColor" in2="blur" operator="in" result="coloredGlow"/>
          {/* Merge glow and original image */}
          <feMerge>
            <feMergeNode in="coloredGlow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Drop shadow */}
      <g transform="translate(0, 1.5) rotate(180)" opacity="0.3">
        <image
          href="/logos/f1 car.png"
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          opacity="0.5"
        />
      </g>
      
      {/* Car image with team-colored glow - flipped 180° (nose down) */}
      <g transform="rotate(180)">
        <image
          href="/logos/f1 car.png"
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          filter={`url(#${filterId})`}
        />
      </g>
    </g>
  )
}
