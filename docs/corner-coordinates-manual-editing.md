# Corner Coordinates - Manual Editing Guide

## Overview
Corner positions are stored in `public/data/tracks.json` and can be manually edited to adjust corner placement on the track SVG.

## File Location
`public/data/tracks.json`

## Corner Coordinate Structure

Each corner in the `corners` array has the following structure:

```json
{
  "number": 1,
  "type": "fast",
  "x": 254.0,
  "y": 522.0,
  "expectedDistanceRange": {
    "min": 253.0,
    "max": 415.0
  }
}
```

### Fields
- **number**: Corner number (1, 2, 3, etc.)
- **type**: Corner type (`"slow"`, `"medium"`, `"fast"`)
- **x**: X coordinate in SVG viewBox units
- **y**: Y coordinate in SVG viewBox units
- **expectedDistanceRange**: Distance range for corner matching (optional)

## Finding SVG ViewBox

The SVG viewBox is typically found in the SVG file header:
```xml
<svg viewBox="0 0 593 700" ...>
```

This means:
- ViewBox origin: (0, 0)
- ViewBox width: 593
- ViewBox height: 700

## How to Update Coordinates

### Step 1: Open tracks.json
Edit `public/data/tracks.json` in your code editor.

### Step 2: Find the Track
Locate the track you want to update, for example:
```json
{
  "tracks": {
    "australia": {
      "id": "australia",
      "name": "Australian Grand Prix",
      "svgFile": "australia.svg",
      "corners": [...]
    }
  }
}
```

### Step 3: Update Corner Coordinates
Modify the `x` and `y` values for each corner:

```json
{
  "corners": [
    {
      "number": 1,
      "type": "fast",
      "x": 254.0,
      "y": 522.0,
      "expectedDistanceRange": {
        "min": 253.0,
        "max": 415.0
      }
    },
    {
      "number": 2,
      "type": "slow",
      "x": 347.9,
      "y": 587.4,
      "expectedDistanceRange": {
        "min": 981.0,
        "max": 1121.0
      }
    }
  ]
}
```

### Step 4: Save and Refresh
1. Save the file
2. Refresh the browser to see updated positions

## Finding Corner Positions

### Method 1: Using Browser DevTools
1. Open the track SVG in browser
2. Inspect the SVG element
3. Hover over corners to see their approximate positions
4. Use the coordinates shown in the UI

### Method 2: Using Graphics Editor
1. Open the SVG file in Inkscape, Figma, or similar
2. Identify corner positions visually
3. Note the coordinates from the editor
4. Update tracks.json with those coordinates

### Method 3: Estimation Script
Use the estimation script to get approximate positions:
```bash
python scripts/estimate_corner_positions.py <track_id>
```

Then manually refine the coordinates in tracks.json.

## Coordinate System

### ViewBox Coordinates
- Coordinates are in SVG viewBox units
- Origin (0, 0) is typically at top-left
- X increases to the right
- Y increases downward

### Example
For a viewBox of `0 0 593 700`:
- Top-left corner: (0, 0)
- Top-right corner: (593, 0)
- Bottom-left corner: (0, 700)
- Bottom-right corner: (593, 700)
- Center: (296.5, 350)

## Current Corner Display

The track panel shows:
- Corner markers on the SVG
- Corner coordinates below the track
- Instructions for manual editing

## Tips

1. **Start with estimation**: Use the estimation script to get initial positions
2. **Refine manually**: Adjust coordinates based on visual inspection
3. **Test incrementally**: Update one corner at a time and check the result
4. **Use browser refresh**: Refresh after each change to see updates
5. **Check viewBox**: Ensure coordinates are within the SVG viewBox bounds

## Example: Australia Track

```json
{
  "corners": [
    {
      "number": 1,
      "type": "fast",
      "x": 486.0,
      "y": 449.8,
      "expectedDistanceRange": {
        "min": 253.0,
        "max": 415.0
      }
    },
    {
      "number": 2,
      "type": "slow",
      "x": 347.9,
      "y": 587.4,
      "expectedDistanceRange": {
        "min": 981.0,
        "max": 1121.0
      }
    }
  ]
}
```

## Troubleshooting

### Corners Not Showing
- **Check**: Do corners have `x` and `y` coordinates?
- **Solution**: Add coordinates to each corner in tracks.json

### Wrong Positions
- **Check**: Are coordinates within viewBox bounds?
- **Solution**: Verify coordinates match the SVG viewBox

### Coordinates Not Updating
- **Check**: Did you save the file?
- **Solution**: Save tracks.json and refresh the browser

### JSON Syntax Errors
- **Check**: Is the JSON valid?
- **Solution**: Validate JSON syntax (trailing commas, quotes, etc.)

## Best Practices

1. **Backup**: Keep a backup of tracks.json before making changes
2. **Version Control**: Use git to track changes
3. **Incremental Updates**: Update one track at a time
4. **Documentation**: Note coordinate sources (estimation, manual, etc.)
5. **Testing**: Test corner positions after each update

