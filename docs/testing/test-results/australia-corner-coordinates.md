# Australia Corner Coordinates - Edit Guide

## File Location
**`public/data/tracks.json`**

## SVG ViewBox
The Australia SVG has a viewBox of: `0 0 593 700`
- X range: 0 to 593
- Y range: 0 to 700

## Where to Edit

Open `public/data/tracks.json` and find the `australia` track section (starts around line 3).

### Current Corner Coordinates

```json
{
  "tracks": {
    "australia": {
      "id": "australia",
      "name": "Australian Grand Prix",
      "svgFile": "australia.svg",
      "corners": [
        {
          "number": 1,
          "type": "fast",
          "x": 152.73912048339844,    // ← Edit this
          "y": 426.9739196777344,     // ← Edit this
          "expectedDistanceRange": {
            "min": 253,
            "max": 415
          }
        },
        {
          "number": 2,
          "type": "slow",
          "x": 347.9,                 // ← Edit this
          "y": 587.4,                 // ← Edit this
          "expectedDistanceRange": {
            "min": 981,
            "max": 1121
          }
        },
        {
          "number": 3,
          "type": "fast",
          "x": 20.508695983886724,    // ← Edit this
          "y": 205.81302490234373,    // ← Edit this
          "expectedDistanceRange": {
            "min": 1791,
            "max": 1925
          }
        },
        {
          "number": 4,
          "type": "fast",
          "x": 185.3,                 // ← Edit this
          "y": 143.1,                 // ← Edit this
          "expectedDistanceRange": {
            "min": 3223,
            "max": 3377
          }
        },
        {
          "number": 5,
          "type": "slow",
          "x": 382.5,                 // ← Edit this
          "y": 127,                   // ← Edit this
          "expectedDistanceRange": {
            "min": 4039,
            "max": 4141
          }
        },
        {
          "number": 6,
          "type": "medium",
          "x": 444.5,                 // ← Edit this
          "y": 178.3,                 // ← Edit this
          "expectedDistanceRange": {
            "min": 4331,
            "max": 4433
          }
        },
        {
          "number": 7,
          "type": "slow",
          "x": 476.6,                 // ← Edit this
          "y": 228.2,                 // ← Edit this
          "expectedDistanceRange": {
            "min": 4515,
            "max": 4657
          }
        }
      ]
    }
  }
}
```

## How to Edit

1. **Open the file**: `public/data/tracks.json`
2. **Find Australia track**: Look for `"australia"` (around line 3)
3. **Edit coordinates**: Change the `x` and `y` values for each corner
4. **Save the file**: Save your changes
5. **Refresh browser**: Reload the page to see updated positions

## Coordinate Ranges

- **X coordinates**: Must be between 0 and 593
- **Y coordinates**: Must be between 0 and 700

## Tips

1. **View current positions**: The track panel shows current coordinates below the track
2. **Use browser DevTools**: Inspect the SVG to find approximate positions
3. **Incremental updates**: Change one corner at a time and refresh to check
4. **Round numbers**: You can use whole numbers like `254` instead of decimals

## Example: Updating Corner 1

Change from:
```json
"x": 152.73912048339844,
"y": 426.9739196777344,
```

To (for example):
```json
"x": 254,
"y": 522,
```

Then save and refresh the browser!

