# Corner Coordinate Editor

A graphical tool for editing corner coordinates on F1 track SVG maps.

## Overview

This tool allows you to visually position corners on track SVG maps by dragging them to the correct locations. The coordinates are automatically saved to `tracks.json` for use in the main application.

## Features

- **All Tracks in One Session**: Select any track from a dropdown - edit all tracks without restarting
- **Visual SVG Display**: View track SVG maps with corner markers (rendered directly from SVG paths)
- **Drag & Drop**: Click and drag corners to reposition them
- **Zoom & Pan**: Zoom in/out and pan around the track
- **Corner List**: See all corners with their numbers, types, and coordinates
- **Auto-save**: Save changes directly to `tracks.json`
- **Color-coded**: Corners are color-coded by type (slow=red, medium=orange, fast=green)
- **No Dependencies**: Works with just tkinter and Python standard library (no cairosvg needed!)

## Installation

### 1. Verify tkinter is Available

**That's it!** The script only needs tkinter (usually included with Python).

tkinter is usually included with Python, but on some Linux systems you may need to install it:

- **Ubuntu/Debian**: `sudo apt-get install python3-tk`
- **Fedora**: `sudo dnf install python3-tkinter`
- **macOS**: Usually included with Python
- **Windows**: Usually included with Python

**No other dependencies needed!** The script renders SVG paths directly on the canvas.

## Usage

### Basic Usage

Simply run the script - no arguments needed:

```bash
python scripts/edit_corner_coordinates.py
```

The GUI will open with a track selector dropdown. Select any track from the dropdown to edit its corners.

### Available Tracks

Track IDs can be found in `public/data/tracks.json`. Common examples:
- `australia` - Australian Grand Prix
- `monaco` - Monaco Grand Prix
- `silverstone` - British Grand Prix
- `spa` - Belgian Grand Prix
- etc.

## How to Use

1. **Run the script**: `python scripts/edit_corner_coordinates.py`
2. **Select a track**: Choose a track from the dropdown at the top
3. **View the track**: The SVG track map is displayed with current corner positions
4. **Drag corners**: Click and drag corner markers to their correct positions on the track
5. **Zoom if needed**: Use the zoom buttons or mouse wheel to zoom in/out
6. **Switch tracks**: Select a different track from the dropdown to edit another track
7. **Save changes**: Click "Save Changes" to write coordinates to `tracks.json` for the current track
8. **Edit all tracks**: You can edit all tracks in one session without restarting

## Controls

- **Track Selector Dropdown**: Select any track to edit
- **Load Track Button**: Load the selected track
- **Left Click + Drag**: Move a corner marker
- **Mouse Wheel**: Zoom in/out (may need to click canvas first)
- **Zoom In/Out Buttons**: Zoom using buttons
- **Reset View**: Reset zoom and pan to fit track
- **Save Changes**: Save corner coordinates to `tracks.json` for the current track
- **Corner List**: Click a corner in the list to see its details

## Corner Colors

- 🔴 **Red**: Slow corners
- 🟠 **Orange**: Medium-speed corners
- 🟢 **Green**: Fast corners
- ⚫ **Gray**: Unknown type

## File Structure

- **Input**: `public/data/tracks.json` - Track and corner definitions
- **Input**: `public/Tracks/*.svg` - Track SVG maps
- **Output**: `public/data/tracks.json` - Updated corner coordinates

## Troubleshooting

### SVG Not Rendering

The script renders SVG paths directly, so no external renderer is needed. If the track doesn't show:
1. Check that the SVG file exists in `public/Tracks/`
2. Verify the SVG file contains path elements
3. Try selecting a different track from the dropdown

### Corners Not Showing

If corners don't appear:
1. Check that the track has corners defined in `tracks.json`
2. Verify corner coordinates are within the SVG viewBox
3. Try resetting the view

### Can't Save Changes

If saving fails:
1. Check file permissions on `public/data/tracks.json`
2. Verify the file is not open in another program
3. Check for JSON syntax errors in the file

### tkinter Not Found

If you get a tkinter import error:
- **Linux**: Install `python3-tk` package
- **macOS**: Reinstall Python with tkinter support
- **Windows**: Usually included by default

## Tips

1. **Start with zoomed out view**: Use "Reset View" to see the entire track first
2. **Use corner numbers**: Corner numbers help identify which corner you're editing
3. **Check corner list**: The corner list shows current coordinates as you drag
4. **Save frequently**: Save your changes regularly to avoid losing work
5. **Verify in browser**: After saving, check the main app to verify corner positions

## Technical Details

- **SVG Rendering**: Uses cairosvg (or svglib as fallback) to convert SVG to PNG
- **Coordinate System**: Uses SVG viewBox coordinates
- **Coordinate Conversion**: Automatically converts between SVG and canvas coordinates
- **Data Format**: Saves coordinates as floating-point numbers in `tracks.json`

## Notes

- This is a **development tool** and should not be deployed to production
- Changes are saved directly to `tracks.json` - make backups if needed
- The script preserves all existing track data, only updating corner coordinates
- Corner types and distance ranges are preserved when saving

