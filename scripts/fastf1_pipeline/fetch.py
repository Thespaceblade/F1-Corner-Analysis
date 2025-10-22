from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, Optional

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


def fetch_session(identifier: SessionIdentifier, cache_dir: Path) -> FetchResult:
    """
    Placeholder for future FastF1 session fetching.

    Args:
        identifier: Year/round/session selection.
        cache_dir: Where raw FastF1 caches should live.

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

    try:
        fastf1.Cache.enable_cache(str(cache_dir))
        session = fastf1.get_session(identifier.year, identifier.round_slug, identifier.session_code)
        session.load(laps=True, telemetry=False, weather=False)
        return FetchResult(
            status="ok",
            identifier=identifier,
            session=session,
            message="OK",
        )
    except Exception as exc:  # pragma: no cover - defensive logging
        return FetchResult(
            status="error",
            identifier=identifier,
            message=f"{exc.__class__.__name__}: {exc}",
        )
