# Scripts Directory

This directory contains all Python scripts, test files, and utilities for the F1 Corner Analysis project.

## Directory Structure

```
scripts/
├── README.md                    # This file
│
├── fastf1_pipeline/            # Core data pipeline
│   ├── __init__.py
│   ├── config.py               # Pipeline configuration
│   ├── fetch.py                # FastF1 data fetching
│   ├── transforms.py           # Data transformation
│   └── corners.py              # Corner detection and analysis
│
├── data_fetching/              # Data fetching scripts
│   ├── fetch_fastf1_data.py    # Fetch single session
│   └── bulk_fetch_fastf1_data.py  # Bulk fetch multiple sessions
│
├── corner_analysis/            # Corner analysis scripts
│   ├── analyze_corner_distances.py
│   ├── analyze_track_corners.py
│   ├── batch_analyze_tracks.py
│   └── update_tracks_json.py
│
├── corner_editing/             # Corner editing scripts
│   ├── edit_corner_coordinates.py  # Interactive corner editor
│   ├── estimate_corner_positions.py
│   └── populate_all_tracks.py  # Orchestrate full workflow
│
├── testing/                    # Test and debug scripts
│   ├── comprehensive_test_suite.py
│   ├── debug_corner_detection.py
│   ├── debug_corner_matching.py
│   ├── test_corner_data_quality.py
│   ├── test_corner_matching_after_fix.py
│   └── test_event_markers.py
│
├── validation/                 # Validation scripts
│   ├── validate_corner_coordinates.js
│   └── validate_corner_coordinates.ts
│
├── docs/                       # Script documentation
│   ├── README-corner-editor.md
│   ├── QUICK_START.md
│   ├── CORNER_EDITOR_VIABILITY.md
│   ├── POPULATE_ALL_TRACKS_GUIDE.md
│   └── PROGRESS_INDICATORS.md
│
├── requirements/               # Requirements files
│   └── requirements-corner-editor.txt
│
├── legacy/                     # Legacy scripts
│   ├── f1_corners.py
│   └── f1_test.py
│
└── sql/                        # SQL scripts
    └── schema.sql
```

## Quick Start

### Fetching Data

**Single Session:**
```bash
python scripts/data_fetching/fetch_fastf1_data.py --year 2025 --round bahrain --session Q
```

**Bulk Fetch:**
```bash
python scripts/data_fetching/bulk_fetch_fastf1_data.py --year 2025 --sessions Q R
```

### Corner Analysis

**Analyze Single Track:**
```bash
python scripts/corner_analysis/analyze_track_corners.py --track monaco --year 2025 --session Q
```

**Batch Analyze:**
```bash
python scripts/corner_analysis/batch_analyze_tracks.py --year 2025 --session Q --output-dir output/corners
```

### Corner Editing

**Interactive Editor:**
```bash
python scripts/corner_editing/edit_corner_coordinates.py
```

**Populate All Tracks:**
```bash
python scripts/corner_editing/populate_all_tracks.py --year 2025 --sessions Q R
```

## Script Categories

### Data Fetching (`data_fetching/`)

Scripts for fetching F1 session data from FastF1:
- **fetch_fastf1_data.py** - Fetch data for a single session
- **bulk_fetch_fastf1_data.py** - Fetch data for multiple sessions/tracks

### Corner Analysis (`corner_analysis/`)

Scripts for analyzing corners and generating corner definitions:
- **analyze_track_corners.py** - Analyze corners for a single track
- **batch_analyze_tracks.py** - Analyze corners for multiple tracks
- **analyze_corner_distances.py** - Analyze corner distances
- **update_tracks_json.py** - Update tracks.json with corner definitions

### Corner Editing (`corner_editing/`)

Scripts for editing and managing corner coordinates:
- **edit_corner_coordinates.py** - Interactive GUI for editing corner coordinates
- **estimate_corner_positions.py** - Estimate corner positions
- **populate_all_tracks.py** - Orchestrate complete workflow (fetch, analyze, update)

### Testing (`testing/`)

Test and debug scripts:
- **comprehensive_test_suite.py** - Comprehensive test suite
- **debug_corner_detection.py** - Debug corner detection
- **debug_corner_matching.py** - Debug corner matching
- **test_corner_data_quality.py** - Test corner data quality
- **test_corner_matching_after_fix.py** - Test corner matching after fixes
- **test_event_markers.py** - Test event markers

### Validation (`validation/`)

Validation scripts for corner coordinates:
- **validate_corner_coordinates.js** - JavaScript validation
- **validate_corner_coordinates.ts** - TypeScript validation

## Core Pipeline (`fastf1_pipeline/`)

The core pipeline module provides:
- **config.py** - Pipeline configuration
- **fetch.py** - FastF1 data fetching
- **transforms.py** - Data transformation
- **corners.py** - Corner detection and analysis

All scripts import from this module using:
```python
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastf1_pipeline import ...
```

## Documentation

See the [`docs/`](./docs/) directory for detailed documentation:
- **[README-corner-editor.md](./docs/README-corner-editor.md)** - Corner editor documentation
- **[QUICK_START.md](./docs/QUICK_START.md)** - Quick start guide
- **[POPULATE_ALL_TRACKS_GUIDE.md](./docs/POPULATE_ALL_TRACKS_GUIDE.md)** - Guide for populating all tracks
- **[PROGRESS_INDICATORS.md](./docs/PROGRESS_INDICATORS.md)** - Progress indicators guide

## Requirements

Install Python dependencies:
```bash
pip install fastf1 pandas numpy
```

For corner editor (optional):
```bash
pip install -r scripts/requirements/requirements-corner-editor.txt
```

## Usage Examples

### Complete Workflow

Populate all tracks with session data and corner definitions:
```bash
python scripts/corner_editing/populate_all_tracks.py --year 2025 --sessions Q R
```

This script orchestrates:
1. Fetching session data from FastF1
2. Analyzing tracks to generate corner definitions
3. Updating tracks.json with corner definitions

### Fetching Specific Tracks

Fetch data for specific tracks only:
```bash
python scripts/data_fetching/bulk_fetch_fastf1_data.py --year 2025 --sessions Q --tracks monaco bahrain
```

### Analyzing Specific Tracks

Analyze specific tracks:
```bash
python scripts/corner_analysis/batch_analyze_tracks.py --year 2025 --session Q --tracks monaco bahrain
```

## Notes

- All scripts should be run from the project root directory
- Script paths in commands reflect the new organized structure
- The `fastf1_pipeline` module is imported by adding the scripts directory to the Python path
- See individual script documentation for detailed usage instructions

## Legacy Scripts

Legacy scripts are kept in the [`legacy/`](./legacy/) directory for reference but are not actively maintained.

---

**Last Updated:** 2025-01-XX

