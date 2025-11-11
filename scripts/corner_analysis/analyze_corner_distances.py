#!/usr/bin/env python3
"""
Analyze actual corner distances vs expected ranges.
"""

import json
from pathlib import Path
from collections import defaultdict

def analyze_corner_distances():
    """Analyze corner distances in session data."""
    session_path = Path(__file__).parent.parent / "public" / "data" / "sessions" / "2025" / "australia" / "R" / "session.json"
    
    if not session_path.exists():
        print(f"Session not found: {session_path}")
        return
    
    with open(session_path) as f:
        data = json.load(f)
    
    # Load track definitions
    tracks_path = Path(__file__).parent.parent / "public" / "data" / "tracks.json"
    with open(tracks_path) as f:
        tracks_data = json.load(f)
    
    australia_track = tracks_data.get("tracks", {}).get("australia", {})
    track_corners = australia_track.get("corners", [])
    
    print("=" * 80)
    print("Corner Distance Analysis - Australia Race")
    print("=" * 80)
    
    # Get VER and NOR corners
    corners = data.get("corners", {})
    ver_corners = corners.get("VER", [])
    nor_corners = corners.get("NOR", [])
    
    print(f"\nVER corners: {len(ver_corners)}")
    print(f"NOR corners: {len(nor_corners)}")
    
    # Analyze distances by corner number
    ver_by_corner = defaultdict(list)
    nor_by_corner = defaultdict(list)
    
    for corner in ver_corners:
        corner_num = corner.get("cornerNumber")
        apex_dist = corner.get("apexDistance")
        if corner_num and apex_dist:
            ver_by_corner[corner_num].append(apex_dist)
    
    for corner in nor_corners:
        corner_num = corner.get("cornerNumber")
        apex_dist = corner.get("apexDistance")
        if corner_num and apex_dist:
            nor_by_corner[corner_num].append(apex_dist)
    
    print("\n" + "=" * 80)
    print("Detected Corner Distances vs Expected Ranges")
    print("=" * 80)
    
    for track_corner in track_corners:
        corner_num = track_corner.get("number")
        expected_range = track_corner.get("expectedDistanceRange", {})
        expected_min = expected_range.get("min", 0)
        expected_max = expected_range.get("max", 0)
        
        ver_dists = ver_by_corner.get(corner_num, [])
        nor_dists = nor_by_corner.get(corner_num, [])
        
        ver_avg = sum(ver_dists) / len(ver_dists) if ver_dists else None
        nor_avg = sum(nor_dists) / len(nor_dists) if nor_dists else None
        
        ver_min = min(ver_dists) if ver_dists else None
        ver_max = max(ver_dists) if ver_dists else None
        nor_min = min(nor_dists) if nor_dists else None
        nor_max = max(nor_dists) if nor_dists else None
        
        print(f"\nCorner {corner_num}:")
        print(f"  Expected range: [{expected_min}, {expected_max}] ({expected_max - expected_min:.0f}m)")
        
        if ver_dists:
            print(f"  VER: {len(ver_dists)} samples")
            print(f"    Range: [{ver_min:.1f}, {ver_max:.1f}]")
            print(f"    Avg: {ver_avg:.1f}")
            in_range = sum(1 for d in ver_dists if expected_min <= d <= expected_max)
            print(f"    In expected range: {in_range}/{len(ver_dists)} ({in_range/len(ver_dists)*100:.1f}%)")
        else:
            print(f"  VER: No data")
        
        if nor_dists:
            print(f"  NOR: {len(nor_dists)} samples")
            print(f"    Range: [{nor_min:.1f}, {nor_max:.1f}]")
            print(f"    Avg: {nor_avg:.1f}")
            in_range = sum(1 for d in nor_dists if expected_min <= d <= expected_max)
            print(f"    In expected range: {in_range}/{len(nor_dists)} ({in_range/len(nor_dists)*100:.1f}%)")
        else:
            print(f"  NOR: No data")
        
        # Check if averages are outside expected range
        if ver_avg and (ver_avg < expected_min or ver_avg > expected_max):
            diff_min = expected_min - ver_avg if ver_avg < expected_min else 0
            diff_max = ver_avg - expected_max if ver_avg > expected_max else 0
            diff = diff_min + diff_max
            print(f"    ⚠️  VER average is {diff:.1f}m outside expected range")
        
        if nor_avg and (nor_avg < expected_min or nor_avg > expected_max):
            diff_min = expected_min - nor_avg if nor_avg < expected_min else 0
            diff_max = nor_avg - expected_max if nor_avg > expected_max else 0
            diff = diff_min + diff_max
            print(f"    ⚠️  NOR average is {diff:.1f}m outside expected range")
    
    # Check maximum distance
    all_distances = [c.get("apexDistance") for c in ver_corners + nor_corners if c.get("apexDistance")]
    max_dist = max(all_distances) if all_distances else 0
    print(f"\n" + "=" * 80)
    print(f"Maximum detected distance: {max_dist:.1f}m")
    print(f"Track corners 11-14 expect distances: 4800-5250m")
    print(f"⚠️  Maximum distance ({max_dist:.1f}m) is less than minimum expected (4800m)")
    print("=" * 80)
    
    # Find unmatched corners (those detected but not matched)
    all_detected_distances = sorted(set([c.get("apexDistance") for c in ver_corners + nor_corners if c.get("apexDistance")]))
    print(f"\nAll detected apex distances (sample):")
    print(f"  First 20: {all_detected_distances[:20]}")
    print(f"  Last 20: {all_detected_distances[-20:]}")
    
    # Check for corners near expected ranges
    print(f"\nChecking for corners near expected ranges for 11-14:")
    problem_corners = [11, 12, 13, 14]
    for corner_num in problem_corners:
        track_corner = next((c for c in track_corners if c.get("number") == corner_num), None)
        if not track_corner:
            continue
        expected_range = track_corner.get("expectedDistanceRange", {})
        expected_min = expected_range.get("min", 0)
        expected_max = expected_range.get("max", 0)
        
        # Find detected corners near this range
        near_distances = [d for d in all_detected_distances if abs(d - (expected_min + expected_max) / 2) < 200]
        print(f"  Corner {corner_num} expects [{expected_min}, {expected_max}]")
        if near_distances:
            print(f"    Found nearby distances: {near_distances[:5]}")
        else:
            print(f"    No nearby distances found")

if __name__ == "__main__":
    analyze_corner_distances()





