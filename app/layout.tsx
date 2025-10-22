import './globals.css'
import React from 'react'

export const metadata = {
  title: 'F1 Corner Analysis',
  description: 'inspired by F1Tempo'
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
