'use client'

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

type Track = {
  id: string
  name: string
  polyline: Array<[number,number]>
  corners: Array<{
    number: number
    type: 'slow' | 'medium' | 'fast'
    entry: [number,number]
    apex: [number,number]
    exit: [number,number]
  }>
}

type Session = {
  trackId: string
  year: number
  session: string
  driverA: string
  driverB: string
  corners: Array<{
    cornerNumber: number
    driverA: { cornerTime: number }
    driverB: { cornerTime: number }
    winner: string
    delta_s: number
  }>
}

function prepareData(track?: Track, session?: Session) {
  if (!track || !session) return []
  
  return track.corners.map(corner => ({
    cornerNumber: corner.number,
    cornerType: corner.type,
    driverA: session.corners.find(c => c.cornerNumber === corner.number)?.driverA?.cornerTime ?? 0,
    driverB: session.corners.find(c => c.cornerNumber === corner.number)?.driverB?.cornerTime ?? 0
  }))
}

export default function ChartPanel({ track, session }: { track?: Track, session?: Session }){
  const data = prepareData(track, session)

  return (
    <div style={{height:360}}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{top:12,right:12,left:6,bottom:6}}>
          <CartesianGrid strokeDasharray="3 6" className="chart-grid" />
          <XAxis dataKey="lap" stroke="#9aa4b2" />
          <YAxis stroke="#9aa4b2" />
          <Tooltip wrapperClassName="panel p-2" />
          <Line 
            name={session?.driverA ?? 'Driver A'}
            type="monotone" 
            dataKey="driverA" 
            stroke="#7cc7ff" 
            strokeWidth={2} 
            dot={(props) => {
              const type = data[props.index]?.cornerType
              return (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={4} 
                  fill={type === 'slow' ? '#ef4444' : type === 'medium' ? '#eab308' : '#22c55e'}
                  strokeWidth={2}
                  stroke="#7cc7ff"
                />
              )
            }}
          />
          <Line 
            name={session?.driverB ?? 'Driver B'}
            type="monotone" 
            dataKey="driverB" 
            stroke="#bcd9ff" 
            strokeWidth={2} 
            dot={(props) => {
              const type = data[props.index]?.cornerType
              return (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={4} 
                  fill={type === 'slow' ? '#ef4444' : type === 'medium' ? '#eab308' : '#22c55e'}
                  strokeWidth={2}
                  stroke="#bcd9ff"
                />
              )
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
