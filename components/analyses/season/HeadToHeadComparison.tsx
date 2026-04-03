'use client'

import React, { useState, useMemo } from 'react'
import { SeasonData } from '../../../lib/seasonTypes'
import { calculateHeadToHead } from '../../../lib/seasonAggregator'
import CustomSelect from '../../CustomSelect'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDriverColor } from '../../../lib/teamData'

type HeadToHeadComparisonProps = {
  seasonData: SeasonData
}

export default function HeadToHeadComparison({ seasonData }: HeadToHeadComparisonProps) {
  const driverCodes = Object.keys(seasonData.drivers).sort()
  
  const [driver1, setDriver1] = useState<string>(driverCodes[0] ?? '')
  const [driver2, setDriver2] = useState<string>(driverCodes[1] ?? '')

  const h2hData = useMemo(() => {
    if (!driver1 || !driver2 || driver1 === driver2) return null
    return calculateHeadToHead(driver1, driver2, seasonData.rounds)
  }, [driver1, driver2, seasonData.rounds])

  const qualiChartData = h2hData ? [
    { name: driver1, value: h2hData.qualifyingWins.driver1 },
    { name: driver2, value: h2hData.qualifyingWins.driver2 },
  ] : []

  const raceChartData = h2hData ? [
    { name: driver1, value: h2hData.raceWins.driver1 },
    { name: driver2, value: h2hData.raceWins.driver2 },
  ] : []

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-200 mb-3">Head-to-Head Comparison</h4>
        <p className="text-xs text-gray-400 mb-4">
          Compare two drivers across qualifying, race performance, and statistics
        </p>
      </div>

      {/* Driver Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Driver 1</label>
          <CustomSelect
            value={driver1}
            onChange={(v) => setDriver1(String(v))}
            options={driverCodes.map(code => ({ value: code, label: code }))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Driver 2</label>
          <CustomSelect
            value={driver2}
            onChange={(v) => setDriver2(String(v))}
            options={driverCodes.map(code => ({ value: code, label: code }))}
          />
        </div>
      </div>

      {h2hData && driver1 !== driver2 ? (
        <>
          {/* Overall Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
              <div className="text-xs text-gray-400 mb-2">Qualifying H2H</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-200">
                  {h2hData.qualifyingWins.driver1}
                </span>
                <span className="text-gray-500">-</span>
                <span className="text-2xl font-bold text-gray-200">
                  {h2hData.qualifyingWins.driver2}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {h2hData.qualifyingWins.total} comparisons
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
              <div className="text-xs text-gray-400 mb-2">Race H2H</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-200">
                  {h2hData.raceWins.driver1}
                </span>
                <span className="text-gray-500">-</span>
                <span className="text-2xl font-bold text-gray-200">
                  {h2hData.raceWins.driver2}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {h2hData.raceWins.total} comparisons
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
              <div className="text-xs text-gray-400 mb-2">Points Difference</div>
              <div className="text-2xl font-bold text-gray-200">
                {h2hData.pointsDifference > 0 ? '+' : ''}{h2hData.pointsDifference}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {h2hData.pointsScored.driver1} vs {h2hData.pointsScored.driver2}
              </div>
            </div>
          </div>

          {/* Visualizations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
              <h5 className="text-sm font-semibold text-gray-200 mb-3">Qualifying Battles</h5>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qualiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#9aa4b2" 
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      stroke="#9aa4b2" 
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '12px',
                        color: '#e7eaee'
                      }}
                      itemStyle={{
                        color: '#e7eaee'
                      }}
                      labelStyle={{
                        color: '#e7eaee',
                        fontWeight: 600
                      }}
                      cursor={{ fill: 'rgba(124, 199, 255, 0.1)' }}
                    />
                    <Bar 
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    >
                      {qualiChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getDriverColor(entry.name, seasonData.year) ?? '#7cc7ff'}
                          opacity={0.9}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 backdrop-blur-sm bg-gray-800/30">
              <h5 className="text-sm font-semibold text-gray-200 mb-3">Race Battles</h5>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={raceChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#9aa4b2" 
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      stroke="#9aa4b2" 
                      tick={{ 
                        fill: '#e7eaee', 
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '12px',
                        color: '#e7eaee'
                      }}
                      itemStyle={{
                        color: '#e7eaee'
                      }}
                      labelStyle={{
                        color: '#e7eaee',
                        fontWeight: 600
                      }}
                      cursor={{ fill: 'rgba(124, 199, 255, 0.1)' }}
                    />
                    <Bar 
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    >
                      {raceChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getDriverColor(entry.name, seasonData.year) ?? '#7cc7ff'}
                          opacity={0.9}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 py-10">
          <p>Select two different drivers to compare</p>
        </div>
      )}
    </div>
  )
}
