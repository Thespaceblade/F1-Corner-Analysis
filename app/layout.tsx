import './globals.css'
import React from 'react'

export const metadata = {
  title: 'F1 Corner Analysis',
  description: 'with data from FastF1',
  icons: {
    icon: '/logos/logo-navy.png',
    shortcut: '/logos/logo-navy.png',
    apple: '/logos/logo-navy.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen py-8">
          {children}
        </div>
      </body>
    </html>
  )
}
