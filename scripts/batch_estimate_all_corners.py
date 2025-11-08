#!/usr/bin/env python3
"""
Batch estimate corner positions for all tracks.

This script processes all tracks in tracks.json and estimates corner coordinates
based on:
1. SVG viewBox dimensions (parsed from SVG files)
2. Corner distance data (from expectedDistanceRange)
3. Improved estimation algorithm

Usage:
    python scripts/batch_estimate_all_corners.py
    python scripts/batch_estimate_all_corners.py --overwrite  # Overwrite existing coordinates
    python scripts/batch_estimate_all_corners.py --track australia  # Process single track
"""

import argparse
import json
import math
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def parse_svg_viewbox(svg_path: Path) -> Optional[Dict[str, float]]:
    """Parse viewBox from SVG file."""
    try:
        with open(svg_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Try to find viewBox attribute
        viewbox_match = re.search(
            r'viewBox\s*=\s*["\']([^"\']+)["\']',
            content,
            re.IGNORECASE
        )
        
        if viewbox_match:
            parts = viewbox_match.group(1).strip().split()
            if len(parts) == 4:
                try:
                    return {
                        'minX': float(parts[0]),
                        'minY': float(parts[1]),
                        'w': float(parts[2]),
                        'h': float(parts[3]),
                    }
                except ValueError:
                    pass
        
        # Fallback: try to find width and height
        width_match = re.search(r'width\s*=\s*["\']([^"\']+)["\']', content, re.IGNORECASE)
        height_match = re.search(r'height\s*=\s*["\']([^"\']+)["\']', content, re.IGNORECASE)
        
        if width_match and height_match:
            try:
                width = float(re.sub(r'[^\d.]', '', width_match.group(1)))
                height = float(re.sub(r'[^\d.]', '', height_match.group(1)))
                return {
                    'minX': 0,
                    'minY': 0,
                    'w': width,
                    'h': height,
                }
            except ValueError:
                pass
        
        return None
    except Exception as e:
        print(f"  Warning: Could not parse SVG viewBox: {e}", file=sys.stderr)
        return None


def estimate_track_length(corners: List[Dict]) -> float:
    """Estimate track length from corner distances."""
    max_distance = 0
    
    for corner in corners:
        distance_range = corner.get('expectedDistanceRange', {})
        if distance_range:
            max_distance = max(max_distance, distance_range.get('max', 0))
    
    # Add ~20% padding for straights and remaining track
    if max_distance > 0:
        return max_distance * 1.2
    
    # Fallback: estimate based on number of corners
    # Assume average corner spacing of ~400m
    return len(corners) * 400 if corners else 5000


def estimate_corner_positions(
    corners: List[Dict],
    viewbox: Dict[str, float],
    track_length: Optional[float] = None,
) -> List[Dict]:
    """
    Estimate corner positions on SVG using improved algorithm.
    
    Uses distance data to create a more accurate distribution around the track.
    """
    if not corners:
        return []
    
    min_x = viewbox.get('minX', 0)
    min_y = viewbox.get('minY', 0)
    width = viewbox.get('w', 600)
    height = viewbox.get('h', 700)
    
    # Calculate track length if not provided
    if track_length is None:
        track_length = estimate_track_length(corners)
    
    # Use viewBox center and dimensions for track bounds
    center_x = min_x + width / 2
    center_y = min_y + height / 2
    
    # Use a more realistic track shape
    # Adjust radius based on viewBox aspect ratio
    aspect_ratio = width / height if height > 0 else 1.0
    
    if aspect_ratio > 1.2:
        # Wide track (more horizontal)
        radius_x = width * 0.38
        radius_y = height * 0.32
    elif aspect_ratio < 0.8:
        # Tall track (more vertical)
        radius_x = width * 0.32
        radius_y = height * 0.38
    else:
        # Square-ish track
        radius_x = width * 0.35
        radius_y = height * 0.35
    
    estimated = []
    
    for corner in corners:
        # Get distance from expectedDistanceRange
        distance_range = corner.get('expectedDistanceRange', {})
        
        if distance_range and distance_range.get('min', 0) > 0:
            # Use the middle of the distance range
            avg_distance = (distance_range.get('min', 0) + distance_range.get('max', 0)) / 2
        else:
            # Fallback: distribute evenly based on corner number
            corner_ratio = (corner['number'] - 1) / max(len(corners), 1)
            avg_distance = corner_ratio * track_length
        
        # Normalize distance to 0-1 range
        distance_ratio = (avg_distance % track_length) / track_length
        
        # Calculate angle (0 = top, increasing clockwise)
        # Start at top (270 degrees in standard coordinates, but we adjust)
        angle = (distance_ratio * 2 * math.pi) - (math.pi / 2)
        
        # Calculate position on ellipse
        x = center_x + radius_x * math.cos(angle)
        y = center_y + radius_y * math.sin(angle)
        
        # Ensure coordinates are within viewBox bounds
        x = max(min_x, min(min_x + width, x))
        y = max(min_y, min(min_y + height, y))
        
        # Create updated corner with coordinates
        updated_corner = {
            **corner,
            'x': round(x, 1),
            'y': round(y, 1),
        }
        
        # Remove _estimated flag if present (clean up)
        if '_estimated' in updated_corner:
            del updated_corner['_estimated']
        
        estimated.append(updated_corner)
    
    return estimated


def process_track(
    track_id: str,
    track_data: Dict,
    tracks_dir: Path,
    overwrite: bool = False,
) -> Tuple[bool, str, List[Dict]]:
    """Process a single track and estimate corner positions."""
    corners = track_data.get('corners', [])
    
    if not corners:
        return False, "No corners defined", []
    
    # Check if corners already have coordinates
    has_coordinates = all('x' in corner and 'y' in corner for corner in corners)
    
    if has_coordinates and not overwrite:
        return False, "Already has coordinates (use --overwrite to update)", corners
    
    # Get SVG file path
    svg_file = track_data.get('svgFile')
    if not svg_file:
        return False, "No SVG file specified", []
    
    svg_path = tracks_dir / svg_file
    if not svg_path.exists():
        return False, f"SVG file not found: {svg_file}", []
    
    # Parse viewBox from SVG
    viewbox = parse_svg_viewbox(svg_path)
    if not viewbox:
        return False, "Could not parse SVG viewBox", []
    
    # Estimate corner positions
    estimated_corners = estimate_corner_positions(corners, viewbox)
    
    return True, "Estimated", estimated_corners


def main():
    parser = argparse.ArgumentParser(
        description='Batch estimate corner positions for all tracks'
    )
    parser.add_argument(
        '--overwrite',
        action='store_true',
        help='Overwrite existing coordinates'
    )
    parser.add_argument(
        '--track',
        type=str,
        help='Process only a specific track (e.g., australia)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    
    args = parser.parse_args()
    
    # Paths
    project_root = Path(__file__).parent.parent
    tracks_file = project_root / 'public' / 'data' / 'tracks.json'
    tracks_dir = project_root / 'public' / 'Tracks'
    
    if not tracks_file.exists():
        print(f"Error: {tracks_file} not found", file=sys.stderr)
        sys.exit(1)
    
    if not tracks_dir.exists():
        print(f"Error: {tracks_dir} not found", file=sys.stderr)
        sys.exit(1)
    
    # Load tracks.json
    try:
        with open(tracks_file, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading tracks.json: {e}", file=sys.stderr)
        sys.exit(1)
    
    tracks = data.get('tracks', {})
    
    if not tracks:
        print("No tracks found in tracks.json", file=sys.stderr)
        sys.exit(1)
    
    # Filter tracks if --track specified
    if args.track:
        if args.track not in tracks:
            print(f"Error: Track '{args.track}' not found", file=sys.stderr)
            sys.exit(1)
        tracks = {args.track: tracks[args.track]}
    
    # Process tracks
    results = []
    updated_count = 0
    
    print(f"Processing {len(tracks)} track(s)...\n")
    
    for track_id, track_data in sorted(tracks.items()):
        print(f"Track: {track_id} ({track_data.get('name', 'Unknown')})")
        
        success, message, estimated_corners = process_track(
            track_id,
            track_data,
            tracks_dir,
            overwrite=args.overwrite,
        )
        
        if success:
            print(f"  ✓ {message}")
            print(f"  ViewBox: {parse_svg_viewbox(tracks_dir / track_data.get('svgFile', ''))}")
            print(f"  Corners: {len(estimated_corners)}")
            
            if not args.dry_run:
                # Update tracks.json
                data['tracks'][track_id]['corners'] = estimated_corners
            
            updated_count += 1
            
            # Show first few coordinates
            for corner in estimated_corners[:3]:
                print(f"    Corner {corner['number']}: ({corner['x']}, {corner['y']})")
            if len(estimated_corners) > 3:
                print(f"    ... and {len(estimated_corners) - 3} more")
        else:
            print(f"  ⚠ {message}")
        
        results.append((track_id, success, message))
        print()
    
    # Save updated tracks.json
    if not args.dry_run and updated_count > 0:
        try:
            # Create backup
            backup_file = tracks_file.with_suffix('.json.backup')
            if backup_file.exists():
                backup_file.unlink()
            
            with open(backup_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Write updated data
            with open(tracks_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"✅ Updated {updated_count} track(s)")
            print(f"📁 Backup saved to: {backup_file}")
            print(f"📝 Updated: {tracks_file}")
            print("\n⚠️  These are estimates. Please verify and fine-tune manually if needed.")
        except Exception as e:
            print(f"Error saving tracks.json: {e}", file=sys.stderr)
            sys.exit(1)
    elif args.dry_run:
        print(f"Dry run: Would update {updated_count} track(s)")
        print("Run without --dry-run to apply changes")
    
    # Summary
    print(f"\nSummary:")
    print(f"  Processed: {len(results)} track(s)")
    print(f"  Updated: {updated_count} track(s)")
    print(f"  Skipped: {len(results) - updated_count} track(s)")


if __name__ == '__main__':
    main()

