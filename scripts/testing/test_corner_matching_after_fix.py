#!/usr/bin/env python3
"""
Test corner matching after fixing distance ranges.
"""

import json
from pathlib import Path
from collections import defaultdict

def test_corner_matching():
    """Test corner matching with updated ranges."""
    print("=" * 80)
    print("Corner Matching Test - After Fix")
    print("=" * 80)
    
    # Load tracks data
    tracks_path = Path(__file__).parent.parent / "public" / "data" / "tracks.json"
    with open(tracks_path) as f:
        tracks_data = json.load(f)
    
    australia_track = tracks_data.get("tracks", {}).get("australia", {})
    track_corners = australia_track.get("corners", [])
    
    # Load session data
    session_path = Path(__file__).parent.parent / "public" / "data" / "sessions" / "2025" / "australia" / "R" / "session.json"
    with open(session_path) as f:
        session_data = json.load(f)
    
    corners = session_data.get("corners", {})
    
    print(f"\nTesting Australia Race session")
    print(f"Expected corners: {len(track_corners)}")
    print(f"Drivers with corner data: {len(corners)}")
    
    # Expected corner numbers
    expected_corners = set(c.get("number") for c in track_corners)
    problem_corners = {6, 7, 8, 10, 11, 12, 13, 14}
    
    print(f"\nProblem corners: {sorted(problem_corners)}")
    print(f"Expected distance ranges:")
    for corner_num in sorted(problem_corners):
        track_corner = next((c for c in track_corners if c.get("number") == corner_num), None)
        if track_corner:
            range_data = track_corner.get("expectedDistanceRange", {})
            print(f"  Corner {corner_num}: [{range_data.get('min')}, {range_data.get('max')}]")
    
    print(f"\n" + "=" * 80)
    print("Corner Matching Results:")
    print("=" * 80)
    
    # Test matching logic
    def match_corner_to_track(apex_dist, tolerance=50.0):
        """Match a detected corner to track corner."""
        best_match = None
        best_diff = float("inf")
        
        for track_corner in track_corners:
            range_data = track_corner.get("expectedDistanceRange", {})
            if not range_data:
                continue
            
            expected_min = range_data.get("min", 0)
            expected_max = range_data.get("max", 0)
            
            # Calculate distance from range
            if apex_dist < expected_min:
                dist_from_range = expected_min - apex_dist
            elif apex_dist > expected_max:
                dist_from_range = apex_dist - expected_max
            else:
                # Inside range - use distance from center
                range_center = (expected_min + expected_max) / 2.0
                dist_from_range = abs(apex_dist - range_center)
            
            # Consider if within tolerance
            if dist_from_range <= tolerance:
                if dist_from_range < best_diff:
                    best_match = track_corner.get("number")
                    best_diff = dist_from_range
        
        return best_match, best_diff
    
    # Test with VER and NOR
    for driver in ["VER", "NOR"]:
        driver_corners = corners.get(driver, [])
        if not driver_corners:
            continue
        
        print(f"\n{driver}:")
        corner_numbers = set()
        corner_distances = {}
        
        for corner in driver_corners:
            corner_num = corner.get("cornerNumber")
            apex_dist = corner.get("apexDistance")
            if corner_num and apex_dist:
                corner_numbers.add(corner_num)
                if corner_num not in corner_distances:
                    corner_distances[corner_num] = []
                corner_distances[corner_num].append(apex_dist)
        
        print(f"  Detected corners: {sorted(corner_numbers)}")
        print(f"  Missing corners: {sorted(expected_corners - corner_numbers)}")
        
        # Check problem corners
        print(f"\n  Problem corners status:")
        for corner_num in sorted(problem_corners):
            if corner_num in corner_numbers:
                dists = corner_distances[corner_num]
                avg_dist = sum(dists) / len(dists)
                track_corner = next((c for c in track_corners if c.get("number") == corner_num), None)
                if track_corner:
                    range_data = track_corner.get("expectedDistanceRange", {})
                    expected_min = range_data.get("min", 0)
                    expected_max = range_data.get("max", 0)
                    
                    if expected_min <= avg_dist <= expected_max:
                        status = "✅ IN RANGE"
                    else:
                        diff = min(abs(avg_dist - expected_min), abs(avg_dist - expected_max))
                        status = f"⚠️  OUT OF RANGE (diff: {diff:.1f}m)"
                    
                    print(f"    Corner {corner_num}: {len(dists)} samples, avg {avg_dist:.1f}m, range [{expected_min}, {expected_max}] - {status}")
                else:
                    print(f"    Corner {corner_num}: {len(dists)} samples, avg {avg_dist:.1f}m - ⚠️  No track definition")
            else:
                # Check if there are unmatched corners that might match
                print(f"    Corner {corner_num}: ❌ NOT DETECTED")
                
                # Check if any unmatched corners might be this corner
                unmatched_corners = []
                for corner in driver_corners:
                    corner_num_detected = corner.get("cornerNumber")
                    apex_dist = corner.get("apexDistance")
                    if corner_num_detected and apex_dist:
                        # This corner is already matched, skip
                        continue
                    
                    # Check if this unmatched corner might match corner_num
                    matched_num, diff = match_corner_to_track(apex_dist)
                    if matched_num == corner_num:
                        unmatched_corners.append(apex_dist)
                
                if unmatched_corners:
                    print(f"      Found {len(unmatched_corners)} potential matches at distances: {unmatched_corners[:5]}")
        
        # Coverage
        coverage = len(corner_numbers) / len(expected_corners) * 100
        print(f"\n  Coverage: {coverage:.1f}% ({len(corner_numbers)}/{len(expected_corners)})")
        
        # Problem corner coverage
        problem_coverage = len(corner_numbers & problem_corners) / len(problem_corners) * 100
        print(f"  Problem corner coverage: {problem_coverage:.1f}% ({len(corner_numbers & problem_corners)}/{len(problem_corners)})")

if __name__ == "__main__":
    test_corner_matching()





