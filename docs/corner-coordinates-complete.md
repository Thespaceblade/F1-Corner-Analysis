# Corner Coordinates - Complete Setup ✅

## Summary

All tracks now have corner definitions and estimated coordinates! The batch setup script has successfully generated:

- ✅ **24 tracks** with corner definitions
- ✅ **24 tracks** with estimated coordinates
- ✅ **~400+ corners** total across all tracks

## What Was Done

### 1. Corner Definitions Generated
- Created corner definitions for all tracks
- Each corner includes:
  - Corner number (1, 2, 3, ...)
  - Corner type (slow/medium/fast)
  - Expected distance range (for matching)

### 2. Coordinates Estimated
- Parsed SVG viewBox from each track's SVG file
- Generated x/y coordinates using elliptical distribution
- Coordinates are in SVG coordinate space
- All corners positioned within viewBox bounds

### 3. Files Updated
- `public/data/tracks.json` - Updated with all corner data
- `public/data/tracks.json.backup` - Backup of original file

## Track Corner Counts

| Track | Corners | Track | Corners |
|-------|---------|-------|---------|
| Australia | 7 | Monaco | 19 |
| Austria | 10 | Netherlands | 14 |
| Azerbaijan | 20 | Qatar | 16 |
| Bahrain | 15 | Saudi Arabia | 27 |
| Belgium | 19 | Singapore | 23 |
| Brazil | 15 | Spain | 16 |
| Canada | 14 | United States | 20 |
| China | 16 | Abu Dhabi | 21 |
| Emilia-Romagna | 19 | Great Britain | 18 |
| Hungary | 14 | Italy | 11 |
| Japan | 18 | Las Vegas | 17 |
| Mexico | 17 | Miami | 19 |

## Current Status

All coordinates are **estimates** and need manual fine-tuning for accuracy.

### Coordinates Are:
- ✅ Generated automatically
- ✅ Positioned within SVG bounds
- ✅ Based on track layout assumptions
- ⚠️ Need manual adjustment for accuracy

### Fine-Tuning Required:
- Adjust corner positions to match actual track layout
- Verify corner numbers match track direction
- Refine coordinates for visual accuracy

## How to Fine-Tune Coordinates

### Step 1: Open tracks.json
```bash
# File location
public/data/tracks.json
```

### Step 2: Find Track
Locate the track you want to adjust:
```json
{
  "monaco": {
    "id": "monaco",
    "name": "Monaco Grand Prix",
    "svgFile": "monaco.svg",
    "corners": [
      {
        "number": 1,
        "type": "medium",
        "x": 274.0,
        "y": 84.0,
        "expectedDistanceRange": {
          "min": 0,
          "max": 60.0
        }
      }
    ]
  }
}
```

### Step 3: Edit Coordinates
Update `x` and `y` values:
```json
{
  "number": 1,
  "type": "medium",
  "x": 280.0,    // ← Edit this
  "y": 90.0,     // ← Edit this
  "expectedDistanceRange": {
    "min": 0,
    "max": 60.0
  }
}
```

### Step 4: Save and Refresh
1. Save `tracks.json`
2. Refresh browser
3. Check corner positions on track SVG
4. Adjust as needed

## Finding Accurate Coordinates

### Method 1: Browser DevTools
1. Open track in browser
2. Inspect SVG element
3. Hover over corners to see positions
4. Note coordinates

### Method 2: Graphics Editor
1. Open SVG file in Inkscape/Figma
2. Identify corner positions
3. Note x/y coordinates
4. Update tracks.json

### Method 3: Visual Inspection
1. View track SVG in browser
2. Compare corner markers with track layout
3. Adjust coordinates incrementally
4. Refresh to see changes

## Coordinate Ranges

Each track has different viewBox dimensions. Check the SVG file to see the range:

- **Monaco**: viewBox="0 0 548 700" (x: 0-548, y: 0-700)
- **Australia**: viewBox="0 0 593 700" (x: 0-593, y: 0-700)
- **Bahrain**: Check SVG file for viewBox

## Scripts Available

### 1. Complete Setup
```bash
python scripts/complete_corner_setup.py
```
- Generates corner definitions
- Estimates coordinates
- Processes all tracks

### 2. Batch Estimation
```bash
python scripts/batch_estimate_all_corners.py --overwrite
```
- Estimates coordinates only
- Overwrites existing coordinates
- Processes all tracks

### 3. Single Track
```bash
python scripts/batch_estimate_all_corners.py --track monaco --overwrite
```
- Process single track
- Useful for testing

## Tips for Fine-Tuning

1. **Start with one track**: Pick a track you know well
2. **Work incrementally**: Adjust one corner at a time
3. **Use browser refresh**: See changes immediately
4. **Check viewBox**: Ensure coordinates are in range
5. **Verify corner numbers**: Match track direction
6. **Test with session data**: Use performance overlays to verify

## Example: Fine-Tuning Monaco

1. Open `public/data/tracks.json`
2. Find `"monaco"` track
3. View Monaco SVG in browser
4. Identify first corner (typically after start/finish)
5. Adjust Corner 1 coordinates
6. Refresh browser
7. Repeat for all corners

## Backup and Restore

### Backup Location
- `public/data/tracks.json.backup`

### Restore Original
```bash
cp public/data/tracks.json.backup public/data/tracks.json
```

## Next Steps

1. ✅ **Done**: Corner definitions generated
2. ✅ **Done**: Coordinates estimated
3. ⏳ **Next**: Fine-tune coordinates manually
4. ⏳ **Future**: Use session data for better accuracy
5. ⏳ **Future**: Validate with performance overlays

## Validation

After fine-tuning, validate by:
1. Viewing track SVG with corner markers
2. Checking corner numbers match track direction
3. Verifying corner types (slow/medium/fast)
4. Testing with session data and performance overlays

## Support

- See `docs/corner-coordinates-manual-editing.md` for detailed editing guide
- See `docs/batch-corner-setup-summary.md` for setup details
- Check track SVG files for viewBox dimensions




