'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Full-bleed atmospheric plane */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(124,199,255,0.18),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(255,80,80,0.10),transparent_50%),linear-gradient(160deg,#0a0c10_0%,#0d0f13_45%,#121820_100%)]" />
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%] opacity-[0.22] md:opacity-[0.35]">
          <Image
            src="/logos/f1 car.png"
            alt=""
            fill
            priority
            className="object-contain object-right-bottom scale-110 md:scale-100"
            sizes="(max-width: 768px) 100vw, 62vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--page-bg)] via-[var(--page-bg)]/85 to-transparent md:via-[var(--page-bg)]/55" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-12 md:px-8">
        <div className="max-w-xl space-y-6 md:space-y-8">
          <div className="home-brand-enter flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-accent/40 md:h-20 md:w-20">
              <Image
                src="/logos/logo-transparent.png"
                alt=""
                width={80}
                height={80}
                className="object-contain p-1.5"
                priority
              />
            </div>
            <p className="font-display text-4xl font-bold tracking-tight text-[#7cc7ff] drop-shadow-[0_0_24px_rgba(124,199,255,0.35)] md:text-5xl">
              F1 Corner Analysis
            </p>
          </div>

          <h1 className="home-copy-enter font-display text-2xl font-semibold leading-snug tracking-tight text-white md:text-3xl">
            Corner telemetry and season standings, side by side.
          </h1>

          <p className="home-copy-enter text-base text-subtext-clr md:text-lg" style={{ animationDelay: '0.12s' }}>
            Dig into session lap data track by track, or step back and read the championship story for a whole year.
          </p>

          <div
            className="home-cta-enter flex flex-col gap-3 sm:flex-row sm:items-stretch"
            style={{ animationDelay: '0.22s' }}
          >
            <Link
              href="/race"
              className="group flex min-h-[3.25rem] flex-1 items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 no-underline transition hover:border-accent hover:bg-accent/20"
            >
              <span>
                <span className="block font-display text-lg font-semibold text-accent">Race Analysis</span>
                <span className="block text-xs text-gray-400">Track, session, corners</span>
              </span>
              <span className="text-accent transition group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/season"
              className="group flex min-h-[3.25rem] flex-1 items-center justify-between gap-3 rounded-xl border border-gray-600 bg-gray-900/50 px-5 py-3 no-underline transition hover:border-gray-400 hover:bg-gray-800/70"
            >
              <span>
                <span className="block font-display text-lg font-semibold text-white">Season Review</span>
                <span className="block text-xs text-gray-400">Standings and progression</span>
              </span>
              <span className="text-gray-300 transition group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
