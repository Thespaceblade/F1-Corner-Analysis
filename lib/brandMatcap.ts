/**
 * Procedural brand matcap — dark asphalt with a soft F1-red highlight.
 * Generated at runtime so we never ship third-party matcap assets.
 */

export type BrandMatcapOptions = {
  size?: number
  base?: string
  mid?: string
  highlight?: string
  accent?: string
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

export function createBrandMatcapCanvas(options: BrandMatcapOptions = {}): HTMLCanvasElement {
  const size = options.size ?? 256
  const base = parseHex(options.base ?? '#1a1a1c')
  const mid = parseHex(options.mid ?? '#3a3a40')
  const highlight = parseHex(options.highlight ?? '#d4d0c8')
  const accent = parseHex(options.accent ?? '#e10600')

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const img = ctx.createImageData(size, size)
  const data = img.data
  const cx = size * 0.42
  const cy = size * 0.38
  const r = size * 0.62

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - cx) / r
      const dy = (y - cy) / r
      const d = Math.sqrt(dx * dx + dy * dy)
      const nd = Math.min(1, d)

      // Sphere-like falloff for matcap lighting.
      const lit = Math.pow(1 - nd, 1.35)
      let rgb = mix(base, mid, lit * 0.85)
      rgb = mix(rgb, highlight, Math.pow(Math.max(0, lit - 0.55) / 0.45, 1.6) * 0.9)

      // Soft brand accent in the upper-right rim.
      const ax = (x - size * 0.68) / (size * 0.28)
      const ay = (y - size * 0.28) / (size * 0.28)
      const accentW = Math.exp(-(ax * ax + ay * ay) * 2.2) * 0.35 * (1 - nd * 0.4)
      rgb = mix(rgb, accent, accentW)

      const i = (y * size + x) * 4
      data[i] = rgb[0]
      data[i + 1] = rgb[1]
      data[i + 2] = rgb[2]
      data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  return canvas
}
