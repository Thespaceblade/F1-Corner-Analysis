from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Sequence, Set

from .config import PipelineConfig
from .corners import (
    calculate_corner_metrics,
    detect_corners,
    match_corners_to_track,
    resample_to_common_distance,
)
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


def process_session_corners(
    session: Any,
    laps_df: pd.DataFrame,
    round_slug: str,
    selected_drivers: Sequence[str] | None = None,
    process_fastest_only: bool = False,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process corner telemetry for all valid laps in session.

    Args:
        session: FastF1 session object
        laps_df: DataFrame of laps
        round_slug: Round slug for loading track corner definitions
        selected_drivers: Filter to specific drivers (optional)
        process_fastest_only: If True, only process fastest lap per driver (faster)

    Returns:
        Dictionary mapping driver codes to lists of corner metrics
    """
    corners_by_driver: Dict[str, List[Dict[str, Any]]] = {}

    if pd is None:
        return corners_by_driver

    # Load track corner definitions (if available)
    track_corners = None
    try:
        config = PipelineConfig()
        tracks_path = config.root / "public" / "data" / "tracks.json"
        if tracks_path.exists():
            tracks_data = json.loads(tracks_path.read_text())
            if round_slug in tracks_data.get("tracks", {}):
                track_corners = tracks_data["tracks"][round_slug].get("corners", [])
    except Exception:
        # If we can't load track corners, continue without matching
        track_corners = None

    # Filter to valid laps only
    valid_laps = laps_df[laps_df["IsAccurate"] == True].copy()

    if selected_drivers:
        valid_laps = valid_laps[valid_laps["Driver"].isin(selected_drivers)]

    if valid_laps.empty:
        return corners_by_driver

    # If processing fastest only, get fastest lap per driver
    if process_fastest_only:
        fastest_laps = []
        for driver in valid_laps["Driver"].unique():
            driver_laps = valid_laps[valid_laps["Driver"] == driver]
            if not driver_laps.empty:
                # Get fastest lap by LapTime
                fastest = driver_laps.nsmallest(1, "LapTime")
                fastest_laps.append(fastest)
        if fastest_laps:
            valid_laps = pd.concat(fastest_laps, ignore_index=True)

    # Process each valid lap
    for _, lap_row in valid_laps.iterrows():
        driver_code = lap_row["Driver"]
        lap_number = _safe_int(lap_row["LapNumber"])

        if lap_number is None:
            continue

        try:
            # Get lap object from session
            lap_filter = (session.laps["Driver"] == driver_code) & (
                session.laps["LapNumber"] == lap_number
            )
            matching_laps = session.laps[lap_filter]

            if matching_laps.empty:
                continue

            lap = matching_laps.iloc[0]

            # Get telemetry with distance
            telemetry = lap.get_car_data().add_distance()

            if telemetry is None or telemetry.empty:
                continue

            # Resample to uniform grid
            telemetry_resampled = resample_to_common_distance(telemetry, step=2.0)

            if telemetry_resampled.empty or "Speed" not in telemetry_resampled.columns:
                continue

            # Detect corners using enhanced method that includes fast corner detection
            # Uses speed gradient analysis to detect fast corners with minimal speed drops
            throttle_series = telemetry_resampled.get("Throttle") if "Throttle" in telemetry_resampled.columns else None
            brake_series = telemetry_resampled.get("Brake") if "Brake" in telemetry_resampled.columns else None
            
            detected = detect_corners(
                telemetry_resampled["Speed"],
                telemetry_resampled["Distance"],
                min_drop_kmh=10.0,  # Reduced from default 18.0 to catch fast corners
                min_recovery_kmh=8.0,  # Reduced from default 10.0
                throttle_series=throttle_series,
                brake_series=brake_series,
                use_throttle_brake=True,  # Enable fast corner detection using speed gradient analysis
            )

            if not detected:
                continue

            # Calculate metrics
            corner_metrics = calculate_corner_metrics(
                telemetry_resampled,
                detected,
                lap_number,
            )

            if not corner_metrics:
                continue

            # Match to track corners if available
            if track_corners:
                corner_metrics = match_corners_to_track(
                    corner_metrics,
                    track_corners,
                    tolerance_meters=50.0,
                )

            # Store in dictionary
            if driver_code not in corners_by_driver:
                corners_by_driver[driver_code] = []

            corners_by_driver[driver_code].extend(corner_metrics)

        except Exception as e:
            # Log error but continue processing
            # In production, you might want to log this properly
            print(f"Error processing corner for {driver_code} lap {lap_number}: {e}")
            continue

    return corners_by_driver


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
    
    # Safely get laps - handle cases where session failed to load properly
    try:
        laps_df = getattr(session, "laps", None)
        if laps_df is None:
            # Try to access it to trigger loading check
            laps_df = session.laps
    except Exception as e:
        # Session data not available (future session, data unavailable, etc.)
        return {
            "meta": {**meta, "status": "error"},
            "drivers": {},
            "laps": [],
            "corners": {},
            "notes": [
                f"Session data not available: {str(e)}"
            ],
        }

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

    # Get session start time for calculating relative session time
    # For qualifying, use Q1 start from session_status if available, otherwise use first lap time
    session_start_time = None
    q1_start_time = None
    
    # Try to get Q1 start from session_status first (most accurate)
    if pd is not None and hasattr(session, "session_status"):
        session_status = getattr(session, "session_status", None)
        if session_status is not None and not session_status.empty:
            for _, row in session_status.iterrows():
                status = str(row.get("Status", "")).strip()
                if status == "Started":
                    q1_start_time = row.get("Time", None)
                    break
    
    # Use Q1 start if available, otherwise use first lap time
    if q1_start_time is not None:
        session_start_time = q1_start_time
    elif pd is not None and "Time" in laps_df.columns:
        times = laps_df["Time"].dropna()
        if len(times) > 0:
            session_start_time = times.min()

    for row in laps_df.itertuples(index=False):
        driver_code = getattr(row, "Driver")
        lap_number = _safe_int(getattr(row, "LapNumber"))
        lap_time_seconds = _timedelta_to_seconds(getattr(row, "LapTime", None))
        track_status_raw = _stringify_track_status(getattr(row, "TrackStatus", None))
        status_codes = _extract_status_codes(track_status_raw)
        
        # Calculate session time in seconds (relative to session start)
        session_time_seconds = None
        if pd is not None and session_start_time is not None:
            lap_time = getattr(row, "Time", None)
            if lap_time is not None and pd.notna(lap_time):
                try:
                    time_delta = lap_time - session_start_time
                    session_time_seconds = float(time_delta.total_seconds())
                except (AttributeError, TypeError):
                    pass

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
                "sessionTimeSeconds": session_time_seconds,
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

    # Process corner telemetry for valid laps
    corners_payload = process_session_corners(
        session,
        laps_df,
        identifier.round_slug,
        selected_drivers=selected_drivers,
    )

    # Extract Q1/Q2/Q3 boundaries from session_status for qualifying sessions
    qualifyingBoundaries = None
    if pd is not None and hasattr(session, "session_status"):
        session_status = getattr(session, "session_status", None)
        if session_status is not None and not session_status.empty:
            # Find Q1, Q2, Q3 start and finish times
            # In F1 qualifying, we expect 3 "Started" and 3 "Finished" statuses
            started_times = []
            finished_times = []
            
            for _, row in session_status.iterrows():
                status = str(row.get("Status", "")).strip()
                time_val = row.get("Time", None)
                
                if status == "Started" and time_val is not None:
                    started_times.append(time_val)
                elif status == "Finished" and time_val is not None:
                    finished_times.append(time_val)
            
            # We need at least Q1 start to calculate boundaries
            if len(started_times) >= 1:
                q1_start = started_times[0]
                
                # Calculate relative times in seconds from Q1 start
                q1_start_seconds = 0.0
                q1_end_seconds = None
                q2_start_seconds = None
                q2_end_seconds = None
                q3_start_seconds = None
                q3_end_seconds = None
                
                if len(finished_times) >= 1:
                    q1_end_seconds = (finished_times[0] - q1_start).total_seconds()
                
                if len(started_times) >= 2:
                    q2_start_seconds = (started_times[1] - q1_start).total_seconds()
                    if len(finished_times) >= 2:
                        q2_end_seconds = (finished_times[1] - q1_start).total_seconds()
                
                if len(started_times) >= 3:
                    q3_start_seconds = (started_times[2] - q1_start).total_seconds()
                    if len(finished_times) >= 3:
                        q3_end_seconds = (finished_times[2] - q1_start).total_seconds()
                
                qualifyingBoundaries = {
                    "q1Start": q1_start_seconds,
                    "q1End": q1_end_seconds,
                    "q2Start": q2_start_seconds,
                    "q2End": q2_end_seconds,
                    "q3Start": q3_start_seconds,
                    "q3End": q3_end_seconds,
                }

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
    if not any(corners_payload.values()):
        notes.append("No corner telemetry data available for this session.")

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
    
    # Add qualifying boundaries if available
    if qualifyingBoundaries is not None:
        payload["qualifyingBoundaries"] = qualifyingBoundaries

    return payload
