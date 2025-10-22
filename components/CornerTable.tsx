'use client'

import React from 'react'

type Corner = {
  cornerNumber: number
  driverA: { cornerTime: number }
  driverB: { cornerTime: number }
  winner: string
  delta_s: number
}

type CornerInfo = {
  number: number
  type: 'slow' | 'medium' | 'fast'
}

export default function CornerTable({ 
  corners,
  cornerInfo
}: { 
  corners: Corner[]
  cornerInfo: CornerInfo[]
}){
  return (
    <div>
      <table className="w-full table-auto text-left">
        <thead>
          <tr>
            <th className="pb-2">Corner</th>
            <th className="pb-2">Type</th>
            <th className="pb-2">Driver A</th>
            <th className="pb-2">Driver B</th>
            <th className="pb-2">Winner</th>
            <th className="pb-2">Delta (s)</th>
          </tr>
        </thead>
        <tbody>
          {corners.map(c => {
            const info = cornerInfo.find(i => i.number === c.cornerNumber)
            return (
              <tr key={c.cornerNumber} className="border-t border-[var(--border-clr)]">
                <td className="py-2">{c.cornerNumber}</td>
                <td className="py-2">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 bg-${info?.type === 'slow' ? 'red' : info?.type === 'medium' ? 'yellow' : 'green'}-500`} />
                  {info?.type ?? 'unknown'}
                </td>
                <td className="py-2">{c.driverA?.cornerTime?.toFixed(3)}</td>
                <td className="py-2">{c.driverB?.cornerTime?.toFixed(3)}</td>
                <td className="py-2">{c.winner}</td>
                <td className="py-2">{c.delta_s?.toFixed(3)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
