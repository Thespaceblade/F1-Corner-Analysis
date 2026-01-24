'use client'

import React, { useMemo } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { f1Teams } from '../../../lib/teamData'
import DriverBadge from '../../formatting/DriverBadge'

type TeamStandingsTableProps = {
  seasonData: SeasonData
}

export default function TeamStandingsTable({ seasonData }: TeamStandingsTableProps) {
  const sortedTeams = useMemo(() => {
    return Object.values(seasonData.teams)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((team, index) => ({ ...team, position: index + 1 }))
  }, [seasonData.teams])

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-200">
        Constructor Standings - {seasonData.year}
      </h4>

      <div className="border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">POS</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">TEAM</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">DRIVERS</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">PTS</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">WINS</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">PODIUMS</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">1-2s</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">DOUBLE POD</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">DOUBLE PTS</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team) => {
                const teamInfo = f1Teams.find(t => t.id === team.teamId)
                
                return (
                  <tr
                    key={team.teamId}
                    className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span className={`font-bold text-sm ${
                        team.position === 1 ? 'text-amber-400' :
                        team.position === 2 ? 'text-gray-300' :
                        team.position === 3 ? 'text-orange-400' :
                        'text-gray-400'
                      }`}>
                        {team.position}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 flex items-center">
                          <img
                            src={`/team-logos/${team.teamId}.png`}
                            alt={teamInfo?.shortName ?? team.teamId}
                            className="relative z-10 h-full w-full object-contain"
                            style={
                              ['aston-martin', 'visa-rb', 'stake'].includes(team.teamId)
                                ? { transform: 'scale(1.3)' }
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
                        {team.driver1 && <DriverBadge code={team.driver1} size="sm" variant="badge" />}
                        {team.driver2 && <DriverBadge code={team.driver2} size="sm" variant="badge" />}
                      </div>
                    </td>
                    <td className="text-right py-3 px-3 font-semibold text-gray-200">
                      {team.totalPoints}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {team.totalWins}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {team.totalPodiums}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {team.oneTwo}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {team.doublePodium}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-300">
                      {team.doublePoints}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
