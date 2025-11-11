#!/usr/bin/env python3
"""
Test script to validate event marker detection and rendering.
Checks for safety car periods, VSC, pit stops, flags, etc.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Set

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

def extract_event_flags(laps: List[Dict[str, Any]]) -> Dict[str, Set[int]]:
    """Extract event flags from lap data."""
    events = {
        "pit_stops": set(),  # in-lap flag
        "safety_car": set(),
        "virtual_safety_car": set(),
        "yellow_flags": set(),
        "red_flags": set(),
        "race_start": set(),
    }
    
    for lap in laps:
        if not lap or lap.get("lapNumber") is None:
            continue
        
        lap_number = lap.get("lapNumber")
        flags = lap.get("flags", [])
        
        # Race start (lap 1)
        if lap_number == 1:
            events["race_start"].add(1)
        
        # Check flags
        if "in-lap" in flags:
            events["pit_stops"].add(lap_number)
        if "safety-car" in flags:
            events["safety_car"].add(lap_number)
        if "virtual-safety-car" in flags:
            events["virtual_safety_car"].add(lap_number)
        if "yellow-flag" in flags and "safety-car" not in flags and "virtual-safety-car" not in flags:
            events["yellow_flags"].add(lap_number)
        if "red-flag" in flags:
            events["red_flags"].add(lap_number)
    
    return events

def detect_safety_car_periods(sc_laps: Set[int]) -> List[Dict[str, int]]:
    """Detect continuous safety car periods."""
    if not sc_laps:
        return []
    
    sorted_laps = sorted(sc_laps)
    periods = []
    current_start = sorted_laps[0]
    current_end = sorted_laps[0]
    
    for lap in sorted_laps[1:]:
        if lap == current_end + 1:
            # Continuous
            current_end = lap
        else:
            # Gap - end current period
            periods.append({"start": current_start, "end": current_end})
            current_start = lap
            current_end = lap
    
    # Don't forget the last period
    periods.append({"start": current_start, "end": current_end})
    
    return periods

def test_race_sessions():
    """Test race session event markers."""
    print("=" * 80)
    print("Race Session - Event Marker Test")
    print("=" * 80)
    
    # Look for session data
    data_dir = Path(__file__).parent.parent / "public" / "data" / "sessions"
    if not data_dir.exists():
        print(f"Data directory not found: {data_dir}")
        return
    
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
        print("No race session data found")
        print(f"Expected path: {data_dir}/*/*/R/session.json")
        return
    
    print(f"\nFound {len(race_sessions)} race session(s)\n")
    
    sessions_tested = 0
    for session_path in race_sessions[:10]:  # Test up to 10 sessions
        sessions_tested += 1
        print("-" * 80)
        track = session_path.parent.parent.name
        year = session_path.parent.parent.parent.name
        print(f"Session: {year} {track} Race")
        print(f"Path: {session_path}")
        
        session_data = load_session_data(session_path)
        if not session_data:
            print("  ⚠️  Could not load session data")
            continue
        
        laps = session_data.get("laps", [])
        if not laps:
            print("  ⚠️  No lap data")
            continue
        
        # Extract events
        events = extract_event_flags(laps)
        
        # Detect periods
        sc_periods = detect_safety_car_periods(events["safety_car"])
        vsc_periods = detect_safety_car_periods(events["virtual_safety_car"])
        
        print(f"\n  Events detected:")
        print(f"    Race start: {len(events['race_start'])} (lap 1)")
        print(f"    Pit stops: {len(events['pit_stops'])} ({sorted(events['pit_stops'])[:10]}{'...' if len(events['pit_stops']) > 10 else ''})")
        print(f"    Safety car periods: {len(sc_periods)}")
        for period in sc_periods:
            print(f"      SC: Lap {period['start']} - {period['end']} ({period['end'] - period['start'] + 1} laps)")
        print(f"    VSC periods: {len(vsc_periods)}")
        for period in vsc_periods:
            print(f"      VSC: Lap {period['start']} - {period['end']} ({period['end'] - period['start'] + 1} laps)")
        print(f"    Yellow flags: {len(events['yellow_flags'])} ({sorted(events['yellow_flags'])[:10]}{'...' if len(events['yellow_flags']) > 10 else ''})")
        print(f"    Red flags: {len(events['red_flags'])} ({sorted(events['red_flags'])}{'' if events['red_flags'] else ' (none)'})")
        
        # Check for drivers
        drivers = session_data.get("meta", {}).get("availableDrivers", [])
        if drivers:
            print(f"\n  Available drivers: {', '.join(drivers[:10])}{'...' if len(drivers) > 10 else ''}")
        
        # Validate event detection
        issues = []
        if len(sc_periods) > 0 and len(events['safety_car']) == 0:
            issues.append("SC periods detected but no SC laps found")
        if len(vsc_periods) > 0 and len(events['virtual_safety_car']) == 0:
            issues.append("VSC periods detected but no VSC laps found")
        if len(events['pit_stops']) == 0 and len(laps) > 10:
            issues.append("No pit stops detected (unusual for race)")
        
        if issues:
            print(f"\n  ⚠️  Issues:")
            for issue in issues:
                print(f"    - {issue}")
        else:
            print(f"\n  ✅ Event detection looks good")
    
    print(f"\n" + "=" * 80)
    print(f"Tested {sessions_tested} race sessions")
    print("=" * 80)

def main():
    """Run event marker tests."""
    test_race_sessions()

if __name__ == "__main__":
    main()

