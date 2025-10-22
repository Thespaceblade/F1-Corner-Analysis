'use client'

import React from 'react'

type CornerInfo = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

type CornerTableProps = {
  corners: Record<string, unknown[]>
  cornerInfo: CornerInfo[]
  selectedDrivers: string[]
}

const typeColors: Record<CornerInfo['type'], string> = {
  slow: '#ef4444',
  medium: '#eab308',
  fast: '#22c55e'
}

export default function CornerTable({ corners, cornerInfo, selectedDrivers }: CornerTableProps) {
  const hasCornerData = Object.values(corners ?? {}).some((driverCorners) =>
    Array.isArray(driverCorners) && driverCorners.length > 0
  )

  return (
    <div className="mt-6 panel p-4">
      <h2 className="text-lg font-semibold text-gray-100">Corner Analysis</h2>
      <p className="text-xs text-gray-500">
        Corner-level telemetry will surface braking, apex and exit deltas between selected drivers.
      </p>

      {!hasCornerData && (
        <div className="mt-4 rounded border border-dashed border-gray-600/60 bg-gray-900/40 p-4 text-sm text-gray-400">
          Live corner telemetry is not yet generated for this session. Regenerate the dataset with
          detailed telemetry enabled or check back later.
        </div>
      )}

      {hasCornerData && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="pb-2">Corner</th>
                <th className="pb-2">Type</th>
                {selectedDrivers.map((code) => (
                  <th key={code} className="pb-2">
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cornerInfo.map((corner) => (
                <tr key={corner.number} className="border-t border-[var(--border-clr)]">
                  <td className="py-2 font-medium text-gray-200">{corner.number}</td>
                  <td className="py-2">
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: typeColors[corner.type] }}
                    />
                    <span className="uppercase tracking-wide text-xs text-gray-400">{corner.type}</span>
                  </td>
                  {selectedDrivers.map((code) => (
                    <td key={code} className="py-2 text-gray-300">
                      {/* Placeholder until telemetry aggregation is wired */}
                      —
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
