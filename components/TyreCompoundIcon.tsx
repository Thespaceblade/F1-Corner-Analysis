'use client'

import React from 'react'

type TyreCompoundIconProps = {
  compound: string | null | undefined
  size?: number
}

const COMPOUND_CONFIG: Record<string, { color: string; letter: string }> = {
  SOFT: { color: '#dc2626', letter: 'S' },
  MEDIUM: { color: '#eab308', letter: 'M' },
  HARD: { color: '#d1d5db', letter: 'H' },
  INTERMEDIATE: { color: '#059669', letter: 'I' },
  WET: { color: '#2563eb', letter: 'W' },
}

export default function TyreCompoundIcon({ compound, size = 18 }: TyreCompoundIconProps) {
  if (!compound) {
    return null
  }

  const normalized = compound.toUpperCase()
  const config = COMPOUND_CONFIG[normalized] || { color: '#6b7280', letter: '?' }

  return (
    <div
      className="inline-flex items-center justify-center rounded-full border-2 border-black font-bold text-black"
      style={{
        width: size,
        height: size,
        backgroundColor: config.color,
        fontSize: size * 0.6,
        lineHeight: 1,
      }}
      title={compound}
    >
      {config.letter}
    </div>
  )
}

