import './globals.css'
import React from 'react'
import { Barlow_Condensed, Sora } from 'next/font/google'

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

export const metadata = {
  title: 'F1 Corner Analysis',
  description: 'Corner telemetry and season standings from FastF1',
  icons: {
    icon: '/logos/logo-navy.png',
    shortcut: '/logos/logo-navy.png',
    apple: '/logos/logo-navy.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="min-h-screen py-8">{children}</div>
      </body>
    </html>
  )
}
