'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Trophy, 
  Users, 
  Building2, 
  GitCompare, 
  TrendingUp, 
  Map 
} from 'lucide-react'
import { SeasonData } from '../../lib/seasonTypes'
import SeasonOverview from './season/SeasonOverview'
import DriverStandingsTable from './season/DriverStandingsTable'
import TeamStandingsTable from './season/TeamStandingsTable'
import HeadToHeadComparison from './season/HeadToHeadComparison'
import ChampionshipProgressionChart from './season/ChampionshipProgressionChart'
import TrackByTrackAnalysis from './season/TrackByTrackAnalysis'

type SeasonTab =
  | 'overview'
  | 'drivers'
  | 'teams'
  | 'head-to-head'
  | 'progression'
  | 'tracks'

type SeasonReviewPanelProps = {
  year?: number
  initialTab?: SeasonTab
  selectedDrivers?: string[]
}

const seasonTabs: Array<{
  id: SeasonTab
  label: string
  shortLabel: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: 'overview',
    label: 'Season Overview',
    shortLabel: 'Overview',
    description: 'High-level season summary and key statistics',
    icon: Trophy,
  },
  {
    id: 'drivers',
    label: 'Driver Standings',
    shortLabel: 'Drivers',
    description: 'Comprehensive driver championship table with advanced stats',
    icon: Users,
  },
  {
    id: 'teams',
    label: 'Team Standings',
    shortLabel: 'Teams',
    description: 'Constructor championship analysis and team performance',
    icon: Building2,
  },
  {
    id: 'head-to-head',
    label: 'Head-to-Head',
    shortLabel: 'H2H',
    description: 'Compare drivers side-by-side with detailed metrics',
    icon: GitCompare,
  },
  {
    id: 'progression',
    label: 'Championship Progression',
    shortLabel: 'Progress',
    description: 'Visual championship evolution throughout the season',
    icon: TrendingUp,
  },
  {
    id: 'tracks',
    label: 'Track-by-Track',
    shortLabel: 'Tracks',
    description: 'Race-by-race performance breakdown',
    icon: Map,
  },
]

export default function SeasonReviewPanel({
  year = new Date().getFullYear(),
  initialTab = 'overview',
  selectedDrivers = [],
}: SeasonReviewPanelProps) {
  const [selectedTab, setSelectedTab] = useState<SeasonTab>(initialTab)
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Load season data
  useEffect(() => {
    async function loadSeasonData() {
      setLoading(true)
      setError(null)
      
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/seasons/${year}/summary`)
        
        if (!response.ok) {
          throw new Error(`Failed to load season data: ${response.statusText}`)
        }
        
        const data = await response.json()
        setSeasonData(data)
      } catch (err) {
        console.error('Error loading season data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load season data')
        setSeasonData(null)
      } finally {
        setLoading(false)
      }
    }

    loadSeasonData()
  }, [year])

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent rounded-lg pointer-events-none -z-10" />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-700/60">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {seasonTabs.map((tab) => {
            const isSelected = selectedTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`group relative px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium rounded-t-lg whitespace-nowrap flex items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 sm:flex-1 transition-all duration-200 ease-out ${
                  isSelected
                    ? 'bg-accent/15 text-accent border-b-2 border-accent shadow-[0_-2px_8px_rgba(124,199,255,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border-b-2 border-transparent'
                }`}
              >
                <tab.icon className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-all duration-200 ${isSelected ? 'scale-110 text-accent' : 'group-hover:scale-105 text-gray-400 group-hover:text-gray-200'}`} />
                <span className="text-[10px] sm:text-xs leading-tight font-medium">
                  {tab.shortLabel}
                </span>
                
                {/* Tooltip */}
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

      {/* Content Area */}
      <div className="mt-2 relative min-h-[400px]">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading season data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <div className="font-semibold mb-1">Error loading season data</div>
            <div className="text-red-400/80">{error}</div>
          </div>
        )}

        {!loading && !error && seasonData && (
          <div 
            key={selectedTab}
            className="animate-in fade-in duration-200"
          >
            {selectedTab === 'overview' && (
              <SeasonOverview seasonData={seasonData} />
            )}

            {selectedTab === 'drivers' && (
              <DriverStandingsTable seasonData={seasonData} />
            )}

            {selectedTab === 'teams' && (
              <TeamStandingsTable seasonData={seasonData} />
            )}

            {selectedTab === 'head-to-head' && (
              <HeadToHeadComparison seasonData={seasonData} />
            )}

            {selectedTab === 'progression' && (
              <ChampionshipProgressionChart 
                seasonData={seasonData} 
                selectedDrivers={selectedDrivers}
              />
            )}

            {selectedTab === 'tracks' && (
              <TrackByTrackAnalysis 
                seasonData={seasonData} 
                selectedDrivers={selectedDrivers}
              />
            )}
          </div>
        )}

        {!loading && !error && !seasonData && (
          <div className="text-center text-gray-400 py-20">
            <p>No season data available for {year}</p>
            <p className="text-sm text-gray-500 mt-2">
              Select a different year from the toolbar above
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
