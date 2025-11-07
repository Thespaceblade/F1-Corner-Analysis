'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Globe to avoid SSR issues
// Updated to fix build error - removed invalid pointLabelSize prop
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-900/40 rounded-lg">
      <div className="text-gray-400 text-sm">Loading globe...</div>
    </div>
  )
})


type Track = {
  id: string
  name: string
  coordinates?: {
    latitude: number
    longitude: number
    city?: string
    country?: string
  }
  date?: string
}

type GlobeTrackSelectorProps = {
  tracks: Track[]
  selectedTrack: string
  onTrackChange: (trackId: string) => void
  selectedYear: number
  onYearChange: (year: number) => void
  years: number[]
}

export default function GlobeTrackSelector({
  tracks,
  selectedTrack,
  onTrackChange,
  selectedYear,
  onYearChange,
  years,
}: GlobeTrackSelectorProps) {
  const globeRef = useRef<any>(null)
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const idleRotationRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Filter tracks that have coordinates and prepare for globe
  const tracksWithCoords = useMemo(() => {
    return tracks.filter(track => track.coordinates).map(track => ({
      ...track,
      lat: track.coordinates!.latitude,
      lng: track.coordinates!.longitude,
      size: selectedTrack === track.id ? 0.15 : hoveredTrack === track.id ? 0.12 : 0.08,
      color: selectedTrack === track.id 
        ? '#3b82f6' // accent blue for selected
        : hoveredTrack === track.id 
        ? '#60a5fa' // lighter blue for hover
        : '#94a3b8', // gray for default
      // Preserve original track data for labels
      name: track.name,
      date: track.date,
      coordinates: track.coordinates,
    }))
  }, [tracks, selectedTrack, hoveredTrack])

  // Smooth camera transition to selected track
  useEffect(() => {
    if (!globeRef.current || !selectedTrack) return

    const track = tracksWithCoords.find(t => t.id === selectedTrack)
    if (!track) return

    const globe = globeRef.current
    const pointOfView = globe.pointOfView()
    
    // Calculate target camera position
    const targetLat = track.lat
    const targetLng = track.lng
    const targetAltitude = 2.2 // Zoom level for track focus

    // Smooth transition using easing
    const duration = 1500 // ms - longer for smoother feel
    const startTime = Date.now()
    const startLat = pointOfView.lat || 0
    const startLng = pointOfView.lng || 0
    const startAlt = pointOfView.altitude || 3

    // Ease-in-out cubic for smooth acceleration and deceleration
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(progress)

      const currentLat = startLat + (targetLat - startLat) * eased
      const currentLng = startLng + (targetLng - startLng) * eased
      const currentAlt = startAlt + (targetAltitude - startAlt) * eased

      globe.pointOfView({ lat: currentLat, lng: currentLng, altitude: currentAlt }, 0)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animationFrameRef.current = null
      }
    }

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [selectedTrack, tracksWithCoords])

  // Idle rotation animation - smooth continuous rotation when not interacting
  useEffect(() => {
    if (isInteracting) {
      // Stop rotation when interacting
      if (idleRotationRef.current) {
        cancelAnimationFrame(idleRotationRef.current)
        idleRotationRef.current = null
      }
      return
    }

    // Resume rotation after 4 seconds of inactivity for smoother UX
    const timeout = setTimeout(() => {
      if (!globeRef.current) return

      const rotationSpeed = 0.08 // degrees per frame (very slow, smooth rotation)

      const rotate = () => {
        if (!globeRef.current || isInteracting) {
          if (idleRotationRef.current) {
            cancelAnimationFrame(idleRotationRef.current)
            idleRotationRef.current = null
          }
          return
        }

        const globe = globeRef.current
        const pov = globe.pointOfView()
        const currentLng = pov.lng || 0

        globe.pointOfView(
          { 
            lat: pov.lat || 0, 
            lng: currentLng + rotationSpeed, 
            altitude: pov.altitude || 3 
          },
          0
        )

        idleRotationRef.current = requestAnimationFrame(rotate)
      }

      idleRotationRef.current = requestAnimationFrame(rotate)
    }, 4000)

    return () => {
      clearTimeout(timeout)
      if (idleRotationRef.current) {
        cancelAnimationFrame(idleRotationRef.current)
        idleRotationRef.current = null
      }
    }
  }, [isInteracting])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleRotationRef.current) {
        cancelAnimationFrame(idleRotationRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [])

  const handleMarkerClick = useCallback((marker: any) => {
    const track = tracksWithCoords.find(t => t.lat === marker.lat && t.lng === marker.lng)
    if (track) {
      onTrackChange(track.id)
      setIsInteracting(true)
      // Keep interaction state longer after click to allow animation to complete
      setTimeout(() => setIsInteracting(false), 3500)
    }
  }, [tracksWithCoords, onTrackChange])

  const handleMarkerHover = useCallback((marker: any, prevMarker: any) => {
    const track = tracksWithCoords.find(t => t.lat === marker?.lat && t.lng === marker?.lng)
    setHoveredTrack(track?.id || null)
  }, [tracksWithCoords])

  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleGlobeInteraction = useCallback(() => {
    setIsInteracting(true)
    // Clear existing timeout
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current)
    }
    // Reset interaction timeout
    interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 4000)
  }, [])

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Selected track info (optional, can be removed if not needed) */}
      {selectedTrack && (
        <div className="text-sm text-gray-300 font-medium text-center">
          {tracks.find(t => t.id === selectedTrack)?.name}
        </div>
      )}

      {/* Globe container with fixed aspect ratio - properly centered */}
      <div 
        className="relative w-full bg-gray-900/40 rounded-lg overflow-hidden"
        style={{ 
          aspectRatio: '16/9',
          minHeight: '400px',
          maxHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseMove={handleGlobeInteraction}
        onTouchStart={handleGlobeInteraction}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            pointsData={tracksWithCoords}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointRadius="size"
            pointResolution={16}
            pointLabel={(d: any) => {
              const track = tracksWithCoords.find(t => t.lat === d.lat && t.lng === d.lng)
              if (!track) return ''
              
              let label = track.name
              if (track.coordinates?.city && track.coordinates?.country) {
                label += `\n${track.coordinates.city}, ${track.coordinates.country}`
              } else if (track.coordinates?.city) {
                label += `\n${track.coordinates.city}`
              } else if (track.coordinates?.country) {
                label += `\n${track.coordinates.country}`
              }
              if (track.date) {
                label += `\n${track.date}`
              }
              return label
            }}
            onPointClick={handleMarkerClick}
            onPointHover={handleMarkerHover}
            pointAltitude={0}
            animateIn={true}
            enablePointerInteraction={true}
            showAtmosphere={true}
            atmosphereColor="#3b82f6"
            atmosphereAltitude={0.12}
            transitionDuration={300}
          />
        </div>
      </div>
    </div>
  )
}

