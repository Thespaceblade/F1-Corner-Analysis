# Corner Telemetry Analysis - Implementation Plan

## Overview

This document outlines the complete implementation plan for integrating corner telemetry analysis into the F1 Corner Analysis application. The goal is to transform the placeholder `CornerTable` component into a fully functional corner-by-corner analysis tool.

---

## Current State Analysis

### ✅ What We Have

1. **Corner Detection Algorithm** (`f1_corners.py`)
   - `detect_corners()` - Detects corners from speed/distance telemetry
   - `per_corner_metrics()` - Calculates entry/apex/exit speeds and corner time
   - `align_corners_by_distance()` - Matches corners between drivers
   - `resample_to_common_distance()` - Normalizes telemetry to uniform grid

2. **Data Pipeline Infrastructure**
   - FastF1 session fetching (`fetch.py`)
   - Data transformation (`transforms.py`)
   - JSON storage and API serving

3. **UI Components**
   - `CornerTable.tsx` - Placeholder component ready for data
   - `TrackPanel.tsx` - Track SVG with corner markers
   - Track corner definitions in `tracks.json`

### ❌ What's Missing

1. **Telemetry Loading** - Currently `telemetry=False` in `fetch.py`
2. **Corner Processing** - No corner detection in `transforms.py`
3. **Corner Matching** - No alignment with track corner definitions
4. **Data Storage** - Corner data not included in session JSON
5. **UI Display** - CornerTable shows placeholder data

---

## Architecture Design

### Data Flow

```
FastF1 Session
    ↓
Load Telemetry (telemetry=True)
    ↓
For each valid lap:
    ↓
    Get car_data with distance
    ↓
    Resample to uniform distance grid
    ↓
    Detect corners (speed-based algorithm)
    ↓
    Calculate corner metrics
    ↓
    Match to track corner definitions
    ↓
Store in session.json → corners: { driver: [cornerData[]] }
    ↓
API Route serves corner data
    ↓
CornerTable component displays data
```

### Data Structures

#### Corner Metrics (Per Lap)

```typescript
interface CornerMetrics {
  cornerNumber: number           // Track corner number (from tracks.json)
  detectedCornerIndex: number    // Index in detected corners array
  lapNumber: number              // Which lap this is from
  entrySpeed: number             // km/h at corner entry
  apexSpeed: number                 // km/h at apex
  exitSpeed: number               // km/h at corner exit
  cornerTime: number              // seconds through corner
  brakingDistance: number        // meters from entry to apex
  accelerationDistance: number    // meters from apex to exit
  entryDistance: number           // track distance at entry (m)
  apexDistance: number            // track distance at apex (m)
  exitDistance: number            // track distance at exit (m)
  minSpeed: number                // minimum speed in corner
  maxLateralG: number            // maximum lateral G-force (if available)
  throttleApplication?: number   // distance where throttle applied (if available)
}
```

#### Track Corner Definition (from tracks.json)

```typescript
interface TrackCorner {
  number: number                  // Corner number (1, 2, 3, ...)
  type: 'slow' | 'medium' | 'fast'
  x: number                       // SVG X coordinate
  y: number                       // SVG Y coordinate
  // Optional: Add expected distance range for matching
  expectedDistanceRange?: {
    min: number
    max: number
  }
}
```

#### Session JSON Structure

```json
{
  "meta": { ... },
  "drivers": { ... },
  "laps": [ ... ],
  "corners": {
    "VER": [
      {
        "cornerNumber": 1,
        "lapNumber": 5,
        "entrySpeed": 245.3,
        "apexSpeed": 98.7,
        "exitSpeed": 187.2,
        "cornerTime": 2.456,
        "brakingDistance": 125.3,
        "accelerationDistance": 87.6,
        "entryDistance": 1250.5,
        "apexDistance": 1375.8,
        "exitDistance": 1463.4,
        "minSpeed": 95.2
      },
      // ... more corners
    ],
    "NOR": [ ... ]
  }
}
```

---

## Implementation Phases

### Phase 1: Extend Data Pipeline (Backend)

#### 1.1 Update `fetch.py` to Load Telemetry

**File**: `scripts/fastf1_pipeline/fetch.py`

**Changes**:
- Change `session.load(laps=True, telemetry=False, weather=False)` 
- To: `session.load(laps=True, telemetry=True, weather=False)`

**Considerations**:
- Telemetry data is large - may need to process selectively
- Consider processing only valid laps to reduce data size
- May need to add option to skip telemetry for faster processing

#### 1.2 Create Corner Detection Module

**New File**: `scripts/fastf1_pipeline/corners.py`

**Functions to implement**:

```python
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

def detect_corners(
    speed_series: pd.Series,
    distance_series: pd.Series,
    min_drop_kmh: float = 18.0,
    min_recovery_kmh: float = 10.0,
    min_len_pts: int = 4
) -> List[Dict[str, int]]:
    """
    Detect corners from speed/distance telemetry.
    Returns list of dicts with start_idx, apex_idx, end_idx.
    """
    # Port from f1_corners.py
    pass

def resample_to_common_distance(
    tel_df: pd.DataFrame,
    step: float = 2.0
) -> pd.DataFrame:
    """
    Resample telemetry to uniform distance grid.
    """
    # Port from f1_corners.py
    pass

def calculate_corner_metrics(
    telemetry: pd.DataFrame,
    corners: List[Dict[str, int]],
    lap_number: int
) -> List[Dict[str, Any]]:
    """
    Calculate metrics for each detected corner.
    Returns list of corner metric dictionaries.
    """
    metrics = []
    for idx, corner in enumerate(corners, start=1):
        start_idx = corner["start_idx"]
        apex_idx = corner["apex_idx"]
        end_idx = corner["end_idx"]
        
        entry_speed = float(telemetry["Speed"].iloc[start_idx])
        apex_speed = float(telemetry["Speed"].iloc[apex_idx])
        exit_speed = float(telemetry["Speed"].iloc[end_idx])
        
        # Calculate times
        if "Time_s" in telemetry.columns:
            t_start = float(telemetry["Time_s"].iloc[start_idx])
            t_end = float(telemetry["Time_s"].iloc[end_idx])
            corner_time = t_end - t_start
        else:
            corner_time = None
        
        # Calculate distances
        entry_dist = float(telemetry["Distance"].iloc[start_idx])
        apex_dist = float(telemetry["Distance"].iloc[apex_idx])
        exit_dist = float(telemetry["Distance"].iloc[end_idx])
        
        braking_dist = apex_dist - entry_dist
        accel_dist = exit_dist - apex_dist
        
        # Find minimum speed in corner
        corner_speeds = telemetry["Speed"].iloc[start_idx:end_idx+1]
        min_speed = float(corner_speeds.min())
        
        metrics.append({
            "detectedCornerIndex": idx,
            "lapNumber": lap_number,
            "entrySpeed": round(entry_speed, 1),
            "apexSpeed": round(apex_speed, 1),
            "exitSpeed": round(exit_speed, 1),
            "cornerTime": round(corner_time, 3) if corner_time else None,
            "brakingDistance": round(braking_dist, 1),
            "accelerationDistance": round(accel_dist, 1),
            "entryDistance": round(entry_dist, 1),
            "apexDistance": round(apex_dist, 1),
            "exitDistance": round(exit_dist, 1),
            "minSpeed": round(min_speed, 1),
        })
    
    return metrics

def match_corners_to_track(
    detected_corners: List[Dict[str, Any]],
    track_corners: List[Dict[str, Any]],
    tolerance_meters: float = 50.0
) -> List[Dict[str, Any]]:
    """
    Match detected corners to track corner definitions.
    
    Args:
        detected_corners: List of corner metrics with apexDistance
        track_corners: List of track corner definitions from tracks.json
        tolerance_meters: Maximum distance difference for matching
    
    Returns:
        List of matched corners with cornerNumber assigned
    """
    matched = []
    used_track_corners = set()
    
    # Sort detected corners by apex distance
    sorted_detected = sorted(detected_corners, key=lambda c: c["apexDistance"])
    
    # If we have track corner distance ranges, use those
    # Otherwise, use simple sequential matching
    for detected in sorted_detected:
        apex_dist = detected["apexDistance"]
        best_match = None
        best_diff = float('inf')
        
        for track_idx, track_corner in enumerate(track_corners):
            if track_idx in used_track_corners:
                continue
            
            # Check if track corner has expected distance range
            if "expectedDistanceRange" in track_corner:
                expected_min = track_corner["expectedDistanceRange"]["min"]
                expected_max = track_corner["expectedDistanceRange"]["max"]
                
                if expected_min <= apex_dist <= expected_max:
                    diff = min(abs(apex_dist - expected_min), abs(apex_dist - expected_max))
                    if diff < best_diff:
                        best_match = track_idx
                        best_diff = diff
            else:
                # Fallback: sequential matching (assumes corners are in order)
                # This is less accurate but works if we don't have distance data
                if best_match is None:
                    best_match = track_idx
                    best_diff = 0
        
        if best_match is not None and best_diff <= tolerance_meters:
            matched_corner = {
                **detected,
                "cornerNumber": track_corners[best_match]["number"],
                "cornerType": track_corners[best_match].get("type", "medium"),
            }
            matched.append(matched_corner)
            used_track_corners.add(best_match)
        else:
            # Unmatched corner - assign sequential number
            matched_corner = {
                **detected,
                "cornerNumber": len(matched) + 1,
                "cornerType": "unknown",
            }
            matched.append(matched_corner)
    
    return matched
```

#### 1.3 Integrate Corner Processing into `transforms.py`

**File**: `scripts/fastf1_pipeline/transforms.py`

**Changes**:

1. Import corner detection functions:
```python
from .corners import (
    detect_corners,
    resample_to_common_distance,
    calculate_corner_metrics,
    match_corners_to_track,
)
```

2. Add function to process corners for a session:
```python
def process_session_corners(
    session: Any,
    laps_df: pd.DataFrame,
    track_corners: List[Dict[str, Any]] | None = None,
    selected_drivers: Sequence[str] | None = None,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process corner telemetry for all valid laps in session.
    
    Args:
        session: FastF1 session object
        laps_df: DataFrame of laps
        track_corners: Track corner definitions (optional)
        selected_drivers: Filter to specific drivers (optional)
    
    Returns:
        Dictionary mapping driver codes to lists of corner metrics
    """
    corners_by_driver: Dict[str, List[Dict[str, Any]]] = {}
    
    if pd is None:
        return corners_by_driver
    
    # Filter to valid laps only
    valid_laps = laps_df[laps_df["IsAccurate"] == True].copy()
    
    if selected_drivers:
        valid_laps = valid_laps[valid_laps["Driver"].isin(selected_drivers)]
    
    # Process each valid lap
    for _, lap_row in valid_laps.iterrows():
        driver_code = lap_row["Driver"]
        lap_number = int(lap_row["LapNumber"])
        
        try:
            # Get lap object
            lap = session.laps[
                (session.laps["Driver"] == driver_code) &
                (session.laps["LapNumber"] == lap_number)
            ].iloc[0]
            
            # Get telemetry with distance
            telemetry = lap.get_car_data().add_distance()
            
            # Resample to uniform grid
            telemetry_resampled = resample_to_common_distance(telemetry, step=2.0)
            
            # Detect corners
            detected = detect_corners(
                telemetry_resampled["Speed"],
                telemetry_resampled["Distance"]
            )
            
            if not detected:
                continue
            
            # Calculate metrics
            corner_metrics = calculate_corner_metrics(
                telemetry_resampled,
                detected,
                lap_number
            )
            
            # Match to track corners if available
            if track_corners:
                corner_metrics = match_corners_to_track(
                    corner_metrics,
                    track_corners,
                    tolerance_meters=50.0
                )
            
            # Store in dictionary
            if driver_code not in corners_by_driver:
                corners_by_driver[driver_code] = []
            
            corners_by_driver[driver_code].extend(corner_metrics)
            
        except Exception as e:
            # Log error but continue processing
            print(f"Error processing corner for {driver_code} lap {lap_number}: {e}")
            continue
    
    return corners_by_driver
```

3. Update `build_session_payload()` to call corner processing:
```python
# In build_session_payload(), after processing laps:

# Load track corner definitions (if available)
track_corners = None
try:
    tracks_path = config.root / "public" / "data" / "tracks.json"
    if tracks_path.exists():
        tracks_data = json.loads(tracks_path.read_text())
        round_slug = identifier.round_slug
        if round_slug in tracks_data.get("tracks", {}):
            track_corners = tracks_data["tracks"][round_slug].get("corners", [])
except Exception:
    # If we can't load track corners, continue without matching
    track_corners = None

# Process corners
corners_payload = process_session_corners(
    session,
    laps_df,
    track_corners=track_corners,
    selected_drivers=selected_drivers,
)
```

**Performance Considerations**:
- Corner processing is CPU-intensive
- Consider processing only fastest lap per driver initially
- Add option to skip corner processing for faster data generation
- Could process corners asynchronously in background

#### 1.4 Update Session JSON Schema

The `corners` field in session JSON will now contain real data:

```json
{
  "corners": {
    "VER": [
      {
        "cornerNumber": 1,
        "detectedCornerIndex": 1,
        "lapNumber": 5,
        "entrySpeed": 245.3,
        "apexSpeed": 98.7,
        "exitSpeed": 187.2,
        "cornerTime": 2.456,
        "brakingDistance": 125.3,
        "accelerationDistance": 87.6,
        "entryDistance": 1250.5,
        "apexDistance": 1375.8,
        "exitDistance": 1463.4,
        "minSpeed": 95.2,
        "cornerType": "slow"
      }
    ]
  }
}
```

---

### Phase 2: Update TypeScript Types

#### 2.1 Update `lib/sessionDataClient.ts`

**Add corner metrics type**:

```typescript
export type CornerMetrics = {
  cornerNumber: number
  detectedCornerIndex?: number
  lapNumber: number
  entrySpeed: number
  apexSpeed: number
  exitSpeed: number
  cornerTime: number | null
  brakingDistance: number
  accelerationDistance: number
  entryDistance: number
  apexDistance: number
  exitDistance: number
  minSpeed: number
  cornerType?: 'slow' | 'medium' | 'fast' | 'unknown'
}

export type SessionPayload = {
  meta: SessionMeta
  drivers: Record<string, SessionDriver>
  laps: SessionLap[]
  corners: Record<string, CornerMetrics[]>  // Updated from unknown[]
  notes?: string[]
  qualifyingBoundaries?: QualifyingBoundaries
}
```

---

### Phase 3: Enhance UI Components

#### 3.1 Update `CornerTable.tsx`

**File**: `components/CornerTable.tsx`

**Changes**:

1. Import types:
```typescript
import { CornerMetrics } from '../lib/sessionDataClient'
```

2. Update props:
```typescript
type CornerTableProps = {
  corners: Record<string, CornerMetrics[]>  // Updated type
  cornerInfo: CornerInfo[]
  selectedDrivers: string[]
}
```

3. Implement data aggregation and display:

```typescript
export default function CornerTable({ corners, cornerInfo, selectedDrivers }: CornerTableProps) {
  // Aggregate corner data by corner number
  const aggregatedCorners = useMemo(() => {
    const aggregated: Map<number, {
      cornerNumber: number
      cornerType: 'slow' | 'medium' | 'fast'
      driverData: Record<string, {
        avgEntrySpeed?: number
        avgApexSpeed?: number
        avgExitSpeed?: number
        avgCornerTime?: number
        bestCornerTime?: number
        bestLapNumber?: number
        lapCount: number
      }>
    }> = new Map()
    
    // Initialize with track corner info
    cornerInfo.forEach(corner => {
      aggregated.set(corner.number, {
        cornerNumber: corner.number,
        cornerType: corner.type,
        driverData: {},
      })
    })
    
    // Aggregate data from each driver
    selectedDrivers.forEach(driverCode => {
      const driverCorners = corners[driverCode] || []
      
      // Group by corner number
      const byCorner = new Map<number, CornerMetrics[]>()
      driverCorners.forEach(corner => {
        const num = corner.cornerNumber
        if (!byCorner.has(num)) {
          byCorner.set(num, [])
        }
        byCorner.get(num)!.push(corner)
      })
      
      // Calculate averages for each corner
      byCorner.forEach((cornerLaps, cornerNum) => {
        if (!aggregated.has(cornerNum)) {
          aggregated.set(cornerNum, {
            cornerNumber: cornerNum,
            cornerType: 'medium',
            driverData: {},
          })
        }
        
        const corner = aggregated.get(cornerNum)!
        const validTimes = cornerLaps
          .map(c => c.cornerTime)
          .filter((t): t is number => t !== null && !isNaN(t))
        
        const avgEntrySpeed = cornerLaps.reduce((sum, c) => sum + c.entrySpeed, 0) / cornerLaps.length
        const avgApexSpeed = cornerLaps.reduce((sum, c) => sum + c.apexSpeed, 0) / cornerLaps.length
        const avgExitSpeed = cornerLaps.reduce((sum, c) => sum + c.exitSpeed, 0) / cornerLaps.length
        const avgCornerTime = validTimes.length > 0
          ? validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length
          : undefined
        
        const bestTimeIndex = validTimes.length > 0
          ? validTimes.indexOf(Math.min(...validTimes))
          : -1
        
        corner.driverData[driverCode] = {
          avgEntrySpeed: Math.round(avgEntrySpeed * 10) / 10,
          avgApexSpeed: Math.round(avgApexSpeed * 10) / 10,
          avgExitSpeed: Math.round(avgExitSpeed * 10) / 10,
          avgCornerTime: avgCornerTime ? Math.round(avgCornerTime * 1000) / 1000 : undefined,
          bestCornerTime: bestTimeIndex >= 0 ? Math.round(validTimes[bestTimeIndex] * 1000) / 1000 : undefined,
          bestLapNumber: bestTimeIndex >= 0 ? cornerLaps[bestTimeIndex].lapNumber : undefined,
          lapCount: cornerLaps.length,
        }
      })
    })
    
    return Array.from(aggregated.values()).sort((a, b) => a.cornerNumber - b.cornerNumber)
  }, [corners, cornerInfo, selectedDrivers])
  
  // ... rest of component
}
```

4. Update table rendering to show real data:

```typescript
<tbody>
  {aggregatedCorners.map((corner) => (
    <tr key={corner.cornerNumber} className="border-t border-[var(--border-clr)]">
      <td className="py-2 font-medium text-gray-200">{corner.cornerNumber}</td>
      <td className="py-2">
        <span
          className="mr-2 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: typeColors[corner.cornerType] }}
        />
        <span className="uppercase tracking-wide text-xs text-gray-400">
          {corner.cornerType}
        </span>
      </td>
      {selectedDrivers.map((code) => {
        const data = corner.driverData[code]
        if (!data || data.lapCount === 0) {
          return (
            <td key={code} className="py-2 text-gray-500 text-xs">
              No data
            </td>
          )
        }
        
        return (
          <td key={code} className="py-2 text-gray-300">
            <div className="text-xs space-y-0.5">
              {data.avgCornerTime !== undefined && (
                <div className="font-mono">
                  {data.avgCornerTime.toFixed(3)}s
                  {data.bestCornerTime !== undefined && data.bestCornerTime < data.avgCornerTime && (
                    <span className="ml-1 text-accent text-[10px]">
                      (best: {data.bestCornerTime.toFixed(3)}s)
                    </span>
                  )}
                </div>
              )}
              <div className="text-[10px] text-gray-500">
                {data.avgApexSpeed.toFixed(0)} km/h apex
              </div>
              <div className="text-[10px] text-gray-500">
                {data.lapCount} lap{data.lapCount !== 1 ? 's' : ''}
              </div>
            </div>
          </td>
        )
      })}
    </tr>
  ))}
</tbody>
```

#### 3.2 Add Corner Delta Visualization

**New Component**: `components/CornerDeltaChart.tsx`

Visualize time deltas between drivers per corner:

```typescript
// Bar chart showing corner time differences
// Positive = first driver slower
// Negative = first driver faster
```

#### 3.3 Enhance TrackPanel with Corner Data

**File**: `components/TrackPanel.tsx`

Add ability to highlight corners with performance data:
- Color-code corners by driver performance
- Show speed traces on track
- Click corner to see detailed metrics

---

### Phase 4: Testing & Validation

#### 4.1 Unit Tests

- Test corner detection algorithm
- Test corner matching logic
- Test data aggregation

#### 4.2 Integration Tests

- Test full pipeline: FastF1 → JSON → UI
- Test with various tracks and sessions
- Validate corner matching accuracy

#### 4.3 Performance Testing

- Measure processing time for full session
- Test with large datasets
- Optimize if needed

---

## Implementation Checklist

### Backend (Python)

- [ ] Create `scripts/fastf1_pipeline/corners.py` module
- [ ] Port corner detection functions from `f1_corners.py`
- [ ] Implement `calculate_corner_metrics()`
- [ ] Implement `match_corners_to_track()`
- [ ] Update `fetch.py` to load telemetry (`telemetry=True`)
- [ ] Add `process_session_corners()` to `transforms.py`
- [ ] Integrate corner processing into `build_session_payload()`
- [ ] Add track corner loading from `tracks.json`
- [ ] Test with sample sessions
- [ ] Handle edge cases (no telemetry, invalid laps, etc.)

### Frontend (TypeScript/React)

- [ ] Update `CornerMetrics` type in `sessionDataClient.ts`
- [ ] Update `SessionPayload` type
- [ ] Implement data aggregation in `CornerTable.tsx`
- [ ] Update table rendering with real data
- [ ] Add corner delta visualization
- [ ] Add tooltips with detailed metrics
- [ ] Add filtering/sorting options
- [ ] Test with real data

### Testing & Documentation

- [ ] Write unit tests for corner detection
- [ ] Write integration tests
- [ ] Test with multiple tracks
- [ ] Validate corner matching accuracy
- [ ] Document corner detection parameters
- [ ] Update API documentation

---

## Performance Considerations

### Processing Time

- Corner detection per lap: ~100-500ms
- Full session (20 drivers, 50 laps): ~2-10 minutes
- Consider processing only fastest lap per driver initially
- Add progress indicators for long operations

### Data Size

- Corner data per lap: ~20-50 corners × ~200 bytes = 4-10 KB
- Full session: ~20 drivers × 50 laps × 10 KB = ~10 MB
- Still manageable for JSON storage
- Consider compression if needed

### Optimization Strategies

1. **Selective Processing**
   - Only process valid laps
   - Option to process only fastest lap per driver
   - Skip telemetry loading if corners not needed

2. **Caching**
   - Cache processed corner data
   - Only reprocess if session data changes

3. **Background Processing**
   - Process corners asynchronously
   - Show placeholder while processing
   - Update UI when complete

---

## Future Enhancements

1. **Advanced Metrics**
   - Lateral G-forces
   - Throttle/brake application points
   - Gear selection in corners
   - DRS usage

2. **Visualization**
   - Speed trace overlay on track
   - Corner-by-corner comparison charts
   - Heatmaps of corner performance

3. **Analysis Tools**
   - Identify driver strengths/weaknesses
   - Track-specific corner analysis
   - Historical corner performance trends

4. **Matching Improvements**
   - Machine learning for corner matching
   - Use sector boundaries for better matching
   - Handle track layout changes

---

## Risk Assessment

### Technical Risks

1. **Telemetry Availability**
   - Risk: Some sessions may not have telemetry
   - Mitigation: Graceful fallback, show message if unavailable

2. **Corner Matching Accuracy**
   - Risk: Detected corners may not match track definitions
   - Mitigation: Use distance ranges, tolerance matching, manual override

3. **Performance**
   - Risk: Processing full sessions may be slow
   - Mitigation: Selective processing, caching, background jobs

### Data Quality Risks

1. **Missing Telemetry**
   - Some laps may not have telemetry data
   - Handle gracefully, show available data only

2. **Corner Detection Errors**
   - Algorithm may miss corners or detect false positives
   - Tune parameters, add validation

---

## Success Criteria

1. ✅ Corner data appears in `CornerTable` for all valid laps
2. ✅ Corner metrics are accurate (within 5% of manual calculation)
3. ✅ Corner matching is correct for 90%+ of corners
4. ✅ Processing time is acceptable (< 5 minutes for full session)
5. ✅ UI is responsive and intuitive
6. ✅ Data is stored efficiently in JSON format

---

## Next Steps

1. **Start with Phase 1.1**: Update `fetch.py` to load telemetry
2. **Create `corners.py` module**: Port detection functions
3. **Test on single session**: Validate corner detection works
4. **Integrate into pipeline**: Add to `transforms.py`
5. **Update UI**: Populate `CornerTable` with real data
6. **Iterate and improve**: Refine matching and display

---

## Conclusion

This implementation plan provides a complete roadmap for adding corner telemetry analysis to the F1 Corner Analysis application. The phased approach allows for incremental development and testing, reducing risk and enabling early validation of the corner detection and matching algorithms.

The key challenge will be accurately matching detected corners to track corner definitions, but the proposed matching algorithm with distance-based tolerance should handle most cases. For edge cases, we can add manual override capabilities or improve the matching algorithm based on real-world data.

