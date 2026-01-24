'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import DriverBadge from '../../formatting/DriverBadge'
import CustomSelect from '../../CustomSelect'

type TrackByTrackAnalysisProps = {
  seasonData: SeasonData
  selectedDrivers?: string[]
}

export default function TrackByTrackAnalysis({ 
  seasonData, 
  selectedDrivers = [] 
}: TrackByTrackAnalysisProps) {
  const driverCodes = Object.keys(seasonData.drivers).sort()
  
  // Use toolbar-selected driver if available, otherwise use first driver
  const defaultDriver = selectedDrivers.length > 0 ? selectedDrivers[0] : (driverCodes[0] ?? '')
  const [selectedDriver, setSelectedDriver] = useState<string>(defaultDriver)
  
  // Update selected driver when toolbar selection changes
  useEffect(() => {
    if (selectedDrivers.length > 0 && !selectedDrivers.includes(selectedDriver)) {
      setSelectedDriver(selectedDrivers[0])
    }
  }, [selectedDrivers, selectedDriver])

  const driverRounds = useMemo(() => {
    if (!selectedDriver) return []

    return seasonData.rounds.map(round => {
      const qualiResult = round.qualifyingResults.find(q => q.driverCode === selectedDriver)
      const raceResult = round.results.find(r => r.driverCode === selectedDriver)

      const positionsGained = raceResult?.gridPosition && raceResult.position
        ? raceResult.gridPosition - raceResult.position
        : null

      return {
        round: round.round,
        trackName: round.trackName,
        qualiPosition: qualiResult?.position ?? null,
        racePosition: raceResult?.position ?? null,
        points: raceResult?.points ?? 0,
        status: raceResult?.status ?? 'N/A',
        positionsGained,
        fastestLap: raceResult?.fastestLap ?? false,
      }
    })
  }, [selectedDriver, seasonData.rounds])

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-3">Track-by-Track Analysis</h4>
        <p className="text-xs text-gray-400 mb-4">
          Detailed race-by-race performance breakdown
        </p>
      </div>

      {/* Driver Selection */}
      <div className="max-w-xs">
        <label className="text-xs text-gray-400 mb-2 block">
          Select Driver
          {selectedDrivers.length > 0 && (
            <span className="ml-2 text-[10px] text-accent">
              (Using toolbar selection)
            </span>
          )}
        </label>
        <CustomSelect
          value={selectedDriver}
          onChange={(v) => setSelectedDriver(String(v))}
          options={driverCodes.map(code => ({ value: code, label: code }))}
        />
      </div>

      {/* Results Table */}
      <div className="border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">RD</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">TRACK</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">QUALI</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">RACE</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">+/-</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold text-xs">PTS</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold text-xs">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {driverRounds.map((round) => (
                <tr
                  key={round.round}
                  className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                >
                  <td className="py-3 px-3 text-gray-400">{round.round}</td>
                  <td className="py-3 px-3 text-gray-200">{round.trackName}</td>
                  <td className="text-right py-3 px-3 text-gray-300">
                    {round.qualiPosition ? `P${round.qualiPosition}` : 'N/A'}
                  </td>
                  <td className="text-right py-3 px-3 font-medium">
                    <span className={
                      round.racePosition === 1 ? 'text-amber-400' :
                      round.racePosition === 2 ? 'text-gray-300' :
                      round.racePosition === 3 ? 'text-orange-400' :
                      round.racePosition && round.racePosition <= 10 ? 'text-green-400' :
                      'text-gray-300'
                    }>
                      {round.racePosition ? `P${round.racePosition}` : 'N/A'}
                    </span>
                  </td>
                  <td className="text-right py-3 px-3">
                    {round.positionsGained !== null ? (
                      <span className={
                        round.positionsGained > 0 ? 'text-green-400' :
                        round.positionsGained < 0 ? 'text-red-400' :
                        'text-gray-400'
                      }>
                        {round.positionsGained > 0 ? '+' : ''}{round.positionsGained}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-3 text-gray-300">
                    {round.points}
                    {round.fastestLap && (
                      <span className="ml-1 text-purple-400 text-xs">FL</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs ${
                      round.status === 'Finished' ? 'text-gray-400' :
                      round.status === 'DNF' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {round.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
