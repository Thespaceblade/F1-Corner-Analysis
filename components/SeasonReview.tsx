'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SeasonData } from '../lib/seasonTypes'
import SeasonReviewPanel from './analyses/SeasonReviewPanel'

type SeasonReviewProps = {
  year: number
  isVisible?: boolean
  selectedDrivers?: string[]
}

/**
 * Standalone Season Review component
 * This appears as a separate section on the page, not within race analysis
 */
export default function SeasonReview({ year, isVisible = true, selectedDrivers = [] }: SeasonReviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-expand when year is selected (component becomes visible)
  useEffect(() => {
    if (isVisible && year > 0) {
      setIsExpanded(true)
    }
  }, [isVisible, year])

  if (!isVisible) return null

  return (
    <section id="season-review" className="mt-4 page-section page-section-6">
      <div className="panel p-4">
        {/* Header with expand/collapse */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-100 group-hover:text-accent transition-colors">
                Season Review {year > 0 ? year : ''}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
            )}
          </div>
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="animate-in fade-in duration-200 border-t border-gray-700/60 pt-3">
            <SeasonReviewPanel year={year} selectedDrivers={selectedDrivers} />
          </div>
        )}

        {/* Collapsed Preview */}
        {!isExpanded && (
          <div className="text-sm text-gray-400 text-center py-2">
            {year > 0 
              ? 'Click to view full season statistics and championship analysis'
              : 'Select a year from the dropdown above to view season statistics'
            }
          </div>
        )}
      </div>
    </section>
  )
}
