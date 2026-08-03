import * as THREE from 'three'

export type SvgViewBox = {
  minX: number
  minY: number
  width: number
  height: number
}

export type RibbonBuildResult = {
  geometry: THREE.BufferGeometry
  viewBox: SvgViewBox
  /** Maps SVG (x, y) → local 3D (x, y, z) using the same frame as the ribbon. */
  svgToLocal: (svgX: number, svgY: number) => THREE.Vector3
  bounds: { size: number; center: THREE.Vector3 }
}

export type CornerMarker = {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
}

const ASPHALT_STROKE = '#374151'

/**
 * Extract asphalt centerline path data from a track SVG (same source as HeroTrackStage).
 */
export function extractAsphaltPathD(svgText: string): { pathD: string; viewBox: SvgViewBox } {
  const vbMatch = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i)
  const parts = (vbMatch?.[1] ?? '0 0 700 700').trim().split(/\s+/).map(Number)
  const viewBox: SvgViewBox = {
    minX: parts[0] || 0,
    minY: parts[1] || 0,
    width: parts[2] || 700,
    height: parts[3] || 700,
  }

  const pathTags = svgText.match(/<path\b[^>]*>/gi) ?? []
  const segments: string[] = []

  for (const tag of pathTags) {
    const stroke = tag.match(/\bstroke\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const d = tag.match(/\bd\s*=\s*["']([^"']+)["']/i)?.[1]
    if (d && stroke === ASPHALT_STROKE) {
      segments.push(d.trim())
    }
  }

  // Fallback: longest path if asphalt stroke isn't found.
  if (!segments.length) {
    let best = ''
    for (const tag of pathTags) {
      const d = tag.match(/\bd\s*=\s*["']([^"']+)["']/i)?.[1] ?? ''
      if (d.length > best.length) best = d
    }
    if (best) segments.push(best)
  }

  return { pathD: segments.join(' '), viewBox }
}

function sampleSvgPathSegments(pathD: string, samplesPerUnit = 0.55): THREE.Vector2[][] {
  if (typeof document === 'undefined' || !pathD) return []

  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.style.cssText = 'position:absolute;left:-99999px;top:-99999px;width:0;height:0;overflow:hidden'
  document.body.appendChild(svg)

  // Split on moveto commands so each asphalt sector is sampled independently.
  const rawSegments = pathD
    .split(/(?=[Mm])/)
    .map((s) => s.trim())
    .filter(Boolean)

  const segments: THREE.Vector2[][] = []

  try {
    for (const segD of rawSegments) {
      const path = document.createElementNS(ns, 'path')
      path.setAttribute('d', segD)
      svg.appendChild(path)

      let total = 0
      try {
        total = path.getTotalLength()
      } catch {
        continue
      }
      if (!total || !Number.isFinite(total)) continue

      const count = Math.max(12, Math.round(total * samplesPerUnit))
      const points: THREE.Vector2[] = []
      for (let i = 0; i <= count; i++) {
        const pt = path.getPointAtLength((i / count) * total)
        points.push(new THREE.Vector2(pt.x, pt.y))
      }
      if (points.length >= 2) segments.push(points)
    }
  } finally {
    document.body.removeChild(svg)
  }

  return segments
}

function buildRibbonGeometry(
  centerline: THREE.Vector3[],
  halfWidth: number,
  halfHeight: number,
  closed = false,
): THREE.BufferGeometry {
  const n = centerline.length
  if (n < 2) return new THREE.BufferGeometry()

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const up = new THREE.Vector3(0, 1, 0)
  const tangents: THREE.Vector3[] = []

  for (let i = 0; i < n; i++) {
    const prev = centerline[closed ? (i - 1 + n) % n : Math.max(0, i - 1)]
    const next = centerline[closed ? (i + 1) % n : Math.min(n - 1, i + 1)]
    const t = next.clone().sub(prev)
    if (t.lengthSq() < 1e-10) t.set(1, 0, 0)
    else t.normalize()
    tangents.push(t)
  }

  for (let i = 0; i < n; i++) {
    const p = centerline[i]
    const tangent = tangents[i]
    let side = new THREE.Vector3().crossVectors(up, tangent)
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0)
    side.normalize()

    const u = n === 1 ? 0 : i / (n - 1)
    const lt = p.clone().addScaledVector(side, halfWidth).addScaledVector(up, halfHeight)
    const rt = p.clone().addScaledVector(side, -halfWidth).addScaledVector(up, halfHeight)
    const rb = p.clone().addScaledVector(side, -halfWidth).addScaledVector(up, -halfHeight)
    const lb = p.clone().addScaledVector(side, halfWidth).addScaledVector(up, -halfHeight)

    const ring = [lt, rt, rb, lb]
    const ringNormals = [
      up.clone().add(side).normalize(),
      up.clone().add(side.clone().negate()).normalize(),
      up.clone().negate().add(side.clone().negate()).normalize(),
      up.clone().negate().add(side).normalize(),
    ]

    for (let v = 0; v < 4; v++) {
      positions.push(ring[v].x, ring[v].y, ring[v].z)
      normals.push(ringNormals[v].x, ringNormals[v].y, ringNormals[v].z)
      uvs.push(u, v / 3)
    }
  }

  const segCount = closed ? n : n - 1
  for (let i = 0; i < segCount; i++) {
    const a = i * 4
    const b = ((i + 1) % n) * 4
    indices.push(a, b, a + 1, a + 1, b, b + 1)
    indices.push(a + 1, b + 1, a + 2, a + 2, b + 1, b + 2)
    indices.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3)
    indices.push(a + 3, b + 3, a, a, b + 3, b)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Build a low-poly extruded ribbon from a track SVG string.
 */
export function buildTrackRibbonFromSvg(
  svgText: string,
  options?: { samples?: number; width?: number; height?: number },
): RibbonBuildResult | null {
  const { pathD, viewBox } = extractAsphaltPathD(svgText)
  if (!pathD) return null

  // samples option ≈ total samples across the whole circuit.
  const density = (options?.samples ?? 360) / 700
  const svgSegments = sampleSvgPathSegments(pathD, Math.max(0.25, density))
  if (!svgSegments.length) return null

  const allSvgPoints = svgSegments.flat()
  const centerWorld = new THREE.Vector3()
  const tmp = allSvgPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
  const box = new THREE.Box3().setFromPoints(tmp)
  box.getCenter(centerWorld)
  const size = Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).z, 1)

  const halfWidth = options?.width ?? 0.045
  const halfHeight = options?.height ?? 0.012
  const geometries: THREE.BufferGeometry[] = []

  for (const seg of svgSegments) {
    const centerline = seg.map((p) => {
      const v = new THREE.Vector3(p.x, 0, p.y)
      v.sub(centerWorld)
      v.multiplyScalar(2 / size)
      return v
    })
    const first = centerline[0]
    const last = centerline[centerline.length - 1]
    const closed = first.distanceTo(last) < 0.05
    geometries.push(buildRibbonGeometry(centerline, halfWidth, halfHeight, closed))
  }

  // Merge sector ribbons into one BufferGeometry for a single draw call.
  const geometry =
    geometries.length === 1
      ? geometries[0]
      : (() => {
          const merged = mergeBufferGeometries(geometries)
          geometries.forEach((g) => g.dispose())
          return merged ?? geometries[0]
        })()

  const svgToLocal = (svgX: number, svgY: number) => {
    const v = new THREE.Vector3(svgX, 0, svgY)
    v.sub(centerWorld)
    v.multiplyScalar(2 / size)
    v.y = halfHeight + 0.02
    return v
  }

  return {
    geometry,
    viewBox,
    svgToLocal,
    bounds: { size: 2, center: new THREE.Vector3() },
  }
}

function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (!geometries.length) return null
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  let indexOffset = 0

  for (const g of geometries) {
    const pos = g.getAttribute('position') as THREE.BufferAttribute
    const nor = g.getAttribute('normal') as THREE.BufferAttribute | null
    const uv = g.getAttribute('uv') as THREE.BufferAttribute | null
    const idx = g.getIndex()

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      if (nor) normals.push(nor.getX(i), nor.getY(i), nor.getZ(i))
      else normals.push(0, 1, 0)
      if (uv) uvs.push(uv.getX(i), uv.getY(i))
      else uvs.push(0, 0)
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + indexOffset)
    } else {
      for (let i = 0; i < pos.count; i++) indices.push(i + indexOffset)
    }
    indexOffset += pos.count
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  merged.setIndex(indices)
  merged.computeVertexNormals()
  return merged
}

export const CORNER_TYPE_COLORS: Record<CornerMarker['type'], string> = {
  slow: '#ef4444',
  medium: '#fbbf24',
  fast: '#3b82f6',
}
