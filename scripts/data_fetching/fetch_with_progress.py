#!/usr/bin/env python3
"""
Bulk fetch with real-time progress monitoring and clean slate handling.

Usage:
  python scripts/data_fetching/fetch_with_progress.py --year 2025 --sessions Q R --tracks brazil las-vegas qatar abu-dhabi
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Iterable, List, Sequence

# Suppress FastF1 verbose logging
import logging
logging.getLogger('fastf1').setLevel(logging.WARNING)
logging.getLogger('fastf1.core').setLevel(logging.WARNING)
logging.getLogger('fastf1.req').setLevel(logging.WARNING)
logging.getLogger('fastf1.api').setLevel(logging.WARNING)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastf1_pipeline import PipelineConfig, SessionIdentifier, build_session_payload, fetch_session


def check_running_processes() -> bool:
    """Check if fetch processes are already running."""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "bulk_fetch_fastf1_data|fetch_with_progress"],
            capture_output=True,
            text=True
        )
        return result.returncode == 0 and result.stdout.strip()
    except Exception:
        return False


def load_rounds(calendar_path: Path) -> List[dict]:
    """Load rounds from calendar file."""
    data = json.loads(calendar_path.read_text())
    return data.get("rounds", [])


def normalize_session_code(code: str) -> str:
    return code.strip().upper()


def should_include_round(round_entry: dict, wanted_tracks: set[str] | None) -> bool:
    if not wanted_tracks:
        return True
    round_id = round_entry.get("id")
    if not round_id:
        return False
    return round_id in wanted_tracks


def print_progress(current: int, total: int, round_name: str, session: str, status: str = ""):
    """Print progress bar with current status."""
    bar_length = 40
    filled = int(bar_length * current / total)
    bar = "█" * filled + "░" * (bar_length - filled)
    pct = (current / total * 100) if total > 0 else 0
    
    status_icon = {
        "fetching": "🔄",
        "success": "✅",
        "error": "❌",
        "": ""
    }.get(status, "")
    
    print(
        f"\r[{bar}] {pct:5.1f}% | {status_icon} {round_name:30s} / {session:2s} {status}",
        end="",
        flush=True
    )


def fetch_single_session(
    year: int,
    round_entry: dict,
    session_code: str,
    config: PipelineConfig,
    current: int,
    total: int,
) -> tuple[str, str, str]:
    """Fetch a single session and return status info."""
    round_id = round_entry.get("id", "unknown")
    round_number = round_entry.get("round", 0)
    round_name = round_entry.get("name", round_id)
    
    identifier = SessionIdentifier(
        year=year,
        round_slug=round_id,
        session_code=normalize_session_code(session_code),
    )
    
    # Show fetching status
    print_progress(current, total, round_name, identifier.session_code, "fetching")
    
    try:
        cache_dir = config.resolve_cache(year, round_id, identifier.session_code)
        fetch_result = fetch_session(identifier, cache_dir, round_number=round_number)
        
        if fetch_result.status == "ok":
            payload = build_session_payload(fetch_result)
            output_dir = config.resolve_output(year, round_id, identifier.session_code)
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / "session.json"
            output_path.write_text(json.dumps(payload, indent=2))
            
            driver_count = len(payload.get("drivers", {}))
            lap_count = len(payload.get("laps", []))
            print_progress(current, total, round_name, identifier.session_code, f"success ({driver_count} drivers, {lap_count} laps)")
            return "ok", f"{driver_count} drivers, {lap_count} laps", ""
        else:
            error_msg = fetch_result.message or "Unknown error"
            print_progress(current, total, round_name, identifier.session_code, f"error: {error_msg[:40]}")
            return "error", "", error_msg
    except Exception as e:
        error_msg = str(e)[:60]
        print_progress(current, total, round_name, identifier.session_code, f"error: {error_msg}")
        return "error", "", str(e)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bulk fetch FastF1 data with real-time progress monitoring."
    )
    parser.add_argument("--year", type=int, required=True, help="Championship year (e.g. 2025).")
    parser.add_argument(
        "--sessions",
        nargs="+",
        required=True,
        help="Session codes to fetch (e.g. Q R).",
    )
    parser.add_argument(
        "--tracks",
        nargs="*",
        help="Optional list of track ids to include (defaults to all from the calendar file).",
    )
    parser.add_argument(
        "--calendar",
        type=Path,
        default=Path("public/data/calendar2025.json"),
        help="Path to the calendar JSON used to resolve track identifiers.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Run even if other fetch processes are detected.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    
    # Check for running processes
    if not args.force and check_running_processes():
        print("\n⚠️  ERROR: Other fetch processes are already running!")
        print("   Stop them first with: pkill -f bulk_fetch_fastf1_data")
        print("   Or use --force to run anyway")
        return 1
    
    calendar_path = args.calendar
    if not calendar_path.exists():
        print(f"❌ ERROR: Calendar file not found: {calendar_path}")
        return 1
    
    rounds = load_rounds(calendar_path)
    if not rounds:
        print(f"❌ ERROR: No rounds found in {calendar_path}")
        return 1
    
    config = PipelineConfig()
    sessions = [normalize_session_code(code) for code in args.sessions]
    tracks_filter = set(args.tracks) if args.tracks else None
    
    # Filter rounds to process
    rounds_to_process = [
        r for r in rounds 
        if should_include_round(r, tracks_filter)
    ]
    
    total_sessions = len(rounds_to_process) * len(sessions)
    
    print(f"\n{'='*70}")
    print(f"🚀 Starting fetch for {len(rounds_to_process)} tracks")
    print(f"   Sessions: {', '.join(sessions)}")
    print(f"   Total sessions to fetch: {total_sessions}")
    print(f"{'='*70}\n")
    
    results = []
    current = 0
    
    start_time = time.time()
    
    for round_entry in rounds_to_process:
        for session_code in sessions:
            current += 1
            status, info, error = fetch_single_session(
                args.year,
                round_entry,
                session_code,
                config,
                current,
                total_sessions,
            )
            
            results.append({
                "round": round_entry.get("round", 0),
                "round_id": round_entry.get("id", "unknown"),
                "round_name": round_entry.get("name", "unknown"),
                "session": session_code,
                "status": status,
                "info": info,
                "error": error,
            })
            
            # New line after each session
            print()
    
    elapsed_time = time.time() - start_time
    
    # Summary
    success_count = sum(1 for r in results if r["status"] == "ok")
    error_count = sum(1 for r in results if r["status"] == "error")
    
    print(f"\n{'='*70}")
    print(f"📊 FETCH COMPLETE")
    print(f"{'='*70}")
    print(f"Total sessions: {total_sessions}")
    print(f"✅ Successful: {success_count}")
    print(f"❌ Errors: {error_count}")
    print(f"⏱️  Time elapsed: {elapsed_time:.1f} seconds")
    
    if error_count > 0:
        print(f"\n⚠️  Sessions with errors:")
        for r in results:
            if r["status"] == "error":
                print(f"   - Round {r['round']:02d} {r['round_name']:30s} / {r['session']:2s}: {r['error']}")
    
    print(f"{'='*70}\n")
    
    return 0 if error_count == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())



