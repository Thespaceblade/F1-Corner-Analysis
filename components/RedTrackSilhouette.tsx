'use client'

import { useEffect, useState } from 'react'
import { loadTrackSvg } from '../lib/trackSvgLoader'
import { parseLapGeometry } from '../lib/trackLapGeometry'

type RedTrackSilhouetteProps = {
  svgFile: string
  className?: string
  /** `solid` = filled mask of the full SVG. `thin` = centerline stroke only. */
  weight?: 'solid' | 'thin'
}

/** Brand-red track outline — solid mask or thin centerline stroke. */
export default function RedTrackSilhouette({
  svgFile,
  className = '',
  weight = 'solid',
}: RedTrackSilhouetteProps) {
  const url = `/Tracks/${svgFile}`
  const [thin, setThin] = useState<{ viewBox: string; lapD: string } | null>(null)

  useEffect(() => {
    if (weight !== 'thin') return
    let active = true
    loadTrackSvg(svgFile)
      .then((raw) => {
        if (!active) return
        const geo = parseLapGeometry(raw)
        if (geo.lapD) setThin({ viewBox: geo.viewBox, lapD: geo.lapD })
      })
      .catch(() => {
        /* decorative */
      })
    return () => {
      active = false
    }
  }, [svgFile, weight])

  if (weight === 'thin') {
    return (
      <div className={`track-red-sil is-thin ${className}`.trim()} aria-hidden="true">
        {thin ? (
          <svg viewBox={thin.viewBox} preserveAspectRatio="xMidYMid meet">
            <path className="track-red-sil-stroke" d={thin.lapD} />
          </svg>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`track-red-sil ${className}`.trim()}
      style={{
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
      }}
      aria-hidden="true"
    />
  )
}
