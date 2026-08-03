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
  /**
   * `hero` = centered Lando-style title stack (kicker + large title),
   * with description + aside in a bar underneath.
   */
  headerVariant?: 'default' | 'hero'
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
  headerVariant = 'default',
}: AppShellProps) {
  const showHeader = Boolean(title || headerAside || kicker || description)

  return (
    <div className="pb-8">
      <AppNav contextLabel={contextLabel} />
      <main className="mx-auto max-w-6xl px-4 pt-6 page-content page-content-visible">
        {showHeader && headerVariant === 'hero' ? (
          <header className="app-shell-header is-hero">
            <div className="app-shell-hero-title">
              {kicker && <p className="app-shell-kicker">{kicker}</p>}
              {title && <h1 className="app-shell-title">{title}</h1>}
            </div>
            {(description || headerAside) && (
              <div className="app-shell-hero-bar">
                {description && <p className="app-shell-hero-desc">{description}</p>}
                {headerAside && <div className="app-shell-hero-aside">{headerAside}</div>}
              </div>
            )}
          </header>
        ) : showHeader ? (
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
        ) : null}

        {children}
      </main>
      {aside}
    </div>
  )
}
