#!/usr/bin/env ts-node
/**
 * Validation script for corner coordinates
 * 
 * This script validates that:
 * 1. All corner coordinates are within the SVG viewBox bounds
 * 2. All tracks have corner data
 * 3. Corner coordinates are valid numbers
 * 4. Corner numbers are sequential
 * 
 * Usage: npx ts-node scripts/validate_corner_coordinates.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface Corner {
  number: number
  type: 'slow' | 'medium' | 'fast'
  x: number
  y: number
  expectedDistanceRange?: {
    min: number
    max: number
  }
}

interface Track {
  id: string
  name: string
  svgFile: string
  corners: Corner[]
  coordinates?: {
    latitude: number
    longitude: number
  }
  city?: string
  country?: string
}

interface TracksData {
  tracks: {
    [key: string]: Track
  }
}

interface ViewBox {
  minX: number
  minY: number
  w: number
  h: number
}

interface ValidationResult {
  track: string
  trackName: string
  isValid: boolean
  errors: string[]
  warnings: string[]
  cornerCount: number
  cornersOutOfBounds: number
  viewBox?: ViewBox
}

/**
 * Extract viewBox from SVG file
 */
function extractViewBox(svgContent: string): ViewBox | null {
  const vbMatch = svgContent.match(/viewBox\s*=\s*"([^"]+)"/) || svgContent.match(/viewBox\s*=\s*'([^']+)'/)
  if (!vbMatch || !vbMatch[1]) {
    return null
  }

  const parts = vbMatch[1].trim().split(/\s+/).map(Number)
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p))) {
    return null
  }

  return {
    minX: parts[0],
    minY: parts[1],
    w: parts[2],
    h: parts[3],
  }
}

/**
 * Load SVG file and extract viewBox
 */
async function loadSvgViewBox(svgFile: string): Promise<ViewBox | null> {
  const svgPath = path.join(__dirname, '..', 'public', 'Tracks', svgFile)
  
  if (!fs.existsSync(svgPath)) {
    console.warn(`SVG file not found: ${svgPath}`)
    return null
  }

  try {
    const svgContent = fs.readFileSync(svgPath, 'utf-8')
    return extractViewBox(svgContent)
  } catch (error) {
    console.error(`Error reading SVG file ${svgFile}:`, error)
    return null
  }
}

/**
 * Validate corner coordinates against viewBox
 */
function validateCornerCoordinates(
  corners: Corner[],
  viewBox: ViewBox | null
): { errors: string[]; warnings: string[]; outOfBounds: number } {
  const errors: string[] = []
  const warnings: string[] = []
  let outOfBounds = 0

  if (!viewBox) {
    errors.push('ViewBox not available for validation')
    return { errors, warnings, outOfBounds }
  }

  // Check if corners are within bounds
  for (const corner of corners) {
    const { x, y, number } = corner

    // Check if coordinates are valid numbers
    if (typeof x !== 'number' || Number.isNaN(x)) {
      errors.push(`Corner ${number}: Invalid x coordinate (${x})`)
    }
    if (typeof y !== 'number' || Number.isNaN(y)) {
      errors.push(`Corner ${number}: Invalid y coordinate (${y})`)
    }

    // Check if coordinates are within viewBox bounds
    const maxX = viewBox.minX + viewBox.w
    const maxY = viewBox.minY + viewBox.h

    if (x < viewBox.minX || x > maxX) {
      errors.push(
        `Corner ${number}: x coordinate (${x}) is out of bounds [${viewBox.minX}, ${maxX}]`
      )
      outOfBounds++
    } else if (x < viewBox.minX + viewBox.w * 0.05 || x > maxX - viewBox.w * 0.05) {
      warnings.push(
        `Corner ${number}: x coordinate (${x}) is near the edge of viewBox`
      )
    }

    if (y < viewBox.minY || y > maxY) {
      errors.push(
        `Corner ${number}: y coordinate (${y}) is out of bounds [${viewBox.minY}, ${maxY}]`
      )
      outOfBounds++
    } else if (y < viewBox.minY + viewBox.h * 0.05 || y > maxY - viewBox.h * 0.05) {
      warnings.push(
        `Corner ${number}: y coordinate (${y}) is near the edge of viewBox`
      )
    }
  }

  // Check if corner numbers are sequential
  const cornerNumbers = corners.map(c => c.number).sort((a, b) => a - b)
  for (let i = 0; i < cornerNumbers.length; i++) {
    if (cornerNumbers[i] !== i + 1) {
      warnings.push(
        `Corner numbers are not sequential. Expected ${i + 1}, found ${cornerNumbers[i]}`
      )
      break
    }
  }

  return { errors, warnings, outOfBounds }
}

/**
 * Validate a single track
 */
async function validateTrack(trackId: string, track: Track): Promise<ValidationResult> {
  const result: ValidationResult = {
    track: trackId,
    trackName: track.name,
    isValid: true,
    errors: [],
    warnings: [],
    cornerCount: track.corners.length,
    cornersOutOfBounds: 0,
  }

  // Check if track has corners
  if (!track.corners || track.corners.length === 0) {
    result.errors.push('Track has no corners defined')
    result.isValid = false
    return result
  }

  // Load SVG and get viewBox
  const viewBox = await loadSvgViewBox(track.svgFile)
  result.viewBox = viewBox || undefined

  // Validate corner coordinates
  const validation = validateCornerCoordinates(track.corners, viewBox)
  result.errors.push(...validation.errors)
  result.warnings.push(...validation.warnings)
  result.cornersOutOfBounds = validation.outOfBounds

  if (validation.errors.length > 0) {
    result.isValid = false
  }

  return result
}

/**
 * Main validation function
 */
async function main() {
  const tracksJsonPath = path.join(__dirname, '..', 'public', 'data', 'tracks.json')
  
  if (!fs.existsSync(tracksJsonPath)) {
    console.error(`Tracks JSON file not found: ${tracksJsonPath}`)
    process.exit(1)
  }

  const tracksData: TracksData = JSON.parse(fs.readFileSync(tracksJsonPath, 'utf-8'))
  const tracks = tracksData.tracks

  console.log('=' .repeat(80))
  console.log('Corner Coordinate Validation')
  console.log('=' .repeat(80))
  console.log(`\nValidating ${Object.keys(tracks).length} tracks...\n`)

  const results: ValidationResult[] = []

  // Validate each track
  for (const [trackId, track] of Object.entries(tracks)) {
    const result = await validateTrack(trackId, track)
    results.push(result)
  }

  // Print results
  let totalErrors = 0
  let totalWarnings = 0
  let tracksWithErrors = 0

  for (const result of results) {
    if (result.errors.length > 0) {
      tracksWithErrors++
      totalErrors += result.errors.length
    }
    totalWarnings += result.warnings.length

    console.log(`\n${'─'.repeat(80)}`)
    console.log(`Track: ${result.trackName} (${result.track})`)
    console.log(`Corners: ${result.cornerCount}`)
    if (result.viewBox) {
      console.log(
        `ViewBox: ${result.viewBox.minX} ${result.viewBox.minY} ${result.viewBox.w} ${result.viewBox.h}`
      )
    } else {
      console.log('ViewBox: Not available')
    }

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors (${result.errors.length}):`)
      for (const error of result.errors) {
        console.log(`   • ${error}`)
      }
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${result.warnings.length}):`)
      for (const warning of result.warnings) {
        console.log(`   • ${warning}`)
      }
    }

    if (result.isValid && result.warnings.length === 0) {
      console.log('\n✅ All checks passed')
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`)
  console.log('Summary')
  console.log('='.repeat(80))
  console.log(`Total tracks: ${results.length}`)
  console.log(`Tracks with errors: ${tracksWithErrors}`)
  console.log(`Total errors: ${totalErrors}`)
  console.log(`Total warnings: ${totalWarnings}`)
  console.log(`Tracks with out-of-bounds corners: ${results.filter(r => r.cornersOutOfBounds > 0).length}`)

  // Focus on corners 12-14 for Australia track
  const australiaResult = results.find(r => r.track === 'australia')
  if (australiaResult) {
    console.log(`\n${'─'.repeat(80)}`)
    console.log('Australia Track - Corners 12-14 Details:')
    const australiaTrack = tracks['australia']
    const corners12to14 = australiaTrack.corners.filter(c => c.number >= 12 && c.number <= 14)
    for (const corner of corners12to14) {
      console.log(`  Corner ${corner.number}: (${corner.x}, ${corner.y})`)
      if (australiaResult.viewBox) {
        const vb = australiaResult.viewBox
        const maxX = vb.minX + vb.w
        const maxY = vb.minY + vb.h
        const inBounds = corner.x >= vb.minX && corner.x <= maxX && corner.y >= vb.minY && corner.y <= maxY
        console.log(`    In bounds: ${inBounds ? '✅' : '❌'}`)
      }
    }
  }

  // Exit with error code if there are validation errors
  if (totalErrors > 0) {
    console.log(`\n❌ Validation failed with ${totalErrors} error(s)`)
    process.exit(1)
  } else {
    console.log(`\n✅ Validation passed`)
    process.exit(0)
  }
}

// Run validation
main().catch(error => {
  console.error('Validation error:', error)
  process.exit(1)
})





