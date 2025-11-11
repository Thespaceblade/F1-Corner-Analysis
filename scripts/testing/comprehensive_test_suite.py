#!/usr/bin/env python3
"""
Comprehensive test suite for F1 Corner Analysis application.
Tests corner data, event markers, coordinates, and data quality.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple
from collections import defaultdict

def load_tracks_data() -> Dict[str, Any]:
    """Load tracks.json data."""
    tracks_path = Path(__file__).parent.parent / "public" / "data" / "tracks.json"
    if not tracks_path.exists():
        return {}
    try:
        with open(tracks_path) as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading tracks.json: {e}")
        return {}

def load_session_data(session_path: Path) -> Dict[str, Any]:
    """Load session JSON data."""
    if not session_path.exists():
        return {}
    try:
        with open(session_path) as f:
            return json.load(f)
    except Exception as e:
        return {}

def test_corner_coordinates():
    """Test corner coordinates are valid."""
    print("=" * 80)
    print("TEST 1: Corner Coordinate Validation")
    print("=" * 80)
    
    tracks_data = load_tracks_data()
    tracks = tracks_data.get("tracks", {})
    
    issues = []
    for track_id, track in tracks.items():
        corners = track.get("corners", [])
        if not corners:
            issues.append(f"{track_id}: No corners defined")
            continue
        
        # Check for missing coordinates
        missing_coords = [c for c in corners if "x" not in c or "y" not in c]
        if missing_coords:
            issues.append(f"{track_id}: {len(missing_coords)} corners missing coordinates")
        
        # Check for missing distance ranges
        missing_ranges = [c for c in corners if "expectedDistanceRange" not in c]
        if missing_ranges:
            issues.append(f"{track_id}: {len(missing_ranges)} corners missing distance ranges")
    
    if issues:
        print(f"\n⚠️  Issues found: {len(issues)}")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print(f"\n✅ All {len(tracks)} tracks have valid corner definitions")
    
    return len(issues) == 0

def test_corner_data_coverage():
    """Test corner data coverage across sessions."""
    print("\n" + "=" * 80)
    print("TEST 2: Corner Data Coverage")
    print("=" * 80)
    
    data_dir = Path(__file__).parent.parent / "public" / "data" / "sessions"
    if not data_dir.exists():
        print(f"⚠️  Data directory not found: {data_dir}")
        return False
    
    tracks_data = load_tracks_data()
    tracks = tracks_data.get("tracks", {})
    
    results = defaultdict(lambda: {"sessions": 0, "drivers": set(), "missing_corners": defaultdict(set)})
    
    # Scan all sessions
    session_count = 0
    for year_dir in data_dir.iterdir():
        if not year_dir.is_dir():
            continue
        for track_dir in year_dir.iterdir():
            if not track_dir.is_dir():
                continue
            track_id = track_dir.name
            if track_id not in tracks:
                continue
            
            for session_dir in track_dir.iterdir():
                session_file = session_dir / "session.json"
                if not session_file.exists():
                    continue
                
                session_data = load_session_data(session_file)
                if not session_data:
                    continue
                
                corners = session_data.get("corners", {})
                if not corners:
                    continue
                
                session_count += 1
                expected_corners = set(c.get("number") for c in tracks[track_id].get("corners", []))
                
                for driver, driver_corners in corners.items():
                    results[track_id]["sessions"] += 1
                    results[track_id]["drivers"].add(driver)
                    
                    corner_numbers = {c.get("cornerNumber") for c in driver_corners if c.get("cornerNumber")}
                    missing = expected_corners - corner_numbers
                    if missing:
                        results[track_id]["missing_corners"][driver].update(missing)
    
    print(f"\nScanned {session_count} sessions across {len(results)} tracks\n")
    
    # Report results
    all_good = True
    for track_id, data in results.items():
        print(f"{track_id}:")
        print(f"  Sessions: {data['sessions']}")
        print(f"  Drivers: {len(data['drivers'])}")
        
        if data["missing_corners"]:
            all_good = False
            print(f"  ⚠️  Missing corners:")
            for driver, missing in data["missing_corners"].items():
                print(f"    {driver}: {sorted(missing)}")
        else:
            print(f"  ✅ All corners have data")
    
    return all_good

def test_australia_specific():
    """Test Australia track specifically (problem corners 6-14)."""
    print("\n" + "=" * 80)
    print("TEST 3: Australia Track - Problem Corners (6-14)")
    print("=" * 80)
    
    data_dir = Path(__file__).parent.parent / "public" / "data" / "sessions"
    if not data_dir.exists():
        print(f"⚠️  Data directory not found: {data_dir}")
        return False
    
    tracks_data = load_tracks_data()
    australia_track = tracks_data.get("tracks", {}).get("australia")
    if not australia_track:
        print("⚠️  Australia track not found in tracks.json")
        return False
    
    expected_corners = {c.get("number") for c in australia_track.get("corners", [])}
    problem_corners = {6, 7, 8, 10, 11, 12, 13, 14}
    
    print(f"\nExpected corners: {sorted(expected_corners)}")
    print(f"Problem corners: {sorted(problem_corners)}")
    
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
        print("\n⚠️  No Australia session data found")
        return False
    
    print(f"\nFound {len(australia_sessions)} Australia session(s)\n")
    
    all_good = True
    for session_path in australia_sessions[:5]:  # Test up to 5 sessions
        session_name = f"{session_path.parent.parent.name} {session_path.parent.name}"
        print(f"-" * 80)
        print(f"Session: {session_name}")
        
        session_data = load_session_data(session_path)
        if not session_data:
            print("  ⚠️  Could not load session data")
            continue
        
        corners = session_data.get("corners", {})
        if not corners:
            print("  ⚠️  No corner data")
            continue
        
        for driver, driver_corners in corners.items():
            corner_numbers = {c.get("cornerNumber") for c in driver_corners if c.get("cornerNumber")}
            corner_times = {
                c.get("cornerNumber"): c.get("cornerTime")
                for c in driver_corners
                if c.get("cornerNumber")
            }
            
            missing = problem_corners - corner_numbers
            null_times = problem_corners & corner_numbers - {k for k, v in corner_times.items() if v is not None}
            
            print(f"\n  {driver}:")
            if missing:
                all_good = False
                print(f"    ❌ Missing corners: {sorted(missing)}")
            if null_times:
                all_good = False
                print(f"    ❌ Null times: {sorted(null_times)}")
            if not missing and not null_times:
                print(f"    ✅ All problem corners have data")
                # Show sample data
                for corner_num in sorted(problem_corners & corner_numbers):
                    time = corner_times.get(corner_num)
                    if time is not None:
                        print(f"      Corner {corner_num}: {time:.3f}s")
    
    return all_good

def test_event_detection():
    """Test event detection in race sessions."""
    print("\n" + "=" * 80)
    print("TEST 4: Event Detection (Race Sessions)")
    print("=" * 80)
    
    data_dir = Path(__file__).parent.parent / "public" / "data" / "sessions"
    if not data_dir.exists():
        print(f"⚠️  Data directory not found: {data_dir}")
        return False
    
    # Find race sessions
    race_sessions = []
    for year_dir in data_dir.iterdir():
        if not year_dir.is_dir():
            continue
        for track_dir in year_dir.iterdir():
            if not track_dir.is_dir():
                continue
            session_file = track_dir / "R" / "session.json"
            if session_file.exists():
                race_sessions.append(session_file)
    
    if not race_sessions:
        print("⚠️  No race session data found")
        return False
    
    print(f"\nFound {len(race_sessions)} race session(s)\n")
    
    sessions_with_events = 0
    total_pit_stops = 0
    total_sc_periods = 0
    total_vsc_periods = 0
    
    for session_path in race_sessions[:10]:  # Test up to 10 sessions
        session_data = load_session_data(session_path)
        if not session_data:
            continue
        
        laps = session_data.get("laps", [])
        if not laps:
            continue
        
        # Extract events
        events = {
            "pit_stops": set(),
            "safety_car": set(),
            "virtual_safety_car": set(),
            "yellow_flags": set(),
            "red_flags": set(),
        }
        
        for lap in laps:
            if not lap or lap.get("lapNumber") is None:
                continue
            lap_number = lap.get("lapNumber")
            flags = lap.get("flags", [])
            
            if "in-lap" in flags:
                events["pit_stops"].add(lap_number)
            if "safety-car" in flags:
                events["safety_car"].add(lap_number)
            if "virtual-safety-car" in flags:
                events["virtual_safety_car"].add(lap_number)
            if "yellow-flag" in flags:
                events["yellow_flags"].add(lap_number)
            if "red-flag" in flags:
                events["red_flags"].add(lap_number)
        
        # Detect periods
        sc_laps = sorted(events["safety_car"])
        vsc_laps = sorted(events["virtual_safety_car"])
        
        sc_periods = []
        if sc_laps:
            current_start = sc_laps[0]
            current_end = sc_laps[0]
            for lap in sc_laps[1:]:
                if lap == current_end + 1:
                    current_end = lap
                else:
                    sc_periods.append((current_start, current_end))
                    current_start = lap
                    current_end = lap
            sc_periods.append((current_start, current_end))
        
        vsc_periods = []
        if vsc_laps:
            current_start = vsc_laps[0]
            current_end = vsc_laps[0]
            for lap in vsc_laps[1:]:
                if lap == current_end + 1:
                    current_end = lap
                else:
                    vsc_periods.append((current_start, current_end))
                    current_start = lap
                    current_end = lap
            vsc_periods.append((current_start, current_end))
        
        if events["pit_stops"] or sc_periods or vsc_periods:
            sessions_with_events += 1
            total_pit_stops += len(events["pit_stops"])
            total_sc_periods += len(sc_periods)
            total_vsc_periods += len(vsc_periods)
    
    print(f"Sessions with events: {sessions_with_events}")
    print(f"Total pit stops detected: {total_pit_stops}")
    print(f"Total SC periods: {total_sc_periods}")
    print(f"Total VSC periods: {total_vsc_periods}")
    
    if sessions_with_events > 0:
        print(f"\n✅ Event detection working")
        return True
    else:
        print(f"\n⚠️  No events detected in tested sessions")
        return False

def test_data_consistency():
    """Test data consistency across sessions."""
    print("\n" + "=" * 80)
    print("TEST 5: Data Consistency")
    print("=" * 80)
    
    data_dir = Path(__file__).parent.parent / "public" / "data" / "sessions"
    if not data_dir.exists():
        print(f"⚠️  Data directory not found: {data_dir}")
        return False
    
    issues = []
    session_count = 0
    
    for year_dir in data_dir.iterdir():
        if not year_dir.is_dir():
            continue
        for track_dir in year_dir.iterdir():
            if not track_dir.is_dir():
                continue
            for session_dir in track_dir.iterdir():
                session_file = session_dir / "session.json"
                if not session_file.exists():
                    continue
                
                session_data = load_session_data(session_file)
                if not session_data:
                    continue
                
                session_count += 1
                
                # Check for required fields
                if "meta" not in session_data:
                    issues.append(f"{session_file}: Missing 'meta' field")
                if "laps" not in session_data:
                    issues.append(f"{session_file}: Missing 'laps' field")
                if "corners" not in session_data:
                    issues.append(f"{session_file}: Missing 'corners' field")
                
                # Check lap data
                laps = session_data.get("laps", [])
                for i, lap in enumerate(laps):
                    if "driver" not in lap:
                        issues.append(f"{session_file}: Lap {i} missing driver")
                    if "lapNumber" not in lap:
                        issues.append(f"{session_file}: Lap {i} missing lapNumber")
    
    print(f"\nScanned {session_count} sessions")
    
    if issues:
        print(f"⚠️  Issues found: {len(issues)}")
        for issue in issues[:10]:  # Show first 10
            print(f"  - {issue}")
        if len(issues) > 10:
            print(f"  ... and {len(issues) - 10} more")
        return False
    else:
        print(f"✅ All sessions have consistent data structure")
        return True

def main():
    """Run comprehensive test suite."""
    print("=" * 80)
    print("F1 Corner Analysis - Comprehensive Test Suite")
    print("=" * 80)
    
    results = {
        "corner_coordinates": test_corner_coordinates(),
        "corner_data_coverage": test_corner_data_coverage(),
        "australia_specific": test_australia_specific(),
        "event_detection": test_event_detection(),
        "data_consistency": test_data_consistency(),
    }
    
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(1 for p in results.values() if p)
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n✅ All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())

