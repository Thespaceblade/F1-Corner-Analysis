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
    throttle_series: pd.Series | None = None,
    brake_series: pd.Series | None = None,
    use_throttle_brake: bool = False,
) -> List[Dict[str, int]]:
    """
    Detect corners from speed/distance telemetry using speed drop heuristic.
    Optionally uses throttle/brake signals to detect fast corners.

    Algorithm:
    - Primary: A corner begins when speed starts a sustained drop larger than min_drop_kmh
    - The apex is the local minimum after the drop
    - Corner ends when speed recovers by min_recovery_kmh or trend reverses
    - Secondary (if use_throttle_brake): Detect corners from throttle lifts or brake applications
      even when speed drop is minimal (for fast corners)

    Args:
        speed_series: Series of speed values in km/h
        distance_series: Series of distance values in meters
        min_drop_kmh: Minimum speed drop to detect corner start (default: 18.0)
        min_recovery_kmh: Minimum speed recovery to detect corner end (default: 10.0)
        min_len_pts: Minimum number of points for valid corner (default: 4)
        throttle_series: Optional series of throttle values (0-100%)
        brake_series: Optional series of brake values (0-100%)
        use_throttle_brake: If True, use throttle/brake signals for fast corner detection

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

    # Primary detection: speed-based corners (slow/medium corners)
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

    # Secondary detection: speed gradient-based corners (fast corners)
    # Look for local minima in speed gradient, even when overall speed is increasing
    # This catches fast corners that don't have significant speed drops
    if use_throttle_brake:
        # Calculate speed gradient (rate of change)
        speed_gradient = np.gradient(sp)
        speed_gradient_smooth = np.convolve(speed_gradient, np.ones(5)/5, mode='same')
        
        # Find local minima in speed gradient (points where acceleration decreases)
        # These indicate corners even if speed is still increasing
        i = 10
        while i < n - 10:
            # Check if this is a local minimum in speed gradient
            is_local_min = True
            for offset in [-5, -3, -1, 1, 3, 5]:
                if i + offset < n and speed_gradient_smooth[i] >= speed_gradient_smooth[i + offset]:
                    is_local_min = False
                    break
            
            # Also check for actual speed local minima (even very shallow ones)
            speed_is_local_min = True
            for offset in [-3, -2, -1, 1, 2, 3]:
                if 0 <= i + offset < n and sp[i] > sp[i + offset]:
                    speed_is_local_min = False
                    break
            
            # Detect corner if gradient minimum OR speed minimum (even shallow)
            if is_local_min or speed_is_local_min:
                # Find the actual speed minimum in this region (apex)
                apex_idx = i
                min_speed = sp[i]
                search_start = max(0, i - 10)
                search_end = min(n - 1, i + 15)
                for j in range(search_start, search_end):
                    if sp[j] < min_speed:
                        min_speed = sp[j]
                        apex_idx = j
                
                # Find start (look backward for speed peak or gradient change)
                start_idx = apex_idx
                for j in range(apex_idx, max(0, apex_idx - 25), -1):
                    if j > 0 and sp[j] > sp[j-1]:
                        start_idx = j
                        break
                start_idx = max(0, start_idx - 3)
                
                # Find end (look forward for speed recovery)
                end_idx = apex_idx
                for j in range(apex_idx, min(n - 1, apex_idx + 25)):
                    if j < n - 1 and sp[j] < sp[j+1]:
                        end_idx = j
                        break
                end_idx = min(n - 1, end_idx + 3)
                
                # Only add if:
                # 1. Corner is at least min_len_pts long
                # 2. Doesn't overlap with existing corners
                # 3. Has some speed variation (even if small, > 1 km/h difference)
                speed_variation = sp[start_idx] - sp[apex_idx] if start_idx < apex_idx else sp[apex_idx] - sp[end_idx]
                
                if end_idx - start_idx >= min_len_pts and speed_variation > 1.0:
                    overlaps = False
                    for existing in corners:
                        existing_start = existing["start_idx"]
                        existing_end = existing["end_idx"]
                        if not (end_idx < existing_start - 30 or start_idx > existing_end + 30):
                            overlaps = True
                            break
                    
                    if not overlaps:
                        corners.append({
                            "start_idx": int(start_idx),
                            "apex_idx": int(apex_idx),
                            "end_idx": int(end_idx),
                        })
                
                i = end_idx + 5
            else:
                i += 1
    
    # Also use brake signals if available
    if use_throttle_brake and brake_series is not None:
        brake = np.asarray(brake_series)
        
        # Detect corners from brake applications (even minimal braking)
        i = 5
        while i < n - 5:
            # Check for any brake application
            brake_window = brake[max(0, i-5):min(n, i+5)]
            max_brake = np.max(brake_window)
            
            if max_brake > 1.0:  # Any braking at all
                # Find the braking peak (corner entry)
                brake_peak_idx = i
                for j in range(i, min(i + 15, n - 1)):
                    if brake[j] > brake[brake_peak_idx]:
                        brake_peak_idx = j
                
                # Find apex (speed minimum near brake application)
                apex_idx = brake_peak_idx
                min_speed = sp[brake_peak_idx]
                for j in range(brake_peak_idx, min(brake_peak_idx + 25, n - 1)):
                    if sp[j] < min_speed:
                        min_speed = sp[j]
                        apex_idx = j
                
                # Find start and end
                start_idx = max(0, brake_peak_idx - 10)
                end_idx = min(n - 1, apex_idx + 20)
                
                # Check for overlaps
                overlaps = False
                for existing in corners:
                    existing_start = existing["start_idx"]
                    existing_end = existing["end_idx"]
                    if not (end_idx < existing_start - 50 or start_idx > existing_end + 50):
                        overlaps = True
                        break
                
                if not overlaps and end_idx - start_idx >= min_len_pts:
                    corners.append({
                        "start_idx": int(start_idx),
                        "apex_idx": int(apex_idx),
                        "end_idx": int(end_idx),
                    })
                
                i = end_idx + 1
            else:
                i += 1
    
    # Sort corners by apex distance and remove any that are too close together
    corners.sort(key=lambda c: c["apex_idx"])
    filtered_corners = []
    for corner in corners:
        if not filtered_corners:
            filtered_corners.append(corner)
        else:
            # Only add if apex is at least 20 points away from previous
            last_apex = filtered_corners[-1]["apex_idx"]
            if abs(corner["apex_idx"] - last_apex) >= 20:
                filtered_corners.append(corner)
    
    return filtered_corners


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
