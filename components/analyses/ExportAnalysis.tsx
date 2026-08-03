'use client'

import React, { useState } from 'react'
import { SessionPayload } from '../../lib/sessionDataClient'

type ExportAnalysisProps = {
  sessionData: SessionPayload
  selectedDrivers: string[]
  trackName: string
}

export default function ExportAnalysis({
  sessionData,
  selectedDrivers,
  trackName,
}: ExportAnalysisProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exporting, setExporting] = useState(false)

  const handleExportData = () => {
    setExporting(true)
    try {
      // Prepare data for export
      const exportData = {
        track: trackName,
        session: `${sessionData.meta.year} ${sessionData.meta.round} ${sessionData.meta.session}`,
        drivers: selectedDrivers,
        laps: sessionData.laps.filter(lap => 
          selectedDrivers.includes(lap.driver.toUpperCase())
        ),
        corners: sessionData.corners ? 
          Object.fromEntries(
            selectedDrivers.map(driver => [driver, sessionData.corners[driver] || []])
          ) : {},
        meta: sessionData.meta,
      }

      if (exportFormat === 'json') {
        const json = JSON.stringify(exportData, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${trackName}_${sessionData.meta.year}_${sessionData.meta.session}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // CSV export
        const csvRows: string[] = []
        
        // Laps CSV
        csvRows.push('Lap Data')
        csvRows.push('Driver,Lap Number,Lap Time (s),Sector 1 (s),Sector 2 (s),Sector 3 (s),Compound,Stint,Tyre Life,Valid')
        sessionData.laps
          .filter(lap => selectedDrivers.includes(lap.driver.toUpperCase()))
          .forEach(lap => {
            csvRows.push(
              `${lap.driver},${lap.lapNumber || ''},${lap.lapTimeSeconds || ''},` +
              `${lap.sectorTimesSeconds[0] || ''},${lap.sectorTimesSeconds[1] || ''},${lap.sectorTimesSeconds[2] || ''},` +
              `${lap.compound || ''},${lap.stint || ''},${lap.tyreLife || ''},${lap.isValid !== false}`
            )
          })

        // Corners CSV
        if (sessionData.corners) {
          csvRows.push('')
          csvRows.push('Corner Data')
          csvRows.push('Driver,Corner Number,Lap Number,Entry Speed (km/h),Apex Speed (km/h),Exit Speed (km/h),Corner Time (s),Braking Distance (m),Acceleration Distance (m)')
          selectedDrivers.forEach(driver => {
            const driverCorners = sessionData.corners[driver] || []
            driverCorners.forEach(corner => {
              csvRows.push(
                `${driver},${corner.cornerNumber},${corner.lapNumber},` +
                `${corner.entrySpeed},${corner.apexSpeed},${corner.exitSpeed},` +
                `${corner.cornerTime || ''},${corner.brakingDistance},${corner.accelerationDistance}`
              )
            })
          })
        }

        const csv = csvRows.join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${trackName}_${sessionData.meta.year}_${sessionData.meta.session}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/race/${encodeURIComponent(sessionData.meta.round)}?year=${sessionData.meta.year}&session=${sessionData.meta.session}${
      selectedDrivers.length > 0 ? `&drivers=${encodeURIComponent(selectedDrivers.join(','))}` : ''
    }`
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Shareable link copied to clipboard!')
    }).catch(() => {
      // Fallback: show in alert
      prompt('Copy this link:', shareUrl)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Export & Share
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Export session data, generate shareable links, and export charts.
        </p>
      </div>

      {/* Export Data */}
      <div className="panel p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Export Session Data
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Export Format
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-4 py-2 text-sm rounded transition ${
                  exportFormat === 'csv'
                    ? 'bg-accent text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-4 py-2 text-sm rounded transition ${
                  exportFormat === 'json'
                    ? 'bg-accent text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                JSON
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          </button>
          <p className="text-xs text-gray-500">
            Exports lap times, corner data, and session metadata for selected drivers.
          </p>
        </div>
      </div>

      {/* Share Link */}
      <div className="panel p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Share Session
        </h4>
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleShareLink}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
          >
            Generate Shareable Link
          </button>
          <p className="text-xs text-gray-500">
            Creates a shareable URL that includes track, year, session, and selected drivers.
          </p>
        </div>
      </div>

      {/* Export Chart */}
      <div className="panel p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Export Charts
        </h4>
        <div className="space-y-4">
          <button
            type="button"
            disabled
            aria-describedby="chart-export-status"
            className="cursor-not-allowed rounded bg-gray-800 px-4 py-2 text-gray-500"
          >
            Export Chart as Image (Coming Soon)
          </button>
          <p id="chart-export-status" className="text-xs text-gray-500">
            Chart image export is not available yet.
          </p>
        </div>
      </div>

      {/* Session Info */}
      <div className="panel p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Session Information
        </h4>
        <div className="space-y-2 text-sm text-gray-400">
          <div>
            <span className="font-semibold">Track:</span> {trackName}
          </div>
          <div>
            <span className="font-semibold">Year:</span> {sessionData.meta.year}
          </div>
          <div>
            <span className="font-semibold">Session:</span> {sessionData.meta.session}
          </div>
          <div>
            <span className="font-semibold">Drivers:</span> {selectedDrivers.join(', ')}
          </div>
          <div>
            <span className="font-semibold">Laps:</span> {sessionData.laps.filter(l => 
              selectedDrivers.includes(l.driver.toUpperCase())
            ).length}
          </div>
        </div>
      </div>
    </div>
  )
}










