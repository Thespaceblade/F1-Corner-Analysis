#!/usr/bin/env python3
"""
Command line entry point for fetching FastF1 telemetry.

Usage:
  python scripts/fetch_fastf1_data.py --year 2025 --round bahrain --session Q --drivers VER PER
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List, Sequence

from fastf1_pipeline import PipelineConfig, SessionIdentifier, build_session_payload, fetch_session


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch and transform FastF1 telemetry into JSON assets.")
    parser.add_argument("--year", type=int, required=True, help="Championship year, e.g. 2025")
    parser.add_argument("--round", required=True, help="Round slug matching tracks.json (e.g. 'bahrain')")
    parser.add_argument("--session", required=True, help="Session code (FP1, FP2, FP3, Q, R, SQ, etc.)")
    parser.add_argument(
        "--drivers",
        nargs="*",
        default=None,
        help="Optional list of driver codes to filter (default: include all available drivers).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Override output directory (defaults to config output_dir/year/round/session)",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    config = PipelineConfig()

    identifier = SessionIdentifier(
        year=args.year,
        round_slug=args.round,
        session_code=args.session.upper(),
    )

    cache_dir = config.resolve_cache(identifier.year, identifier.round_slug, identifier.session_code)
    fetch_result = fetch_session(identifier, cache_dir)
    payload = build_session_payload(fetch_result, drivers=args.drivers)

    output_dir = args.output or config.resolve_output(identifier.year, identifier.round_slug, identifier.session_code)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "session.json"
    output_path.write_text(json.dumps(payload, indent=2))

    print(f"Wrote session data to {output_path}")
    if fetch_result.status != "ok":
        print(f"Warning: fetch status = {fetch_result.status} ({fetch_result.message})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
