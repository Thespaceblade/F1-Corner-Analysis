export type LapGeometry = {
  viewBox: string
  lapD: string
  start: { x: number; y: number } | null
}

/**
 * Pull the thick asphalt segments (stroke #374151) out of a track SVG and
 * concatenate them into one continuous lap path.
 */
export function parseLapGeometry(raw: string): LapGeometry {
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 620 700'
  const pathTags = raw.match(/<path\b[^>]*>/g) ?? []
  const segments: string[] = []

  for (const tag of pathTags) {
    const stroke = tag.match(/\bstroke="([^"]+)"/)?.[1]?.toLowerCase()
    const d = tag.match(/\bd="([^"]+)"/)?.[1]
    if (d && stroke === '#374151') {
      segments.push(d.trim())
    }
  }

  const lapD = segments.join(' ')
  const startMatch = segments[0]?.match(/M\s*([\d.]+)[ ,]+([\d.]+)/)
  const start = startMatch
    ? { x: Number(startMatch[1]), y: Number(startMatch[2]) }
    : null

  return { viewBox, lapD, start }
}
