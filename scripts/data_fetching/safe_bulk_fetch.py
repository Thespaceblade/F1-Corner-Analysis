#!/usr/bin/env python3
"""
Safe bulk fetch that checks for running processes before starting.

Usage:
  python scripts/data_fetching/safe_bulk_fetch.py --year 2025 --sessions Q R --tracks brazil las-vegas
"""

import argparse
import subprocess
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from data_fetching.check_running_fetches import check_running_processes


def main():
    parser = argparse.ArgumentParser(
        description="Safe bulk fetch that checks for running processes first."
    )
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--sessions", nargs="+", required=True)
    parser.add_argument("--tracks", nargs="*", default=None)
    parser.add_argument("--calendar", type=Path, default=Path("public/data/calendar2025.json"))
    parser.add_argument("--force", action="store_true", help="Run even if processes are already running")
    
    args = parser.parse_args()
    
    # Check for running processes
    if not args.force and check_running_processes():
        print("\n⚠️  Warning: Fetch processes are already running!")
        print("   Use --force to run anyway, or wait for them to complete.")
        print("   Check status with: python scripts/data_fetching/check_running_fetches.py")
        sys.exit(1)
    
    # Build command
    cmd = [
        sys.executable,
        str(Path(__file__).parent / "bulk_fetch_fastf1_data.py"),
        "--year", str(args.year),
        "--sessions", *args.sessions,
        "--calendar", str(args.calendar),
    ]
    
    if args.tracks:
        cmd.extend(["--tracks", *args.tracks])
    
    # Run the actual fetch
    print(f"\n🚀 Starting fetch (no other processes detected)...\n")
    sys.exit(subprocess.call(cmd))


if __name__ == "__main__":
    main()


