#!/usr/bin/env python3
"""
Regenerate all Australia sessions with corner data for all drivers.

This script regenerates all available sessions for the Australia track,
ensuring corner data is populated using the track corner definitions from tracks.json.

The corner data will be generated for ALL valid laps from ALL drivers in each session.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

# Sessions to regenerate (in order of priority)
SESSIONS = ['Q', 'R', 'FP1', 'FP2', 'FP3']
YEAR = 2025
ROUND = 'australia'

def check_corner_data(session_file: Path) -> dict:
    """Check corner data in a session file."""
    if not session_file.exists():
        return {'exists': False}
    
    try:
        with open(session_file, 'r') as f:
            data = json.load(f)
        
        corners = data.get('corners', {})
        total_corners = sum(len(corner_list) for corner_list in corners.values())
        drivers_with_corners = len([d for d, c in corners.items() if c])
        
        # Get unique corner numbers
        corner_numbers = set()
        for driver_corners in corners.values():
            for corner in driver_corners:
                corner_num = corner.get('cornerNumber')
                if corner_num:
                    corner_numbers.add(corner_num)
        
        return {
            'exists': True,
            'status': data.get('meta', {}).get('status', 'unknown'),
            'drivers_with_corners': drivers_with_corners,
            'total_corner_records': total_corners,
            'unique_corners': sorted(corner_numbers),
            'total_drivers': len(data.get('drivers', {})),
        }
    except Exception as e:
        return {'exists': True, 'error': str(e)}

def main():
    project_root = Path(__file__).parent.parent
    script_path = project_root / 'scripts' / 'fetch_fastf1_data.py'
    sessions_dir = project_root / 'public' / 'data' / 'sessions' / str(YEAR) / ROUND
    
    print(f"=" * 70)
    print(f"Regenerating sessions for {ROUND.upper()} ({YEAR})")
    print(f"Sessions to regenerate: {', '.join(SESSIONS)}")
    print(f"=" * 70)
    print()
    
    successful = []
    failed = []
    skipped = []
    
    for session in SESSIONS:
        print(f"Processing {session}...")
        session_file = sessions_dir / session / 'session.json'
        
        # Check current state
        before = check_corner_data(session_file)
        if before.get('exists'):
            print(f"  Current state: {before.get('drivers_with_corners', 0)} drivers with corners")
        
        try:
            # Run the fetch script without --drivers to include all drivers
            # This processes ALL valid laps from ALL drivers
            start_time = time.time()
            result = subprocess.run(
                [
                    sys.executable,
                    str(script_path),
                    '--year', str(YEAR),
                    '--round', ROUND,
                    '--session', session,
                ],
                cwd=project_root,
                capture_output=True,
                text=True,
                check=False,
            )
            elapsed = time.time() - start_time
            
            if result.returncode == 0:
                # Check new state
                after = check_corner_data(session_file)
                if after.get('exists') and after.get('status') == 'ok':
                    print(f"  ✓ Successfully regenerated {session} ({elapsed:.1f}s)")
                    print(f"    Drivers with corners: {after.get('drivers_with_corners', 0)}/{after.get('total_drivers', 0)}")
                    print(f"    Total corner records: {after.get('total_corner_records', 0)}")
                    print(f"    Detected corners: {', '.join(map(str, after.get('unique_corners', [])))}")
                    if result.stdout:
                        output_line = result.stdout.strip().split('\n')[-1]
                        if output_line:
                            print(f"    {output_line}")
                    successful.append(session)
                else:
                    status = after.get('status', 'unknown')
                    if status == 'error':
                        print(f"  ⚠ {session} session unavailable (status: {status})")
                        skipped.append(session)
                    else:
                        print(f"  ✗ {session} completed but data invalid (status: {status})")
                        failed.append(session)
            else:
                error_msg = result.stderr.strip() or result.stdout.strip()
                # Check if it's a "session doesn't exist" error (which is expected for some sessions)
                if "does not exist" in error_msg or "Session type" in error_msg or "not available" in error_msg.lower():
                    print(f"  ⚠ {session} does not exist for this event (skipping)")
                    skipped.append(session)
                else:
                    print(f"  ✗ Failed to regenerate {session}: {error_msg[:100]}")
                    failed.append(session)
        except Exception as e:
            print(f"  ✗ Error processing {session}: {e}")
            failed.append(session)
        
        print()
    
    print("=" * 70)
    print("Summary:")
    print(f"  ✓ Successful: {len(successful)} - {', '.join(successful) if successful else 'none'}")
    if skipped:
        print(f"  ⚠ Skipped: {len(skipped)} - {', '.join(skipped)}")
    if failed:
        print(f"  ✗ Failed: {len(failed)} - {', '.join(failed)}")
    print("=" * 70)
    
    if successful:
        print()
        print("Note: Corner data has been regenerated for all valid laps from all drivers.")
        print("The corner matching uses the track corner definitions from tracks.json.")
    
    return 0 if not failed else 1

if __name__ == '__main__':
    sys.exit(main())

