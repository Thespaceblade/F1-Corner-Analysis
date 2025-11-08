#!/usr/bin/env python3
"""
Update tracks.json with generated corner definitions.

This script merges corner definitions from analysis output into tracks.json,
preserving existing track metadata and adding corner definitions.

Usage:
    python scripts/update_tracks_json.py --input-dir output/corners --tracks-json public/data/tracks.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict


def load_tracks_json(tracks_json_path: Path) -> Dict[str, Any]:
    """Load tracks.json file."""
    if not tracks_json_path.exists():
        print(f"Error: tracks.json not found: {tracks_json_path}", file=sys.stderr)
        sys.exit(1)

    with open(tracks_json_path) as f:
        return json.load(f)


def load_corner_definitions(input_dir: Path) -> Dict[str, Dict[str, Any]]:
    """Load corner definitions from analysis output directory."""
    definitions = {}
    
    for corner_file in input_dir.glob("*.json"):
        if corner_file.name == "summary.json":
            continue
        
        try:
            with open(corner_file) as f:
                data = json.load(f)
            track_id = data.get("track")
            if track_id:
                definitions[track_id] = data
        except Exception as e:
            print(f"Warning: Could not load {corner_file}: {e}", file=sys.stderr)
    
    return definitions


def merge_corner_definitions(
    tracks_data: Dict[str, Any], corner_definitions: Dict[str, Dict[str, Any]], remove_metadata: bool = True
) -> Dict[str, Any]:
    """Merge corner definitions into tracks.json structure."""
    tracks = tracks_data.get("tracks", {})
    
    for track_id, corner_data in corner_definitions.items():
        if track_id not in tracks:
            print(f"Warning: Track {track_id} not found in tracks.json, skipping", file=sys.stderr)
            continue
        
        corners = corner_data.get("corners", [])
        if not corners:
            print(f"Warning: No corners found for {track_id}, skipping", file=sys.stderr)
            continue
        
        # Remove metadata if requested
        if remove_metadata:
            for corner in corners:
                corner.pop("_metadata", None)
        
        # Update track with corner definitions
        tracks[track_id]["corners"] = corners
        
        print(f"✓ Updated {track_id}: {len(corners)} corners", file=sys.stderr)
    
    return tracks_data


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Update tracks.json with generated corner definitions"
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        required=True,
        help="Directory containing corner definition JSON files",
    )
    parser.add_argument(
        "--tracks-json",
        type=Path,
        default=Path("public/data/tracks.json"),
        help="Path to tracks.json file (default: public/data/tracks.json)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output file (default: overwrite tracks.json)",
    )
    parser.add_argument(
        "--keep-metadata",
        action="store_true",
        help="Keep metadata fields in corner definitions",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be updated without making changes",
    )

    args = parser.parse_args()

    # Load tracks.json
    tracks_data = load_tracks_json(args.tracks_json)

    # Load corner definitions
    corner_definitions = load_corner_definitions(args.input_dir)
    
    if not corner_definitions:
        print("Error: No corner definitions found in input directory", file=sys.stderr)
        return 1

    print(f"Found corner definitions for {len(corner_definitions)} tracks", file=sys.stderr)

    # Merge corner definitions
    updated_tracks_data = merge_corner_definitions(
        tracks_data, corner_definitions, remove_metadata=not args.keep_metadata
    )

    # Output results
    output_path = args.output or args.tracks_json
    
    if args.dry_run:
        print("\nDry run - would update:", file=sys.stderr)
        for track_id in corner_definitions.keys():
            if track_id in tracks_data.get("tracks", {}):
                corners = corner_definitions[track_id].get("corners", [])
                print(f"  {track_id}: {len(corners)} corners", file=sys.stderr)
        return 0

    # Write updated tracks.json
    with open(output_path, "w") as f:
        json.dump(updated_tracks_data, f, indent=2)

    print(f"\n✓ Updated tracks.json: {output_path}", file=sys.stderr)
    
    # Count tracks with corners
    tracks_with_corners = sum(
        1 for track in updated_tracks_data.get("tracks", {}).values()
        if track.get("corners")
    )
    print(f"  Tracks with corner definitions: {tracks_with_corners}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

