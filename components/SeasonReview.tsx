'use client'

import React from 'react'
import SeasonReviewPanel from './analyses/SeasonReviewPanel'

type SeasonReviewProps = {
  year: number
  selectedDrivers?: string[]
}

/**
 * Season Review view
 * Rendered as its own top-level mode (not stacked under race analysis)
 */
export default function SeasonReview({ year, selectedDrivers = [] }: SeasonReviewProps) {
  if (year <= 0) return null

  return (
    <section id="season-review" className="mt-6 page-section page-section-3">
      <div className="panel p-4">
        <div className="mb-3 border-b border-gray-700/60 pb-3">
          <h2 className="text-xl font-bold text-gray-100">
            Season Review {year}
          </h2>
        </div>
        <SeasonReviewPanel year={year} selectedDrivers={selectedDrivers} />
      </div>
    </section>
  )
}
