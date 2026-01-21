#!/usr/bin/env python3
"""
Check progress of bulk data fetching by counting completed sessions.

Usage:
  python scripts/data_fetching/check_fetch_progress.py --year 2025 --sessions Q R
"""

import argparse
import json
from pathlib import Path
from typing import List, Set


def load_rounds(calendar_path: Path) -> List[dict]:
    """Load rounds from calendar file."""
    data = json.loads(calendar_path.read_text())
    return data.get("rounds", [])


def check_progress(year: int, sessions: List[str], calendar_path: Path, output_base: Path = Path("public/data/sessions")):
    """Check how many sessions have been fetched."""
    rounds = load_rounds(calendar_path)
    total_sessions = len(rounds) * len(sessions)
    
    completed = 0
    missing = []
    
    for round_entry in rounds:
        round_id = round_entry.get("id")
        round_number = round_entry.get("round", 0)
        round_name = round_entry.get("name", round_id)
        
        for session_code in sessions:
            session_path = output_base / str(year) / round_id / session_code / "session.json"
            if session_path.exists():
                completed += 1
            else:
                missing.append(f"Round {round_number:02d} {round_id} / {session_code}")
    
    print(f"\n{'='*60}")
    print(f"Fetch Progress for {year}")
    print(f"{'='*60}")
    print(f"Total sessions: {total_sessions}")
    print(f"Completed: {completed}")
    print(f"Remaining: {total_sessions - completed}")
    print(f"Progress: {(completed / total_sessions * 100):.1f}%")
    
    if missing:
        print(f"\nMissing sessions ({len(missing)}):")
        for item in missing[:10]:  # Show first 10
            print(f"  - {item}")
        if len(missing) > 10:
            print(f"  ... and {len(missing) - 10} more")
    
    print(f"{'='*60}\n")
    
    return completed, total_sessions


def main():
    parser = argparse.ArgumentParser(description="Check progress of bulk data fetching.")
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
    
    check_progress(args.year, args.sessions, args.calendar, args.output_base)


if __name__ == "__main__":
    main()



