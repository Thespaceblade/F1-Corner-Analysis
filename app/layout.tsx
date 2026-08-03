import './globals.css'
import React from 'react'
import { Barlow_Condensed, IBM_Plex_Mono, Sora } from 'next/font/google'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const body = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'F1 Corner Analysis',
  description:
    'Corner-level Formula 1 telemetry and season standings from FastF1: entry, apex, exit, and championship review.',
  icons: {
    icon: '/logos/f1-corner-analysis.png',
    shortcut: '/logos/f1-corner-analysis.png',
    apple: '/logos/f1-corner-analysis.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}
