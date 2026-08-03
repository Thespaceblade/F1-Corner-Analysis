'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Trophy,
  Users,
  Building2,
  GitCompare,
  TrendingUp,
  Map,
  Route,
} from 'lucide-react'
import { SeasonData } from '../../lib/seasonTypes'
import { getTeamById } from '../../lib/teamData'
import SeasonOverview from './season/SeasonOverview'
import DriverStandingsTable from './season/DriverStandingsTable'
import TeamStandingsTable from './season/TeamStandingsTable'
import HeadToHeadComparison from './season/HeadToHeadComparison'
import ChampionshipProgressionChart from './season/ChampionshipProgressionChart'
import TrackByTrackAnalysis from './season/TrackByTrackAnalysis'
import TrackTypeAnalysis from './season/TrackTypeAnalysis'
import LoadingIndicator from '../LoadingIndicator'

type SeasonTab =
  | 'overview'
  | 'drivers'
  | 'teams'
  | 'head-to-head'
  | 'progression'
  | 'tracks'
  | 'track-types'

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
    description: 'Leaders, key stats, and season highlight charts',
    icon: Trophy,
  },
  {
    id: 'drivers',
    label: 'Driver Standings',
    shortLabel: 'Drivers',
    description: 'Full driver table with expandable advanced metrics',
    icon: Users,
  },
  {
    id: 'teams',
    label: 'Team Standings',
    shortLabel: 'Teams',
    description: 'Constructor table with teammate splits and reliability',
    icon: Building2,
  },
  {
    id: 'head-to-head',
    label: 'Head-to-Head',
    shortLabel: 'H2H',
    description: 'Driver duels with round-by-round scorecard',
    icon: GitCompare,
  },
  {
    id: 'progression',
    label: 'Championship Progression',
    shortLabel: 'Progress',
    description: 'Cumulative points charts for drivers or constructors',
    icon: TrendingUp,
  },
  {
    id: 'tracks',
    label: 'Track-by-Track',
    shortLabel: 'Rounds',
    description: 'Race-by-race results for a selected driver',
    icon: Map,
  },
  {
    id: 'track-types',
    label: 'Track Types',
    shortLabel: 'Types',
    description: 'Street vs high-speed vs traditional form',
    icon: Route,
  },
]

export default function SeasonReviewPanel({
  year = new Date().getFullYear(),
  initialTab = 'overview',
  selectedDrivers = [],
}: SeasonReviewPanelProps) {
  const [selectedTab, setSelectedTab] = useState<SeasonTab>(initialTab)
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSeasonData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/seasons/${year}/summary`)
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.message || payload?.error || response.statusText)
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

  const leaderMeta = useMemo(() => {
    if (!seasonData) return null
    const drivers = Object.values(seasonData.drivers).sort((a, b) => b.totalPoints - a.totalPoints)
    const teams = Object.values(seasonData.teams).sort((a, b) => b.totalPoints - a.totalPoints)
    const leadDriver = drivers[0]
    const leadTeam = teams[0]
    const progress =
      seasonData.totalRaces > 0
        ? Math.min(100, Math.round((seasonData.completedRaces / seasonData.totalRaces) * 100))
        : 0

    return {
      leadDriver,
      leadTeam,
      progress,
      teamName: leadTeam
        ? getTeamById(leadTeam.teamId, seasonData.year)?.shortName ?? leadTeam.teamId
        : null,
    }
  }, [seasonData])

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent rounded-lg pointer-events-none -z-10" />

      {seasonData && leaderMeta && !loading && (
        <div className="mb-4 rounded-lg border border-gray-700/70 bg-gray-900/40 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-accent font-semibold">
                {seasonData.isSeasonComplete ? 'Season complete' : 'Season in progress'}
              </div>
              <div className="mt-1 text-sm text-gray-200">
                {seasonData.completedRaces} of {seasonData.totalRaces} races counted
                {leaderMeta.leadDriver && (
                  <>
                    {' · '}
                    <span className="text-accent font-medium">{leaderMeta.leadDriver.driverCode}</span>
                    {' leads on '}
                    {leaderMeta.leadDriver.totalPoints} pts
                  </>
                )}
                {leaderMeta.teamName && (
                  <>
                    {' · '}
                    {leaderMeta.teamName} leads constructors
                  </>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 shrink-0">
              {leaderMeta.progress}% of calendar
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent/80 to-accent transition-all duration-700"
              style={{ width: `${leaderMeta.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="border-b border-gray-700/60">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {seasonTabs.map((tab) => {
            const isSelected = selectedTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`group relative px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium rounded-t-lg whitespace-nowrap flex items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 transition-all duration-200 ease-out ${
                  isSelected
                    ? 'bg-accent/15 text-accent border-b-2 border-accent shadow-[0_-2px_8px_rgba(225,6,0,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border-b-2 border-transparent'
                }`}
              >
                <tab.icon
                  className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-all duration-200 ${
                    isSelected
                      ? 'scale-110 text-accent'
                      : 'group-hover:scale-105 text-gray-400 group-hover:text-gray-200'
                  }`}
                />
                <span className="hidden sm:inline text-xs leading-tight font-medium">{tab.shortLabel}</span>
                <span className="sm:hidden text-[10px] leading-tight font-medium">{tab.shortLabel}</span>

                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out whitespace-nowrap z-50 border border-gray-700/50 translate-y-1 group-hover:translate-y-0">
                  <div className="font-semibold mb-1 text-accent">{tab.label}</div>
                  <div className="text-gray-400 text-[10px] leading-relaxed">{tab.description}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900/95" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 relative min-h-[420px]">
        {loading && (
          <LoadingIndicator label={`Loading ${year} season data...`} className="py-20" />
        )}

        {error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <div className="font-semibold mb-1">Error loading season data</div>
            <div className="text-red-400/80">{error}</div>
          </div>
        )}

        {!loading && !error && seasonData && (
          <div key={selectedTab} className="animate-in fade-in duration-200">
            {selectedTab === 'overview' && <SeasonOverview seasonData={seasonData} />}
            {selectedTab === 'drivers' && <DriverStandingsTable seasonData={seasonData} />}
            {selectedTab === 'teams' && <TeamStandingsTable seasonData={seasonData} />}
            {selectedTab === 'head-to-head' && (
              <HeadToHeadComparison seasonData={seasonData} selectedDrivers={selectedDrivers} />
            )}
            {selectedTab === 'progression' && (
              <ChampionshipProgressionChart
                seasonData={seasonData}
                selectedDrivers={selectedDrivers}
              />
            )}
            {selectedTab === 'tracks' && (
              <TrackByTrackAnalysis seasonData={seasonData} selectedDrivers={selectedDrivers} />
            )}
            {selectedTab === 'track-types' && (
              <TrackTypeAnalysis seasonData={seasonData} selectedDrivers={selectedDrivers} />
            )}
          </div>
        )}

        {!loading && !error && !seasonData && (
          <div className="text-center text-gray-400 py-20">
            <p>No season data available for {year}</p>
            <p className="text-sm text-gray-500 mt-2">
              Select a different year, or check that race results have been imported.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
