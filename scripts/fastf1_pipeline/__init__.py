"""
FastF1 data ingestion pipeline.

This package will eventually expose helpers that download telemetry from the
`fastf1` library, normalize it, and write JSON artifacts consumed by the UI.

Current scaffold provides typed entry points so future work can plug in
incrementally without changing the public contract.
"""

from .config import PipelineConfig  # noqa: F401
from .corners import (  # noqa: F401
    calculate_corner_metrics,
    detect_corners,
    match_corners_to_track,
    resample_to_common_distance,
)
from .fetch import FetchResult, SessionIdentifier, fetch_session  # noqa: F401
from .transforms import build_session_payload  # noqa: F401
