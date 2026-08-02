'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: '/', label: 'Home', exact: true },
  { href: '/race', label: 'Race Analysis' },
  { href: '/season', label: 'Season Review' },
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="mb-6 flex flex-wrap items-center gap-1 border-b border-gray-800/80 pb-3"
    >
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`)

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
    </nav>
  )
}
