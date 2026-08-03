'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import LoadingIndicator from './LoadingIndicator'

const Track3DPanel = dynamic(() => import('./Track3DPanel'), {
  ssr: false,
  loading: () => <LoadingIndicator label="Loading 3D..." className="py-8" />,
})

type LazyTrack3DProps = {
  svgFile: string
  className?: string
  autoRotate?: boolean
  autoRotateSpeed?: number
  showCorners?: boolean
  variant?: 'brand' | 'neon'
  rootMargin?: string
}

/**
 * Mounts WebGL track only while near the viewport so the circuits grid
 * does not open dozens of GPU contexts at once.
 */
export default function LazyTrack3D({
  svgFile,
  className = '',
  autoRotate = true,
  autoRotateSpeed = 0.55,
  showCorners = false,
  variant = 'neon',
  rootMargin = '160px 0px',
}: LazyTrack3DProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = hostRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setActive(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => setActive(Boolean(entry?.isIntersecting)),
      { rootMargin, threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, svgFile])

  return (
    <div ref={hostRef} className={`lazy-track-3d ${className}`.trim()}>
      {active ? (
        <Track3DPanel
          svgFile={svgFile}
          compact
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          showCorners={showCorners}
          interactive={false}
          variant={variant}
          className="lazy-track-3d-panel"
        />
      ) : (
        <div className="lazy-track-3d-placeholder" aria-hidden="true" />
      )}
    </div>
  )
}
