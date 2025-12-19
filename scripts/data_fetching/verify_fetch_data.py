#!/usr/bin/env python3
"""
Verify that fetched session data contains actual driver data.

Usage:
  python scripts/data_fetching/verify_fetch_data.py --year 2025 --sessions Q R
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List


def load_rounds(calendar_path: Path) -> List[dict]:
    """Load rounds from calendar file."""
    data = json.loads(calendar_path.read_text())
    return data.get("rounds", [])


def verify_sessions(year: int, sessions: List[str], calendar_path: Path, output_base: Path = Path("public/data/sessions")):
    """Verify session data quality."""
    rounds = load_rounds(calendar_path)
    
    results = {
        "valid": [],
        "invalid": [],
        "missing": [],
        "driver_counts": {},
    }
    
    all_drivers = set()
    
    for round_entry in rounds:
        round_id = round_entry.get("id")
        round_number = round_entry.get("round", 0)
        round_name = round_entry.get("name", round_id)
        
        for session_code in sessions:
            session_path = output_base / str(year) / round_id / session_code / "session.json"
            
            if not session_path.exists():
                results["missing"].append({
                    "round": round_number,
                    "round_id": round_id,
                    "round_name": round_name,
                    "session": session_code,
                })
                continue
            
            try:
                with open(session_path) as f:
                    data = json.load(f)
                
                status = data.get("meta", {}).get("status", "unknown")
                drivers = data.get("drivers", {})
                laps = data.get("laps", [])
                driver_count = len(drivers)
                
                if status == "ok" and driver_count > 0:
                    results["valid"].append({
                        "round": round_number,
                        "round_id": round_id,
                        "round_name": round_name,
                        "session": session_code,
                        "drivers": driver_count,
                        "laps": len(laps),
                    })
                    all_drivers.update(drivers.keys())
                    results["driver_counts"][f"{round_id}/{session_code}"] = driver_count
                else:
                    error_msg = data.get("notes", ["Unknown error"])[0] if data.get("notes") else "No error message"
                    results["invalid"].append({
                        "round": round_number,
                        "round_id": round_id,
                        "round_name": round_name,
                        "session": session_code,
                        "status": status,
                        "error": error_msg,
                    })
            except Exception as e:
                results["invalid"].append({
                    "round": round_number,
                    "round_id": round_id,
                    "round_name": round_name,
                    "session": session_code,
                    "status": "error",
                    "error": f"Failed to parse: {e}",
                })
    
    return results, all_drivers


def main():
    parser = argparse.ArgumentParser(description="Verify fetched session data quality.")
    parser.add_argument("--year", type=int, required=True, help="Championship year (e.g. 2025).")
    parser.add_argument("--sessions", nargs="+", required=True, help="Session codes (e.g. Q R).")
    parser.add_argument(
        "--calendar",
        type=Path,
        default=Path("public/data/calendar2025.json"),
        help="Path to the calendar JSON file.",
    )
    parser.add_argument(
        "--output-base",
        type=Path,
        default=Path("public/data/sessions"),
        help="Base directory for session output files.",
    )
    
    args = parser.parse_args()
    
    results, all_drivers = verify_sessions(args.year, args.sessions, args.calendar, args.output_base)
    
    total_expected = len(load_rounds(args.calendar)) * len(args.sessions)
    
    print(f"\n{'='*70}")
    print(f"Data Verification Report for {args.year}")
    print(f"{'='*70}\n")
    
    print(f"Total sessions expected: {total_expected}")
    print(f"Valid sessions (with driver data): {len(results['valid'])}")
    print(f"Invalid/Error sessions: {len(results['invalid'])}")
    print(f"Missing files: {len(results['missing'])}")
    print(f"\nUnique drivers found across all sessions: {len(all_drivers)}")
    if all_drivers:
        print(f"Driver codes: {', '.join(sorted(all_drivers))}")
    
    if results['valid']:
        print(f"\n{'='*70}")
        print("VALID SESSIONS:")
        print(f"{'='*70}")
        for session in sorted(results['valid'], key=lambda x: (x['round'], x['session'])):
            print(f"Round {session['round']:02d} {session['round_name']:25s} / {session['session']:2s} | "
                  f"Drivers: {session['drivers']:2d} | Laps: {session['laps']:4d}")
    
    if results['invalid']:
        print(f"\n{'='*70}")
        print("INVALID/ERROR SESSIONS:")
        print(f"{'='*70}")
        for session in sorted(results['invalid'], key=lambda x: (x['round'], x['session'])):
            print(f"Round {session['round']:02d} {session['round_name']:25s} / {session['session']:2s} | "
                  f"Status: {session['status']:10s} | {session['error']}")
    
    if results['missing']:
        print(f"\n{'='*70}")
        print("MISSING FILES:")
        print(f"{'='*70}")
        for session in sorted(results['missing'], key=lambda x: (x['round'], x['session'])):
            print(f"Round {session['round']:02d} {session['round_name']:25s} / {session['session']:2s}")
    
    # Check for consistency in driver counts
    if results['driver_counts']:
        driver_counts = list(results['driver_counts'].values())
        if len(set(driver_counts)) == 1:
            print(f"\n✓ All valid sessions have {driver_counts[0]} drivers (consistent)")
        else:
            print(f"\n⚠ Driver count varies: min={min(driver_counts)}, max={max(driver_counts)}, avg={sum(driver_counts)/len(driver_counts):.1f}")
    
    print(f"\n{'='*70}\n")


if __name__ == "__main__":
    main()


