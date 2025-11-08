#!/usr/bin/env python3
"""
Batch analyze all tracks to generate corner definitions.

Usage:
    python scripts/batch_analyze_tracks.py --year 2025 --session Q --output-dir output/corners
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List


def get_available_tracks(year: int, session: str, data_dir: Path) -> List[str]:
    """Get list of tracks with available session data."""
    sessions_dir = data_dir / str(year)
    if not sessions_dir.exists():
        return []
    
    tracks = []
    for track_dir in sessions_dir.iterdir():
        if not track_dir.is_dir():
            continue
        session_file = track_dir / session / "session.json"
        if session_file.exists():
            # Check if session has corner data
            try:
                with open(session_file) as f:
                    data = json.load(f)
                corners = data.get("corners", {})
                if corners and data.get("meta", {}).get("status") == "ok":
                    tracks.append(track_dir.name)
            except Exception:
                pass
    
    return sorted(tracks)


def analyze_track(
    track: str, year: int, session: str, output_dir: Path, tolerance: float = 15.0
) -> Dict | None:
    """Analyze a single track and return corner definitions."""
    script_path = Path(__file__).parent / "analyze_track_corners.py"
    output_file = output_dir / f"{track}.json"
    
    try:
        result = subprocess.run(
            [
                sys.executable,
                str(script_path),
                "--track",
                track,
                "--year",
                str(year),
                "--session",
                session,
                "--output",
                str(output_file),
                "--tolerance",
                str(tolerance),
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        
        # Load and return the generated definitions
        if output_file.exists():
            with open(output_file) as f:
                return json.load(f)
        
        return None
    except subprocess.CalledProcessError as e:
        print(f"Error analyzing {track}: {e.stderr}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error processing {track}: {e}", file=sys.stderr)
        return None


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Batch analyze all tracks to generate corner definitions"
    )
    parser.add_argument("--year", type=int, required=True, help="Year (e.g., 2025)")
    parser.add_argument(
        "--session", type=str, required=True, help="Session code (e.g., Q, R)"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("output/corners"),
        help="Output directory for corner definitions (default: output/corners)",
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
    parser.add_argument(
        "--tracks",
        nargs="*",
        help="Specific tracks to analyze (default: all available)",
    )

    args = parser.parse_args()

    # Create output directory
    args.output_dir.mkdir(parents=True, exist_ok=True)

    # Get tracks to analyze
    if args.tracks:
        tracks = args.tracks
    else:
        tracks = get_available_tracks(args.year, args.session, args.data_dir)

    if not tracks:
        print("No tracks found with corner data", file=sys.stderr)
        return 1

    print(f"Analyzing {len(tracks)} tracks...", file=sys.stderr)
    print(f"Output directory: {args.output_dir}", file=sys.stderr)

    # Analyze each track
    results = {}
    successful = 0
    failed = 0

    for track in tracks:
        print(f"\nAnalyzing {track}...", file=sys.stderr)
        result = analyze_track(track, args.year, args.session, args.output_dir, args.tolerance)
        
        if result:
            results[track] = result
            successful += 1
            corners_count = len(result.get("corners", []))
            print(f"  ✓ {track}: {corners_count} corners detected", file=sys.stderr)
        else:
            failed += 1
            print(f"  ✗ {track}: Failed", file=sys.stderr)

    # Generate summary
    summary = {
        "year": args.year,
        "session": args.session,
        "totalTracks": len(tracks),
        "successful": successful,
        "failed": failed,
        "tracks": {},
    }

    for track, result in results.items():
        corners = result.get("corners", [])
        summary["tracks"][track] = {
            "cornerCount": len(corners),
            "distanceRange": result.get("summary", {}).get("distanceRange", {}),
        }

    # Save summary
    summary_file = args.output_dir / "summary.json"
    with open(summary_file, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"Summary:", file=sys.stderr)
    print(f"  Total tracks: {len(tracks)}", file=sys.stderr)
    print(f"  Successful: {successful}", file=sys.stderr)
    print(f"  Failed: {failed}", file=sys.stderr)
    print(f"  Summary saved to: {summary_file}", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())

