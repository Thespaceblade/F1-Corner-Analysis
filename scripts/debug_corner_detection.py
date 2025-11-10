#!/usr/bin/env python3
"""
Debug corner detection for Australia track to understand why corners 11-14 aren't detected.
"""

import json
import sys
from pathlib import Path

# Add parent directory to path to import fastf1_pipeline
sys.path.insert(0, str(Path(__file__).parent))

try:
    import fastf1
    import pandas as pd
    import numpy as np
    from fastf1_pipeline.corners import detect_corners, calculate_corner_metrics, resample_to_common_distance
    from fastf1_pipeline.config import PipelineConfig
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure fastf1 is installed and you're in the correct directory")
    sys.exit(1)

def analyze_lap_corner_detection(year, round_slug, session_code, driver_code, lap_number):
    """Analyze corner detection for a specific lap."""
    print("=" * 80)
    print(f"Corner Detection Analysis")
    print(f"Track: {round_slug}, Session: {session_code}, Driver: {driver_code}, Lap: {lap_number}")
    print("=" * 80)
    
    try:
        # Load session
        session = fastf1.get_session(year, round_slug, session_code)
        session.load(laps=True, telemetry=True)
        
        # Get the specific lap
        lap_filter = (session.laps["Driver"] == driver_code) & (session.laps["LapNumber"] == lap_number)
        matching_laps = session.laps[lap_filter]
        
        if matching_laps.empty:
            print(f"Lap {lap_number} not found for {driver_code}")
            return
        
        lap = matching_laps.iloc[0]
        
        # Get telemetry
        telemetry = lap.get_car_data().add_distance()
        if telemetry is None or telemetry.empty:
            print("No telemetry data")
            return
        
        # Resample
        telemetry_resampled = resample_to_common_distance(telemetry, step=2.0)
        
        if telemetry_resampled.empty or "Speed" not in telemetry_resampled.columns:
            print("No resampled telemetry")
            return
        
        print(f"\nTelemetry data:")
        print(f"  Points: {len(telemetry_resampled)}")
        print(f"  Distance range: {telemetry_resampled['Distance'].min():.1f}m - {telemetry_resampled['Distance'].max():.1f}m")
        print(f"  Speed range: {telemetry_resampled['Speed'].min():.1f} - {telemetry_resampled['Speed'].max():.1f} km/h")
        
        # Get throttle/brake data
        throttle_series = telemetry_resampled.get("Throttle") if "Throttle" in telemetry_resampled.columns else None
        brake_series = telemetry_resampled.get("Brake") if "Brake" in telemetry_resampled.columns else None
        
        # Detect corners with current parameters
        detected = detect_corners(
            telemetry_resampled["Speed"],
            telemetry_resampled["Distance"],
            min_drop_kmh=10.0,
            min_recovery_kmh=8.0,
            throttle_series=throttle_series,
            brake_series=brake_series,
            use_throttle_brake=True,
        )
        
        print(f"\nDetected corners: {len(detected)}")
        
        if detected:
            # Calculate metrics
            corner_metrics = calculate_corner_metrics(
                telemetry_resampled,
                detected,
                lap_number,
            )
            
            print(f"\nCorner metrics calculated: {len(corner_metrics)}")
            
            # Show all detected corners
            print(f"\nAll detected corners (by distance):")
            for i, corner in enumerate(corner_metrics, 1):
                apex_dist = corner.get('apexDistance', 0)
                apex_speed = corner.get('apexSpeed', 0)
                entry_speed = corner.get('entrySpeed', 0)
                exit_speed = corner.get('exitSpeed', 0)
                speed_drop = entry_speed - apex_speed
                
                print(f"  Corner {i:2d}: Distance {apex_dist:7.1f}m, Speed {apex_speed:5.1f} km/h, Drop {speed_drop:4.1f} km/h")
            
            # Focus on corners near track end (last 100m)
            max_dist = telemetry_resampled['Distance'].max()
            end_corners = [c for c in corner_metrics if c.get('apexDistance', 0) >= max_dist - 100]
            
            print(f"\nCorners in last 100m of track ({max_dist - 100:.1f}m - {max_dist:.1f}m):")
            print(f"  Found {len(end_corners)} corners")
            for corner in end_corners:
                apex_dist = corner.get('apexDistance', 0)
                apex_speed = corner.get('apexSpeed', 0)
                entry_speed = corner.get('entrySpeed', 0)
                exit_speed = corner.get('exitSpeed', 0)
                speed_drop = entry_speed - apex_speed
                distance_from_end = max_dist - apex_dist
                
                print(f"    Distance {apex_dist:7.1f}m (from end: {distance_from_end:5.1f}m)")
                print(f"      Speed: Entry {entry_speed:5.1f}, Apex {apex_speed:5.1f}, Exit {exit_speed:5.1f}")
                print(f"      Drop: {speed_drop:4.1f} km/h")
            
            # Check distance spacing
            if len(corner_metrics) > 1:
                print(f"\nDistance spacing between corners:")
                distances = sorted([c.get('apexDistance', 0) for c in corner_metrics])
                for i in range(len(distances) - 1):
                    spacing = distances[i + 1] - distances[i]
                    print(f"  Corner {i+1} to {i+2}: {spacing:.1f}m")
                
                # Check spacing in last 100m
                end_distances = sorted([c.get('apexDistance', 0) for c in end_corners])
                if len(end_distances) > 1:
                    print(f"\nSpacing in last 100m:")
                    for i in range(len(end_distances) - 1):
                        spacing = end_distances[i + 1] - end_distances[i]
                        print(f"  {end_distances[i]:.1f}m to {end_distances[i+1]:.1f}m: {spacing:.1f}m")
        else:
            print("No corners detected!")
            
            # Analyze why no corners detected
            print("\nAnalyzing why no corners detected:")
            speed = telemetry_resampled["Speed"].values
            distance = telemetry_resampled["Distance"].values
            
            # Check for speed drops
            speed_drops = []
            for i in range(1, len(speed)):
                if speed[i-1] > speed[i]:
                    drop = speed[i-1] - speed[i]
                    if drop > 5.0:  # Significant drop
                        speed_drops.append({
                            'index': i,
                            'distance': distance[i],
                            'drop': drop,
                            'speed': speed[i]
                        })
            
            print(f"  Speed drops > 5 km/h: {len(speed_drops)}")
            if speed_drops:
                print(f"  Sample drops:")
                for drop in speed_drops[:10]:
                    print(f"    Distance {drop['distance']:7.1f}m: Drop {drop['drop']:4.1f} km/h, Speed {drop['speed']:5.1f} km/h")
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Analyze corner detection for Australia race."""
    # Analyze a few laps from VER and NOR
    laps_to_check = [
        (2025, "australia", "R", "VER", 8),
        (2025, "australia", "R", "VER", 10),
        (2025, "australia", "R", "NOR", 8),
        (2025, "australia", "R", "NOR", 13),
    ]
    
    for year, round_slug, session_code, driver_code, lap_number in laps_to_check:
        try:
            analyze_lap_corner_detection(year, round_slug, session_code, driver_code, lap_number)
            print("\n" + "=" * 80 + "\n")
        except Exception as e:
            print(f"Error analyzing {driver_code} lap {lap_number}: {e}")
            print("\n" + "=" * 80 + "\n")

if __name__ == "__main__":
    main()

