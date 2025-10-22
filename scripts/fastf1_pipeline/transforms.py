from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Sequence, Set

from .fetch import FetchResult

try:
    import pandas as pd  # type: ignore
except ImportError:  # pragma: no cover - allows running without pandas when FastF1 absent
    pd = None  # type: ignore


def _timedelta_to_seconds(value: Any) -> float | None:
    if value is None:
        return None
    if pd is not None:
        if pd.isna(value):
            return None
        if isinstance(value, pd.Timedelta):
            return float(value.total_seconds())
    try:
        total_seconds = value.total_seconds()  # type: ignore[attr-defined]
        return float(total_seconds)
    except AttributeError:
        return None


def _safe_int(value: Any) -> int | None:
    try:
        if value is None:
            return None
        if pd is not None and pd.isna(value):
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def _stringify_track_status(value: Any) -> str | None:
    if value is None:
        return None
    if pd is not None and pd.isna(value):
        return None
    text = str(value)
    if text.endswith(".0"):
        text = text[:-2]
    return text or None


def _extract_status_codes(track_status: str | None) -> Set[str]:
    if not track_status:
        return set()
    return {ch for ch in track_status if ch.isdigit()}


OUTLIER_FLAGS = {
    "out-lap",
    "in-lap",
    "safety-car",
    "virtual-safety-car",
    "yellow-flag",
    "red-flag",
    "formation-lap",
    "deleted",
    "inaccurate",
    "missing-laptime",
}


def build_session_payload(
    fetch_result: FetchResult,
    *,
    drivers: Iterable[str] | None = None,
) -> Dict[str, Any]:
    """
    Convert FastF1 fetch result into a serialisable JSON payload for the UI.
    """
    identifier = fetch_result.identifier
    selected_drivers: Sequence[str] | None = [d.upper() for d in drivers] if drivers else None

    meta = {
        "year": identifier.year,
        "round": identifier.round_slug,
        "session": identifier.session_code,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "requestedDrivers": selected_drivers,
        "status": fetch_result.status,
    }

    if fetch_result.status != "ok" or fetch_result.session is None or pd is None:
        return {
            "meta": meta,
            "drivers": {},
            "laps": [],
            "corners": {},
            "notes": [
                fetch_result.message
                or ("FastF1 not installed" if fetch_result.status == "fastf1_not_installed" else "Session unavailable")
            ],
        }

    session = fetch_result.session
    laps_df = getattr(session, "laps", None)

    if laps_df is None or laps_df.empty:
        return {
            "meta": meta,
            "drivers": {},
            "laps": [],
            "corners": {},
            "notes": ["No lap data returned by fastf1 for this session."],
        }

    if selected_drivers:
        laps_df = laps_df[laps_df["Driver"].isin(selected_drivers)]

    if laps_df.empty:
        return {
            "meta": meta,
            "drivers": {},
            "laps": [],
            "corners": {},
            "notes": ["Requested drivers have no laps in this session."],
        }

    driver_meta_df = (
        laps_df[["Driver", "DriverNumber", "Team", "Compound", "TyreLife"]]
        .drop_duplicates(subset=["Driver"])
        .reset_index(drop=True)
    )

    drivers_payload: Dict[str, Any] = {}
    for row in driver_meta_df.itertuples(index=False):
        code = getattr(row, "Driver")
        drivers_payload[code] = {
            "code": code,
            "team": getattr(row, "Team", None),
            "number": _safe_int(getattr(row, "DriverNumber", None)),
            "defaultCompound": getattr(row, "Compound", None),
        }

    lap_entries: List[Dict[str, Any]] = []
    total_laps = int(len(laps_df))
    valid_laps = 0
    outlier_laps = 0

    is_race_session = getattr(session, "session_type", "").upper() == "R"

    for row in laps_df.itertuples(index=False):
        driver_code = getattr(row, "Driver")
        lap_number = _safe_int(getattr(row, "LapNumber"))
        lap_time_seconds = _timedelta_to_seconds(getattr(row, "LapTime", None))
        track_status_raw = _stringify_track_status(getattr(row, "TrackStatus", None))
        status_codes = _extract_status_codes(track_status_raw)

        flags: List[str] = []

        if lap_time_seconds is None:
            flags.append("missing-laptime")

        if bool(getattr(row, "Deleted", False)):
            flags.append("deleted")

        if not bool(getattr(row, "IsAccurate", True)):
            flags.append("inaccurate")

        if pd is not None and "PitOutTime" in laps_df.columns:
            if pd.notna(getattr(row, "PitOutTime", None)):
                flags.append("out-lap")

        if pd is not None and "PitInTime" in laps_df.columns:
            if pd.notna(getattr(row, "PitInTime", None)):
                flags.append("in-lap")

        if is_race_session and lap_number == 1:
            flags.append("formation-lap")

        if "2" in status_codes:
            flags.append("yellow-flag")
        if "3" in status_codes or "4" in status_codes:
            flags.append("safety-car")
        if "5" in status_codes or "6" in status_codes:
            flags.append("virtual-safety-car")
        if any(code in status_codes for code in {"7", "8", "9"}):
            flags.append("red-flag")

        seen: List[str] = []
        for flag in flags:
            if flag not in seen:
                seen.append(flag)
        flags = seen

        is_valid = lap_time_seconds is not None and not any(flag in OUTLIER_FLAGS for flag in flags)

        if is_valid:
            valid_laps += 1
        else:
            outlier_laps += 1

        lap_entries.append(
            {
                "driver": driver_code,
                "lapNumber": lap_number,
                "stint": _safe_int(getattr(row, "Stint")),
                "compound": getattr(row, "Compound", None),
                "tyreLife": _safe_int(getattr(row, "TyreLife")),
                "lapTimeSeconds": lap_time_seconds,
                "sectorTimesSeconds": [
                    _timedelta_to_seconds(getattr(row, "Sector1Time", None)),
                    _timedelta_to_seconds(getattr(row, "Sector2Time", None)),
                    _timedelta_to_seconds(getattr(row, "Sector3Time", None)),
                ],
                "isPersonalBest": bool(getattr(row, "IsPersonalBest", False)),
                "trackStatus": track_status_raw,
                "hasData": getattr(row, "IsAccurate", True),
                "flags": flags,
                "isValid": is_valid,
            }
        )

    # Corner-level telemetry not yet implemented; include empty arrays with a note.
    corners_payload = {code: [] for code in drivers_payload.keys()}

    meta["totalLapCount"] = total_laps
    meta["validLapCount"] = valid_laps
    meta["outlierLapCount"] = outlier_laps

    notes = []
    if fetch_result.message and fetch_result.message not in ("OK",):
        notes.append(fetch_result.message)
    if outlier_laps:
        notes.append(
            f"Flagged {outlier_laps} of {total_laps} laps as outliers (out laps, safety car periods, yellow flags, etc.)."
        )
    notes.append("Corner-level telemetry aggregation not yet implemented; arrays are placeholders.")

    event = getattr(session, "event", None)
    event_name = getattr(event, "EventName", None) if event is not None else None
    country = getattr(event, "EventCountry", None) if event is not None else None
    official_name = getattr(event, "OfficialEventName", None) if event is not None else None

    payload = {
        "meta": {
            **meta,
            "event": {
                "name": event_name,
                "country": country,
                "officialName": official_name,
            },
            "availableDrivers": list(drivers_payload.keys()),
        },
        "drivers": drivers_payload,
        "laps": lap_entries,
        "corners": corners_payload,
        "notes": notes,
    }

    return payload
