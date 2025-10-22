#!/usr/bin/env python3
"""
Bulk fetch FastF1 telemetry for multiple rounds/sessions.

Examples:
  python scripts/bulk_fetch_fastf1_data.py --year 2024 --sessions Q R
  python scripts/bulk_fetch_fastf1_data.py --year 2024 --sessions Q --tracks australia monaco
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

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
        fetch_result = fetch_session(identifier, cache_dir)
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

    summaries: List[FetchSummary] = []

    for round_entry in rounds:
        if not should_include_round(round_entry, tracks_filter):
            continue

        round_results = fetch_round_sessions(
            year=args.year,
            round_entry=round_entry,
            session_codes=sessions,
            config=config,
        )

        summaries.extend(round_results)

    success = 0
    failures = []

    for summary in summaries:
        status_icon = "✅" if summary.status == "ok" else "⚠️"
        print(
            f"{status_icon} {summary.round_number:02d} {summary.round_id} / {summary.session_code} "
            f"-> {summary.status}"
        )
        if summary.status == "ok":
            success += 1
        else:
            failures.append(summary)

    print(f"\nCompleted {len(summaries)} fetches ({success} ok, {len(failures)} warnings).")
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
