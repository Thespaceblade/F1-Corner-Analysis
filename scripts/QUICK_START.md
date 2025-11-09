# Quick Start Guide - Corner Coordinate Editor

## Step 1: Verify tkinter is Available

**No dependencies needed!** The script only requires tkinter (usually included with Python).

If tkinter is not available:
- **Linux**: `sudo apt-get install python3-tk` (Ubuntu/Debian)
- **macOS**: Usually included with Python
- **Windows**: Usually included with Python

## Step 2: Run the Editor

Simply run the script - no arguments needed:

```bash
python scripts/edit_corner_coordinates.py
```

The GUI will open with a track selector. Select any track from the dropdown to edit its corners.

## Available Tracks

You can use any of these track IDs:

- `australia` - Australian Grand Prix
- `china` - Chinese Grand Prix
- `japan` - Japanese Grand Prix
- `bahrain` - Bahrain Grand Prix
- `saudi-arabia` - Saudi Arabian Grand Prix
- `miami` - Miami Grand Prix
- `emilia-romagna` - Emilia Romagna Grand Prix
- `monaco` - Monaco Grand Prix
- `spain` - Spanish Grand Prix
- `canada` - Canadian Grand Prix
- `austria` - Austrian Grand Prix
- `great-britain` - British Grand Prix
- `belgium` - Belgian Grand Prix
- `hungary` - Hungarian Grand Prix
- `netherlands` - Dutch Grand Prix
- `italy` - Italian Grand Prix
- `azerbaijan` - Azerbaijan Grand Prix
- `singapore` - Singapore Grand Prix
- `united-states` - United States Grand Prix
- `mexico` - Mexican Grand Prix
- `brazil` - Brazilian Grand Prix
- `las-vegas` - Las Vegas Grand Prix
- `qatar` - Qatar Grand Prix
- `abu-dhabi` - Abu Dhabi Grand Prix

## How to Use

1. **Run the script** - `python scripts/edit_corner_coordinates.py`
2. **Select a track** - Choose a track from the dropdown at the top
3. **Wait for the GUI to open** - you'll see the track SVG with corner markers
4. **Drag corners** - Click and drag corner markers to their correct positions
5. **Zoom if needed** - Use the zoom buttons or mouse wheel
6. **Switch tracks** - Select a different track to edit multiple tracks in one session
7. **Save changes** - Click "Save Changes" to update `tracks.json` for the current track
8. **Verify** - Check the corner list on the right to see updated coordinates

## Controls

- **Track Selector Dropdown**: Select any track to edit
- **Load Track Button**: Load the selected track
- **Left Click + Drag**: Move a corner marker
- **Mouse Wheel**: Zoom in/out (may need to click canvas first)
- **Zoom In/Out Buttons**: Zoom using buttons
- **Reset View**: Reset zoom and pan to fit track
- **Save Changes**: Save corner coordinates to `tracks.json` for the current track

## Troubleshooting

### "tkinter not found"
- **Linux**: `sudo apt-get install python3-tk` (Ubuntu/Debian)
- **macOS**: Usually included, but may need to reinstall Python
- **Windows**: Usually included by default

### SVG not showing properly
- Make sure the SVG file exists in `public/Tracks/`
- Check that the track has a valid `svgFile` in `tracks.json`
- The script renders SVG paths directly - no external renderer needed
- Try selecting a different track from the dropdown

### Can't save changes
- Check file permissions on `public/data/tracks.json`
- Make sure the file is not open in another program
- Verify you have write permissions

## Example Workflow

```bash
# 1. Run the editor (no dependencies needed!)
python scripts/edit_corner_coordinates.py

# 2. In the GUI:
#    - Select "australia" from the track dropdown
#    - Drag corners to correct positions
#    - Use zoom if needed
#    - Click "Save Changes" to save Australia corners
#    - Select "monaco" from the dropdown
#    - Edit Monaco corners
#    - Click "Save Changes" to save Monaco corners
#    - Repeat for all tracks!

# 3. Verify in your main app
#    - Refresh your browser
#    - Check that corners are in the right places
```

## Need Help?

- See `scripts/README-corner-editor.md` for detailed documentation
- See `scripts/CORNER_EDITOR_VIABILITY.md` for feature overview
- Check the error messages in the terminal for specific issues

