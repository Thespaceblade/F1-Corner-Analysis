#!/usr/bin/env python3
"""
Complete corner setup for all tracks.

This script:
1. Generates corner definitions from session data (if available)
2. Creates placeholder corner definitions for tracks without session data
3. Estimates coordinates for all corners

Usage:
    python scripts/complete_corner_setup.py
    python scripts/complete_corner_setup.py --year 2025
"""

import argparse
import json
import math
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Import analysis functions
sys.path.insert(0, str(Path(__file__).parent))
try:
    from analyze_track_corners import load_session_data, analyze_corner_positions, classify_corner_type
except ImportError:
    print("Warning: Could not import analyze_track_corners functions", file=sys.stderr)
    def load_session_data(path): return None
    def analyze_corner_positions(corners): return []
    def classify_corner_type(speed): return "medium"


# Typical corner counts for F1 tracks (can be adjusted)
TYPICAL_CORNER_COUNTS = {
    'monaco': 19,
    'singapore': 23,
    'hungary': 14,
    'spain': 16,
    'italy': 11,
    'belgium': 19,
    'japan': 18,
    'brazil': 15,
    'abu-dhabi': 21,
    'australia': 16,
    'bahrain': 15,
    'china': 16,
    'azerbaijan': 20,
    'spain': 16,
    'canada': 14,
    'france': 15,
    'austria': 10,
    'great-britain': 18,
    'germany': 17,
    'mexico': 17,
    'united-states': 20,
    'miami': 19,
    'emilia-romagna': 19,
    'netherlands': 14,
    'qatar': 16,
    'saudi-arabia': 27,
    'las-vegas': 17,
}


def parse_svg_viewbox(svg_path: Path) -> Optional[Dict[str, float]]:
    """Parse viewBox from SVG file."""
    try:
        with open(svg_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
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
        
        return None
    except Exception:
        return None


def generate_corners_from_session(session_file: Path, track_id: str) -> Optional[List[Dict]]:
    """Generate corner definitions from session data."""
    session_data = load_session_data(session_file)
    
    if not session_data or 'corners' not in session_data:
        return None
    
    corners_data = session_data['corners']
    if not corners_data:
        return None
    
    # Analyze corner positions
    clusters = analyze_corner_positions(corners_data)
    
    if not clusters:
        return None
    
    # Convert to corner definitions
    corner_defs = []
    for i, cluster in enumerate(clusters, 1):
        corner_type = classify_corner_type(cluster.get('avgSpeed', 150))
        corner_defs.append({
            'number': i,
            'type': corner_type,
            'expectedDistanceRange': {
                'min': max(0, cluster.get('min', 0) - 15),
                'max': cluster.get('max', 0) + 15,
            },
        })
    
    return corner_defs


def generate_placeholder_corners(track_id: str, corner_count: int = 15) -> List[Dict]:
    """Generate placeholder corner definitions."""
    corners = []
    
    # Estimate track length (typical F1 tracks are 4-7km)
    track_length = corner_count * 300  # ~300m per corner on average
    
    for i in range(1, corner_count + 1):
        # Distribute corners evenly
        distance_ratio = (i - 1) / corner_count
        base_distance = distance_ratio * track_length
        
        # Alternate corner types (simple heuristic)
        if i % 3 == 0:
            corner_type = 'slow'
            distance_range = 80
        elif i % 3 == 1:
            corner_type = 'medium'
            distance_range = 120
        else:
            corner_type = 'fast'
            distance_range = 150
        
        corners.append({
            'number': i,
            'type': corner_type,
            'expectedDistanceRange': {
                'min': max(0, base_distance - distance_range / 2),
                'max': base_distance + distance_range / 2,
            },
        })
    
    return corners


def estimate_corner_coordinates(
    corners: List[Dict],
    viewbox: Dict[str, float],
    track_length: Optional[float] = None,
) -> List[Dict]:
    """Estimate corner coordinates on SVG."""
    if not corners:
        return []
    
    min_x = viewbox.get('minX', 0)
    min_y = viewbox.get('minY', 0)
    width = viewbox.get('w', 600)
    height = viewbox.get('h', 700)
    
    if track_length is None:
        max_distance = 0
        for corner in corners:
            dist_range = corner.get('expectedDistanceRange', {})
            if dist_range:
                max_distance = max(max_distance, dist_range.get('max', 0))
        track_length = max_distance * 1.2 if max_distance > 0 else len(corners) * 400
    
    center_x = min_x + width / 2
    center_y = min_y + height / 2
    
    aspect_ratio = width / height if height > 0 else 1.0
    
    if aspect_ratio > 1.2:
        radius_x = width * 0.38
        radius_y = height * 0.32
    elif aspect_ratio < 0.8:
        radius_x = width * 0.32
        radius_y = height * 0.38
    else:
        radius_x = width * 0.35
        radius_y = height * 0.35
    
    estimated = []
    for corner in corners:
        dist_range = corner.get('expectedDistanceRange', {})
        
        if dist_range and dist_range.get('min', 0) > 0:
            avg_distance = (dist_range.get('min', 0) + dist_range.get('max', 0)) / 2
        else:
            corner_ratio = (corner['number'] - 1) / max(len(corners), 1)
            avg_distance = corner_ratio * track_length
        
        distance_ratio = (avg_distance % track_length) / track_length
        angle = (distance_ratio * 2 * math.pi) - (math.pi / 2)
        
        x = center_x + radius_x * math.cos(angle)
        y = center_y + radius_y * math.sin(angle)
        
        x = max(min_x, min(min_x + width, x))
        y = max(min_y, min(min_y + height, y))
        
        updated_corner = {**corner, 'x': round(x, 1), 'y': round(y, 1)}
        if '_estimated' in updated_corner:
            del updated_corner['_estimated']
        
        estimated.append(updated_corner)
    
    return estimated


def main():
    parser = argparse.ArgumentParser(description='Complete corner setup for all tracks')
    parser.add_argument('--year', type=int, default=2025, help='Year for session data')
    parser.add_argument('--session', type=str, default='Q', help='Session type')
    parser.add_argument('--dry-run', action='store_true', help='Dry run mode')
    parser.add_argument('--overwrite', action='store_true', help='Overwrite existing corners')
    
    args = parser.parse_args()
    
    project_root = Path(__file__).parent.parent
    tracks_file = project_root / 'public' / 'data' / 'tracks.json'
    tracks_dir = project_root / 'public' / 'Tracks'
    sessions_dir = project_root / 'public' / 'data' / 'sessions' / str(args.year)
    
    # Load tracks.json
    with open(tracks_file, 'r') as f:
        data = json.load(f)
    
    tracks = data.get('tracks', {})
    
    # Find session files
    session_files = {}
    if sessions_dir.exists():
        for session_file in sessions_dir.glob(f'*_{args.session}.json'):
            try:
                session_data = load_session_data(session_file)
                if session_data and 'meta' in session_data:
                    round_slug = session_data['meta'].get('round')
                    if round_slug and round_slug in tracks:
                        session_files[round_slug] = session_file
            except Exception:
                pass
    
    print(f"Found {len(session_files)} session file(s)\n")
    print(f"Processing {len(tracks)} track(s)...\n")
    
    updated_tracks = 0
    coordinates_estimated = 0
    
    for track_id, track_data in sorted(tracks.items()):
        corners = track_data.get('corners', [])
        has_coordinates = corners and all('x' in c and 'y' in c for c in corners)
        
        print(f"Track: {track_id} ({track_data.get('name', 'Unknown')})")
        
        # Step 1: Generate corner definitions if needed
        if not corners or (args.overwrite and track_id in session_files):
            if track_id in session_files:
                print(f"  Generating corners from session data...")
                new_corners = generate_corners_from_session(session_files[track_id], track_id)
                if new_corners:
                    corners = new_corners
                    print(f"  ✓ Generated {len(corners)} corners from session data")
                else:
                    print(f"  ⚠ Could not generate from session data")
            
            # Fallback to placeholder if still no corners
            if not corners:
                corner_count = TYPICAL_CORNER_COUNTS.get(track_id, 15)
                corners = generate_placeholder_corners(track_id, corner_count)
                print(f"  ✓ Generated {len(corners)} placeholder corners")
        
        # Step 2: Estimate coordinates if needed
        svg_file = track_data.get('svgFile')
        if svg_file and corners:
            svg_path = tracks_dir / svg_file
            if svg_path.exists():
                viewbox = parse_svg_viewbox(svg_path)
                if viewbox:
                    if not has_coordinates or args.overwrite:
                        estimated_corners = estimate_corner_coordinates(corners, viewbox)
                        if estimated_corners:
                            corners = estimated_corners
                            coordinates_estimated += 1
                            print(f"  ✓ Estimated coordinates for {len(corners)} corners")
                        else:
                            print(f"  ⚠ Could not estimate coordinates")
                    else:
                        print(f"  ℹ Already has coordinates")
                else:
                    print(f"  ⚠ Could not parse SVG viewBox")
        
        # Update tracks.json
        if corners and (not data['tracks'][track_id].get('corners') or args.overwrite):
            if not args.dry_run:
                data['tracks'][track_id]['corners'] = corners
            updated_tracks += 1
        
        print()
    
    # Save updates
    if not args.dry_run and updated_tracks > 0:
        backup_file = tracks_file.with_suffix('.json.backup')
        if backup_file.exists():
            backup_file.unlink()
        
        with open(backup_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        with open(tracks_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ Updated {updated_tracks} track(s)")
        print(f"✅ Estimated coordinates for {coordinates_estimated} track(s)")
        print(f"📁 Backup: {backup_file}")
        print(f"📝 Updated: {tracks_file}")
        print("\n⚠️  Coordinates are estimates. Please fine-tune manually in tracks.json")
    elif args.dry_run:
        print(f"Dry run: Would update {updated_tracks} track(s)")
        print(f"Would estimate coordinates for {coordinates_estimated} track(s)")
    
    print(f"\nSummary:")
    print(f"  Tracks processed: {len(tracks)}")
    print(f"  Tracks updated: {updated_tracks}")
    print(f"  Coordinates estimated: {coordinates_estimated}")


if __name__ == '__main__':
    main()

