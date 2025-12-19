#!/usr/bin/env python3
"""
Bulk fetch FastF1 telemetry for multiple rounds/sessions.

Examples:
  python scripts/data_fetching/bulk_fetch_fastf1_data.py --year 2024 --sessions Q R
  python scripts/data_fetching/bulk_fetch_fastf1_data.py --year 2024 --sessions Q --tracks australia monaco
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

# Suppress FastF1 verbose logging
logging.getLogger('fastf1').setLevel(logging.WARNING)
logging.getLogger('fastf1.core').setLevel(logging.WARNING)
logging.getLogger('fastf1.req').setLevel(logging.WARNING)
logging.getLogger('fastf1.api').setLevel(logging.WARNING)

import sys
from pathlib import Path

# Add parent directory to path to import fastf1_pipeline
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastf1_pipeline import PipelineConfig, SessionIdentifier, build_session_payload, fetch_session


@dataclass(slots=True)
class FetchSummary:
    round_id: str
    round_number: int
    session_code: str
    status: str
    message: str | None
    output_path: Path | None


def load_rounds(calendar_path: Path) -> List[dict]:
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


def fetch_round_sessions(
    *,
    year: int,
    round_entry: dict,
    session_codes: Iterable[str],
    config: PipelineConfig,
) -> List[FetchSummary]:
    results: List[FetchSummary] = []

    round_id: str = round_entry.get("id")
    round_number: int = round_entry.get("round")

    for session_code in session_codes:
        identifier = SessionIdentifier(
            year=year,
            round_slug=round_id,
            session_code=normalize_session_code(session_code),
        )

        cache_dir = config.resolve_cache(year, round_id, identifier.session_code)
        fetch_result = fetch_session(identifier, cache_dir, round_number=round_number)
        payload = build_session_payload(fetch_result)

        output_dir = config.resolve_output(year, round_id, identifier.session_code)
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / "session.json"
        output_path.write_text(json.dumps(payload, indent=2))

        results.append(
            FetchSummary(
                round_id=round_id,
                round_number=round_number,
                session_code=identifier.session_code,
                status=fetch_result.status,
                message=fetch_result.message,
                output_path=output_path,
            )
        )

    return results


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bulk fetch FastF1 telemetry for multiple sessions.")
    parser.add_argument("--year", type=int, required=True, help="Championship year (e.g. 2024).")
    parser.add_argument(
        "--sessions",
        nargs="+",
        required=True,
        help="Session codes to fetch (e.g. Q R FP1).",
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
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)

    calendar_path = args.calendar
    if not calendar_path.exists():
        raise SystemExit(f"Calendar file not found: {calendar_path}")

    rounds = load_rounds(calendar_path)
    if not rounds:
        raise SystemExit(f"No rounds found in {calendar_path}")

    config = PipelineConfig()
    sessions = [normalize_session_code(code) for code in args.sessions]
    tracks_filter = set(args.tracks) if args.tracks else None

    # Filter rounds to process
    rounds_to_process = [
        r for r in rounds 
        if should_include_round(r, tracks_filter)
    ]
    
    total_sessions = len(rounds_to_process) * len(sessions)
    current_session = 0
    
    print(f"\n{'='*60}")
    print(f"Fetching session data for {len(rounds_to_process)} tracks")
    print(f"Total sessions to fetch: {total_sessions}")
    print(f"{'='*60}\n")

    summaries: List[FetchSummary] = []

    # Use a null device to suppress FastF1 output
    devnull = open(os.devnull, 'w')
    
    for round_entry in rounds_to_process:
        round_id = round_entry.get("id", "unknown")
        round_number = round_entry.get("round", 0)
        round_name = round_entry.get("name", round_id)
        
        # Process each session for this round
        for session_code in sessions:
            current_session += 1
            progress_pct = (current_session / total_sessions) * 100
            
            # Show progress bar
            bar_length = 40
            filled = int(bar_length * current_session / total_sessions)
            bar = "█" * filled + "░" * (bar_length - filled)
            
            # Show progress before fetch
            print(
                f"[{bar}] {progress_pct:5.1f}% | "
                f"Fetching {round_number:02d} {round_id} / {session_code}...",
                end="",
                flush=True
            )
            
            # Fetch the session while suppressing stdout/stderr from FastF1
            identifier = SessionIdentifier(
                year=args.year,
                round_slug=round_id,
                session_code=normalize_session_code(session_code),
            )
            
            # Suppress FastF1 output during fetch
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            try:
                sys.stdout = devnull
                sys.stderr = devnull
                cache_dir = config.resolve_cache(args.year, round_id, identifier.session_code)
                fetch_result = fetch_session(identifier, cache_dir, round_number=round_number)
                payload = build_session_payload(fetch_result)
            finally:
                sys.stdout = old_stdout
                sys.stderr = old_stderr
            
            output_dir = config.resolve_output(args.year, round_id, identifier.session_code)
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / "session.json"
            output_path.write_text(json.dumps(payload, indent=2))
            
            result = FetchSummary(
                round_id=round_id,
                round_number=round_number,
                session_code=identifier.session_code,
                status=fetch_result.status,
                message=fetch_result.message,
                output_path=output_path,
            )
            
            # Update progress bar with result (overwrite the "Fetching..." line)
            status_icon = "✅" if result.status == "ok" else "⚠️"
            print(
                f"\r[{bar}] {progress_pct:5.1f}% | "
                f"{status_icon} {round_number:02d} {round_id} / {result.session_code} -> {result.status}",
                end="\n",
                flush=True
            )
            
            summaries.append(result)
    
    devnull.close()

    success = 0
    failures = []

    for summary in summaries:
        if summary.status == "ok":
            success += 1
        else:
            failures.append(summary)

    print(f"\n{'='*60}")
    print(f"Completed {len(summaries)} fetches ({success} ok, {len(failures)} warnings).")
    if failures:
        print("Warnings:")
        for summary in failures:
            print(
                f"  - {summary.round_id} {summary.session_code}: {summary.status}"
                + (f" ({summary.message})" if summary.message else "")
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
