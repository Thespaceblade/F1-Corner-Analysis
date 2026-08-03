'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { loadTrackSvg } from '../lib/trackSvgLoader'
import { createBrandMatcapCanvas } from '../lib/brandMatcap'
import {
  buildTrackRibbonFromSvg,
  CORNER_TYPE_COLORS,
  type CornerMarker,
} from '../lib/trackRibbonGeometry'
import LoadingIndicator from './LoadingIndicator'

export type Track3DCorner = CornerMarker

type Track3DPanelProps = {
  svgFile: string
  corners?: Track3DCorner[]
  className?: string
  /** Soft continuous yaw when the user isn't dragging. */
  autoRotate?: boolean
  autoRotateSpeed?: number
  showCorners?: boolean
  /** Compact mode for selector cards / spotlights. */
  compact?: boolean
  /** Allow drag/zoom orbit. Off in compact embeds inside links. */
  interactive?: boolean
  /**
   * `neon` = Lando-style extruded volt ribbon with real height.
   * `brand` = darker matcap asphalt with red highlight.
   */
  variant?: 'brand' | 'neon'
  onCornerHover?: (cornerNumber: number | null) => void
  onCornerClick?: (cornerNumber: number) => void
}

export default function Track3DPanel({
  svgFile,
  corners = [],
  className = '',
  autoRotate = true,
  autoRotateSpeed = 0.35,
  showCorners = true,
  compact = false,
  interactive,
  variant = 'brand',
  onCornerHover,
  onCornerClick,
}: Track3DPanelProps) {
  const canInteract = interactive ?? !compact
  const mountRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [hoveredCorner, setHoveredCorner] = useState<number | null>(null)

  const hoverCbRef = useRef(onCornerHover)
  const clickCbRef = useRef(onCornerClick)
  const hoveredRef = useRef<number | null>(null)
  hoverCbRef.current = onCornerHover
  clickCbRef.current = onCornerClick

  const cornersKey = corners
    .map((c) => `${c.number}:${c.type}:${c.x}:${c.y}`)
    .join('|')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !svgFile) return

    let disposed = false
    let raf = 0
    let renderer: THREE.WebGLRenderer | null = null
    let controls: OrbitControls | null = null
    let scene: THREE.Scene | null = null
    let camera: THREE.PerspectiveCamera | null = null
    let ribbonMesh: THREE.Mesh | null = null
    let glowMesh: THREE.Mesh | null = null
    let trackRoot: THREE.Group | null = null
    let cornerGroup: THREE.Group | null = null
    let matcapTex: THREE.CanvasTexture | null = null
    let resizeObserver: ResizeObserver | null = null
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const cornerMeshes: THREE.Mesh[] = []

    setReady(false)
    setError(null)
    hoveredRef.current = null
    setHoveredCorner(null)

    const widthOf = () => Math.max(1, mount.clientWidth)
    const heightOf = () => Math.max(1, mount.clientHeight)

    const onPointerMove = (event: PointerEvent) => {
      if (!renderer || !camera || !cornerGroup || !showCorners) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(cornerMeshes, false)
      const next =
        hits.length && hits[0].object.userData.cornerNumber != null
          ? (hits[0].object.userData.cornerNumber as number)
          : null
      if (hoveredRef.current !== next) {
        hoveredRef.current = next
        setHoveredCorner(next)
        hoverCbRef.current?.(next)
      }
      renderer.domElement.style.cursor = next != null ? 'pointer' : 'grab'
    }

    const onPointerLeave = () => {
      hoveredRef.current = null
      setHoveredCorner(null)
      hoverCbRef.current?.(null)
      if (renderer) renderer.domElement.style.cursor = 'grab'
    }

    const onClick = () => {
      const current = hoveredRef.current
      if (current != null) {
        clickCbRef.current?.(current)
        return
      }
      if (!camera) return
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(cornerMeshes, false)
      const num = hits[0]?.object.userData.cornerNumber as number | undefined
      if (num != null) clickCbRef.current?.(num)
    }

    ;(async () => {
      try {
        const svgText = await loadTrackSvg(svgFile)
        if (disposed) return

        const neon = variant === 'neon'
        const built = buildTrackRibbonFromSvg(svgText, {
          samples: compact ? (neon ? 320 : 220) : 380,
          // Slightly thinner tube — Lando reads as a glowing ribbon, not a slab.
          width: neon ? (compact ? 0.048 : 0.042) : compact ? 0.05 : 0.042,
          height: neon ? (compact ? 0.048 : 0.038) : compact ? 0.014 : 0.011,
        })
        if (!built) {
          setError('Could not build 3D track from SVG')
          setReady(true)
          return
        }

        const cornerList = corners

        scene = new THREE.Scene()
        scene.background = new THREE.Color(neon ? '#050505' : compact ? '#0a0a0a' : '#0c0c0c')
        // Soft fog so the neon fades at the edges without cropping the layout.
        scene.fog = new THREE.FogExp2(neon ? 0x050505 : 0x0a0a0a, neon ? 0.035 : 0.12)

        camera = new THREE.PerspectiveCamera(neon ? 28 : 36, widthOf() / heightOf(), 0.05, 60)
        if (!neon) {
          camera.position.set(1.55, 1.35, 1.75)
        }

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, neon && compact ? 1.5 : 2))
        renderer.setSize(widthOf(), heightOf())
        renderer.domElement.style.display = 'block'
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'
        renderer.domElement.style.cursor = 'grab'
        renderer.domElement.style.touchAction = 'none'
        mount.appendChild(renderer.domElement)

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = neon ? 0.08 : 0.06
        controls.enablePan = false
        controls.enableZoom = canInteract
        controls.enableRotate = canInteract
        controls.minDistance = neon ? 2.6 : 1.2
        controls.maxDistance = neon ? 8.5 : 4.5
        // Lower than the old high isometric, but high enough to read the layout.
        controls.maxPolarAngle = neon ? Math.PI * 0.58 : Math.PI * 0.48
        controls.minPolarAngle = neon ? Math.PI * 0.36 : Math.PI * 0.12
        controls.autoRotate = autoRotate
        controls.autoRotateSpeed = autoRotateSpeed
        controls.target.set(0, neon ? 0.05 : 0, 0)
        if (neon) {
          // ~35° look-down, pulled back so elongated circuits stay in frame.
          camera.position.set(3.55, 1.28, 3.85)
          controls.update()
        }
        renderer.domElement.style.cursor = canInteract ? 'grab' : 'inherit'
        renderer.domElement.style.pointerEvents = canInteract ? 'auto' : 'none'

        let material: THREE.Material
        if (neon) {
          material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ff4a3c'),
            emissive: new THREE.Color('#e10600'),
            emissiveIntensity: 0.95,
            metalness: 0.06,
            roughness: 0.24,
            transparent: true,
            opacity: 0.72,
            flatShading: false,
            depthWrite: false,
          })
          scene.add(new THREE.AmbientLight(0xffffff, 0.2))
          const key = new THREE.DirectionalLight(0xffd2cc, 0.65)
          key.position.set(2.8, 1.8, 1.6)
          scene.add(key)
          const fill = new THREE.PointLight(0xe10600, 2.05, 10, 2)
          fill.position.set(0, 0.45, 0.15)
          scene.add(fill)
          const rim = new THREE.PointLight(0xffffff, 0.2, 9, 2)
          rim.position.set(-2.2, 0.7, -2)
          scene.add(rim)
        } else {
          const canvas = createBrandMatcapCanvas({
            size: 256,
            base: '#2a2a30',
            mid: '#6b6b75',
            highlight: '#f5f2ea',
            accent: '#e10600',
          })
          matcapTex = new THREE.CanvasTexture(canvas)
          matcapTex.colorSpace = THREE.SRGBColorSpace
          matcapTex.needsUpdate = true
          material = new THREE.MeshMatcapMaterial({
            matcap: matcapTex,
            color: new THREE.Color('#ffffff'),
            flatShading: false,
          })
        }

        trackRoot = new THREE.Group()
        // Extra margin so elongated circuits (Spa, Jeddah, etc.) don't clip.
        if (neon) trackRoot.scale.setScalar(0.62)
        scene.add(trackRoot)

        ribbonMesh = new THREE.Mesh(built.geometry, material)
        trackRoot.add(ribbonMesh)

        if (neon) {
          // Soft outer shell — the translucent neon halo on Lando's visualiser.
          glowMesh = new THREE.Mesh(
            built.geometry,
            new THREE.MeshBasicMaterial({
              color: new THREE.Color('#ff1a0a'),
              transparent: true,
              opacity: 0.28,
              depthWrite: false,
              side: THREE.BackSide,
            }),
          )
          glowMesh.scale.setScalar(1.22)
          trackRoot.add(glowMesh)
        }

        // Soft ground disc for depth.
        const ground = new THREE.Mesh(
          new THREE.CircleGeometry(neon ? 2.4 : 1.8, 48),
          new THREE.MeshBasicMaterial({
            color: neon ? 0x030303 : 0x080808,
            transparent: true,
            opacity: neon ? 0.45 : 0.55,
            depthWrite: false,
          }),
        )
        ground.rotation.x = -Math.PI / 2
        ground.position.y = neon ? -0.05 : -0.04
        scene.add(ground)

        cornerGroup = new THREE.Group()
        ;(neon && trackRoot ? trackRoot : scene).add(cornerGroup)

        if (showCorners && cornerList.length) {
          const seen = new Set<number>()
          for (const corner of cornerList) {
            if (seen.has(corner.number)) continue
            seen.add(corner.number)

            const pos = built.svgToLocal(corner.x, corner.y)
            const color = CORNER_TYPE_COLORS[corner.type] ?? '#e10600'
            const marker = new THREE.Mesh(
              new THREE.SphereGeometry(compact ? 0.028 : 0.024, 16, 16),
              new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.35,
                roughness: 0.35,
                metalness: 0.15,
              }),
            )
            marker.position.copy(pos)
            marker.userData.cornerNumber = corner.number
            marker.userData.baseScale = 1
            cornerGroup.add(marker)
            cornerMeshes.push(marker)

            if (!compact) {
              const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.032, 0.04, 24),
                new THREE.MeshBasicMaterial({
                  color,
                  transparent: true,
                  opacity: 0.55,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                }),
              )
              ring.rotation.x = -Math.PI / 2
              ring.position.copy(pos)
              ring.position.y = 0.002
              ring.userData.cornerNumber = corner.number
              cornerGroup.add(ring)
            }
          }

          // Minimal fill light so emissive spheres read clearly with matcap ribbon.
          scene.add(new THREE.AmbientLight(0xffffff, 0.55))
          const key = new THREE.DirectionalLight(0xffffff, 0.45)
          key.position.set(2, 4, 1)
          scene.add(key)
        }

        if (canInteract) {
          renderer.domElement.addEventListener('pointermove', onPointerMove)
          renderer.domElement.addEventListener('pointerleave', onPointerLeave)
          renderer.domElement.addEventListener('click', onClick)
        }

        const fit = () => {
          if (!renderer || !camera) return
          const w = widthOf()
          const h = heightOf()
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        fit()
        resizeObserver = new ResizeObserver(fit)
        resizeObserver.observe(mount)

        const clock = new THREE.Clock()
        const animate = () => {
          if (disposed || !renderer || !scene || !camera || !controls) return
          raf = requestAnimationFrame(animate)
          const t = clock.getElapsedTime()
          const hotCorner = hoveredRef.current

          for (const mesh of cornerMeshes) {
            const num = mesh.userData.cornerNumber as number
            const hot = hotCorner === num
            const s = hot ? 1.35 + Math.sin(t * 6) * 0.08 : 1
            mesh.scale.setScalar(s)
            const mat = mesh.material as THREE.MeshStandardMaterial
            if (mat.emissiveIntensity != null) {
              mat.emissiveIntensity = hot ? 0.85 : 0.35
            }
          }

          // Lando-like breathing glow + gentle hover.
          if (neon && ribbonMesh) {
            const ribbonMat = ribbonMesh.material as THREE.MeshStandardMaterial
            if (ribbonMat.emissiveIntensity != null) {
              ribbonMat.emissiveIntensity = 0.78 + Math.sin(t * 1.05) * 0.18
            }
            if (ribbonMat.opacity != null) {
              ribbonMat.opacity = 0.64 + Math.sin(t * 0.85) * 0.1
            }
            if (glowMesh) {
              const glowMat = glowMesh.material as THREE.MeshBasicMaterial
              glowMat.opacity = 0.16 + Math.sin(t * 1.05) * 0.08
            }
            if (trackRoot) {
              trackRoot.position.y = Math.sin(t * 0.7) * 0.016
            }
          }

          controls.update()
          renderer.render(scene, camera)
        }
        animate()
        setReady(true)
      } catch (err) {
        if (disposed) return
        const message = err instanceof Error ? err.message : String(err)
        setError(`Failed to load 3D track: ${message}`)
        setReady(true)
      }
    })()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      if (renderer) {
        if (canInteract) {
          renderer.domElement.removeEventListener('pointermove', onPointerMove)
          renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
          renderer.domElement.removeEventListener('click', onClick)
        }
        renderer.dispose()
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement)
        }
      }
      controls?.dispose()
      ribbonMesh?.geometry.dispose()
      if (ribbonMesh?.material && !Array.isArray(ribbonMesh.material)) {
        ribbonMesh.material.dispose()
      }
      if (glowMesh?.material && !Array.isArray(glowMesh.material)) {
        glowMesh.material.dispose()
      }
      matcapTex?.dispose()
      cornerMeshes.forEach((m) => {
        m.geometry.dispose()
        if (!Array.isArray(m.material)) m.material.dispose()
      })
      scene?.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj !== ribbonMesh && obj !== glowMesh && !cornerMeshes.includes(obj)) {
            obj.geometry?.dispose()
            if (obj.material && !Array.isArray(obj.material)) obj.material.dispose()
          }
        }
      })
    }
  }, [svgFile, autoRotate, autoRotateSpeed, showCorners, compact, canInteract, cornersKey, variant])

  return (
    <div
      className={`track-3d-panel ${compact ? 'is-compact' : ''} ${variant === 'neon' ? 'is-neon' : ''} ${className}`.trim()}
    >
                      {!compact && (
        <div className="track-3d-panel-meta">
          <span className="track-3d-panel-label">3D circuit</span>
          {canInteract && (
            <span className="track-3d-panel-hint">Drag to orbit · scroll to zoom</span>
          )}
        </div>
      )}

      <div
        ref={mountRef}
        className="track-3d-canvas-host"
        role="img"
        aria-label={`3D view of ${svgFile.replace(/\.svg$/i, '')} circuit`}
      />

      {!ready && (
        <LoadingIndicator
          label="Building 3D circuit..."
          className="track-3d-loading"
        />
      )}

      {error && (
        <div className="track-3d-error" role="alert">
          {error}
        </div>
      )}

      {ready && !error && !compact && hoveredCorner != null && (
        <div className="track-3d-hover-chip">Corner {hoveredCorner}</div>
      )}
    </div>
  )
}
