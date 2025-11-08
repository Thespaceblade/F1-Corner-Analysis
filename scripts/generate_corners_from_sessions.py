#!/usr/bin/env python3
"""
Generate corner definitions from session data.

This script analyzes session data to generate corner definitions (distance ranges, types)
for tracks that don't have corners defined yet.

Usage:
    python scripts/generate_corners_from_sessions.py
    python scripts/generate_corners_from_sessions.py --year 2025
    python scripts/generate_corners_from_sessions.py --track australia
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Import from analyze_track_corners.py
sys.path.insert(0, str(Path(__file__).parent))
from analyze_track_corners import load_session_data, analyze_corner_positions


def find_session_files(tracks_dir: Path, year: int = 2025, session: str = 'Q') -> Dict[str, Path]:
    """Find session JSON files for all tracks."""
    sessions_dir = tracks_dir.parent / 'data' / 'sessions'
    session_files = {}
    
    if not sessions_dir.exists():
        return session_files
    
    # Look for session files
    pattern = f"{year}_*_{session}.json"
    for session_file in sessions_dir.glob(pattern):
        # Extract track ID from filename (format: YEAR_ROUND_SESSION.json)
        parts = session_file.stem.split('_')
        if len(parts) >= 3:
            # Track ID is typically in the round part, but we need to map it
            # For now, try to match by checking session data
            try:
                data = load_session_data(session_file)
                if data and 'meta' in data:
                    round_slug = data['meta'].get('round')
                    if round_slug:
                        session_files[round_slug] = session_file
            except Exception:
                pass
    
    return session_files


def generate_corner_definitions_from_session(
    session_file: Path,
    track_id: str,
) -> Optional[List[Dict]]:
    """Generate corner definitions from session data."""
    session_data = load_session_data(session_file)
    
    if not session_data:
        return None
    
    corners_data = session_data.get('corners', {})
    
    if not corners_data:
        return None
    
    # Analyze corner positions
    corner_clusters = analyze_corner_positions(corners_data)
    
    if not corner_clusters:
        return None
    
    # Convert clusters to corner definitions
    corner_definitions = []
    
    for i, cluster in enumerate(corner_clusters, 1):
        corner_def = {
            'number': i,
            'type': cluster.get('type', 'medium'),
            'expectedDistanceRange': {
                'min': cluster.get('min', cluster.get('center', 0) - 50),
                'max': cluster.get('max', cluster.get('center', 0) + 50),
            },
        }
        corner_definitions.append(corner_def)
    
    return corner_definitions


def main():
    parser = argparse.ArgumentParser(
        description='Generate corner definitions from session data'
    )
    parser.add_argument(
        '--year',
        type=int,
        default=2025,
        help='Year to use for session data (default: 2025)'
    )
    parser.add_argument(
        '--session',
        type=str,
        default='Q',
        help='Session to use (default: Q)'
    )
    parser.add_argument(
        '--track',
        type=str,
        help='Process only a specific track'
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
    
    # Load tracks.json
    try:
        with open(tracks_file, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading tracks.json: {e}", file=sys.stderr)
        sys.exit(1)
    
    tracks = data.get('tracks', {})
    
    # Find session files
    sessions_dir = project_root / 'public' / 'data' / 'sessions'
    session_files = {}
    
    if sessions_dir.exists():
        # Try to find session files
        for session_file in sessions_dir.glob(f"{args.year}_*_{args.session}.json"):
            # Load session to get track ID
            session_data = load_session_data(session_file)
            if session_data and 'meta' in session_data:
                round_slug = session_data['meta'].get('round')
                if round_slug and round_slug in tracks:
                    session_files[round_slug] = session_file
    
    print(f"Found {len(session_files)} session file(s) for {args.year} {args.session}\n")
    
    # Filter tracks if --track specified
    if args.track:
        if args.track not in tracks:
            print(f"Error: Track '{args.track}' not found", file=sys.stderr)
            sys.exit(1)
        tracks = {args.track: tracks[args.track]}
    
    # Process tracks
    updated_count = 0
    
    for track_id, track_data in sorted(tracks.items()):
        corners = track_data.get('corners', [])
        
        # Skip if already has corners
        if corners:
            print(f"Track: {track_id} - Already has {len(corners)} corner(s)")
            continue
        
        # Check if we have session data
        if track_id not in session_files:
            print(f"Track: {track_id} - No session data found")
            continue
        
        print(f"Track: {track_id} ({track_data.get('name', 'Unknown')})")
        
        # Generate corner definitions
        corner_definitions = generate_corner_definitions_from_session(
            session_files[track_id],
            track_id,
        )
        
        if corner_definitions:
            print(f"  ✓ Generated {len(corner_definitions)} corner(s)")
            
            if not args.dry_run:
                data['tracks'][track_id]['corners'] = corner_definitions
            
            updated_count += 1
            
            # Show first few corners
            for corner in corner_definitions[:3]:
                dist_range = corner.get('expectedDistanceRange', {})
                print(f"    Corner {corner['number']}: {corner['type']} "
                      f"({dist_range.get('min', 0):.0f}-{dist_range.get('max', 0):.0f}m)")
            if len(corner_definitions) > 3:
                print(f"    ... and {len(corner_definitions) - 3} more")
        else:
            print(f"  ⚠ Could not generate corner definitions")
        
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
        except Exception as e:
            print(f"Error saving tracks.json: {e}", file=sys.stderr)
            sys.exit(1)
    elif args.dry_run:
        print(f"Dry run: Would update {updated_count} track(s)")
        print("Run without --dry-run to apply changes")
    
    print(f"\nSummary:")
    print(f"  Processed: {len(tracks)} track(s)")
    print(f"  Updated: {updated_count} track(s)")


if __name__ == '__main__':
    main()

