#!/usr/bin/env python3
"""
Restore corner coordinates from git history.

This script restores x and y coordinates for corners that were lost
when update_tracks_json.py replaced the corners array.

Usage:
    python scripts/corner_analysis/restore_corner_coordinates.py --commit b78a85c
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict


def get_tracks_json_from_commit(commit: str) -> Dict[str, Any] | None:
    """Get tracks.json content from a specific git commit."""
    try:
        result = subprocess.run(
            ["git", "show", f"{commit}:public/data/tracks.json"],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError:
        print(f"Error: Could not get tracks.json from commit {commit}", file=sys.stderr)
        return None
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in commit {commit}: {e}", file=sys.stderr)
        return None


def restore_coordinates(
    current_tracks: Dict[str, Any],
    historical_tracks: Dict[str, Any]
) -> Dict[str, Any]:
    """Restore x and y coordinates from historical data."""
    restored_count = 0
    total_corners = 0
    
    for track_id, current_track in current_tracks.get("tracks", {}).items():
        if track_id not in historical_tracks.get("tracks", {}):
            continue
        
        historical_track = historical_tracks["tracks"][track_id]
        historical_corners = historical_track.get("corners", [])
        
        if not historical_corners:
            continue
        
        # Create map of historical corners by number
        historical_by_number = {
            c.get("number"): c 
            for c in historical_corners 
            if "number" in c and "x" in c and "y" in c
        }
        
        # Restore coordinates in current corners
        current_corners = current_track.get("corners", [])
        for corner in current_corners:
            total_corners += 1
            corner_number = corner.get("number")
            
            if corner_number in historical_by_number:
                hist_corner = historical_by_number[corner_number]
                if "x" not in corner and "x" in hist_corner:
                    corner["x"] = hist_corner["x"]
                    restored_count += 1
                if "y" not in corner and "y" in hist_corner:
                    corner["y"] = hist_corner["y"]
                    if "x" not in corner:
                        restored_count -= 1  # Don't double count
    
    print(f"Restored coordinates for {restored_count} out of {total_corners} corners", file=sys.stderr)
    return current_tracks


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Restore corner coordinates from git history"
    )
    parser.add_argument(
        "--commit",
        type=str,
        default="b78a85c",
        help="Git commit hash to restore coordinates from (default: b78a85c)"
    )
    parser.add_argument(
        "--tracks-json",
        type=Path,
        default=Path("public/data/tracks.json"),
        help="Path to tracks.json file (default: public/data/tracks.json)"
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output file (default: overwrite tracks.json)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be restored without making changes"
    )
    
    args = parser.parse_args()
    
    # Load current tracks.json
    if not args.tracks_json.exists():
        print(f"Error: tracks.json not found: {args.tracks_json}", file=sys.stderr)
        return 1
    
    current_tracks = json.loads(args.tracks_json.read_text())
    
    # Get historical tracks.json
    historical_tracks = get_tracks_json_from_commit(args.commit)
    if not historical_tracks:
        return 1
    
    # Restore coordinates
    restored_tracks = restore_coordinates(current_tracks, historical_tracks)
    
    if args.dry_run:
        print("\nDry run - would restore coordinates", file=sys.stderr)
        return 0
    
    # Write restored tracks.json
    output_path = args.output or args.tracks_json
    with open(output_path, "w") as f:
        json.dump(restored_tracks, f, indent=2)
    
    print(f"\n✓ Restored coordinates to: {output_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
