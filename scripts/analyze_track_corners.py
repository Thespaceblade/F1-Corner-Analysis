#!/usr/bin/env python3
"""
Analyze detected corners from session data to generate track corner definitions.

This script analyzes detected corner data across multiple drivers/laps to infer
consistent corner positions, types, and distance ranges for track corner matching.

Usage:
    python scripts/analyze_track_corners.py --track monaco --year 2025 --session Q
    python scripts/analyze_track_corners.py --track monaco --year 2025 --session Q --output tracks_monaco.json
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List

import numpy as np


def load_session_data(session_path: Path) -> Dict[str, Any] | None:
    """Load session JSON data."""
    if not session_path.exists():
        print(f"Error: Session file not found: {session_path}", file=sys.stderr)
        return None

    try:
        with open(session_path) as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading session data: {e}", file=sys.stderr)
        return None


def analyze_corner_positions(corners: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    Analyze detected corners to find consistent corner positions.
    
    Args:
        corners: Dictionary mapping driver codes to lists of corner metrics
        
    Returns:
        List of corner position clusters with statistics
    """
    # Collect all apex distances and speeds
    all_apex_distances = []
    distance_to_speeds: Dict[float, List[float]] = defaultdict(list)
    
    for driver, driver_corners in corners.items():
        for corner in driver_corners:
            apex_dist = corner.get("apexDistance", 0)
            apex_speed = corner.get("apexSpeed", 0)
            
            if apex_dist > 0:
                all_apex_distances.append(apex_dist)
                # Round to nearest meter for clustering
                dist_key = round(apex_dist)
                distance_to_speeds[dist_key].append(apex_speed)
    
    if not all_apex_distances:
        return []
    
    all_apex_distances = np.array(all_apex_distances)
    
    # Cluster apex distances to find consistent corner positions
    # Group distances within cluster_tolerance meters
    cluster_tolerance = 25.0  # 25m tolerance for corner position
    min_occurrences = 5  # Minimum occurrences to consider a corner
    
    sorted_distances = np.sort(all_apex_distances)
    clusters: List[Dict[str, Any]] = []
    current_cluster: List[float] = [sorted_distances[0]]
    
    for dist in sorted_distances[1:]:
        if dist - current_cluster[-1] < cluster_tolerance:
            current_cluster.append(dist)
        else:
            # Finalize current cluster
            if len(current_cluster) >= min_occurrences:
                cluster_distances = np.array(current_cluster)
                center = float(np.mean(cluster_distances))
                cluster_min = float(np.min(cluster_distances))
                cluster_max = float(np.max(cluster_distances))
                std = float(np.std(cluster_distances))
                
                # Get speeds for this cluster
                cluster_speeds = []
                for d in current_cluster:
                    dist_key = round(d)
                    cluster_speeds.extend(distance_to_speeds.get(dist_key, []))
                
                avg_speed = float(np.mean(cluster_speeds)) if cluster_speeds else 0.0
                
                clusters.append({
                    "center": center,
                    "min": cluster_min,
                    "max": cluster_max,
                    "std": std,
                    "count": len(current_cluster),
                    "avgSpeed": avg_speed,
                })
            
            current_cluster = [dist]
    
    # Don't forget the last cluster
    if len(current_cluster) >= min_occurrences:
        cluster_distances = np.array(current_cluster)
        center = float(np.mean(cluster_distances))
        cluster_min = float(np.min(cluster_distances))
        cluster_max = float(np.max(cluster_distances))
        std = float(np.std(cluster_distances))
        
        cluster_speeds = []
        for d in current_cluster:
            dist_key = round(d)
            cluster_speeds.extend(distance_to_speeds.get(dist_key, []))
        
        avg_speed = float(np.mean(cluster_speeds)) if cluster_speeds else 0.0
        
        clusters.append({
            "center": center,
            "min": cluster_min,
            "max": cluster_max,
            "std": std,
            "count": len(current_cluster),
            "avgSpeed": avg_speed,
        })
    
    # Sort clusters by center distance
    clusters.sort(key=lambda x: x["center"])
    
    return clusters


def classify_corner_type(avg_speed: float) -> str:
    """
    Classify corner type based on average apex speed.
    
    Args:
        avg_speed: Average apex speed in km/h
        
    Returns:
        Corner type: 'slow', 'medium', or 'fast'
    """
    if avg_speed < 120:
        return "slow"
    elif avg_speed < 180:
        return "medium"
    else:
        return "fast"


def generate_corner_definitions(
    clusters: List[Dict[str, Any]], tolerance_meters: float = 15.0
) -> List[Dict[str, Any]]:
    """
    Generate track corner definitions from clusters.
    
    Args:
        clusters: List of corner position clusters
        tolerance_meters: Additional tolerance for distance ranges
        
    Returns:
        List of corner definitions
    """
    corner_definitions = []
    
    for idx, cluster in enumerate(clusters, start=1):
        # Calculate distance range with tolerance
        min_distance = max(0, cluster["min"] - tolerance_meters)
        max_distance = cluster["max"] + tolerance_meters
        
        # Classify corner type
        corner_type = classify_corner_type(cluster["avgSpeed"])
        
        corner_def = {
            "number": idx,
            "type": corner_type,
            "expectedDistanceRange": {
                "min": round(min_distance, 1),
                "max": round(max_distance, 1),
            },
            # Metadata for validation
            "_metadata": {
                "centerDistance": round(cluster["center"], 1),
                "avgSpeed": round(cluster["avgSpeed"], 1),
                "occurrences": cluster["count"],
                "stdDev": round(cluster["std"], 1),
            },
        }
        
        corner_definitions.append(corner_def)
    
    return corner_definitions


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Analyze detected corners to generate track corner definitions"
    )
    parser.add_argument("--track", type=str, required=True, help="Track ID (e.g., monaco)")
    parser.add_argument("--year", type=int, required=True, help="Year (e.g., 2025)")
    parser.add_argument(
        "--session", type=str, required=True, help="Session code (e.g., Q, R)"
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output JSON file (default: print to stdout)",
    )
    parser.add_argument(
        "--tolerance",
        type=float,
        default=15.0,
        help="Distance tolerance in meters (default: 15.0)",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path("public/data/sessions"),
        help="Session data directory (default: public/data/sessions)",
    )

    args = parser.parse_args()

    # Load session data
    session_path = args.data_dir / str(args.year) / args.track / args.session / "session.json"
    data = load_session_data(session_path)
    
    if data is None:
        return 1

    # Check if session has corner data
    corners = data.get("corners", {})
    if not corners:
        print(f"Error: No corner data found in session", file=sys.stderr)
        return 1

    print(f"Analyzing corners for {args.track} ({args.year} {args.session})", file=sys.stderr)
    print(f"Drivers with corner data: {len(corners)}", file=sys.stderr)

    # Analyze corner positions
    clusters = analyze_corner_positions(corners)
    
    if not clusters:
        print("Error: No consistent corner positions found", file=sys.stderr)
        return 1

    print(f"Found {len(clusters)} consistent corner positions", file=sys.stderr)

    # Generate corner definitions
    corner_definitions = generate_corner_definitions(clusters, tolerance_meters=args.tolerance)

    # Create output structure
    output = {
        "track": args.track,
        "year": args.year,
        "session": args.session,
        "corners": corner_definitions,
        "summary": {
            "totalCorners": len(corner_definitions),
            "distanceRange": {
                "min": round(clusters[0]["min"], 1),
                "max": round(clusters[-1]["max"], 1),
            },
        },
    }

    # Output results
    if args.output:
        with open(args.output, "w") as f:
            json.dump(output, f, indent=2)
        print(f"Corner definitions written to: {args.output}", file=sys.stderr)
    else:
        print(json.dumps(output, indent=2))

    # Print summary
    print(f"\nSummary:", file=sys.stderr)
    print(f"  Track: {args.track}", file=sys.stderr)
    print(f"  Corners detected: {len(corner_definitions)}", file=sys.stderr)
    print(f"  Distance range: {output['summary']['distanceRange']['min']:.1f}m - {output['summary']['distanceRange']['max']:.1f}m", file=sys.stderr)
    print(f"\nCorner breakdown:", file=sys.stderr)
    type_counts = {}
    for corner in corner_definitions:
        corner_type = corner["type"]
        type_counts[corner_type] = type_counts.get(corner_type, 0) + 1
    for corner_type, count in sorted(type_counts.items()):
        print(f"  {corner_type}: {count}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

