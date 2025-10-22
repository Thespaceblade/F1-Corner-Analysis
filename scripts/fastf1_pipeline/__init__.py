"""
FastF1 data ingestion pipeline.

This package will eventually expose helpers that download telemetry from the
`fastf1` library, normalize it, and write JSON artifacts consumed by the UI.

Current scaffold provides typed entry points so future work can plug in
incrementally without changing the public contract.
"""

from .config import PipelineConfig  # noqa: F401
from .fetch import FetchResult, SessionIdentifier, fetch_session  # noqa: F401
from .transforms import build_session_payload  # noqa: F401
