# Track Corner Population - Implementation Summary

## Plan Overview

We have created a comprehensive plan and tooling to populate `tracks.json` with corner definitions for all F1 tracks.

## Tools Created

### 1. Analysis Script (`scripts/analyze_track_corners.py`)
**Purpose**: Analyze detected corners from a single session to generate corner definitions.

**Features**:
- Loads session data with corner metrics
- Clusters apex distances to find consistent corner positions
- Classifies corner types based on apex speeds (slow/medium/fast)
- Generates distance ranges for corner matching
- Outputs JSON format compatible with `tracks.json`

**Usage**:
```bash
python scripts/analyze_track_corners.py --track monaco --year 2025 --session Q
python scripts/analyze_track_corners.py --track monaco --year 2025 --session Q --output monaco_corners.json
```

### 2. Batch Analysis Script (`scripts/batch_analyze_tracks.py`)
**Purpose**: Analyze all available tracks in batch.

**Features**:
- Automatically discovers tracks with available session data
- Analyzes all tracks in parallel
- Generates summary report
- Saves individual corner definition files

**Usage**:
```bash
python scripts/batch_analyze_tracks.py --year 2025 --session Q --output-dir output/corners
```

### 3. Update Script (`scripts/update_tracks_json.py`)
**Purpose**: Merge generated corner definitions into `tracks.json`.

**Features**:
- Loads corner definitions from analysis output
- Merges into existing `tracks.json` structure
- Preserves existing track metadata
- Optional dry-run mode
- Option to keep or remove metadata

**Usage**:
```bash
python scripts/update_tracks_json.py --input-dir output/corners --tracks-json public/data/tracks.json
python scripts/update_tracks_json.py --input-dir output/corners --dry-run  # Preview changes
```

## Workflow

### Step 1: Analyze Tracks
```bash
# Analyze all tracks
python scripts/batch_analyze_tracks.py --year 2025 --session Q --output-dir output/corners

# Or analyze individual tracks
python scripts/analyze_track_corners.py --track monaco --year 2025 --session Q --output output/corners/monaco.json
```

### Step 2: Review Results
```bash
# Check summary
cat output/corners/summary.json

# Review individual track definitions
cat output/corners/monaco.json
```

### Step 3: Update tracks.json
```bash
# Dry run first
python scripts/update_tracks_json.py --input-dir output/corners --dry-run

# Apply updates
python scripts/update_tracks_json.py --input-dir output/corners
```

### Step 4: Validate & Test
```bash
# Regenerate a session to test matching
python scripts/fetch_fastf1_data.py --year 2025 --round monaco --session Q

# Check if corners are matched
python -c "
import json
with open('public/data/sessions/2025/monaco/Q/session.json') as f:
    data = json.load(f)
corners = data.get('corners', {})
if corners:
    sample = list(corners.values())[0][0]
    print(f'Corner number: {sample.get(\"cornerNumber\")}')
    print(f'Corner type: {sample.get(\"cornerType\")}')
"
```

## Corner Detection Results

### Current Status
- **Monaco**: 9 corners detected (official: 19 corners)
- **Bahrain**: 8 corners detected (official: 15 corners)
- **Spain**: 7 corners detected (official: 16 corners)

### Why Fewer Corners Detected?
1. **Fast corners**: Some high-speed corners may not trigger detection (small speed drops)
2. **Detection parameters**: Current thresholds (18 km/h drop) may miss subtle corners
3. **Track characteristics**: Some tracks have corners that blend together
4. **Data quality**: Some corners may not be consistently detected across all laps

### Solutions
1. **Lower thresholds**: Reduce `min_drop_kmh` for tracks with fast corners
2. **Manual addition**: Add missing corners manually based on known track info
3. **Multiple sessions**: Combine data from multiple sessions (Q, R, FP)
4. **Track-specific tuning**: Adjust parameters per track

## Next Steps

### Immediate (Automated)
1. ✅ Run batch analysis on all tracks
2. ✅ Generate corner definitions
3. ✅ Review and validate results
4. ⏳ Update `tracks.json` with definitions

### Short-term (Manual)
1. ⏳ Validate corner counts match official numbers
2. ⏳ Add missing corners manually
3. ⏳ Adjust corner types if needed
4. ⏳ Fine-tune distance ranges

### Long-term (Enhancement)
1. ⏳ Improve detection algorithm for fast corners
2. ⏳ Add corner names/descriptions
3. ⏳ Add SVG coordinates for visualization
4. ⏳ Support for track layout changes

## Validation Criteria

### Corner Definitions Should:
- ✅ Match known corner counts (or be close)
- ✅ Have sequential corner numbers
- ✅ Have non-overlapping distance ranges
- ✅ Have appropriate corner types
- ✅ Cover full lap distance

### Matching Should:
- ✅ Match 90%+ of detected corners
- ✅ Assign correct corner numbers
- ✅ Assign appropriate corner types
- ✅ Handle edge cases gracefully

## Example Output

### Corner Definition Format
```json
{
  "number": 1,
  "type": "slow",
  "expectedDistanceRange": {
    "min": 15.0,
    "max": 261.0
  },
  "_metadata": {
    "centerDistance": 187.0,
    "avgSpeed": 104.9,
    "occurrences": 285,
    "stdDev": 26.7
  }
}
```

### Updated tracks.json
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
          "type": "slow",
          "expectedDistanceRange": {
            "min": 15.0,
            "max": 261.0
          }
        }
        // ... more corners
      ]
    }
  }
}
```

## Testing

### Test Corner Matching
```bash
# Regenerate session with corner definitions
python scripts/fetch_fastf1_data.py --year 2025 --round monaco --session Q

# Check matching results
python -c "
import json
with open('public/data/sessions/2025/monaco/Q/session.json') as f:
    data = json.load(f)
corners = data.get('corners', {})
total = sum(len(v) for v in corners.values())
matched = sum(1 for v in corners.values() for c in v if c.get('cornerNumber'))
print(f'Total corners: {total}')
print(f'Matched corners: {matched}')
print(f'Match rate: {matched/total*100:.1f}%')
"
```

## Resources

- **Plan Document**: `docs/track-corner-population-plan.md`
- **Analysis Script**: `scripts/analyze_track_corners.py`
- **Batch Script**: `scripts/batch_analyze_tracks.py`
- **Update Script**: `scripts/update_tracks_json.py`
- **Tracks JSON**: `public/data/tracks.json`

