# How to Populate All Tracks with Session Data

This guide explains how to run the `populate_all_tracks.py` script to fetch and process all F1 session data.

## Prerequisites

1. **Python 3.8+** installed
2. **Python dependencies** installed:
   ```bash
   pip install fastf1 pandas numpy
   ```

## Quick Start

### Step 1: Run the populate script

```bash
# From the project root directory
python scripts/populate_all_tracks.py --year 2025 --sessions Q R
```

This will:
1. ✅ Fetch session data for all tracks in the calendar (saves to `public/data/sessions/`)
2. ✅ Analyze tracks to detect corners (saves to `output/corners/`)
3. ✅ Update `tracks.json` with corner definitions (updates `public/data/tracks.json`)

### Step 2: Start your development server

```bash
npm run dev
```

### Step 3: Open the application

Navigate to `http://localhost:3000` - all tracks and sessions should now be available!

## What Gets Created

After running the script, you'll have:

- **Session data**: `public/data/sessions/{year}/{track}/{session}/session.json`
  - This is what the API reads to serve session data
  - Contains lap times, corner metrics, driver data, etc.

- **Track definitions**: `public/data/tracks.json`
  - This is what the frontend loads to show track information
  - Contains corner definitions with distance ranges, types, coordinates

## Command Options

### Basic usage (all tracks)
```bash
python scripts/populate_all_tracks.py --year 2025 --sessions Q R
```

### Specific tracks only
```bash
python scripts/populate_all_tracks.py --year 2025 --sessions Q R --tracks monaco bahrain australia
```

### Multiple sessions
```bash
python scripts/populate_all_tracks.py --year 2025 --sessions FP1 FP2 FP3 Q R
```

### Skip steps (if you've already done some)
```bash
# Skip fetching (use existing session data)
python scripts/populate_all_tracks.py --year 2025 --sessions Q R --skip-fetch

# Skip analysis (use existing corner definitions)
python scripts/populate_all_tracks.py --year 2025 --sessions Q R --skip-analyze

# Skip updating tracks.json
python scripts/populate_all_tracks.py --year 2025 --sessions Q R --skip-update
```

### Custom calendar file
```bash
python scripts/populate_all_tracks.py --year 2025 --sessions Q R --calendar public/data/calendar2024.json
```

## How It Works

1. **Fetch Phase**: 
   - Reads the calendar file (`public/data/calendar2025.json`)
   - For each track, fetches session data from FastF1
   - Saves to `public/data/sessions/{year}/{track}/{session}/session.json`
   - This is the same location the Next.js API reads from

2. **Analysis Phase**:
   - For each track with session data, analyzes corner detection
   - Generates corner definitions with distance ranges and types
   - Saves to `output/corners/{track}.json`

3. **Update Phase**:
   - Merges corner definitions into `public/data/tracks.json`
   - Preserves existing track metadata
   - This is the same file the frontend loads on startup

## Troubleshooting

### "Module not found: fastf1"
```bash
pip install fastf1 pandas numpy
```

### "Calendar file not found"
Make sure `public/data/calendar2025.json` exists. You can create it or use a different calendar file with `--calendar`.

### "No tracks found with corner data"
This means the session data doesn't have corner detection data. Make sure:
- Session data was fetched successfully (check `public/data/sessions/`)
- Session has valid telemetry data
- Try a different session (Q or R usually have the best data)

### Session data takes a long time to fetch
- FastF1 caches data in `cache/fastf1/` to speed up subsequent runs
- First-time fetches can take 1-2 minutes per session
- For 24 tracks × 2 sessions = ~48-96 minutes total (depending on your connection)

### Corner analysis fails for some tracks
- Some tracks may have incomplete telemetry data
- Check the error messages to see which tracks failed
- You can re-run analysis for specific tracks: `--tracks trackname`

## Data Flow

```
populate_all_tracks.py
    ↓
1. Fetch session data → public/data/sessions/{year}/{track}/{session}/session.json
    ↓ (API reads from here)
2. Analyze corners → output/corners/{track}.json
    ↓
3. Update tracks.json → public/data/tracks.json
    ↓ (Frontend loads from here)
```

## After Running

Once the script completes:

1. ✅ Session data is in `public/data/sessions/` - the API can serve it
2. ✅ Track definitions are in `public/data/tracks.json` - the frontend can load it
3. ✅ Start your dev server: `npm run dev`
4. ✅ All tracks and sessions should be available in the UI!

## Notes

- The script uses FastF1's cache, so subsequent runs are faster
- Session data is large (~1-5 MB per session), so expect some disk usage
- Corner analysis requires valid telemetry data - some sessions may not have complete data
- The script preserves existing data - it won't overwrite unless necessary

## Example: Populate All 2025 Tracks

```bash
# Fetch and process all 2025 tracks for Qualifying and Race
python scripts/populate_all_tracks.py --year 2025 --sessions Q R

# This will process all 24 tracks from calendar2025.json
# Output:
# - public/data/sessions/2025/*/Q/session.json (24 files)
# - public/data/sessions/2025/*/R/session.json (24 files)
# - public/data/tracks.json (updated with corner definitions)
```

Then start your app and everything should work! 🎉


