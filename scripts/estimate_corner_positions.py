#!/usr/bin/env python3
"""
Estimate corner positions on SVG from distance data.

This script helps estimate x/y coordinates for corners based on:
1. Corner distance data
2. SVG viewBox dimensions
3. Track layout assumptions

Usage:
    python scripts/estimate_corner_positions.py <track_id>
"""

import json
import sys
import math
from pathlib import Path

def estimate_corner_positions(
    corners: list,
    viewbox: dict,
    track_length: float = 5000.0  # Approximate track length in meters
) -> list:
    """
    Estimate corner positions on SVG.
    
    This is a simplified estimation that distributes corners
    evenly around an elliptical track layout.
    """
    min_x = viewbox.get('minX', 0)
    min_y = viewbox.get('minY', 0)
    width = viewbox.get('w', 600)
    height = viewbox.get('h', 700)
    
    center_x = min_x + width / 2
    center_y = min_y + height / 2
    
    # Use elliptical distribution
    radius_x = width * 0.35
    radius_y = height * 0.35
    
    estimated = []
    for corner in corners:
        # Use the middle of the expected distance range
        distance_range = corner.get('expectedDistanceRange', {})
        if distance_range:
            avg_distance = (distance_range.get('min', 0) + distance_range.get('max', 0)) / 2
        else:
            # Fallback: estimate based on corner number
            avg_distance = corner['number'] * (track_length / len(corners))
        
        # Calculate angle based on distance ratio
        angle = (avg_distance / track_length) * 2 * math.pi
        
        # Calculate position on ellipse
        x = center_x + radius_x * math.cos(angle)
        y = center_y + radius_y * math.sin(angle)
        
        estimated.append({
            **corner,
            'x': round(x, 1),
            'y': round(y, 1),
            '_estimated': True,  # Flag to indicate this is an estimate
        })
    
    return estimated


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/estimate_corner_positions.py <track_id>")
        print("Example: python scripts/estimate_corner_positions.py australia")
        sys.exit(1)
    
    track_id = sys.argv[1]
    tracks_file = Path('public/data/tracks.json')
    
    if not tracks_file.exists():
        print(f"Error: {tracks_file} not found")
        sys.exit(1)
    
    # Load tracks.json
    with open(tracks_file, 'r') as f:
        data = json.load(f)
    
    if track_id not in data.get('tracks', {}):
        print(f"Error: Track '{track_id}' not found in tracks.json")
        sys.exit(1)
    
    track = data['tracks'][track_id]
    corners = track.get('corners', [])
    
    if not corners:
        print(f"Warning: No corners defined for track '{track_id}'")
        sys.exit(0)
    
    # Check if corners already have coordinates
    has_coordinates = all('x' in corner and 'y' in corner for corner in corners)
    
    if has_coordinates:
        print(f"Info: Track '{track_id}' already has corner coordinates")
        print("Corners:")
        for corner in corners:
            print(f"  Corner {corner['number']}: ({corner['x']}, {corner['y']})")
        sys.exit(0)
    
    # SVG viewBox for Australia (from SVG file)
    # We'll need to parse this from the SVG file or provide defaults
    viewbox = {
        'minX': 0,
        'minY': 0,
        'w': 593,
        'h': 700,
    }
    
    # Estimate positions
    estimated_corners = estimate_corner_positions(corners, viewbox)
    
    # Update tracks.json
    data['tracks'][track_id]['corners'] = estimated_corners
    
    # Write back
    with open(tracks_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Estimated corner positions for '{track_id}':")
    for corner in estimated_corners:
        print(f"  Corner {corner['number']}: ({corner['x']}, {corner['y']}) [ESTIMATED]")
    print(f"\n⚠️  These are estimates. Please verify and adjust manually if needed.")
    print(f"    Edit public/data/tracks.json to adjust coordinates.")


if __name__ == '__main__':
    main()

