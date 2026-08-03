'use client'

import React from 'react'
import SeasonReviewPanel from './analyses/SeasonReviewPanel'

type SeasonReviewProps = {
  year: number
  years: number[]
  onYearChange: (year: number) => void
  selectedDrivers?: string[]
  onDriversChange?: (drivers: string[]) => void
}

/** Season stats panel body. Page chrome lives in SeasonPage / AppShell. */
export default function SeasonReview({
  year,
  years,
  onYearChange,
  selectedDrivers = [],
  onDriversChange,
}: SeasonReviewProps) {
  if (year <= 0) return null

  return (
    <section id="season-review" className="mt-2 page-section page-section-3">
      <div className="panel p-4 sm:p-5">
        <SeasonReviewPanel
          year={year}
          years={years}
          onYearChange={onYearChange}
          selectedDrivers={selectedDrivers}
          onDriversChange={onDriversChange}
        />
      </div>
    </section>
  )
}
