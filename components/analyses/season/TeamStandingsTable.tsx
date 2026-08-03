'use client'

import React, { useMemo, useState } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { getTeamById } from '../../../lib/teamData'
import DriverBadge from '../../formatting/DriverBadge'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

type TeamStandingsTableProps = {
  seasonData: SeasonData
}

type SortField =
  | 'position'
  | 'points'
  | 'wins'
  | 'podiums'
  | 'oneTwo'
  | 'doublePodium'
  | 'doublePoints'
  | 'doubleDNF'
  | 'avgFinish'
  | 'gap'

type SortDirection = 'asc' | 'desc'

export default function TeamStandingsTable({ seasonData }: TeamStandingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('position')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const sortedTeams = useMemo(() => {
    const base = Object.values(seasonData.teams)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((team, index) => ({
        ...team,
        position: team.constructorPosition ?? index + 1,
      }))

    return [...base].sort((a, b) => {
      let aVal: number
      let bVal: number
      switch (sortField) {
        case 'position':
          aVal = a.position
          bVal = b.position
          break
        case 'points':
          aVal = a.totalPoints
          bVal = b.totalPoints
          break
        case 'wins':
          aVal = a.totalWins
          bVal = b.totalWins
          break
        case 'podiums':
          aVal = a.totalPodiums
          bVal = b.totalPodiums
          break
        case 'oneTwo':
          aVal = a.oneTwo
          bVal = b.oneTwo
          break
        case 'doublePodium':
          aVal = a.doublePodium
          bVal = b.doublePodium
          break
        case 'doublePoints':
          aVal = a.doublePoints
          bVal = b.doublePoints
          break
        case 'doubleDNF':
          aVal = a.doubleDNF
          bVal = b.doubleDNF
          break
        case 'avgFinish':
          aVal = a.averageFinishingPosition ?? 999
          bVal = b.averageFinishingPosition ?? 999
          break
        case 'gap':
          aVal = Math.abs(a.pointsDifference)
          bVal = Math.abs(b.pointsDifference)
          break
        default:
          return 0
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [seasonData.teams, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      const defaultDesc: SortField[] = [
        'points',
        'wins',
        'podiums',
        'oneTwo',
        'doublePodium',
        'doublePoints',
        'doubleDNF',
        'gap',
      ]
      setSortDirection(defaultDesc.includes(field) ? 'desc' : 'asc')
    }
  }

  const toggleRow = (teamId: string) => {
    const next = new Set(expandedRows)
    if (next.has(teamId)) next.delete(teamId)
    else next.add(teamId)
    setExpandedRows(next)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-accent transition-colors group"
      >
        {children}
        {isActive ? (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-3 h-3 text-accent" />
          ) : (
            <ChevronDown className="w-3 h-3 text-accent" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 text-gray-600 group-hover:text-accent" />
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="text-sm font-semibold text-gray-200">
          Constructor Standings: {seasonData.year}
        </h4>
        <p className="text-xs text-gray-400">Sort columns · expand rows for teammate split</p>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="position">POS</SortButton>
                </th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">TEAM</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">DRIVERS</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="points">PTS</SortButton>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="wins">WINS</SortButton>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="podiums">POD</SortButton>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="oneTwo">1-2</SortButton>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="doublePodium">DBL POD</SortButton>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="doublePoints">DBL PTS</SortButton>
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team) => {
                const teamInfo = getTeamById(team.teamId, seasonData.year)
                const expanded = expandedRows.has(team.teamId)
                const d1Pts = team.driver1
                  ? seasonData.drivers[team.driver1]?.totalPoints ?? 0
                  : 0
                const d2Pts = team.driver2
                  ? seasonData.drivers[team.driver2]?.totalPoints ?? 0
                  : 0

                return (
                  <React.Fragment key={team.teamId}>
                    <tr
                      className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors cursor-pointer"
                      onClick={() => toggleRow(team.teamId)}
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold text-sm ${
                            team.position === 1
                              ? 'text-amber-400'
                              : team.position === 2
                                ? 'text-gray-300'
                                : team.position === 3
                                  ? 'text-orange-400'
                                  : 'text-gray-400'
                          }`}
                        >
                          {team.position}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 flex items-center">
                            <img
                              src={teamInfo?.logoPath ?? `/team-logos/${team.teamId}.png`}
                              alt={teamInfo?.shortName ?? team.teamId}
                              className="relative z-10 h-full w-full object-contain"
                              style={
                                ['aston-martin', 'visa-rb', 'stake', 'cadillac', 'audi', 'racing-bulls'].includes(
                                  team.teamId,
                                )
                                  ? { transform: 'scale(1.25)' }
                                  : undefined
                              }
                            />
                          </div>
                          <span className="font-medium text-gray-200">
                            {teamInfo?.shortName ?? team.teamId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {team.driver1 && (
                            <DriverBadge
                              code={team.driver1}
                              year={seasonData.year}
                              size="sm"
                              variant="badge"
                            />
                          )}
                          {team.driver2 && (
                            <DriverBadge
                              code={team.driver2}
                              year={seasonData.year}
                              size="sm"
                              variant="badge"
                            />
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-3 font-semibold text-gray-200">
                        {team.totalPoints}
                      </td>
                      <td className="text-right py-3 px-3 text-gray-300">{team.totalWins}</td>
                      <td className="text-right py-3 px-3 text-gray-300">{team.totalPodiums}</td>
                      <td className="text-right py-3 px-3 text-gray-300">{team.oneTwo}</td>
                      <td className="text-right py-3 px-3 text-gray-300">{team.doublePodium}</td>
                      <td className="text-right py-3 px-3 text-gray-300">{team.doublePoints}</td>
                      <td className="py-3 px-2 text-gray-500">
                        {expanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b border-gray-800 bg-gray-900/40">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            <div className="rounded-lg border border-gray-700/70 bg-gray-800/40 p-3">
                              <div className="text-gray-500 mb-1">Avg finishing position</div>
                              <div className="text-gray-100 font-semibold text-sm">
                                {team.averageFinishingPosition != null
                                  ? team.averageFinishingPosition.toFixed(2)
                                  : 'N/A'}
                              </div>
                            </div>
                            <div className="rounded-lg border border-gray-700/70 bg-gray-800/40 p-3">
                              <div className="text-gray-500 mb-1">Double DNFs</div>
                              <div className="text-gray-100 font-semibold text-sm">{team.doubleDNF}</div>
                            </div>
                            <div className="rounded-lg border border-gray-700/70 bg-gray-800/40 p-3">
                              <div className="text-gray-500 mb-1">Teammate points split</div>
                              <div className="text-gray-100 font-semibold text-sm">
                                {team.driver1 ?? 'N/A'} {d1Pts} · {team.driver2 ?? 'N/A'} {d2Pts}
                              </div>
                            </div>
                            <div className="rounded-lg border border-gray-700/70 bg-gray-800/40 p-3">
                              <div className="text-gray-500 mb-1">Internal points gap</div>
                              <div className="text-gray-100 font-semibold text-sm">
                                {team.pointsDifference > 0 ? '+' : ''}
                                {team.pointsDifference}
                                {team.driver1 ? ` (${team.driver1} lead)` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
