#!/usr/bin/env python3
"""
Populate all tracks with session data and corner definitions.

This script orchestrates the complete workflow:
1. Fetch session data for all tracks from FastF1
2. Analyze tracks to generate corner definitions
3. Update tracks.json with corner definitions

Usage:
    python scripts/corner_editing/populate_all_tracks.py --year 2025 --sessions Q R
    python scripts/corner_editing/populate_all_tracks.py --year 2025 --sessions Q --tracks monaco bahrain
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import List, Sequence


def run_command(cmd: List[str], description: str, show_output: bool = True) -> bool:
    """Run a command and return True if successful."""
    print(f"\n{'='*60}", file=sys.stderr, flush=True)
    print(f"{description}", file=sys.stderr, flush=True)
    print(f"{'='*60}", file=sys.stderr, flush=True)
    if show_output:
        print(f"Running: {' '.join(cmd)}", file=sys.stderr, flush=True)
        print(file=sys.stderr, flush=True)
    
    # Run with direct output to terminal (better for progress bars)
    # This allows progress bars to update in real-time
    result = subprocess.run(
        cmd,
        check=False,  # Don't raise exception, we'll handle it
    )
    
    if result.returncode != 0:
        print(f"\n❌ Error: {description} failed with exit code {result.returncode}", file=sys.stderr, flush=True)
        return False
    
    print(f"\n✅ {description} completed successfully", file=sys.stderr, flush=True)
    return True


def main(argv: Sequence[str] | None = None) -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Populate all tracks with session data and corner definitions"
    )
    parser.add_argument(
        "--year", type=int, required=True, help="Championship year (e.g., 2025)"
    )
    parser.add_argument(
        "--sessions",
        nargs="+",
        required=True,
        help="Session codes to fetch and analyze (e.g., Q R FP1)",
    )
    parser.add_argument(
        "--tracks",
        nargs="*",
        help="Optional list of track ids to include (defaults to all from calendar)",
    )
    parser.add_argument(
        "--calendar",
        type=Path,
        default=Path("public/data/calendar2025.json"),
        help="Path to the calendar JSON (default: public/data/calendar2025.json)",
    )
    parser.add_argument(
        "--skip-fetch",
        action="store_true",
        help="Skip fetching session data (use existing data)",
    )
    parser.add_argument(
        "--skip-analyze",
        action="store_true",
        help="Skip analyzing tracks (use existing corner definitions)",
    )
    parser.add_argument(
        "--skip-update",
        action="store_true",
        help="Skip updating tracks.json",
    )
    parser.add_argument(
        "--tolerance",
        type=float,
        default=15.0,
        help="Distance tolerance in meters for corner analysis (default: 15.0)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("output/corners"),
        help="Output directory for corner definitions (default: output/corners)",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path("public/data/sessions"),
        help="Session data directory (default: public/data/sessions)",
    )
    parser.add_argument(
        "--tracks-json",
        type=Path,
        default=Path("public/data/tracks.json"),
        help="Path to tracks.json file (default: public/data/tracks.json)",
    )
    
    args = parser.parse_args(argv)
    
    script_dir = Path(__file__).parent.parent
    errors = []
    
    # Print header
    print(f"\n{'='*70}", file=sys.stderr, flush=True)
    print(f"  F1 Corner Analysis - Populate All Tracks", file=sys.stderr, flush=True)
    print(f"  Year: {args.year} | Sessions: {', '.join(args.sessions)}", file=sys.stderr, flush=True)
    if args.tracks:
        print(f"  Tracks: {', '.join(args.tracks)}", file=sys.stderr, flush=True)
    print(f"{'='*70}\n", file=sys.stderr, flush=True)
    
    import time
    start_time = time.time()
    
    # Step 1: Fetch session data
    if not args.skip_fetch:
        fetch_cmd = [
            sys.executable,
            str(script_dir / "data_fetching" / "bulk_fetch_fastf1_data.py"),
            "--year",
            str(args.year),
            "--sessions",
            *args.sessions,
            "--calendar",
            str(args.calendar),
        ]
        
        if args.tracks:
            fetch_cmd.extend(["--tracks", *args.tracks])
        
        if not run_command(fetch_cmd, "Fetching session data from FastF1"):
            errors.append("Failed to fetch session data")
            if not args.skip_analyze:
                print(
                    "\nWarning: Fetch failed. Analysis may not work without session data.",
                    file=sys.stderr,
                )
    
    # Step 2: Analyze tracks to generate corner definitions
    # Note: We analyze each session separately
    if not args.skip_analyze:
        for session in args.sessions:
            analyze_cmd = [
                sys.executable,
                str(script_dir / "corner_analysis" / "batch_analyze_tracks.py"),
                "--year",
                str(args.year),
                "--session",
                session,
                "--output-dir",
                str(args.output_dir),
                "--tolerance",
                str(args.tolerance),
                "--data-dir",
                str(args.data_dir),
            ]
            
            if args.tracks:
                analyze_cmd.extend(["--tracks", *args.tracks])
            
            if not run_command(
                analyze_cmd, f"Analyzing tracks for session {session}"
            ):
                errors.append(f"Failed to analyze tracks for session {session}")
    
    # Step 3: Update tracks.json with corner definitions
    if not args.skip_update:
        update_cmd = [
            sys.executable,
            str(script_dir / "corner_analysis" / "update_tracks_json.py"),
            "--input-dir",
            str(args.output_dir),
            "--tracks-json",
            str(args.tracks_json),
        ]
        
        if not run_command(update_cmd, "Updating tracks.json with corner definitions"):
            errors.append("Failed to update tracks.json")
    
    # Summary
    elapsed_time = time.time() - start_time
    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)
    
    print(f"\n{'='*70}", file=sys.stderr, flush=True)
    print("Summary", file=sys.stderr, flush=True)
    print(f"{'='*70}", file=sys.stderr, flush=True)
    print(f"Total time: {minutes}m {seconds}s", file=sys.stderr, flush=True)
    
    if errors:
        print(f"\n⚠️  Completed with {len(errors)} error(s):", file=sys.stderr, flush=True)
        for error in errors:
            print(f"  - {error}", file=sys.stderr, flush=True)
        return 1
    
    print("\n✅ All steps completed successfully!", file=sys.stderr, flush=True)
    print("\nNext steps:", file=sys.stderr, flush=True)
    print("  1. Start your dev server: npm run dev", file=sys.stderr, flush=True)
    print("  2. Open http://localhost:3000", file=sys.stderr, flush=True)
    print("  3. All tracks and sessions should now be available!", file=sys.stderr, flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

