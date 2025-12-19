# Scripts Directory Organization Plan

## Current Issues

The scripts directory has many files at the root level:
- Data fetching scripts
- Corner analysis scripts
- Corner editing scripts
- Debug/test scripts
- Validation scripts
- Documentation files
- Requirements files

## Proposed Organization

```
scripts/
├── README.md                    # Main scripts documentation
│
├── fastf1_pipeline/            # Core pipeline (keep as is)
│   ├── __init__.py
│   ├── config.py
│   ├── fetch.py
│   ├── transforms.py
│   └── corners.py
│
├── data_fetching/              # Data fetching scripts
│   ├── fetch_fastf1_data.py
│   └── bulk_fetch_fastf1_data.py
│
├── corner_analysis/            # Corner analysis scripts
│   ├── analyze_corner_distances.py
│   ├── analyze_track_corners.py
│   ├── batch_analyze_tracks.py
│   └── update_tracks_json.py
│
├── corner_editing/             # Corner editing scripts
│   ├── edit_corner_coordinates.py
│   ├── estimate_corner_positions.py
│   └── populate_all_tracks.py
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
├── docs/                       # Script documentation (already exists)
│   ├── README-corner-editor.md
│   ├── QUICK_START.md
│   ├── CORNER_EDITOR_VIABILITY.md
│   ├── POPULATE_ALL_TRACKS_GUIDE.md
│   └── PROGRESS_INDICATORS.md
│
├── requirements/               # Requirements files
│   └── requirements-corner-editor.txt
│
├── legacy/                     # Legacy scripts (keep as is)
│   ├── f1_corners.py
│   └── f1_test.py
│
└── sql/                        # SQL scripts (keep as is)
    └── schema.sql
```

## Benefits

1. **Clear Organization** - Related scripts grouped together
2. **Easy Navigation** - Find scripts by purpose
3. **Better Maintainability** - Easier to update and maintain
4. **Scalability** - Easy to add new scripts in the right place
5. **Documentation** - All docs in one place

## Migration Steps

1. Create new directories
2. Move scripts to appropriate folders
3. Update imports in scripts (if needed)
4. Update documentation references
5. Update README.md with new structure






