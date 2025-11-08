# Corner Performance SVG Visualization - Summary

## Overview
This feature displays corner performance metrics (speed, time lost/gained, etc.) directly on the track SVG with numbered corners and interactive tooltips.

## What Was Implemented

### 1. Corner Performance Aggregation
- **File**: `lib/cornerPerformanceAggregator.ts`
- Aggregates corner metrics by corner number
- Calculates averages, best times, and time deltas
- Supports multi-driver comparisons

### 2. Corner Performance Overlay
- **File**: `components/CornerPerformanceOverlay.tsx`
- Renders corner markers with performance indicators
- Color-coded borders based on time delta
- Shows speed and time delta badges
- Interactive hover and click handlers

### 3. Interactive Tooltips
- **File**: `components/CornerTooltip.tsx`
- Displays detailed corner metrics on hover
- Shows entry/apex/exit speeds
- Shows average and best corner times
- Shows time delta vs best
- Driver breakdown for multi-driver comparisons

### 4. Enhanced TrackPanel
- **File**: `components/TrackPanel.tsx`
- Integrated performance overlay
- Accepts corner performance data
- Falls back to simple markers if no performance data

### 5. Corner Position Estimation
- **File**: `scripts/estimate_corner_positions.py`
- Estimates corner positions from distance data
- Uses elliptical distribution based on track layout
- Adds x/y coordinates to tracks.json

## Usage

### Basic Usage
1. Select a track (e.g., Australia)
2. Select a session (e.g., Q)
3. Select drivers (e.g., VER, NOR)
4. Corner performance will automatically display on the SVG

### Features
- **Hover**: Shows tooltip with detailed metrics
- **Color Coding**: 
  - Green border = Faster than average
  - Yellow border = Average performance
  - Red border = Slower than average
- **Speed Badge**: Shows apex speed above corner
- **Time Delta Badge**: Shows time delta below corner

## Corner Coordinates

### Current Status
- Australia: Coordinates estimated (may need manual adjustment)
- Other tracks: No coordinates yet

### Adding/Updating Corner Coordinates

#### Option 1: Manual Entry (Most Accurate)
1. Open track SVG in graphics editor (Inkscape, Figma, etc.)
2. Identify corner positions visually
3. Get x/y coordinates
4. Edit `public/data/tracks.json`:
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
      }
    }
  ]
}
```

#### Option 2: Estimation Script
```bash
python scripts/estimate_corner_positions.py <track_id>
```

This will estimate positions based on distance data. You should verify and adjust manually.

## Visual Design

### Corner Markers
- **Background**: Color by corner type (slow/medium/fast)
- **Border**: Color by performance (green/yellow/red)
- **Number**: White text on marker
- **Speed Badge**: Gray text above marker
- **Time Delta Badge**: Colored text below marker

### Tooltip
- **Background**: Dark semi-transparent
- **Header**: Corner number and type
- **Metrics**: Speeds, times, deltas
- **Driver Breakdown**: Per-driver performance (if multiple drivers)

## Data Flow

```
Session Data
    ↓
Aggregate Corner Performance (cornerPerformanceAggregator.ts)
    ↓
Pass to TrackPanel (ClientPage.tsx)
    ↓
Render Performance Overlay (CornerPerformanceOverlay.tsx)
    ↓
Display on SVG with Tooltips (CornerTooltip.tsx)
```

## Future Enhancements

### 1. Better Corner Position Calculation
- Parse SVG path to map distances to coordinates
- Use actual track layout instead of elliptical estimation
- Support manual adjustment through UI

### 2. Advanced Visualizations
- Heat map coloring for track segments
- Speed trace overlay
- Braking/acceleration zones
- Corner entry/exit lines

### 3. Interactive Features
- Click corner to filter CornerTable
- Highlight corner on map when selected in table
- Compare corner performance across sessions
- Historical corner performance trends

### 4. Multi-Track Support
- Add coordinates for all tracks
- Batch estimation script
- Validation script to check coordinate accuracy

## Troubleshooting

### Corners Not Showing
- **Check**: Do corners have x/y coordinates in tracks.json?
- **Solution**: Run estimation script or add manually

### Tooltip Not Appearing
- **Check**: Is corner performance data available?
- **Solution**: Ensure session data is loaded and drivers are selected

### Wrong Corner Positions
- **Check**: Are coordinates accurate?
- **Solution**: Manually adjust coordinates in tracks.json
- **Tip**: Open SVG in editor to verify positions

### Performance Data Missing
- **Check**: Does session have corner data?
- **Solution**: Regenerate session with corner detection enabled

## Testing

### Test with Australia
1. Select Australia track
2. Select 2025, Q session
3. Select VER and NOR
4. Hover over corners to see tooltips
5. Verify speed and time data is correct

### Verify Coordinates
1. Open `public/Tracks/australia.svg` in browser
2. Compare corner markers with actual track layout
3. Adjust coordinates in `tracks.json` if needed

## Files Modified/Created

### New Files
- `lib/cornerPerformanceAggregator.ts`
- `components/CornerPerformanceOverlay.tsx`
- `components/CornerTooltip.tsx`
- `scripts/estimate_corner_positions.py`
- `lib/cornerPositionCalculator.ts` (placeholder)

### Modified Files
- `components/TrackPanel.tsx`
- `components/ClientPage.tsx`
- `public/data/tracks.json` (Australia corners)

## Next Steps

1. ✅ Implemented basic visualization
2. ✅ Added corner coordinates for Australia
3. ⏳ Test with real session data
4. ⏳ Adjust corner positions manually for accuracy
5. ⏳ Add coordinates for other tracks
6. ⏳ Add advanced features (heat map, speed trace, etc.)

