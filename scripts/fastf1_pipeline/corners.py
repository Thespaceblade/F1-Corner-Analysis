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

    # Primary detection: speed-based corners (optimized)
    # Use vectorized operations where possible for better performance
    i = 1
    while i < n - 2:
        # Quick check: skip if speed is increasing (not braking)
        if sp[i - 1] - sp[i] < 0.5:
            i += 1
            continue

        # Find braking window (speed drop)
        j = i
        drop = 0.0
        # Limit search window to prevent excessive iteration
        max_search = min(i + 100, n - 1)
        while j < max_search and sp[j] > sp[j + 1]:  # Descending
            drop += sp[j] - sp[j + 1]
            j += 1
            # Early exit if we've found enough drop
            if drop >= min_drop_kmh:
                break

        if drop >= min_drop_kmh:
            # j is at the apex index approx
            apex_idx = j

            # Find recovery (limit search window)
            k = apex_idx
            recover = 0.0
            max_recovery_search = min(apex_idx + 100, n - 1)
            while k < max_recovery_search and recover < min_recovery_kmh:
                if k + 1 >= n:
                    break
                if sp[k + 1] - sp[k] < -0.2:  # Speed dropping again, stop
                    break
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
            last_apex = filtered_corners[-1]["apex_idx"]
            apex_distance_diff = abs(corner["apex_idx"] - last_apex)
            
            # Calculate actual distance difference if distance series is available
            # This allows for adaptive spacing based on actual track distance
            distance_diff_meters = None
            try:
                if len(distance_series) > max(corner["apex_idx"], last_apex):
                    # Convert to array if it's a Series for indexing
                    if hasattr(distance_series, 'iloc'):
                        dist1 = float(distance_series.iloc[last_apex])
                        dist2 = float(distance_series.iloc[corner["apex_idx"]])
                    else:
                        dist1 = float(distance_series[last_apex])
                        dist2 = float(distance_series[corner["apex_idx"]])
                    distance_diff_meters = abs(dist2 - dist1)
            except (IndexError, ValueError, TypeError):
                pass
            
            # Minimum spacing: 
            # - 10 points (20m) for general corners
            # - 5 points (10m) if distance difference is < 100m (for corner clusters)
            # This allows closely-spaced corners like corners 11-14 to be detected
            min_spacing_points = 10  # Default: 20m
            if distance_diff_meters is not None and distance_diff_meters < 100:
                # For corners within 100m of each other, use smaller spacing
                min_spacing_points = 5  # 10m spacing
            
            if apex_distance_diff >= min_spacing_points:
                filtered_corners.append(corner)
            # If corners are very close but have significant speed differences, 
            # they might be distinct corners - keep the one with larger speed drop
            elif apex_distance_diff >= 3:  # At least 6m apart
                # Check if this corner has a significantly different speed profile
                # Compare speed drops between the two corners
                last_corner_speed_drop = 0
                current_corner_speed_drop = 0
                
                if last_apex < len(sp) - 1 and last_apex > 0:
                    last_start_idx = filtered_corners[-1].get("start_idx", last_apex - 5)
                    last_start_idx = max(0, min(last_start_idx, last_apex))
                    if last_start_idx < len(sp):
                        last_corner_speed_drop = sp[last_start_idx] - sp[last_apex]
                
                if corner["apex_idx"] < len(sp) - 1 and corner["apex_idx"] > 0:
                    current_start_idx = corner.get("start_idx", corner["apex_idx"] - 5)
                    current_start_idx = max(0, min(current_start_idx, corner["apex_idx"]))
                    if current_start_idx < len(sp):
                        current_corner_speed_drop = sp[current_start_idx] - sp[corner["apex_idx"]]
                
                # If current corner has significantly different speed drop (>5 km/h difference),
                # keep it as a distinct corner
                if abs(current_corner_speed_drop - last_corner_speed_drop) > 5.0:
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
    track_corners_for_types: List[Dict[str, Any]] | None = None,
) -> List[Dict[str, Any]]:
    """
    Match detected corners to track corner definitions.
    Improved to handle corner clusters with overlapping distance ranges.
    Supports both FastF1 CircuitInfo format (distance) and tracks.json format (expectedDistanceRange).

    Args:
        detected_corners: List of corner metrics with apexDistance
        track_corners: List of track corner definitions (FastF1 CircuitInfo or tracks.json)
        tolerance_meters: Maximum distance difference for matching
        track_corners_for_types: Optional tracks.json corners for corner types (if track_corners is FastF1 format)

    Returns:
        List of matched corners with cornerNumber assigned
    """
    if not detected_corners:
        return []

    matched = []
    used_track_corners = set()

    # Sort detected corners by apex distance
    sorted_detected = sorted(detected_corners, key=lambda c: c.get("apexDistance", 0))

    # Detect corner clusters (corners within 100m of each other)
    # For clusters, we use stricter matching and sequential ordering
    track_corner_distances = []
    is_fastf1_format = False
    
    for track_corner in track_corners:
        # Check if this is FastF1 format (has "distance" key) or tracks.json format (has "expectedDistanceRange")
        if "distance" in track_corner:
            # FastF1 CircuitInfo format - single distance value
            is_fastf1_format = True
            track_corner_distances.append(float(track_corner["distance"]))
        elif "expectedDistanceRange" in track_corner:
            # tracks.json format - distance range
            range_center = (
                track_corner["expectedDistanceRange"]["min"] + 
                track_corner["expectedDistanceRange"]["max"]
            ) / 2.0
            track_corner_distances.append(range_center)
        else:
            track_corner_distances.append(0)
    
    # Find clusters in track corners (corners within 100m of each other)
    clusters = []
    current_cluster = []
    for i, dist in enumerate(track_corner_distances):
        if not current_cluster:
            current_cluster = [i]
        elif dist - track_corner_distances[current_cluster[0]] < 100:
            current_cluster.append(i)
        else:
            if len(current_cluster) > 1:
                clusters.append(current_cluster)
            current_cluster = [i]
    if len(current_cluster) > 1:
        clusters.append(current_cluster)

    # Create a map of track corner index to cluster
    track_to_cluster = {}
    for cluster_idx, cluster in enumerate(clusters):
        for track_idx in cluster:
            track_to_cluster[track_idx] = cluster_idx

    # Match detected corners to track corners
    for detected in sorted_detected:
        apex_dist = detected.get("apexDistance", 0)
        best_match = None
        best_diff = float("inf")
        best_is_in_range = False

        # First pass: Find best match considering all track corners
        for track_idx, track_corner in enumerate(track_corners):
            if track_idx in used_track_corners:
                continue

            # Check if track corner has distance data (FastF1 format) or distance range (tracks.json format)
            dist_from_range = None
            is_in_range = False
            
            if "distance" in track_corner:
                # FastF1 CircuitInfo format - single distance value
                corner_distance = float(track_corner["distance"])
                # For FastF1, use a small tolerance window around the distance (e.g., ±25m)
                tolerance_window = 25.0
                expected_min = corner_distance - tolerance_window
                expected_max = corner_distance + tolerance_window
                is_in_range = expected_min <= apex_dist <= expected_max
                dist_from_range = abs(apex_dist - corner_distance)
            elif "expectedDistanceRange" in track_corner:
                # tracks.json format - distance range
                expected_min = track_corner["expectedDistanceRange"]["min"]
                expected_max = track_corner["expectedDistanceRange"]["max"]
                is_in_range = expected_min <= apex_dist <= expected_max

                # Calculate distance from range
                if apex_dist < expected_min:
                    dist_from_range = expected_min - apex_dist
                elif apex_dist > expected_max:
                    dist_from_range = apex_dist - expected_max
                else:
                    # Inside range - use distance from center for ranking
                    range_center = (expected_min + expected_max) / 2.0
                    dist_from_range = abs(apex_dist - range_center)
            else:
                # No distance data - skip this corner
                continue
            
            # For corners in clusters, use stricter tolerance (15m instead of 50m)
            # and prioritize corners that are in range
            is_in_cluster = track_idx in track_to_cluster
            cluster_tolerance = 15.0 if is_in_cluster else tolerance_meters
            
            # Consider this corner if it's within tolerance
            if dist_from_range is not None and dist_from_range <= cluster_tolerance:
                # Prioritize: 1) corners in range, 2) corners in clusters (sequential), 3) closest distance
                score = dist_from_range
                if is_in_range:
                    score -= 1000  # Strongly prefer corners in range
                if is_in_cluster and best_match is not None and best_match in track_to_cluster:
                    # Within same cluster, prefer sequential ordering
                    cluster = track_to_cluster[track_idx]
                    if cluster == track_to_cluster[best_match]:
                        # Same cluster - check if this is the next corner in sequence
                        if track_idx > best_match:
                            score -= 500  # Prefer next corner in sequence
                
                if score < best_diff or (is_in_range and not best_is_in_range):
                    best_match = track_idx
                    best_diff = dist_from_range
                    best_is_in_range = is_in_range
            # Note: Removed else clause for fallback sequential matching as it's not needed with distance-based matching

        # If we found a match, accept it (check tolerance for non-cluster corners)
        if best_match is not None:
            is_in_cluster = best_match in track_to_cluster
            cluster_tolerance = 15.0 if is_in_cluster else tolerance_meters
            
            if best_diff <= cluster_tolerance or best_is_in_range:
                track_corner = track_corners[best_match]
                
                # Get corner type from track_corners_for_types if available (tracks.json has types)
                corner_type = "medium"  # Default
                if track_corners_for_types:
                    # Find matching corner in tracks.json by number
                    corner_number = track_corner.get("number", len(matched) + 1)
                    for tc in track_corners_for_types:
                        if tc.get("number") == corner_number:
                            corner_type = tc.get("type", "medium")
                            break
                else:
                    # Use type from track_corner if available
                    corner_type = track_corner.get("type", "medium")
                
                matched_corner = {
                    **detected,
                    "cornerNumber": track_corner.get("number", len(matched) + 1),
                    "cornerType": corner_type,
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
