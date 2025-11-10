#!/usr/bin/env python3
"""
Debug script to check corner matching issues for Australia track.
This script will help identify why corners 6-14 are not matching correctly.
"""

import json
import sys
from pathlib import Path

def analyze_australia_corners():
    """Analyze Australia track corner distance ranges."""
    tracks_path = Path(__file__).parent.parent / "public" / "data" / "tracks.json"
    
    if not tracks_path.exists():
        print(f"Error: {tracks_path} not found")
        return
    
    with open(tracks_path) as f:
        tracks_data = json.load(f)
    
    australia = tracks_data.get("tracks", {}).get("australia")
    if not australia:
        print("Error: Australia track not found")
        return
    
    corners = australia.get("corners", [])
    print("=" * 80)
    print("Australia Track - Corner Distance Range Analysis")
    print("=" * 80)
    print(f"\nTotal corners: {len(corners)}\n")
    
    print("Corner Distance Ranges:")
    print("-" * 80)
    for corner in corners:
        num = corner.get("number")
        range_data = corner.get("expectedDistanceRange", {})
        if range_data:
            min_dist = range_data.get("min", 0)
            max_dist = range_data.get("max", 0)
            range_width = max_dist - min_dist
            print(f"Corner {num:2d}: [{min_dist:7.1f}, {max_dist:7.1f}] - Range: {range_width:5.1f}m - Type: {corner.get('type', 'unknown')}")
        else:
            print(f"Corner {num:2d}: No distance range defined - Type: {corner.get('type', 'unknown')}")
    
    print("\n" + "=" * 80)
    print("Issues Identified:")
    print("=" * 80)
    
    issues = []
    for i, corner in enumerate(corners):
        num = corner.get("number")
        range_data = corner.get("expectedDistanceRange", {})
        if not range_data:
            issues.append(f"Corner {num}: No distance range defined")
            continue
        
        min_dist = range_data.get("min", 0)
        max_dist = range_data.get("max", 0)
        range_width = max_dist - min_dist
        
        # Check for very narrow ranges
        if range_width < 10:
            issues.append(f"Corner {num}: Very narrow range ({range_width:.1f}m) - may miss corners")
        
        # Check for overlapping ranges
        if i > 0:
            prev_corner = corners[i - 1]
            prev_range = prev_corner.get("expectedDistanceRange", {})
            if prev_range:
                prev_max = prev_range.get("max", 0)
                if min_dist < prev_max:
                    overlap = prev_max - min_dist
                    issues.append(f"Corner {num}: Overlaps with corner {prev_corner.get('number')} by {overlap:.1f}m")
        
        # Check for gaps
        if i > 0:
            prev_corner = corners[i - 1]
            prev_range = prev_corner.get("expectedDistanceRange", {})
            if prev_range:
                prev_max = prev_range.get("max", 0)
                gap = min_dist - prev_max
                if gap > 50:
                    issues.append(f"Corner {num}: Large gap from corner {prev_corner.get('number')} ({gap:.1f}m)")
    
    if issues:
        for issue in issues:
            print(f"  ⚠️  {issue}")
    else:
        print("  ✅ No obvious issues found")
    
    print("\n" + "=" * 80)
    print("Problem Corners (6, 7, 8, 10, 11, 12, 13, 14):")
    print("=" * 80)
    problem_corners = [6, 7, 8, 10, 11, 12, 13, 14]
    for corner in corners:
        num = corner.get("number")
        if num in problem_corners:
            range_data = corner.get("expectedDistanceRange", {})
            if range_data:
                min_dist = range_data.get("min", 0)
                max_dist = range_data.get("max", 0)
                range_width = max_dist - min_dist
                center = (min_dist + max_dist) / 2
                print(f"\nCorner {num} ({corner.get('type', 'unknown')}):")
                print(f"  Range: [{min_dist:.1f}, {max_dist:.1f}] ({range_width:.1f}m)")
                print(f"  Center: {center:.1f}m")
                print(f"  Coordinates: ({corner.get('x', 0)}, {corner.get('y', 0)})")
                
                # Suggest expanded range
                expanded_min = max(0, center - 30)
                expanded_max = center + 30
                print(f"  Suggested expanded range: [{expanded_min:.1f}, {expanded_max:.1f}] (±30m from center)")
            else:
                print(f"\nCorner {num}: No distance range defined!")
    
    print("\n" + "=" * 80)
    print("Recommendations:")
    print("=" * 80)
    print("1. Expand narrow distance ranges (especially corners 7, 8)")
    print("2. Resolve overlapping ranges (corners 7-8)")
    print("3. Ensure all corners have distance ranges defined")
    print("4. Consider using ±30m tolerance from range center for matching")

if __name__ == "__main__":
    analyze_australia_corners()




