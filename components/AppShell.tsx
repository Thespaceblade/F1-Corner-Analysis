'use client'

import React from 'react'
import AppNav from './AppNav'

type AppShellProps = {
  children: React.ReactNode
  kicker?: string
  title?: string
  description?: string
  contextLabel?: string
  /** Extra controls aligned with the page title (e.g. year select) */
  headerAside?: React.ReactNode
  /** Floating chatbot or other page-level overlays */
  aside?: React.ReactNode
}

/**
 * Shared chrome for tool pages (circuits, season, analysis).
 * Home keeps its own full-bleed layout.
 */
export default function AppShell({
  children,
  kicker,
  title,
  description,
  contextLabel,
  headerAside,
  aside,
}: AppShellProps) {
  return (
    <div className="pb-8">
      <AppNav contextLabel={contextLabel} />
      <main className="mx-auto max-w-6xl px-4 pt-6 page-content page-content-visible">
        {(title || headerAside) && (
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {kicker && (
                <p className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">
                  {kicker}
                </p>
              )}
              {title && (
                <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 max-w-2xl text-sm text-gray-400">{description}</p>
              )}
            </div>
            {headerAside && <div className="shrink-0">{headerAside}</div>}
          </header>
        )}

        {children}
      </main>
      {aside}
    </div>
  )
}
