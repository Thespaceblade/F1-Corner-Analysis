#!/usr/bin/env python3
"""
Check if fetch processes are running and provide status.

Usage:
  python scripts/data_fetching/check_running_fetches.py
"""

import subprocess
import sys
from pathlib import Path


def check_running_processes():
    """Check for running bulk fetch processes."""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "bulk_fetch_fastf1_data"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            pids = result.stdout.strip().split('\n')
            pids = [p for p in pids if p]
            
            if pids:
                print(f"Found {len(pids)} running fetch process(es):")
                for pid in pids:
                    try:
                        # Get process info
                        ps_result = subprocess.run(
                            ["ps", "-p", pid, "-o", "pid,etime,command"],
                            capture_output=True,
                            text=True
                        )
                        if ps_result.returncode == 0:
                            lines = ps_result.stdout.strip().split('\n')
                            if len(lines) > 1:
                                print(f"  PID {lines[1]}")
                    except Exception:
                        pass
                return True
            else:
                print("No fetch processes running.")
                return False
        else:
            print("No fetch processes running.")
            return False
    except Exception as e:
        print(f"Error checking processes: {e}")
        return False


def main():
    is_running = check_running_processes()
    sys.exit(0 if is_running else 1)


if __name__ == "__main__":
    main()


