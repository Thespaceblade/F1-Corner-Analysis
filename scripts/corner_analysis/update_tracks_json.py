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


def find_matching_corner(
    new_corner: Dict[str, Any],
    existing_corners: List[Dict[str, Any]],
    distance_tolerance: float = 50.0
) -> Dict[str, Any] | None:
    """
    Find existing corner that matches new corner by distance range overlap.
    
    Returns the existing corner if it overlaps with the new corner's distance range,
    or None if no match is found.
    """
    new_range = new_corner.get("expectedDistanceRange", {})
    new_min = new_range.get("min", 0)
    new_max = new_range.get("max", 0)
    
    if new_min == 0 and new_max == 0:
        return None
    
    best_match = None
    best_overlap = 0
    
    for existing in existing_corners:
        existing_range = existing.get("expectedDistanceRange", {})
        existing_min = existing_range.get("min", 0)
        existing_max = existing_range.get("max", 0)
        
        if existing_min == 0 and existing_max == 0:
            continue
        
        # Check for overlap
        overlap_min = max(new_min, existing_min)
        overlap_max = min(new_max, existing_max)
        
        if overlap_min <= overlap_max:
            # Calculate overlap percentage
            new_width = new_max - new_min
            existing_width = existing_max - existing_min
            overlap_width = overlap_max - overlap_min
            
            # Use the smaller range as denominator for percentage
            overlap_pct = overlap_width / min(new_width, existing_width) if min(new_width, existing_width) > 0 else 0
            
            if overlap_pct > best_overlap:
                best_overlap = overlap_pct
                best_match = existing
    
    # Require at least 30% overlap to consider it a match
    if best_overlap >= 0.3:
        return best_match
    
    return None


def merge_corner_definitions(
    tracks_data: Dict[str, Any], corner_definitions: Dict[str, Dict[str, Any]], remove_metadata: bool = True
) -> Dict[str, Any]:
    """
    Merge corner definitions into tracks.json structure, preserving existing corners.
    
    This function:
    1. Updates distance ranges for corners that were detected
    2. Preserves existing corners that weren't detected (keeps coordinates and types)
    3. Matches corners by distance range overlap, not just by number
    4. Preserves all coordinates (x, y) from existing corners
    """
    tracks = tracks_data.get("tracks", {})
    
    for track_id, corner_data in corner_definitions.items():
        if track_id not in tracks:
            print(f"Warning: Track {track_id} not found in tracks.json, skipping", file=sys.stderr)
            continue
        
        new_corners = corner_data.get("corners", [])
        if not new_corners:
            print(f"Warning: No corners found for {track_id}, skipping", file=sys.stderr)
            continue
        
        # Get existing corners - these will be preserved if not matched
        existing_corners = tracks[track_id].get("corners", [])
        existing_by_number = {c.get("number"): c for c in existing_corners if "number" in c}
        matched_existing = set()  # Track which existing corners were matched
        
        # Merge new corner data with existing corners
        merged_corners = []
        
        # First, process new corners and match them to existing ones
        for new_corner in new_corners:
            corner_number = new_corner.get("number")
            if corner_number is None:
                print(f"Warning: Corner missing number in {track_id}, skipping", file=sys.stderr)
                continue
            
            # Start with new corner data
            merged_corner = new_corner.copy()
            
            # Try to find matching existing corner by distance range
            matched_existing_corner = find_matching_corner(new_corner, existing_corners)
            
            if matched_existing_corner:
                # Update existing corner with new distance range, preserve everything else
                matched_number = matched_existing_corner.get("number")
                matched_existing.add(matched_number)
                
                # Preserve all existing properties (coordinates, number, type if not in new)
                if "x" in matched_existing_corner:
                    merged_corner["x"] = matched_existing_corner["x"]
                if "y" in matched_existing_corner:
                    merged_corner["y"] = matched_existing_corner["y"]
                if "number" not in merged_corner or merged_corner["number"] != matched_number:
                    merged_corner["number"] = matched_number  # Preserve original number
                if "type" not in merged_corner and "type" in matched_existing_corner:
                    merged_corner["type"] = matched_existing_corner["type"]  # Preserve type if new doesn't have it
            elif corner_number in existing_by_number:
                # Match by number if distance matching didn't work
                existing_corner = existing_by_number[corner_number]
                matched_existing.add(corner_number)
                
                if "x" in existing_corner:
                    merged_corner["x"] = existing_corner["x"]
                if "y" in existing_corner:
                    merged_corner["y"] = existing_corner["y"]
                if "type" not in merged_corner and "type" in existing_corner:
                    merged_corner["type"] = existing_corner["type"]
            
            # Remove metadata if requested
            if remove_metadata:
                merged_corner.pop("_metadata", None)
            
            merged_corners.append(merged_corner)
        
        # Add existing corners that weren't matched (preserve undetected corners)
        for existing_corner in existing_corners:
            existing_number = existing_corner.get("number")
            if existing_number and existing_number not in matched_existing:
                # This corner wasn't detected in new analysis, but we preserve it
                preserved_corner = existing_corner.copy()
                # Ensure it has required fields
                if "expectedDistanceRange" not in preserved_corner:
                    # If no distance range, create a placeholder
                    preserved_corner["expectedDistanceRange"] = {"min": 0, "max": 0}
                merged_corners.append(preserved_corner)
        
        # Sort by corner number to maintain order
        merged_corners.sort(key=lambda c: c.get("number", 999))
        
        # Update track with merged corner definitions
        tracks[track_id]["corners"] = merged_corners
        
        preserved_count = sum(1 for c in merged_corners if "x" in c and "y" in c)
        updated_count = len([c for c in merged_corners if c.get("number") in matched_existing])
        preserved_undetected = len(merged_corners) - len(new_corners)
        
        print(
            f"✓ Updated {track_id}: {len(merged_corners)} corners "
            f"({updated_count} updated, {preserved_undetected} preserved, {preserved_count} with coordinates)",
            file=sys.stderr
        )
    
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

