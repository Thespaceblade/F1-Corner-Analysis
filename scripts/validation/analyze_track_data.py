#!/usr/bin/env python3
"""
Comprehensive analysis of all track data to verify completeness.

This script checks:
- Calendar tracks vs session data
- Session data validity
- Corner definitions
- tracks.json completeness

Usage:
    python scripts/validation/analyze_track_data.py --year 2025
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set


def load_calendar(calendar_path: Path) -> Dict[str, dict]:
    """Load calendar and return track mapping."""
    data = json.loads(calendar_path.read_text())
    return {r['id']: r for r in data.get('rounds', [])}


def analyze_session_data(sessions_dir: Path, year: int) -> Dict[str, Dict]:
    """Analyze all session data files."""
    year_dir = sessions_dir / str(year)
    if not year_dir.exists():
        return {}
    
    results = defaultdict(dict)
    
    for track_dir in sorted(year_dir.iterdir()):
        if not track_dir.is_dir():
            continue
        
        track_id = track_dir.name
        track_sessions = {}
        
        for session_dir in track_dir.iterdir():
            if not session_dir.is_dir():
                continue
            
            session_code = session_dir.name
            session_file = session_dir / 'session.json'
            
            if not session_file.exists():
                track_sessions[session_code] = {
                    'status': 'missing',
                    'error': 'File not found'
                }
                continue
            
            try:
                data = json.loads(session_file.read_text())
                meta = data.get('meta', {})
                status = meta.get('status', 'unknown')
                
                track_sessions[session_code] = {
                    'status': status,
                    'drivers': len(data.get('drivers', {})),
                    'laps': len(data.get('laps', [])),
                    'corners': len(data.get('corners', {})),
                    'error': meta.get('message') if status != 'ok' else None
                }
            except json.JSONDecodeError as e:
                track_sessions[session_code] = {
                    'status': 'error',
                    'error': f'Invalid JSON: {e}'
                }
            except Exception as e:
                track_sessions[session_code] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        results[track_id] = track_sessions
    
    return dict(results)


def analyze_corner_definitions(corners_dir: Path) -> Dict[str, dict]:
    """Analyze corner definition files."""
    if not corners_dir.exists():
        return {}
    
    results = {}
    
    for corner_file in sorted(corners_dir.glob('*.json')):
        if corner_file.name == 'summary.json':
            continue
        
        track_id = corner_file.stem
        
        try:
            data = json.loads(corner_file.read_text())
            corners = data.get('corners', [])
            
            results[track_id] = {
                'corner_count': len(corners),
                'has_coordinates': any(
                    'x' in c and 'y' in c for c in corners
                ),
                'has_distance_ranges': any(
                    'expectedDistanceRange' in c for c in corners
                ),
                'corner_types': set(c.get('type', 'unknown') for c in corners)
            }
        except Exception as e:
            results[track_id] = {
                'error': str(e)
            }
    
    return results


def analyze_tracks_json(tracks_json_path: Path) -> Dict[str, dict]:
    """Analyze tracks.json file."""
    if not tracks_json_path.exists():
        return {}
    
    try:
        data = json.loads(tracks_json_path.read_text())
        tracks = data.get('tracks', {})
        
        results = {}
        for track_id, track_data in tracks.items():
            corners = track_data.get('corners', [])
            results[track_id] = {
                'has_svg': bool(track_data.get('svgFile')),
                'has_name': bool(track_data.get('name')),
                'corner_count': len(corners),
                'has_corners': len(corners) > 0
            }
        
        return results
    except Exception as e:
        print(f"Error reading tracks.json: {e}", file=sys.stderr)
        return {}


def print_report(
    calendar_tracks: Dict[str, dict],
    session_data: Dict[str, Dict],
    corner_defs: Dict[str, dict],
    tracks_json: Dict[str, dict],
    year: int
):
    """Print comprehensive analysis report."""
    
    print(f"\n{'='*80}")
    print(f"  TRACK DATA ANALYSIS - {year}")
    print(f"{'='*80}\n")
    
    # Track counts
    calendar_ids = set(calendar_tracks.keys())
    session_ids = set(session_data.keys())
    corner_ids = set(corner_defs.keys())
    json_ids = set(tracks_json.keys())
    
    print(f"📊 OVERVIEW")
    print(f"  Calendar tracks: {len(calendar_ids)}")
    print(f"  Tracks with session data: {len(session_ids)}")
    print(f"  Tracks with corner definitions: {len(corner_ids)}")
    print(f"  Tracks in tracks.json: {len(json_ids)}")
    print()
    
    # Missing data
    missing_sessions = calendar_ids - session_ids
    missing_corners = calendar_ids - corner_ids
    missing_json = calendar_ids - json_ids
    
    if missing_sessions or missing_corners or missing_json:
        print(f"⚠️  MISSING DATA")
        if missing_sessions:
            print(f"  Missing session data: {sorted(missing_sessions)}")
        if missing_corners:
            print(f"  Missing corner definitions: {sorted(missing_corners)}")
        if missing_json:
            print(f"  Missing in tracks.json: {sorted(missing_json)}")
        print()
    
    # Session data analysis
    print(f"📁 SESSION DATA ANALYSIS")
    session_stats = defaultdict(int)
    total_sessions = 0
    valid_sessions = 0
    
    for track_id, sessions in session_data.items():
        for session_code, session_info in sessions.items():
            total_sessions += 1
            status = session_info.get('status', 'unknown')
            session_stats[status] += 1
            if status == 'ok':
                valid_sessions += 1
    
    print(f"  Total session files: {total_sessions}")
    print(f"  Valid sessions (status=ok): {valid_sessions}")
    print(f"  Session status breakdown:")
    for status, count in sorted(session_stats.items()):
        print(f"    {status:15s}: {count:3d}")
    print()
    
    # Per-track session summary
    print(f"📋 PER-TRACK SESSION SUMMARY")
    print(f"  {'Track':<25s} {'Sessions':<15s} {'Valid':<8s} {'Drivers':<10s} {'Laps':<10s}")
    print(f"  {'-'*25} {'-'*15} {'-'*8} {'-'*10} {'-'*10}")
    
    for track_id in sorted(calendar_ids):
        track_name = calendar_tracks[track_id].get('name', track_id)
        sessions = session_data.get(track_id, {})
        
        valid_count = sum(1 for s in sessions.values() if s.get('status') == 'ok')
        total_count = len(sessions)
        
        # Get average drivers and laps from valid sessions
        valid_sessions_list = [s for s in sessions.values() if s.get('status') == 'ok']
        avg_drivers = sum(s.get('drivers', 0) for s in valid_sessions_list) / len(valid_sessions_list) if valid_sessions_list else 0
        avg_laps = sum(s.get('laps', 0) for s in valid_sessions_list) / len(valid_sessions_list) if valid_sessions_list else 0
        
        print(f"  {track_name[:24]:<25s} {total_count:3d} total     {valid_count:3d}      {avg_drivers:5.1f}      {avg_laps:6.1f}")
    print()
    
    # Corner definitions analysis
    print(f"🔷 CORNER DEFINITIONS ANALYSIS")
    total_corners = sum(c.get('corner_count', 0) for c in corner_defs.values())
    tracks_with_corners = sum(1 for c in corner_defs.values() if c.get('corner_count', 0) > 0)
    
    print(f"  Tracks with corner definitions: {tracks_with_corners}/{len(calendar_ids)}")
    print(f"  Total corners defined: {total_corners}")
    if corner_defs:
        avg_corners = total_corners / len(corner_defs)
        print(f"  Average corners per track: {avg_corners:.1f}")
    print()
    
    # tracks.json analysis
    print(f"📄 TRACKS.JSON ANALYSIS")
    tracks_with_corners_json = sum(1 for t in tracks_json.values() if t.get('has_corners'))
    tracks_with_svg = sum(1 for t in tracks_json.values() if t.get('has_svg'))
    
    print(f"  Tracks with corner definitions: {tracks_with_corners_json}/{len(json_ids)}")
    print(f"  Tracks with SVG files: {tracks_with_svg}/{len(json_ids)}")
    print()
    
    # Summary
    print(f"{'='*80}")
    print(f"✅ SUMMARY")
    print(f"{'='*80}")
    
    all_complete = (
        not missing_sessions and
        not missing_corners and
        not missing_json and
        tracks_with_corners == len(calendar_ids) and
        tracks_with_corners_json == len(calendar_ids)
    )
    
    if all_complete:
        print(f"✅ All {len(calendar_ids)} tracks have complete data!")
        print(f"   - Session data: ✅")
        print(f"   - Corner definitions: ✅")
        print(f"   - tracks.json: ✅")
    else:
        print(f"⚠️  Some tracks are missing data:")
        if missing_sessions:
            print(f"   - Missing session data: {len(missing_sessions)} tracks")
        if missing_corners:
            print(f"   - Missing corner definitions: {len(missing_corners)} tracks")
        if missing_json:
            print(f"   - Missing in tracks.json: {len(missing_json)} tracks")
        if tracks_with_corners < len(calendar_ids):
            print(f"   - Corner definitions incomplete: {tracks_with_corners}/{len(calendar_ids)}")
        if tracks_with_corners_json < len(calendar_ids):
            print(f"   - tracks.json incomplete: {tracks_with_corners_json}/{len(calendar_ids)}")
    
    print()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Analyze all track data for completeness"
    )
    parser.add_argument(
        "--year",
        type=int,
        default=2025,
        help="Year to analyze (default: 2025)"
    )
    parser.add_argument(
        "--calendar",
        type=Path,
        default=Path("public/data/calendar2025.json"),
        help="Path to calendar JSON file"
    )
    parser.add_argument(
        "--sessions-dir",
        type=Path,
        default=Path("public/data/sessions"),
        help="Session data directory"
    )
    parser.add_argument(
        "--corners-dir",
        type=Path,
        default=Path("output/corners"),
        help="Corner definitions directory"
    )
    parser.add_argument(
        "--tracks-json",
        type=Path,
        default=Path("public/data/tracks.json"),
        help="Path to tracks.json file"
    )
    
    args = parser.parse_args()
    
    # Load calendar
    if not args.calendar.exists():
        print(f"❌ ERROR: Calendar file not found: {args.calendar}", file=sys.stderr)
        return 1
    
    calendar_tracks = load_calendar(args.calendar)
    
    # Analyze session data
    session_data = analyze_session_data(args.sessions_dir, args.year)
    
    # Analyze corner definitions
    corner_defs = analyze_corner_definitions(args.corners_dir)
    
    # Analyze tracks.json
    tracks_json = analyze_tracks_json(args.tracks_json)
    
    # Print report
    print_report(
        calendar_tracks,
        session_data,
        corner_defs,
        tracks_json,
        args.year
    )
    
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
