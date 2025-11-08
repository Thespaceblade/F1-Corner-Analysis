# Corner Performance SVG Visualization - Implementation Plan

## Goal
Display corner performance metrics (speed, time lost/gained, etc.) directly on track SVG with numbered corners and interactive tooltips.

## Current State Analysis

### What We Have
- ✅ Track SVGs with viewBox coordinates
- ✅ Corner detection with corner numbers
- ✅ Corner performance data (speeds, times)
- ✅ Track corner definitions in `tracks.json` (but no x/y coordinates)

### What We Need
- ❌ Corner coordinates (x, y) on SVG for positioning
- ❌ Performance overlay component
- ❌ Interactive tooltips
- ❌ Time delta calculations

## Solution Approach

### Option 1: Manual Coordinate Entry (Recommended for Accuracy)
**Process**:
1. Open SVG in editor (Inkscape, Figma, etc.)
2. Identify corner positions visually
3. Add x/y coordinates to `tracks.json`
4. Use coordinates to position performance overlays

**Pros**:
- Accurate positioning
- Full control over placement
- Works for all tracks

**Cons**:
- Manual work for 24 tracks
- Time-consuming

### Option 2: Distance-Based Positioning (Automated)
**Process**:
1. Use corner distance data (apexDistance from telemetry)
2. Map distance to SVG path coordinates
3. Calculate position along track path
4. Position markers automatically

**Pros**:
- Automated
- Works immediately
- No manual work

**Cons**:
- Requires SVG path parsing
- May be less accurate
- Complex implementation

### Option 3: Hybrid Approach (Recommended)
**Process**:
1. Use distance-based positioning as starting point
2. Allow manual adjustment/override
3. Store coordinates in `tracks.json`
4. Fallback to distance-based if no coordinates

**Pros**:
- Best of both worlds
- Automated with manual refinement
- Flexible

**Cons**:
- More complex implementation

## Recommended Implementation: Option 3 (Hybrid)

### Phase 1: Distance-Based Corner Positioning

**Algorithm**:
1. Parse SVG path to get track coordinates
2. Calculate total track length from path
3. Map corner distances to path positions
4. Interpolate x/y coordinates along path

**Implementation**:
```typescript
function calculateCornerPositions(
  svgPath: string,
  cornerDistances: number[],
  totalTrackLength: number
): Array<{x: number, y: number}> {
  // Parse SVG path
  // Calculate positions along path
  // Return x/y coordinates
}
```

### Phase 2: Performance Overlay Component

**Component**: `CornerPerformanceOverlay.tsx`

**Features**:
- Render corner markers with performance data
- Show speed/time on hover
- Display time deltas
- Color code by performance

**Props**:
```typescript
type CornerPerformanceOverlayProps = {
  corners: Corner[]  // With x, y coordinates
  cornerPerformance: Record<number, CornerPerformance>
  viewBox: {minX: number, minY: number, w: number, h: number}
  selectedDrivers?: string[]
  onCornerHover?: (cornerNumber: number) => void
  onCornerClick?: (cornerNumber: number) => void
}
```

### Phase 3: Interactive Tooltips

**Tooltip Content**:
- Corner number and type
- Average speeds (entry/apex/exit)
- Average corner time
- Time delta vs best
- Driver breakdown (if multiple drivers)
- Best time and lap number

**Visual Design**:
- Positioned near corner marker
- Dark background with border
- Color-coded by performance
- Arrow pointing to corner

### Phase 4: Time Delta Visualization

**Display Options**:
1. **Badge on Corner**: Small badge showing +/- time
2. **Color Coding**: Border color indicates performance
3. **Size Variation**: Larger circles for slower corners
4. **Heat Map**: Color track segment by performance

## Data Flow

```
Session Data
    ↓
Aggregate Corner Performance
    ↓
Calculate Corner Positions (distance-based or from tracks.json)
    ↓
Render SVG Overlay
    ↓
Display Performance Metrics
    ↓
Interactive Tooltips
```

## Implementation Steps

### Step 1: Calculate Corner Positions from Distance

**File**: `lib/cornerPositionCalculator.ts`

**Function**: Calculate x/y coordinates from distance data

```typescript
export function calculateCornerPositionsFromDistance(
  svgPath: string,
  cornerDistances: number[],
  trackLength: number
): Array<{x: number, y: number, distance: number}>
```

### Step 2: Update tracks.json Structure

**Add coordinate data**:
```json
{
  "corners": [
    {
      "number": 1,
      "type": "fast",
      "x": 254,
      "y": 522,
      "expectedDistanceRange": {
        "min": 253.0,
        "max": 415.0
      },
      "distance": 359.7  // For validation
    }
  ]
}
```

### Step 3: Create Performance Overlay Component

**File**: `components/CornerPerformanceOverlay.tsx`

**Features**:
- Render corner markers
- Show performance indicators
- Handle hover/click events
- Display tooltips

### Step 4: Integrate into TrackPanel

**Update TrackPanel**:
- Accept corner performance data
- Render performance overlay
- Handle interactions
- Show tooltips

### Step 5: Update ClientPage

**Pass data to TrackPanel**:
- Aggregate corner performance
- Calculate corner positions
- Pass to TrackPanel component

## Visual Design

### Corner Marker Enhancement

**Current**:
```
[Circle with number]
```

**Enhanced**:
```
[Circle with number]
  ↓
[Performance Ring] (color by delta)
  ↓
[Time Badge] (+/- 0.12s)
  ↓
[Hover Tooltip]
```

### Color Coding

**Time Delta**:
- Green: Faster than average (negative delta)
- Yellow: Average (near zero delta)
- Red: Slower than average (positive delta)

**Intensity**:
- Darker = Larger delta
- Lighter = Smaller delta

### Tooltip Design

```
┌─────────────────────────────┐
│ Corner 1 (Fast)             │
├─────────────────────────────┤
│ Avg Speed: 180.3 km/h       │
│   Entry: 245.2 km/h         │
│   Apex:  180.3 km/h         │
│   Exit:  195.1 km/h         │
│                             │
│ Avg Time: 2.45s             │
│ Best Time: 2.33s            │
│ Delta: -0.12s (faster)      │
│                             │
│ Drivers:                    │
│   VER: 2.45s (+0.12s)       │
│   NOR: 2.33s (best)         │
└─────────────────────────────┘
```

## File Structure

### New Files
- `lib/cornerPositionCalculator.ts` - Calculate positions from distance
- `components/CornerPerformanceOverlay.tsx` - Performance overlay component
- `components/CornerTooltip.tsx` - Tooltip component
- `lib/cornerPerformanceAggregator.ts` - Data aggregation (already created)

### Modified Files
- `components/TrackPanel.tsx` - Add performance overlay
- `components/ClientPage.tsx` - Pass performance data
- `public/data/tracks.json` - Add corner coordinates

## Quick Start: Manual Coordinate Entry

For immediate results, we can manually add coordinates for Australia:

1. Open `australia.svg` in a graphics editor
2. Identify corner positions visually
3. Get x/y coordinates
4. Add to `tracks.json`

**Example**:
```json
{
  "corners": [
    {
      "number": 1,
      "type": "fast",
      "x": 254,
      "y": 522,
      "expectedDistanceRange": {"min": 253.0, "max": 415.0}
    }
  ]
}
```

## Next Steps

1. ✅ Create aggregation function (done)
2. ⏳ Create position calculator
3. ⏳ Create performance overlay component
4. ⏳ Add manual coordinates for Australia
5. ⏳ Test visualization
6. ⏳ Add tooltips
7. ⏳ Add interactivity

## Alternative: Simple Distance-Based Approach

If manual coordinates are too time-consuming, we can:
1. Use corner distance data
2. Map to approximate positions on SVG
3. Display performance data
4. Allow manual adjustment later

This gives us a working solution quickly, with the option to refine later.

