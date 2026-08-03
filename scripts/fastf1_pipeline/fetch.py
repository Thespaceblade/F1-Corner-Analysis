from __future__ import annotations

import logging
import re
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


# FastF1 fuzzy-matches some of our calendar slugs to the WRONG event
# (e.g. "great-britain" → Austrian GP). Prefer these explicit names.
_SAFE_EVENT_KEYS: dict[str, str] = {
    "great-britain": "British Grand Prix",
    "barcelona-catalunya": "Barcelona Grand Prix",
    "saudi-arabia": "Saudi Arabian Grand Prix",
    "united-states": "United States Grand Prix",
    "abu-dhabi": "Abu Dhabi Grand Prix",
    "las-vegas": "Las Vegas Grand Prix",
}

# Tokens that must appear in the resolved EventName/OfficialEventName.
_EVENT_MATCH_TOKENS: dict[str, tuple[str, ...]] = {
    "australia": ("australian", "melbourne"),
    "china": ("chinese", "shanghai"),
    "japan": ("japanese", "suzuka"),
    "bahrain": ("bahrain",),
    "saudi-arabia": ("saudi", "jeddah"),
    "miami": ("miami",),
    "canada": ("canadian", "montreal", "montréal"),
    "monaco": ("monaco",),
    "barcelona-catalunya": ("barcelona", "catalunya"),
    "austria": ("austrian", "spielberg"),
    "great-britain": ("british", "silverstone"),
    "belgium": ("belgian", "spa"),
    "hungary": ("hungarian", "budapest"),
    "netherlands": ("dutch", "zandvoort"),
    "italy": ("italian", "monza"),
    "madrid": ("madrid", "spanish"),
    "azerbaijan": ("azerbaijan", "baku"),
    "singapore": ("singapore",),
    "united-states": ("united states", "austin"),
    "mexico": ("mexico",),
    "brazil": ("paulo", "brazil"),
    "las-vegas": ("vegas",),
    "qatar": ("qatar", "lusail"),
    "abu-dhabi": ("abu dhabi", "yas"),
}


def _haystack_has_token(haystack: str, token: str) -> bool:
    escaped = re.escape(token.lower())
    return re.search(rf"(^|[^a-z0-9]){escaped}([^a-z0-9]|$)", haystack) is not None


def _session_matches_slug(session: Any, round_slug: str) -> bool:
    event = getattr(session, "event", None)
    event_name = str(getattr(event, "EventName", "") or "")
    official = str(getattr(event, "OfficialEventName", "") or "")
    location = str(getattr(event, "Location", "") or "")
    haystack = f"{event_name} {official} {location}".lower()
    if not haystack.strip():
        return True

    tokens = list(_EVENT_MATCH_TOKENS.get(round_slug, ()))
    tokens.append(round_slug.replace("-", " "))
    return any(_haystack_has_token(haystack, token) for token in tokens if len(token) >= 3)


def _candidate_keys(round_slug: str, round_number: int | None) -> list[Any]:
    """
    Ordered FastF1 get_session keys to try.

    Prefer round_number when available — it avoids FastF1's fuzzy name matcher,
    which silently maps some slugs (notably great-britain) to the wrong GP.
    """
    keys: list[Any] = []
    if round_number is not None:
        keys.append(round_number)
    safe = _SAFE_EVENT_KEYS.get(round_slug)
    if safe:
        keys.append(safe)
    keys.append(round_slug)
    # De-dupe while preserving order
    seen: set[Any] = set()
    ordered: list[Any] = []
    for key in keys:
        if key in seen:
            continue
        seen.add(key)
        ordered.append(key)
    return ordered


def _load_session(year: int, event_key: Any, session_code: str, cache_dir: Path) -> Any:
    fastf1.Cache.enable_cache(str(cache_dir))
    session = fastf1.get_session(year, event_key, session_code)
    # Laps required for analysis. Telemetry is optional via FASTF1_LOAD_TELEMETRY
    # (default on) — disable for faster results-only repairs.
    import os

    load_telemetry = os.environ.get("FASTF1_LOAD_TELEMETRY", "1") not in ("0", "false", "False")
    session.load(laps=True, telemetry=load_telemetry, weather=False)
    _ = session.laps  # force access to confirm load
    return session


def fetch_session(identifier: SessionIdentifier, cache_dir: Path, round_number: int | None = None) -> FetchResult:
    """
    Fetch FastF1 session data.

    Args:
        identifier: Year/round/session selection.
        cache_dir: Where raw FastF1 caches should live.
        round_number: Optional round number — preferred over round_slug when set.

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

    errors: list[str] = []
    for event_key in _candidate_keys(identifier.round_slug, round_number):
        try:
            session = _load_session(
                identifier.year,
                event_key,
                identifier.session_code,
                cache_dir,
            )
        except Exception as exc:
            errors.append(f"{event_key!r}: {exc.__class__.__name__}: {exc}")
            continue

        if not _session_matches_slug(session, identifier.round_slug):
            event = getattr(session, "event", None)
            resolved = getattr(event, "EventName", None) or "unknown"
            errors.append(
                f"{event_key!r}: resolved to '{resolved}' which does not match "
                f"round slug '{identifier.round_slug}'"
            )
            continue

        return FetchResult(
            status="ok",
            identifier=identifier,
            session=session,
            message=f"OK (via {event_key!r})",
        )

    return FetchResult(
        status="error",
        identifier=identifier,
        message="; ".join(errors) if errors else "No FastF1 event key candidates succeeded",
    )
