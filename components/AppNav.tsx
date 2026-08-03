'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type AppNavProps = {
  /** Optional context shown after the primary links (e.g. current circuit name) */
  contextLabel?: string
}

const links: Array<{ href: string; label: string; match: (path: string) => boolean }> = [
  {
    href: '/race',
    label: 'Circuits',
    match: (path) => path === '/race' || path.startsWith('/race/'),
  },
  {
    href: '/season',
    label: 'Season',
    match: (path) => path === '/season' || path.startsWith('/season/'),
  },
]

export default function AppNav({ contextLabel }: AppNavProps) {
  const pathname = usePathname()
  const onHome = pathname === '/'

  return (
    <nav
      aria-label="Primary"
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-800/80 pb-3"
    >
      <Link
        href="/"
        className="mr-1 inline-flex items-center gap-2 no-underline transition hover:opacity-90"
        aria-label="F1 Corner Analysis home"
      >
        <Image
          src="/logos/f1-corner-analysis.png"
          alt=""
          width={28}
          height={28}
          className="object-contain"
        />
        <span
          className={`font-display text-sm font-semibold tracking-tight ${
            onHome ? 'text-accent' : 'text-gray-200'
          }`}
        >
          F1 Corner Analysis
        </span>
      </Link>

      <div className="hidden h-4 w-px bg-gray-700/80 sm:block" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-1">
        {links.map((link) => {
          const active = link.match(pathname)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold no-underline transition ${
                active
                  ? 'bg-accent/15 text-accent'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {contextLabel && (
        <>
          <span className="hidden text-gray-600 sm:inline" aria-hidden="true">
            /
          </span>
          <span className="max-w-[14rem] truncate text-sm text-gray-400 sm:max-w-xs">
            {contextLabel}
          </span>
        </>
      )}
    </nav>
  )
}
