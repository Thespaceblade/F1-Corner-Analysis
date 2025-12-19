'use client'

import React, { useState } from 'react'
import { SessionPayload } from '../lib/sessionDataClient'
import { CornerPerformance } from '../lib/cornerPerformanceAggregator'
import { 
  ClipboardList, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart3, 
  Flag, 
  Zap, 
  Car, 
  Activity, 
  Upload 
} from 'lucide-react'
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
  shortLabel: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    description: 'Quick insights and key session metrics',
    icon: ClipboardList,
  },
  {
    id: 'corner-performance',
    label: 'Corner Performance',
    shortLabel: 'Corners',
    description: 'Corner performance table and delta comparison',
    icon: TrendingUp,
  },
  {
    id: 'corner-entry-exit',
    label: 'Corner Entry/Exit',
    shortLabel: 'Entry/Exit',
    description: 'Analyze corner entry speeds, exit speeds, and braking points',
    icon: ArrowUpRight,
  },
  {
    id: 'stint',
    label: 'Stint Analysis',
    shortLabel: 'Stints',
    description: 'Analyze performance across stints and tyre life',
    icon: BarChart3,
  },
  {
    id: 'corner-difficulty',
    label: 'Corner Difficulty',
    shortLabel: 'Difficulty',
    description: 'Rank corners by difficulty and importance',
    icon: Flag,
  },
  {
    id: 'sector-times',
    label: 'Sector Times',
    shortLabel: 'Sectors',
    description: 'Sector-by-sector analysis and comparison',
    icon: Zap,
  },
  {
    id: 'tyre-compounds',
    label: 'Tyre Compounds',
    shortLabel: 'Tyres',
    description: 'Performance analysis by tyre compound',
    icon: Car,
  },
  {
    id: 'consistency',
    label: 'Consistency',
    shortLabel: 'Consistency',
    description: 'Lap time consistency and distribution analysis',
    icon: Activity,
  },
  {
    id: 'export',
    label: 'Export & Share',
    shortLabel: 'Export',
    description: 'Export data and charts, generate shareable links',
    icon: Upload,
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
      <div className="mb-4 border-b border-gray-700/60">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide sm:overflow-x-visible sm:justify-stretch">
          {analysisTabs.map((tab) => {
            const isSelected = selectedAnalysis === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedAnalysis(tab.id)}
                className={`group relative px-1.5 sm:px-3 py-2 text-[10px] sm:text-xs font-medium rounded-t-lg whitespace-nowrap flex items-center justify-center gap-0.5 sm:gap-1.5 flex-shrink-0 sm:flex-1 transition-all duration-200 ease-out ${
                  isSelected
                    ? 'bg-accent/15 text-accent border-b-2 border-accent shadow-[0_-2px_8px_rgba(124,199,255,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border-b-2 border-transparent'
                }`}
              >
                <tab.icon className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-all duration-200 ${isSelected ? 'scale-110 text-accent' : 'group-hover:scale-105 text-gray-400 group-hover:text-gray-200'}`} />
                <span className="hidden sm:inline text-[10px] sm:text-xs leading-tight font-medium">
                  {tab.shortLabel}
                </span>
                {/* Enhanced tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out whitespace-nowrap z-50 border border-gray-700/50 translate-y-1 group-hover:translate-y-0">
                  <div className="font-semibold mb-1 text-accent">{tab.label}</div>
                  <div className="text-gray-400 text-[10px] leading-relaxed">{tab.description}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900/95"></div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Analysis Content */}
      <div className="mt-4 relative min-h-[200px]">
        <div 
          key={selectedAnalysis}
          className="animate-in fade-in duration-200"
        >
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
    </div>
  )
}

