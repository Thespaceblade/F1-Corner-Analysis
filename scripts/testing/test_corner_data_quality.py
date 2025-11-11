#!/usr/bin/env python3
"""
Test script to validate corner data quality.
Checks for missing corner data, null corner times, and matching issues.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any

def load_session_data(session_path: Path) -> Dict[str, Any]:
    """Load session JSON data."""
    if not session_path.exists():
        return {}
    try:
        with open(session_path) as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {session_path}: {e}")
        return {}

def analyze_corner_data(session_data: Dict[str, Any], track_id: str) -> Dict[str, Any]:
    """Analyze corner data quality."""
    corners = session_data.get("corners", {})
    track_corners = []
    
    # Load track corner definitions
    tracks_path = Path(__file__).parent.parent / "public" / "data" / "tracks.json"
    if tracks_path.exists():
        with open(tracks_path) as f:
            tracks_data = json.load(f)
            track_info = tracks_data.get("tracks", {}).get(track_id)
            if track_info:
                track_corners = track_info.get("corners", [])
    
    results = {
        "track": track_id,
        "drivers": list(corners.keys()),
        "total_corners_expected": len(track_corners),
        "corner_coverage": {},
        "missing_corners": {},
        "null_times": {},
        "issues": []
    }
    
    # Expected corner numbers
    expected_corners = set(corner.get("number") for corner in track_corners)
    
    for driver, driver_corners in corners.items():
        if not isinstance(driver_corners, list):
            continue
        
        # Get unique corner numbers for this driver
        corner_numbers = set()
        corners_with_times = set()
        corners_with_null_times = set()
        
        for corner in driver_corners:
            corner_num = corner.get("cornerNumber")
            if corner_num:
                corner_numbers.add(corner_num)
                corner_time = corner.get("cornerTime")
                if corner_time is not None:
                    corners_with_times.add(corner_num)
                else:
                    corners_with_null_times.add(corner_num)
        
        # Calculate coverage
        missing = expected_corners - corner_numbers
        coverage = len(corner_numbers) / len(expected_corners) * 100 if expected_corners else 0
        
        results["corner_coverage"][driver] = {
            "total_detected": len(corner_numbers),
            "coverage_percent": round(coverage, 1),
            "missing_count": len(missing)
        }
        results["missing_corners"][driver] = sorted(missing)
        results["null_times"][driver] = sorted(corners_with_null_times)
        
        # Identify issues
        if len(missing) > 0:
            results["issues"].append(
                f"{driver}: Missing {len(missing)} corners: {sorted(missing)}"
            )
        if len(corners_with_null_times) > 0:
            results["issues"].append(
                f"{driver}: {len(corners_with_null_times)} corners have null times: {sorted(corners_with_null_times)}"
            )
    
    return results

def test_australia_session():
    """Test Australia track session data."""
    print("=" * 80)
    print("Australia Track - Corner Data Quality Test")
    print("=" * 80)
    
    # Look for session data
    data_dir = Path(__file__).parent.parent / "public" / "data" / "sessions"
    if not data_dir.exists():
        print(f"Data directory not found: {data_dir}")
        return
    
    # Find Australia sessions
    australia_sessions = []
    for year_dir in data_dir.iterdir():
        if not year_dir.is_dir():
            continue
        australia_dir = year_dir / "australia"
        if australia_dir.exists():
            for session_dir in australia_dir.iterdir():
                session_file = session_dir / "session.json"
                if session_file.exists():
                    australia_sessions.append(session_file)
    
    if not australia_sessions:
        print("No Australia session data found")
        print(f"Expected path: {data_dir}/*/australia/*/session.json")
        return
    
    print(f"\nFound {len(australia_sessions)} Australia session(s)\n")
    
    for session_path in australia_sessions[:5]:  # Test up to 5 sessions
        print("-" * 80)
        print(f"Session: {session_path.parent.name}")
        print(f"Path: {session_path}")
        
        session_data = load_session_data(session_path)
        if not session_data:
            print("  ⚠️  Could not load session data")
            continue
        
        results = analyze_corner_data(session_data, "australia")
        
        print(f"\n  Drivers: {', '.join(results['drivers'])}")
        print(f"  Expected corners: {results['total_corners_expected']}")
        
        for driver in results['drivers']:
            coverage = results["corner_coverage"].get(driver, {})
            print(f"\n  {driver}:")
            print(f"    Detected corners: {coverage.get('total_detected', 0)}")
            print(f"    Coverage: {coverage.get('coverage_percent', 0):.1f}%")
            
            missing = results["missing_corners"].get(driver, [])
            if missing:
                print(f"    Missing corners: {missing}")
            
            null_times = results["null_times"].get(driver, [])
            if null_times:
                print(f"    Null times: {null_times}")
        
        # Check for problem corners (6, 7, 8, 10, 11, 12, 13, 14)
        problem_corners = {6, 7, 8, 10, 11, 12, 13, 14}
        print(f"\n  Problem Corners (6, 7, 8, 10, 11, 12, 13, 14):")
        for driver in results['drivers']:
            driver_corners = session_data.get("corners", {}).get(driver, [])
            corner_numbers = {c.get("cornerNumber") for c in driver_corners if c.get("cornerNumber")}
            corner_times = {
                c.get("cornerNumber"): c.get("cornerTime")
                for c in driver_corners
                if c.get("cornerNumber") and c.get("cornerTime") is not None
            }
            
            missing_problem = problem_corners - corner_numbers
            null_problem = problem_corners & corner_numbers - set(corner_times.keys())
            
            print(f"    {driver}:")
            if missing_problem:
                print(f"      Missing: {sorted(missing_problem)}")
            if null_problem:
                print(f"      Null times: {sorted(null_problem)}")
            if not missing_problem and not null_problem:
                print(f"      ✅ All problem corners have data")
                # Show sample times
                for corner_num in sorted(problem_corners & set(corner_times.keys())):
                    time = corner_times[corner_num]
                    print(f"        Corner {corner_num}: {time:.3f}s")
        
        if results["issues"]:
            print(f"\n  ⚠️  Issues:")
            for issue in results["issues"]:
                print(f"    - {issue}")
        else:
            print(f"\n  ✅ No issues found")

def main():
    """Run corner data quality tests."""
    test_australia_session()
    
    print("\n" + "=" * 80)
    print("Test Complete")
    print("=" * 80)

if __name__ == "__main__":
    main()

