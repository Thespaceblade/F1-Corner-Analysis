# Corner Performance SVG Overlay - Implementation Plan

## Goal
Display corner performance metrics (speed, time lost/gained, etc.) directly on the track SVG with numbered corners and interactive tooltips.

## Current State

### TrackPanel Component
- Displays track SVG
- Shows corner markers with numbers and types
- Receives `corners` prop with `x`, `y`, `number`, `type`
- No performance data display

### Available Data
- Session data has `corners` field: `Record<string, CornerMetrics[]>`
- CornerMetrics includes: `cornerNumber`, `apexSpeed`, `cornerTime`, `entrySpeed`, `exitSpeed`, etc.
- Track corner definitions in `tracks.json` with `x`, `y` coordinates

## Implementation Approach

### Option 1: Enhanced TrackPanel with Performance Overlay (Recommended)

**Components**:
1. **TrackPanel** - Enhanced to accept corner performance data
2. **CornerPerformanceOverlay** - SVG overlay showing metrics
3. **CornerTooltip** - Interactive tooltip on hover/click

**Data Flow**:
```
Session Data (corners: Record<string, CornerMetrics[]>)
    ↓
Aggregate by corner number
    ↓
Calculate averages, deltas, best times
    ↓
Pass to TrackPanel
    ↓
Render on SVG overlay
```

### Option 2: Separate Performance Panel

**Components**:
1. **TrackPanel** - Keep as is (just markers)
2. **CornerPerformancePanel** - Side panel with detailed metrics
3. **Interactive linking** - Click corner on SVG highlights in panel

## Recommended Implementation (Option 1)

### Step 1: Update TrackPanel Props

```typescript
type CornerPerformance = {
  cornerNumber: number
  avgSpeed: number
  avgTime: number
  bestTime: number
  timeDelta?: number  // Time lost/gained vs best
  driverCount: number
  speeds: {
    entry: number
    apex: number
    exit: number
  }
}

type TrackPanelProps = {
  svgFile: string
  corners: Corner[]  // Track corner definitions (x, y, number, type)
  cornerPerformance?: Record<number, CornerPerformance>  // Performance data by corner number
  selectedDrivers?: string[]
  onCornerClick?: (cornerNumber: number) => void
}
```

### Step 2: Aggregate Corner Performance Data

```typescript
function aggregateCornerPerformance(
  corners: Record<string, CornerMetrics[]>,
  selectedDrivers: string[]
): Record<number, CornerPerformance> {
  // Group corners by corner number
  // Calculate averages, best times, deltas
  // Return aggregated data
}
```

### Step 3: Render Performance Overlay

**Visual Elements**:
1. **Corner Numbers** - Display on markers (already done)
2. **Speed Indicator** - Color-coded background or border
3. **Time Delta** - Small text showing +/- time
4. **Hover Tooltip** - Detailed metrics on hover
5. **Click Interaction** - Highlight corner, show details panel

**Color Coding**:
- Green: Faster than average (negative delta)
- Yellow: Average performance
- Red: Slower than average (positive delta)
- Intensity: Relative to best time

### Step 4: Interactive Features

1. **Hover**: Show tooltip with:
   - Corner number and type
   - Average speed (entry/apex/exit)
   - Average corner time
   - Time delta vs best
   - Number of samples

2. **Click**: 
   - Highlight corner
   - Show detailed breakdown in side panel
   - Filter CornerTable to this corner

3. **Multiple Drivers**:
   - Show delta between selected drivers
   - Color code based on relative performance
   - Show which driver is faster

## Data Structures

### Corner Performance Data

```typescript
type CornerPerformance = {
  cornerNumber: number
  cornerType: 'slow' | 'medium' | 'fast'
  
  // Aggregated metrics
  avgSpeed: {
    entry: number
    apex: number
    exit: number
  }
  avgTime: number
  bestTime: number
  worstTime: number
  
  // Deltas
  timeDelta?: number  // vs best time
  speedDelta?: number  // vs best speed
  
  // Driver-specific (if multiple drivers)
  driverPerformance?: Record<string, {
    avgSpeed: number
    avgTime: number
    timeDelta: number  // vs best driver
  }>
  
  // Statistics
  sampleCount: number
  driverCount: number
}
```

### Tooltip Data

```typescript
type CornerTooltipData = {
  cornerNumber: number
  cornerType: 'slow' | 'medium' | 'fast'
  metrics: CornerPerformance
  driverBreakdown?: Array<{
    driver: string
    avgTime: number
    avgSpeed: number
    timeDelta: number
  }>
}
```

## Visual Design

### Corner Marker Enhancement

**Current**:
- Circle with corner number
- Color by type (slow/medium/fast)

**Enhanced**:
- Circle with corner number
- Border color by performance (green/yellow/red)
- Background color by type (slow/medium/fast)
- Small text showing time delta
- Hover: Expand tooltip
- Click: Highlight and show details

### Performance Indicators

1. **Speed Ring** - Outer ring showing relative speed
2. **Time Badge** - Small badge showing time delta
3. **Driver Indicator** - Small icons for driver performance
4. **Heat Map** - Optional: Color track segment by performance

## Implementation Steps

### Phase 1: Data Aggregation
1. Create `aggregateCornerPerformance` function
2. Integrate into ClientPage
3. Pass to TrackPanel

### Phase 2: Basic Overlay
1. Update TrackPanel to accept performance data
2. Render performance indicators on corners
3. Add basic tooltip on hover

### Phase 3: Interactive Features
1. Add click handlers
2. Implement tooltip with details
3. Add driver comparison
4. Link with CornerTable

### Phase 4: Advanced Features
1. Time delta visualization
2. Speed trace overlay
3. Heat map coloring
4. Animation/transitions

## File Changes

### New Files
- `components/CornerPerformanceOverlay.tsx` - SVG overlay component
- `components/CornerTooltip.tsx` - Tooltip component
- `lib/cornerPerformanceAggregator.ts` - Data aggregation utilities

### Modified Files
- `components/TrackPanel.tsx` - Add performance overlay
- `components/ClientPage.tsx` - Pass performance data to TrackPanel
- `lib/sessionDataClient.ts` - Add CornerPerformance type

## Example Usage

```typescript
// In ClientPage.tsx
const cornerPerformance = useMemo(() => {
  if (!sessionData?.corners || !selectedDrivers.length) return undefined
  return aggregateCornerPerformance(sessionData.corners, selectedDrivers)
}, [sessionData?.corners, selectedDrivers])

// Pass to TrackPanel
<TrackPanel
  svgFile={currentTrack.svgFile}
  corners={currentTrack.corners}
  cornerPerformance={cornerPerformance}
  selectedDrivers={selectedDrivers}
  onCornerClick={(cornerNumber) => {
    // Filter CornerTable to this corner
    setSelectedCorner(cornerNumber)
  }}
/>
```

## Visual Mockup

```
┌─────────────────────────────────────┐
│  Track SVG                          │
│                                     │
│    [1] ────[2]───[3]               │
│     │       │      │                │
│     │   [4] │      │                │
│     │    │  │      │                │
│    [5]──[6]─┘     [7]               │
│                                     │
│  Corner 1:                          │
│  - Speed: 180 km/h                  │
│  - Time: 2.45s                      │
│  - Delta: -0.12s (faster)           │
│  - Drivers: VER, NOR                │
└─────────────────────────────────────┘
```

## Next Steps

1. ✅ Create aggregation function
2. ✅ Update TrackPanel props
3. ✅ Implement basic overlay
4. ⏳ Add tooltips
5. ⏳ Add interactivity
6. ⏳ Test with Australia track

