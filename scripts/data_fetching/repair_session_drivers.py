#!/usr/bin/env python3
"""
Repair on-disk session.json files:

1. Backfill `drivers` / `availableDrivers` from raceResults / qualifyingResults
   for DNS / 0-lap drivers omitted by older pipeline versions.
2. Strip bogus `raceResults` from qualifying sessions (and vice versa).
3. Delete failed sprint/session files (`meta.status != ok` with no usable data).

Usage:
  python scripts/data_fetching/repair_session_drivers.py
  python scripts/data_fetching/repair_session_drivers.py --year 2026
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def is_usable(payload: dict[str, Any]) -> bool:
    status = (payload.get("meta") or {}).get("status")
    if status and status != "ok":
        return False
    drivers = payload.get("drivers") or {}
    laps = payload.get("laps") or []
    race = payload.get("raceResults") or []
    quali = payload.get("qualifyingResults") or []
    return bool(drivers) or bool(laps) or bool(race) or bool(quali)


def backfill_drivers(payload: dict[str, Any]) -> int:
    drivers = payload.setdefault("drivers", {})
    added = 0

    def upsert(code: str, team: str | None, number: int | None) -> None:
        nonlocal added
        code = (code or "").upper()
        if not code:
            return
        if code in drivers:
            existing = drivers[code]
            if not existing.get("team") and team:
                existing["team"] = team
            if existing.get("number") is None and number is not None:
                existing["number"] = number
            return
        drivers[code] = {
            "code": code,
            "team": team,
            "number": number,
            "defaultCompound": None,
        }
        added += 1

    for res in payload.get("raceResults") or []:
        upsert(res.get("driverCode", ""), res.get("teamName"), res.get("driverNumber"))
    for res in payload.get("qualifyingResults") or []:
        upsert(res.get("driverCode", ""), res.get("teamName"), res.get("driverNumber"))

    meta = payload.setdefault("meta", {})
    meta["availableDrivers"] = sorted(drivers.keys())
    return added


def scrub_wrong_result_tables(payload: dict[str, Any], session_code: str) -> list[str]:
    notes: list[str] = []
    code = session_code.upper()
    if code in {"Q", "SQ", "SSQ", "FQ"} and payload.get("raceResults"):
        # Qualifying payloads previously duplicated classification as raceResults.
        del payload["raceResults"]
        notes.append("removed raceResults from qualifying session")
    if code in {"R", "S"} and payload.get("qualifyingResults") and not payload.get("raceResults"):
        # Keep qualifyingResults on race only if raceResults missing (unusual).
        pass
    if code in {"R", "S"} and payload.get("qualifyingResults"):
        # Race/sprint shouldn't carry quali tables.
        del payload["qualifyingResults"]
        notes.append("removed qualifyingResults from race/sprint session")
    return notes


def main() -> int:
    parser = argparse.ArgumentParser(description="Repair session.json driver coverage and drop bad files.")
    parser.add_argument("--year", type=int, default=None, help="Limit to one year (default: all).")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("public/data/sessions"),
        help="Sessions root directory.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Report only; do not write/delete.")
    args = parser.parse_args()

    root: Path = args.root
    if not root.exists():
        raise SystemExit(f"Sessions root not found: {root}")

    repaired = 0
    deleted = 0
    scanned = 0

    year_dirs = [root / str(args.year)] if args.year else sorted(p for p in root.iterdir() if p.is_dir())
    for year_dir in year_dirs:
        if not year_dir.exists():
            continue
        for session_path in sorted(year_dir.glob("*/*/session.json")):
            scanned += 1
            try:
                payload = json.loads(session_path.read_text())
            except Exception as exc:
                print(f"SKIP unreadable {session_path}: {exc}")
                continue

            if not is_usable(payload):
                print(f"DELETE bad session {session_path}")
                deleted += 1
                if not args.dry_run:
                    session_path.unlink()
                    # Remove empty session/round dirs when possible
                    session_dir = session_path.parent
                    try:
                        session_dir.rmdir()
                    except OSError:
                        pass
                continue

            session_code = session_path.parent.name
            added = backfill_drivers(payload)
            scrub_notes = scrub_wrong_result_tables(payload, session_code)
            if added or scrub_notes:
                repaired += 1
                print(
                    f"REPAIR {session_path}: +{added} drivers"
                    + (f"; {', '.join(scrub_notes)}" if scrub_notes else "")
                )
                if not args.dry_run:
                    session_path.write_text(json.dumps(payload, indent=2) + "\n")

    print(f"\nScanned {scanned} files; repaired {repaired}; deleted {deleted}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
