'use client'

import React, { useState, useMemo } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import DriverBadge from '../../formatting/DriverBadge'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { getTeamById } from '../../../lib/teamData'

type SeasonDataProps = {
  seasonData: SeasonData
}

type SortField = 
  | 'position'
  | 'points'
  | 'wins'
  | 'podiums'
  | 'poles'
  | 'fastestLaps'
  | 'dnfs'
  | 'avgFinish'
  | 'avgQuali'
  | 'consistency'

type SortDirection = 'asc' | 'desc'

export default function DriverStandingsTable({ seasonData }: SeasonDataProps) {
  const [sortField, setSortField] = useState<SortField>('position')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Sort drivers
  const sortedDrivers = useMemo(() => {
    const driversArray = Object.values(seasonData.drivers)
      .map((driver, index) => ({ ...driver, position: index + 1 }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((driver, index) => ({ ...driver, position: index + 1 }))

    return driversArray.sort((a, b) => {
      let aVal: number, bVal: number

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
          aVal = a.raceWins
          bVal = b.raceWins
          break
        case 'podiums':
          aVal = a.podiums
          bVal = b.podiums
          break
        case 'poles':
          aVal = a.polePositions
          bVal = b.polePositions
          break
        case 'fastestLaps':
          aVal = a.fastestLaps
          bVal = b.fastestLaps
          break
        case 'dnfs':
          aVal = a.dnfs
          bVal = b.dnfs
          break
        case 'avgFinish':
          aVal = a.averageFinishPosition ?? 999
          bVal = b.averageFinishPosition ?? 999
          break
        case 'avgQuali':
          aVal = a.averageQualifyingPosition ?? 999
          bVal = b.averageQualifyingPosition ?? 999
          break
        case 'consistency':
          aVal = a.finishingPositionStdDev ?? 999
          bVal = b.finishingPositionStdDev ?? 999
          break
        default:
          return 0
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [seasonData.drivers, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      // Default sort direction for different fields
      const defaultDesc: SortField[] = ['points', 'wins', 'podiums', 'poles', 'fastestLaps']
      setSortDirection(defaultDesc.includes(field) ? 'desc' : 'asc')
    }
  }

  const toggleRow = (driverCode: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(driverCode)) {
      newExpanded.delete(driverCode)
    } else {
      newExpanded.add(driverCode)
    }
    setExpandedRows(newExpanded)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-accent transition-colors group"
      >
        {children}
        {isActive ? (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-3 h-3 text-accent" /> : 
            <ChevronDown className="w-3 h-3 text-accent" />
        ) : (
          <ChevronsUpDown className="w-3 h-3 text-gray-600 group-hover:text-accent" />
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-200">
          Driver Standings - {seasonData.year}
        </h4>
        <p className="text-xs text-gray-400">
          Click column headers to sort • Click rows to expand
        </p>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">
                  <SortButton field="position">POS</SortButton>
                </th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">
                  DRIVER
                </th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">
                  TEAM
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <div className="flex items-center justify-end">
                    <SortButton field="points">PTS</SortButton>
                  </div>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <div className="flex items-center justify-end">
                    <SortButton field="wins">WINS</SortButton>
                  </div>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <div className="flex items-center justify-end">
                    <SortButton field="podiums">POD</SortButton>
                  </div>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <div className="flex items-center justify-end">
                    <SortButton field="poles">POLE</SortButton>
                  </div>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <div className="flex items-center justify-end">
                    <SortButton field="fastestLaps">FL</SortButton>
                  </div>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  <div className="flex items-center justify-end">
                    <SortButton field="dnfs">DNF</SortButton>
                  </div>
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">
                  RACES
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {sortedDrivers.map((driver) => (
                <React.Fragment key={driver.driverCode}>
                  {/* Main Row */}
                  <tr
                    onClick={() => toggleRow(driver.driverCode)}
                    className="border-b border-gray-800 hover:bg-gray-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${
                          driver.position === 1 ? 'text-amber-400' :
                          driver.position === 2 ? 'text-gray-300' :
                          driver.position === 3 ? 'text-orange-400' :
                          'text-gray-400'
                        }`}>
                          {driver.position}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <DriverBadge code={driver.driverCode} year={seasonData.year} size="sm" variant="badge" />
                    </td>
                    <td className="py-3 px-3">
                      {driver.teamId ? (
                        <div className="relative w-8 h-8 flex items-center">
                          <img
                            src={getTeamById(driver.teamId, seasonData.year)?.logoPath ?? `/team-logos/${driver.teamId}.png`}
                            alt={getTeamById(driver.teamId, seasonData.year)?.shortName ?? driver.teamId}
                            className="relative z-10 h-full w-full object-contain"
                            style={
                              ['aston-martin', 'visa-rb', 'stake'].includes(driver.teamId)
                                ? { transform: 'scale(1.3)' }
                                : undefined
                            }
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="text-right py-3 px-3 font-semibold text-gray-200">
                      {driver.totalPoints}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {driver.raceWins}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {driver.podiums}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {driver.polePositions}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {driver.fastestLaps}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {driver.dnfs}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-400 text-xs">
                      {driver.raceStarts}
                    </td>
                    <td className="py-3 px-2">
                      {expandedRows.has(driver.driverCode) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </td>
                  </tr>

                  {/* Expanded Row - Advanced Stats */}
                  {expandedRows.has(driver.driverCode) && (
                    <tr className="border-b border-gray-800 bg-gray-900/60">
                      <td colSpan={11} className="py-4 px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          {/* Performance Stats */}
                          <div className="space-y-2">
                            <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">
                              Performance
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Avg Finish:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.averageFinishPosition?.toFixed(1) ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Best Finish:</span>
                                <span className="text-gray-300 font-medium">
                                  P{driver.bestFinish ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Worst Finish:</span>
                                <span className="text-gray-300 font-medium">
                                  P{driver.worstFinish ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Positions Gained:</span>
                                <span className={`font-medium ${
                                  (driver.averagePositionsGained ?? 0) > 0 ? 'text-green-400' :
                                  (driver.averagePositionsGained ?? 0) < 0 ? 'text-red-400' :
                                  'text-gray-300'
                                }`}>
                                  {driver.averagePositionsGained !== null
                                    ? (driver.averagePositionsGained > 0 ? '+' : '') + driver.averagePositionsGained.toFixed(1)
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Qualifying Stats */}
                          <div className="space-y-2">
                            <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">
                              Qualifying
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Avg Position:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.averageQualifyingPosition?.toFixed(1) ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Q3 Appearances:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.q3Appearances}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Best Grid:</span>
                                <span className="text-gray-300 font-medium">
                                  P{driver.bestQualifyingPosition ?? 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Teammate Comparison */}
                          <div className="space-y-2">
                            <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">
                              vs Teammate
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Qualifying H2H:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.teammateHeadToHeadQualifying.total > 0
                                    ? `${driver.teammateHeadToHeadQualifying.wins}-${driver.teammateHeadToHeadQualifying.total - driver.teammateHeadToHeadQualifying.wins}`
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Race H2H:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.teammateHeadToHeadRace.total > 0
                                    ? `${driver.teammateHeadToHeadRace.wins}-${driver.teammateHeadToHeadRace.total - driver.teammateHeadToHeadRace.wins}`
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Points Diff:</span>
                                <span className={`font-medium ${
                                  driver.pointsVsTeammate > 0 ? 'text-green-400' :
                                  driver.pointsVsTeammate < 0 ? 'text-red-400' :
                                  'text-gray-300'
                                }`}>
                                  {driver.pointsVsTeammate > 0 ? '+' : ''}{driver.pointsVsTeammate}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Consistency */}
                          <div className="space-y-2">
                            <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">
                              Consistency
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Finish Std Dev:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.finishingPositionStdDev?.toFixed(2) ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Point Scoring:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.pointScoringRate.toFixed(0)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Finish Rate:</span>
                                <span className="text-gray-300 font-medium">
                                  {driver.raceStarts > 0
                                    ? ((driver.racesFinished / driver.raceStarts) * 100).toFixed(0)
                                    : 0
                                  }%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
