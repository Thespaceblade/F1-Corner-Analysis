# Corner Telemetry - Quick Start Guide

## Overview

This guide provides a step-by-step approach to implementing corner telemetry analysis, starting with the most critical components.

## Phase 1: Foundation (Start Here)

### Step 1: Create Corner Detection Module

Create `scripts/fastf1_pipeline/corners.py` with basic structure:

```python
# Port functions from f1_corners.py
# Start with detect_corners() and resample_to_common_distance()
```

### Step 2: Enable Telemetry Loading

Update `scripts/fastf1_pipeline/fetch.py`:
- Change `telemetry=False` to `telemetry=True`
- Test with a single session to ensure telemetry loads

### Step 3: Test Corner Detection

Create a test script to validate corner detection works:
```bash
python -c "from fastf1_pipeline.corners import detect_corners; ..."
```

## Phase 2: Integration

### Step 4: Add Corner Processing to Transforms

Add `process_session_corners()` function to `transforms.py`
- Start with processing only fastest lap per driver
- Validate output structure

### Step 5: Update JSON Schema

Ensure session JSON includes corner data in correct format

## Phase 3: UI Updates

### Step 6: Update TypeScript Types

Add `CornerMetrics` type to `sessionDataClient.ts`

### Step 7: Populate CornerTable

Update `CornerTable.tsx` to display real data
- Start with simple display (corner number, speeds)
- Add aggregation later

## Testing Strategy

1. **Single Lap Test**: Process one lap, validate corner detection
2. **Single Driver Test**: Process all laps for one driver
3. **Full Session Test**: Process complete session
4. **UI Test**: Verify data displays correctly

## Recommended First Session

Start with a simple track (e.g., Monaco) and qualifying session:
- Fewer corners to validate
- Cleaner telemetry data
- Easier to manually verify results

## Key Files to Modify

1. `scripts/fastf1_pipeline/fetch.py` - Enable telemetry
2. `scripts/fastf1_pipeline/corners.py` - NEW: Corner detection
3. `scripts/fastf1_pipeline/transforms.py` - Add corner processing
4. `lib/sessionDataClient.ts` - Update types
5. `components/CornerTable.tsx` - Display data

## Common Issues & Solutions

### Issue: Telemetry not loading
- **Solution**: Check FastF1 cache, ensure session has telemetry available

### Issue: Too many/few corners detected
- **Solution**: Adjust `min_drop_kmh` and `min_recovery_kmh` parameters

### Issue: Corner matching incorrect
- **Solution**: Increase `tolerance_meters` or add distance ranges to tracks.json

### Issue: Processing too slow
- **Solution**: Process only fastest lap per driver initially

