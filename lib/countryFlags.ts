const FLAG_BADGE_BASE = (
  body: string,
) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <clipPath id="clip">
        <rect x="1" y="3" width="22" height="18" rx="5" ry="5" />
      </clipPath>
    </defs>
    <rect x="1" y="3" width="22" height="18" rx="5" fill="#0f172a" />
    <g clip-path="url(#clip)">${body}</g>
    <rect x="1" y="3" width="22" height="18" rx="5" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1" />
  </svg>
`

function asDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`
}

const FLAG_SVGS: Record<string, string> = {
  ae: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="6" height="18" fill="#dc2626" />
    <rect x="7" y="3" width="16" height="6" fill="#22c55e" />
    <rect x="7" y="9" width="16" height="6" fill="#ffffff" />
    <rect x="7" y="15" width="16" height="6" fill="#111827" />
  `),
  au: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#0a2f7a" />
    <g transform="translate(1 3)">
      <rect width="10" height="8" fill="#163f8c" />
      <path d="M0 0 10 8M10 0 0 8" stroke="#ffffff" stroke-width="2" />
      <path d="M0 0 10 8M10 0 0 8" stroke="#dc2626" stroke-width="1" />
      <path d="M5 0v8M0 4h10" stroke="#ffffff" stroke-width="3" />
      <path d="M5 0v8M0 4h10" stroke="#dc2626" stroke-width="1.6" />
    </g>
    <circle cx="17" cy="9" r="1.2" fill="#ffffff" />
    <circle cx="19.5" cy="13.5" r="1" fill="#ffffff" />
    <circle cx="15" cy="15.5" r="1" fill="#ffffff" />
    <circle cx="20.5" cy="7" r=".8" fill="#ffffff" />
  `),
  az: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="6" fill="#2aa5db" />
    <rect x="1" y="9" width="22" height="6" fill="#ef4444" />
    <rect x="1" y="15" width="22" height="6" fill="#16a34a" />
    <circle cx="11.2" cy="12" r="3" fill="#ffffff" />
    <circle cx="12.3" cy="12" r="2.4" fill="#ef4444" />
    <circle cx="14.4" cy="12" r=".8" fill="#ffffff" />
  `),
  be: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="7.33" height="18" fill="#111111" />
    <rect x="8.33" y="3" width="7.34" height="18" fill="#facc15" />
    <rect x="15.67" y="3" width="7.33" height="18" fill="#dc2626" />
  `),
  bh: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#dc2626" />
    <path d="M1 3h8l-2 2 2 2-2 2 2 2-2 2 2 2-2 2H1Z" fill="#ffffff" />
  `),
  br: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#16a34a" />
    <path d="M12 5 19 12 12 19 5 12Z" fill="#facc15" />
    <circle cx="12" cy="12" r="3.2" fill="#1d4ed8" />
    <path d="M8.8 12.2c1.4-1.1 5-1.1 6.4 0" stroke="#ffffff" stroke-width=".8" fill="none" />
  `),
  ca: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#ffffff" />
    <rect x="1" y="3" width="5" height="18" fill="#dc2626" />
    <rect x="18" y="3" width="5" height="18" fill="#dc2626" />
    <path d="M12 7.2 13.1 10l2.9-.3-2.1 1.9.8 2.8-2.7-1.4-2.7 1.4.8-2.8-2.1-1.9 2.9.3Z" fill="#dc2626" />
  `),
  cn: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#dc2626" />
    <path d="M6 6.2 6.8 8.4 9.2 8.4 7.2 9.8 8 12 6 10.7 4 12 4.8 9.8 2.8 8.4 5.2 8.4Z" fill="#facc15" />
    <circle cx="10.8" cy="6.8" r=".6" fill="#facc15" />
    <circle cx="12.1" cy="8.8" r=".6" fill="#facc15" />
    <circle cx="12" cy="11.2" r=".6" fill="#facc15" />
    <circle cx="10.3" cy="12.9" r=".6" fill="#facc15" />
  `),
  es: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#c1121f" />
    <rect x="1" y="7.5" width="22" height="9" fill="#facc15" />
    <rect x="5.2" y="9" width="2" height="4" fill="#a16207" />
    <rect x="5.8" y="10" width=".8" height="2" fill="#991b1b" />
  `),
  gb: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#1d4ed8" />
    <path d="M1 3 23 21M23 3 1 21" stroke="#ffffff" stroke-width="4" />
    <path d="M1 3 23 21M23 3 1 21" stroke="#dc2626" stroke-width="2" />
    <path d="M12 3v18M1 12h22" stroke="#ffffff" stroke-width="6" />
    <path d="M12 3v18M1 12h22" stroke="#dc2626" stroke-width="3" />
  `),
  hu: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="6" fill="#dc2626" />
    <rect x="1" y="9" width="22" height="6" fill="#ffffff" />
    <rect x="1" y="15" width="22" height="6" fill="#16a34a" />
  `),
  it: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="7.33" height="18" fill="#16a34a" />
    <rect x="8.33" y="3" width="7.34" height="18" fill="#ffffff" />
    <rect x="15.67" y="3" width="7.33" height="18" fill="#dc2626" />
  `),
  jp: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#ffffff" />
    <circle cx="12" cy="12" r="4.5" fill="#dc2626" />
  `),
  mc: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="9" fill="#dc2626" />
    <rect x="1" y="12" width="22" height="9" fill="#ffffff" />
  `),
  mx: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="7.33" height="18" fill="#16a34a" />
    <rect x="8.33" y="3" width="7.34" height="18" fill="#ffffff" />
    <rect x="15.67" y="3" width="7.33" height="18" fill="#dc2626" />
    <circle cx="12" cy="12" r="1.2" fill="#a16207" />
  `),
  nl: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="6" fill="#dc2626" />
    <rect x="1" y="9" width="22" height="6" fill="#ffffff" />
    <rect x="1" y="15" width="22" height="6" fill="#2563eb" />
  `),
  qa: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#6b102e" />
    <path d="M1 3h9l-2.2 1.5L10 6 7.8 7.5 10 9 7.8 10.5 10 12 7.8 13.5 10 15 7.8 16.5 10 18l-2.2 1.5H1Z" fill="#ffffff" />
  `),
  sa: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#15803d" />
    <rect x="6" y="11" width="10" height="1.1" rx=".5" fill="#ffffff" />
    <circle cx="17.2" cy="11.5" r=".7" fill="#ffffff" />
    <rect x="7" y="7.2" width="9.5" height="1" rx=".5" fill="#ffffff" />
  `),
  sg: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="9" fill="#dc2626" />
    <rect x="1" y="12" width="22" height="9" fill="#ffffff" />
    <circle cx="7.2" cy="8" r="2.2" fill="#ffffff" />
    <circle cx="8" cy="8" r="1.7" fill="#dc2626" />
    <circle cx="9.3" cy="6.8" r=".35" fill="#ffffff" />
    <circle cx="10.1" cy="7.8" r=".35" fill="#ffffff" />
    <circle cx="10.2" cy="9.1" r=".35" fill="#ffffff" />
    <circle cx="9" cy="10" r=".35" fill="#ffffff" />
    <circle cx="7.7" cy="9.6" r=".35" fill="#ffffff" />
  `),
  us: FLAG_BADGE_BASE(`
    <rect x="1" y="3" width="22" height="18" fill="#ffffff" />
    <rect x="1" y="3" width="22" height="2" fill="#dc2626" />
    <rect x="1" y="7" width="22" height="2" fill="#dc2626" />
    <rect x="1" y="11" width="22" height="2" fill="#dc2626" />
    <rect x="1" y="15" width="22" height="2" fill="#dc2626" />
    <rect x="1" y="19" width="22" height="2" fill="#dc2626" />
    <rect x="1" y="3" width="10" height="10" fill="#1d4ed8" />
    <circle cx="4" cy="6" r=".6" fill="#ffffff" />
    <circle cx="7" cy="6" r=".6" fill="#ffffff" />
    <circle cx="4" cy="9" r=".6" fill="#ffffff" />
    <circle cx="7" cy="9" r=".6" fill="#ffffff" />
  `),
}

export function getCountryFlagIcon(countryCode?: string | null): string | undefined {
  if (!countryCode) {
    return undefined
  }

  const svg = FLAG_SVGS[countryCode.toLowerCase()]
  return svg ? asDataUri(svg) : undefined
}
