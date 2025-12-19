from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, Optional

# Suppress FastF1 verbose logging by default
# Users can enable it by setting logging level if needed
logging.getLogger('fastf1').setLevel(logging.WARNING)
logging.getLogger('fastf1.core').setLevel(logging.WARNING)
logging.getLogger('fastf1.req').setLevel(logging.WARNING)
logging.getLogger('fastf1.api').setLevel(logging.WARNING)

try:
    import fastf1  # type: ignore
except ImportError:  # pragma: no cover - library not installed yet
    fastf1 = None  # type: ignore


@dataclass(slots=True)
class SessionIdentifier:
    year: int
    round_slug: str
    session_code: str  # e.g. 'FP1', 'Q', 'R'

@dataclass(slots=True)
class FetchResult:
    status: Literal["ok", "fastf1_not_installed", "error"]
    identifier: SessionIdentifier
    session: Optional[Any] = None
    message: Optional[str] = None


def fetch_session(identifier: SessionIdentifier, cache_dir: Path, round_number: int | None = None) -> FetchResult:
    """
    Fetch FastF1 session data.

    Args:
        identifier: Year/round/session selection.
        cache_dir: Where raw FastF1 caches should live.
        round_number: Optional round number to try if round_slug fails.

    Returns:
        FetchResult describing the outcome.
    """
    cache_dir.mkdir(parents=True, exist_ok=True)

    if fastf1 is None:
        return FetchResult(
            status="fastf1_not_installed",
            identifier=identifier,
            message="Install fastf1 (`pip install fastf1`) to enable telemetry downloads.",
        )

    # Try with round_slug first
    try:
        fastf1.Cache.enable_cache(str(cache_dir))
        session = fastf1.get_session(identifier.year, identifier.round_slug, identifier.session_code)
        # Enable telemetry for corner analysis
        session.load(laps=True, telemetry=True, weather=False)
        
        # Verify that the session actually loaded by checking if we can access laps
        # This catches cases where load() doesn't raise an exception but data isn't available
        try:
            _ = session.laps
            # If we can access laps without error, the session loaded successfully
        except Exception as load_check_exc:
            # If round_number is provided and we got a "not loaded" error, try with round number
            if round_number is not None:
                return _try_with_round_number(identifier, cache_dir, round_number, str(load_check_exc))
            return FetchResult(
                status="error",
                identifier=identifier,
                message=f"Session.load() completed but data not accessible: {load_check_exc.__class__.__name__}: {load_check_exc}",
            )
        
        return FetchResult(
            status="ok",
            identifier=identifier,
            session=session,
            message="OK",
        )
    except Exception as exc:
        # If round_number is provided, try using round number instead of slug
        if round_number is not None:
            return _try_with_round_number(identifier, cache_dir, round_number, str(exc))
        return FetchResult(
            status="error",
            identifier=identifier,
            message=f"{exc.__class__.__name__}: {exc}",
        )


def _try_with_round_number(
    identifier: SessionIdentifier, 
    cache_dir: Path, 
    round_number: int,
    original_error: str
) -> FetchResult:
    """Try fetching session using round number instead of slug."""
    try:
        fastf1.Cache.enable_cache(str(cache_dir))
        session = fastf1.get_session(identifier.year, round_number, identifier.session_code)
        session.load(laps=True, telemetry=True, weather=False)
        
        # Verify that the session actually loaded
        try:
            _ = session.laps
        except Exception as load_check_exc:
            return FetchResult(
                status="error",
                identifier=identifier,
                message=f"Tried round_slug and round_number ({round_number}), but data not accessible: {load_check_exc.__class__.__name__}: {load_check_exc}",
            )
        
        return FetchResult(
            status="ok",
            identifier=identifier,
            session=session,
            message="OK",
        )
    except Exception as exc:
        return FetchResult(
            status="error",
            identifier=identifier,
            message=f"Tried round_slug (failed: {original_error}) and round_number {round_number} (failed: {exc.__class__.__name__}: {exc})",
        )
