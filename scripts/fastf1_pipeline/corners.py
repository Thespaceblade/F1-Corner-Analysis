"""
Corner detection and metrics calculation for F1 telemetry analysis.

This module provides functions to detect corners from speed/distance telemetry
and calculate corner-level metrics for analysis.
"""

from __future__ import annotations

from typing import Any, Dict, List

try:
    import numpy as np  # type: ignore
except ImportError:
    np = None  # type: ignore

try:
    import pandas as pd  # type: ignore
except ImportError:
    pd = None  # type: ignore

# Import pandas API types separately
try:
    if pd is not None:
        from pandas.api.types import (
            is_numeric_dtype,
            is_datetime64_any_dtype,
            is_timedelta64_dtype,
        )
    else:
        raise ImportError("pandas not available")
except ImportError:
    # Fallback functions if pandas API types can't be imported
    def is_numeric_dtype(dtype):  # type: ignore
        if pd is None:
            return False
        try:
            return pd.api.types.is_numeric_dtype(dtype)
        except (AttributeError, ImportError):
            return False
    
    def is_datetime64_any_dtype(dtype):  # type: ignore
        if pd is None:
            return False
        try:
            return pd.api.types.is_datetime64_any_dtype(dtype)
        except (AttributeError, ImportError):
            return False
    
    def is_timedelta64_dtype(dtype):  # type: ignore
        if pd is None:
            return False
        try:
            return pd.api.types.is_timedelta64_dtype(dtype)
        except (AttributeError, ImportError):
            return False


def resample_to_common_distance(
    tel_df: pd.DataFrame,
    step: float = 2.0,
) -> pd.DataFrame:
    """
    Resample telemetry to uniform distance grid.

    Args:
        tel_df: Telemetry DataFrame with Distance column
        step: Distance step in meters (default: 2.0m)

    Returns:
        Resampled DataFrame with uniform distance grid
    """
    if pd is None or tel_df is None or tel_df.empty:
        return tel_df

    # Clean and sort
    tel_df = tel_df.dropna(subset=["Distance"]).sort_values("Distance")
    tel_df = tel_df[~tel_df["Distance"].duplicated(keep="first")]

    if tel_df.empty:
        return tel_df

    max_d = float(tel_df["Distance"].max())
    grid = np.arange(0.0, max_d, step)
    out = pd.DataFrame({"Distance": grid})

    # Interpolate numeric columns only, skipping datetime/timedelta
    for col in tel_df.columns:
        if col == "Distance" or col == "Time":
            continue
        if is_datetime64_any_dtype(tel_df[col]) or is_timedelta64_dtype(tel_df[col]):
            continue
        if not is_numeric_dtype(tel_df[col]):
            continue
        vals = tel_df[col].to_numpy(dtype=float, copy=False)
        out[col] = np.interp(grid, tel_df["Distance"].to_numpy(), vals)

    # Handle Time separately as seconds
    if "Time" in tel_df.columns:
        # Ensure timedelta64[ns]
        t = pd.to_timedelta(tel_df["Time"])
        t_sec = t.dt.total_seconds().to_numpy()
        out["Time_s"] = np.interp(grid, tel_df["Distance"].to_numpy(), t_sec)

    return out


def detect_corners(
    speed_series: pd.Series,
    distance_series: pd.Series,
    min_drop_kmh: float = 18.0,
    min_recovery_kmh: float = 10.0,
    min_len_pts: int = 4,
) -> List[Dict[str, int]]:
    """
    Detect corners from speed/distance telemetry using speed drop heuristic.

    Algorithm:
    - A corner begins when speed starts a sustained drop larger than min_drop_kmh
    - The apex is the local minimum after the drop
    - Corner ends when speed recovers by min_recovery_kmh or trend reverses

    Args:
        speed_series: Series of speed values in km/h
        distance_series: Series of distance values in meters
        min_drop_kmh: Minimum speed drop to detect corner start (default: 18.0)
        min_recovery_kmh: Minimum speed recovery to detect corner end (default: 10.0)
        min_len_pts: Minimum number of points for valid corner (default: 4)

    Returns:
        List of dicts with start_idx, apex_idx, end_idx
    """
    if np is None or pd is None:
        return []

    sp = np.asarray(speed_series)
    d = np.asarray(distance_series)
    n = len(sp)

    if n < min_len_pts:
        return []

    corners = []
    i = 1

    while i < n - 2:
        # Look for start of braking - negative gradient region
        if sp[i - 1] - sp[i] < 0.5:
            i += 1
            continue

        # Potential braking window
        j = i
        drop = 0.0
        while j < n - 1 and sp[j] - sp[j + 1] > 0:  # Descending
            drop += sp[j] - sp[j + 1]
            j += 1

        if drop >= min_drop_kmh:
            # j is at the apex index approx
            apex_idx = j

            # Now find recovery
            k = apex_idx
            recover = 0.0
            while k < n - 1 and recover < min_recovery_kmh and sp[k + 1] - sp[k] >= -0.2:
                recover += max(0.0, sp[k + 1] - sp[k])
                k += 1

            start_idx = max(i - 1, 0)
            end_idx = min(k + 1, n - 1)

            if end_idx - start_idx >= min_len_pts:
                corners.append({
                    "start_idx": int(start_idx),
                    "apex_idx": int(apex_idx),
                    "end_idx": int(end_idx),
                })

            i = end_idx + 1
        else:
            i = j + 1

    return corners


def calculate_corner_metrics(
    telemetry: pd.DataFrame,
    corners: List[Dict[str, int]],
    lap_number: int,
) -> List[Dict[str, Any]]:
    """
    Calculate metrics for each detected corner.

    Args:
        telemetry: Resampled telemetry DataFrame with Speed, Distance, and optionally Time_s
        corners: List of corner dicts with start_idx, apex_idx, end_idx
        lap_number: Lap number for these corners

    Returns:
        List of corner metric dictionaries
    """
    if pd is None or telemetry is None or telemetry.empty or not corners:
        return []

    metrics = []

    for idx, corner in enumerate(corners, start=1):
        start_idx = corner["start_idx"]
        apex_idx = corner["apex_idx"]
        end_idx = corner["end_idx"]

        # Ensure indices are within bounds
        if start_idx >= len(telemetry) or apex_idx >= len(telemetry) or end_idx >= len(telemetry):
            continue

        entry_speed = float(telemetry["Speed"].iloc[start_idx])
        apex_speed = float(telemetry["Speed"].iloc[apex_idx])
        exit_speed = float(telemetry["Speed"].iloc[end_idx])

        # Calculate times
        corner_time = None
        if "Time_s" in telemetry.columns:
            t_start = float(telemetry["Time_s"].iloc[start_idx])
            t_end = float(telemetry["Time_s"].iloc[end_idx])
            corner_time = t_end - t_start

        # Calculate distances
        entry_dist = float(telemetry["Distance"].iloc[start_idx])
        apex_dist = float(telemetry["Distance"].iloc[apex_idx])
        exit_dist = float(telemetry["Distance"].iloc[end_idx])

        braking_dist = apex_dist - entry_dist
        accel_dist = exit_dist - apex_dist

        # Find minimum speed in corner
        corner_speeds = telemetry["Speed"].iloc[start_idx : end_idx + 1]
        min_speed = float(corner_speeds.min())

        metrics.append({
            "detectedCornerIndex": idx,
            "lapNumber": lap_number,
            "entrySpeed": round(entry_speed, 1),
            "apexSpeed": round(apex_speed, 1),
            "exitSpeed": round(exit_speed, 1),
            "cornerTime": round(corner_time, 3) if corner_time is not None else None,
            "brakingDistance": round(braking_dist, 1),
            "accelerationDistance": round(accel_dist, 1),
            "entryDistance": round(entry_dist, 1),
            "apexDistance": round(apex_dist, 1),
            "exitDistance": round(exit_dist, 1),
            "minSpeed": round(min_speed, 1),
        })

    return metrics


def match_corners_to_track(
    detected_corners: List[Dict[str, Any]],
    track_corners: List[Dict[str, Any]],
    tolerance_meters: float = 50.0,
) -> List[Dict[str, Any]]:
    """
    Match detected corners to track corner definitions.

    Args:
        detected_corners: List of corner metrics with apexDistance
        track_corners: List of track corner definitions from tracks.json
        tolerance_meters: Maximum distance difference for matching

    Returns:
        List of matched corners with cornerNumber assigned
    """
    if not detected_corners:
        return []

    matched = []
    used_track_corners = set()

    # Sort detected corners by apex distance
    sorted_detected = sorted(detected_corners, key=lambda c: c.get("apexDistance", 0))

    # If we have track corner distance ranges, use those
    # Otherwise, use simple sequential matching
    for detected in sorted_detected:
        apex_dist = detected.get("apexDistance", 0)
        best_match = None
        best_diff = float("inf")

        for track_idx, track_corner in enumerate(track_corners):
            if track_idx in used_track_corners:
                continue

            # Check if track corner has expected distance range
            if "expectedDistanceRange" in track_corner:
                expected_min = track_corner["expectedDistanceRange"]["min"]
                expected_max = track_corner["expectedDistanceRange"]["max"]

                if expected_min <= apex_dist <= expected_max:
                    # If within range, this is a perfect match (diff = 0)
                    # Use distance from range center for ranking if multiple matches
                    range_center = (expected_min + expected_max) / 2.0
                    diff = abs(apex_dist - range_center)
                    if diff < best_diff:
                        best_match = track_idx
                        best_diff = diff
            else:
                # Fallback: sequential matching (assumes corners are in order)
                # This is less accurate but works if we don't have distance data
                if best_match is None:
                    best_match = track_idx
                    best_diff = 0

        # If we found a match within a distance range, accept it regardless of tolerance
        # Tolerance is only for proximity-based matching when no range is available
        if best_match is not None:
            # Check if the match was within a range (best_diff would be small relative to range)
            track_corner = track_corners[best_match]
            if "expectedDistanceRange" in track_corner:
                expected_min = track_corner["expectedDistanceRange"]["min"]
                expected_max = track_corner["expectedDistanceRange"]["max"]
                # If apex is within range, accept the match
                if expected_min <= apex_dist <= expected_max:
                    matched_corner = {
                        **detected,
                        "cornerNumber": track_corners[best_match].get("number", len(matched) + 1),
                        "cornerType": track_corners[best_match].get("type", "medium"),
                    }
                    matched.append(matched_corner)
                    used_track_corners.add(best_match)
                    continue
                # If outside range but within tolerance, also accept
                elif best_diff <= tolerance_meters:
                    matched_corner = {
                        **detected,
                        "cornerNumber": track_corners[best_match].get("number", len(matched) + 1),
                        "cornerType": track_corners[best_match].get("type", "medium"),
                    }
                    matched.append(matched_corner)
                    used_track_corners.add(best_match)
                    continue
            elif best_diff <= tolerance_meters:
                # Fallback matching within tolerance
                matched_corner = {
                    **detected,
                    "cornerNumber": track_corners[best_match].get("number", len(matched) + 1),
                    "cornerType": track_corners[best_match].get("type", "medium"),
                }
                matched.append(matched_corner)
                used_track_corners.add(best_match)
                continue
        
        # No match found - assign sequential number
        matched_corner = {
            **detected,
            "cornerNumber": len(matched) + 1,
            "cornerType": "unknown",
        }
        matched.append(matched_corner)

    return matched
