# Track Corner Definition Population Plan

## Overview

This document outlines the strategy for populating `tracks.json` with corner definitions that enable matching detected corners to actual track corners.

## Current State

- ✅ Corner detection algorithm working
- ✅ 220,387 corners detected across 48 sessions
- ✅ Corner metrics calculated (entry/apex/exit speeds, distances, times)
- ❌ Track corner definitions empty in `tracks.json`
- ❌ Corner matching not working (corners use `detectedCornerIndex` instead of `cornerNumber`)

## Required Data Structure

Each track corner definition needs:

```json
{
  "number": 1,
  "type": "slow" | "medium" | "fast",
  "expectedDistanceRange": {
    "min": 150.0,
    "max": 200.0
  },
  "x": 100,  // Optional: SVG coordinate
  "y": 150   // Optional: SVG coordinate
}
```

## Population Strategies

### Strategy 1: Statistical Analysis of Detected Corners (Recommended - Automated)

**Approach**: Analyze detected corner data to infer consistent corner positions.

**Method**:
1. Collect all `apexDistance` values from detected corners across multiple drivers/laps
2. Cluster apex distances to find consistent corner positions
3. Sort clusters by distance to get corner order
4. Classify corner types based on speed characteristics:
   - **Slow**: Apex speed < 120 km/h
   - **Medium**: Apex speed 120-180 km/h
   - **Fast**: Apex speed > 180 km/h
5. Calculate distance ranges from cluster min/max with tolerance

**Advantages**:
- Fully automated
- Uses actual telemetry data
- Accurate for tracks with data

**Disadvantages**:
- Requires sufficient data (multiple drivers/laps)
- May miss corners that aren't consistently detected
- Needs manual validation

**Implementation**:
```python
# Script: scripts/analyze_track_corners.py
# - Load session data for a track
# - Analyze detected corners
# - Generate track corner definitions
# - Output to tracks.json format
```

### Strategy 2: Known Track Information (Manual Research)

**Approach**: Research official track corner information.

**Sources**:
- FIA track maps and corner numbers
- Official F1 track guides
- Wikipedia track information
- Track official websites

**Method**:
1. Research each track's corner count and numbers
2. Classify corners by type (slow/medium/fast)
3. Estimate distance ranges from track maps or known distances
4. Manually input into `tracks.json`

**Advantages**:
- Authoritative data
- Complete corner coverage
- Accurate corner numbering

**Disadvantages**:
- Time-consuming (24 tracks)
- Manual work
- May need distance estimation

### Strategy 3: Hybrid Approach (Recommended - Best of Both)

**Approach**: Combine statistical analysis with manual validation and research.

**Method**:
1. **Phase 1**: Automated analysis
   - Run statistical analysis on detected corners
   - Generate initial corner definitions
   - Identify gaps (missing corners)

2. **Phase 2**: Manual validation
   - Verify corner count matches known track info
   - Validate corner types
   - Adjust distance ranges if needed

3. **Phase 3**: Fill gaps
   - Research missing corners
   - Manually add corner definitions
   - Verify matching accuracy

**Advantages**:
- Fast initial population
- High accuracy with validation
- Complete coverage

**Disadvantages**:
- Requires both automation and manual work
- Needs validation process

## Implementation Plan

### Phase 1: Create Analysis Script

**File**: `scripts/analyze_track_corners.py`

**Features**:
- Load session data for a track
- Analyze detected corners across all drivers/laps
- Cluster apex distances
- Classify corner types from speed data
- Generate track corner definitions
- Output JSON format compatible with `tracks.json`

**Usage**:
```bash
python scripts/analyze_track_corners.py --track monaco --year 2025 --session Q
```

### Phase 2: Batch Analysis

**Process**:
1. Run analysis script for all tracks with available data
2. Generate initial corner definitions
3. Export to temporary file for review

**Script**: `scripts/batch_analyze_tracks.py`

### Phase 3: Validation & Manual Entry

**Process**:
1. Review generated corner definitions
2. Compare with known track information
3. Validate corner counts match official numbers
4. Adjust corner types and distance ranges
5. Fill in missing corners manually

**Tools**:
- Validation script to check corner definitions
- Manual editing of `tracks.json`
- Test matching accuracy

### Phase 4: Integration & Testing

**Process**:
1. Update `tracks.json` with corner definitions
2. Regenerate sessions to test matching
3. Verify corner numbers assigned correctly
4. Check UI displays corner numbers/types

## Corner Type Classification

### Based on Apex Speed

- **Slow**: `apexSpeed < 120 km/h`
  - Examples: Hairpins, tight chicanes
  - Characteristic: Large speed drops, long corner times

- **Medium**: `120 <= apexSpeed < 180 km/h`
  - Examples: Medium-radius corners, sweepers
  - Characteristic: Moderate speed reduction

- **Fast**: `apexSpeed >= 180 km/h`
  - Examples: High-speed corners, kinks
  - Characteristic: Small speed reduction, fast corner times

### Based on Corner Characteristics

- **Slow**: Sharp turns, hairpins, tight chicanes
- **Medium**: Standard racing corners
- **Fast**: Sweepers, kinks, high-speed sections

## Distance Range Calculation

### Method 1: Statistical Range

```python
# Use cluster min/max with tolerance
min_distance = cluster_min - 10  # 10m tolerance
max_distance = cluster_max + 10  # 10m tolerance
```

### Method 2: Standard Deviation

```python
# Use mean ± 2 standard deviations
mean = cluster_center
std = cluster_std
min_distance = mean - 2 * std
max_distance = mean + 2 * std
```

### Method 3: Percentile-based

```python
# Use 5th and 95th percentiles
min_distance = np.percentile(cluster_distances, 5)
max_distance = np.percentile(cluster_distances, 95)
```

## Validation Criteria

1. **Corner Count**: Matches known track corner count
2. **Distance Order**: Corners in sequential order by distance
3. **Coverage**: All detected corners matched (or < 5% unmatched)
4. **Distance Ranges**: No overlapping ranges between adjacent corners
5. **Corner Types**: Match known track characteristics

## Testing Strategy

1. **Matching Accuracy**: Test on known sessions
2. **Corner Detection**: Verify all corners detected and matched
3. **UI Display**: Check corner numbers/types display correctly
4. **Edge Cases**: Test with different drivers, sessions, conditions

## Next Steps

1. ✅ Create `scripts/analyze_track_corners.py`
2. ✅ Run analysis on sample tracks (Monaco, Bahrain, Spain)
3. ✅ Generate initial corner definitions
4. ⏳ Validate and refine definitions
5. ⏳ Update `tracks.json`
6. ⏳ Test corner matching
7. ⏳ Regenerate sessions with matched corners

## Example Output

```json
{
  "tracks": {
    "monaco": {
      "id": "monaco",
      "name": "Monaco Grand Prix",
      "svgFile": "monaco.svg",
      "corners": [
        {
          "number": 1,
          "type": "medium",
          "expectedDistanceRange": {
            "min": 180.0,
            "max": 220.0
          }
        },
        {
          "number": 2,
          "type": "slow",
          "expectedDistanceRange": {
            "min": 380.0,
            "max": 420.0
          }
        }
        // ... more corners
      ]
    }
  }
}
```

## Tools & Scripts

### 1. Analysis Script
- **File**: `scripts/analyze_track_corners.py`
- **Purpose**: Analyze detected corners and generate definitions

### 2. Validation Script
- **File**: `scripts/validate_track_corners.py`
- **Purpose**: Validate corner definitions

### 3. Update Script
- **File**: `scripts/update_tracks_json.py`
- **Purpose**: Merge generated definitions into `tracks.json`

## Timeline Estimate

- **Phase 1** (Analysis Script): 2-3 hours
- **Phase 2** (Batch Analysis): 1-2 hours
- **Phase 3** (Validation): 4-6 hours (manual work)
- **Phase 4** (Testing): 2-3 hours

**Total**: ~10-14 hours for all 24 tracks

## Priority Tracks

Start with popular/well-known tracks:
1. Monaco (19 corners, well-documented)
2. Silverstone (18 corners, classic track)
3. Spa-Francorchamps (19 corners, iconic)
4. Monza (11 corners, high-speed)
5. Bahrain (15 corners, season opener)

