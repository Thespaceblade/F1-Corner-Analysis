'use client'

import React, { useState } from 'react'
import { SessionPayload } from '../lib/sessionDataClient'
import { CornerPerformance } from '../lib/cornerPerformanceAggregator'
import CornerEntryExitAnalysis from './analyses/CornerEntryExitAnalysis'
import StintAnalysis from './analyses/StintAnalysis'
import CornerDifficultyAnalysis from './analyses/CornerDifficultyAnalysis'
import CornerPerformanceAnalysis from './analyses/CornerPerformanceAnalysis'
import ExportAnalysis from './analyses/ExportAnalysis'
import SectorTimeAnalysis from './analyses/SectorTimeAnalysis'
import TyreCompoundAnalysis from './analyses/TyreCompoundAnalysis'
import ConsistencyAnalysis from './analyses/ConsistencyAnalysis'
import SessionOverview from './analyses/SessionOverview'

type AnalysisType =
  | 'overview'
  | 'corner-performance'
  | 'corner-entry-exit'
  | 'stint'
  | 'corner-difficulty'
  | 'sector-times'
  | 'tyre-compounds'
  | 'consistency'
  | 'export'

type AnalysisPanelProps = {
  sessionData: SessionPayload | null
  cornerPerformance: Record<number, CornerPerformance> | undefined
  selectedDrivers: string[]
  currentTrack: {
    name: string
    svgFile: string
    corners: Array<{
      number: number
      type: 'slow' | 'medium' | 'fast'
      x: number
      y: number
    }>
  } | null
  cornerFilter: {
    type: 'all' | 'qualifying-segment' | 'lap' | 'average'
    segment?: 'Q1' | 'Q2' | 'Q3'
    lapNumber?: number
  }
}

const analysisTabs: Array<{
  id: AnalysisType
  label: string
  description: string
  icon: string
}> = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Quick insights and key session metrics',
    icon: '📋',
  },
  {
    id: 'corner-performance',
    label: 'Corner Performance',
    description: 'Corner performance table and delta comparison',
    icon: '📈',
  },
  {
    id: 'corner-entry-exit',
    label: 'Corner Entry/Exit',
    description: 'Analyze corner entry speeds, exit speeds, and braking points',
    icon: '↗️',
  },
  {
    id: 'stint',
    label: 'Stint Analysis',
    description: 'Analyze performance across stints and tyre life',
    icon: '📊',
  },
  {
    id: 'corner-difficulty',
    label: 'Corner Difficulty',
    description: 'Rank corners by difficulty and importance',
    icon: '🏁',
  },
  {
    id: 'sector-times',
    label: 'Sector Times',
    description: 'Sector-by-sector analysis and comparison',
    icon: '⚡',
  },
  {
    id: 'tyre-compounds',
    label: 'Tyre Compounds',
    description: 'Performance analysis by tyre compound',
    icon: '🏎️',
  },
  {
    id: 'consistency',
    label: 'Consistency',
    description: 'Lap time consistency and distribution analysis',
    icon: '📊',
  },
  {
    id: 'export',
    label: 'Export & Share',
    description: 'Export data and charts, generate shareable links',
    icon: '📤',
  },
]

export default function AnalysisPanel({
  sessionData,
  cornerPerformance,
  selectedDrivers,
  currentTrack,
  cornerFilter,
}: AnalysisPanelProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>('overview')

  if (!sessionData || !currentTrack) {
    return (
      <div className="mt-6 panel p-6">
        <div className="text-center text-gray-400">
          Select a track and session to view analysis options.
        </div>
      </div>
    )
  }

  if (selectedDrivers.length === 0) {
    return (
      <div className="mt-6 panel p-6">
        <div className="text-center text-gray-400">
          Select at least one driver to view analysis.
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 panel p-4">
      {/* Analysis Tabs */}
      <div className="mb-4 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {analysisTabs.map((tab) => {
            const isSelected = selectedAnalysis === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedAnalysis(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  isSelected
                    ? 'bg-accent/20 text-accent border-b-2 border-accent'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
                title={tab.description}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Analysis Content */}
      <div className="mt-4">
        {selectedAnalysis === 'overview' && (
          <SessionOverview
            sessionData={sessionData}
            selectedDrivers={selectedDrivers}
          />
        )}

        {selectedAnalysis === 'corner-performance' && (
          <CornerPerformanceAnalysis
            corners={sessionData?.corners ?? {}}
            cornerInfo={currentTrack.corners}
            selectedDrivers={selectedDrivers}
            cornerFilter={cornerFilter}
            sessionData={sessionData}
          />
        )}

        {selectedAnalysis === 'corner-entry-exit' && (
          <CornerEntryExitAnalysis
            sessionData={sessionData}
            cornerPerformance={cornerPerformance}
            selectedDrivers={selectedDrivers}
            cornerInfo={currentTrack.corners}
          />
        )}

        {selectedAnalysis === 'stint' && (
          <StintAnalysis
            sessionData={sessionData}
            selectedDrivers={selectedDrivers}
          />
        )}

        {selectedAnalysis === 'corner-difficulty' && (
          <CornerDifficultyAnalysis
            sessionData={sessionData}
            cornerPerformance={cornerPerformance}
            selectedDrivers={selectedDrivers}
            cornerInfo={currentTrack.corners}
          />
        )}

        {selectedAnalysis === 'sector-times' && (
          <SectorTimeAnalysis
            sessionData={sessionData}
            selectedDrivers={selectedDrivers}
          />
        )}

        {selectedAnalysis === 'tyre-compounds' && (
          <TyreCompoundAnalysis
            sessionData={sessionData}
            selectedDrivers={selectedDrivers}
          />
        )}

        {selectedAnalysis === 'consistency' && (
          <ConsistencyAnalysis
            sessionData={sessionData}
            selectedDrivers={selectedDrivers}
          />
        )}

        {selectedAnalysis === 'export' && (
          <ExportAnalysis
            sessionData={sessionData}
            selectedDrivers={selectedDrivers}
            trackName={currentTrack.name}
          />
        )}
      </div>
    </div>
  )
}

