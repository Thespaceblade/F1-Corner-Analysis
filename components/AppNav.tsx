'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type AppNavProps = {
  /** Optional context shown after the brand (e.g. current circuit name) */
  contextLabel?: string
  /**
   * overlay — absolute topbar for the homepage hero
   * page — document-flow topbar for tool pages
   */
  variant?: 'overlay' | 'page'
}

const links: Array<{
  href: string
  label: string
  match: (path: string) => boolean
  external?: boolean
}> = [
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
  {
    href: '/teams',
    label: 'Teams',
    match: (path) => path === '/teams' || path.startsWith('/teams/'),
  },
  {
    href: '/drivers',
    label: 'Drivers',
    match: (path) => path === '/drivers' || path.startsWith('/drivers/'),
  },
  {
    href: 'https://github.com/Thespaceblade/F1-Corner-Analysis',
    label: 'Source',
    match: () => false,
    external: true,
  },
]

export default function AppNav({ contextLabel, variant = 'page' }: AppNavProps) {
  const pathname = usePathname()
  const onHome = pathname === '/'
  const isOverlay = variant === 'overlay'

  const inner = (
    <div className="app-topbar-inner">
      <div className="app-topbar-left">
        <Link href="/" className="app-topbar-brand" aria-label="F1 Corner Analysis home">
          <Image
            src="/logos/f1-corner-analysis.png"
            alt=""
            width={28}
            height={28}
            className="object-contain"
            priority={isOverlay}
          />
          <span className={onHome ? 'is-home' : undefined}>F1 Corner Analysis</span>
        </Link>

        {contextLabel && !isOverlay && (
          <>
            <span className="app-topbar-slash" aria-hidden="true">
              /
            </span>
            <span className="app-topbar-context">{contextLabel}</span>
          </>
        )}
      </div>

      <nav aria-label="Primary" className="app-topbar-links">
        {links.map((link) => {
          const active = !link.external && link.match(pathname)
          if (link.external) {
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="app-topbar-link"
              >
                {link.label}
              </a>
            )
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`app-topbar-link ${active ? 'is-active' : ''}`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className={`app-topbar ${isOverlay ? 'app-topbar--overlay' : 'app-topbar--page'}`}>
      {inner}
    </div>
  )
}
