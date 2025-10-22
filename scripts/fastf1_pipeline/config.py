from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


@dataclass(slots=True)
class PipelineConfig:
    """Holds configuration for FastF1 ingestion runs."""

    root: Path = Path(__file__).resolve().parents[2]
    output_dir: Path = field(default_factory=lambda: Path("public/data/sessions"))
    cache_dir: Path = field(default_factory=lambda: Path("cache/fastf1/raw"))
    enabled_sessions: Iterable[str] = ("P", "Q", "R")

    def resolve_output(self, year: int, round_slug: str, session_code: str) -> Path:
        return self.root / self.output_dir / str(year) / round_slug / session_code

    def resolve_cache(self, year: int, round_slug: str, session_code: str) -> Path:
        return self.root / self.cache_dir / str(year) / round_slug / session_code

    def write_manifest(self, target_dir: Path, payload: dict) -> None:
        target_dir.mkdir(parents=True, exist_ok=True)
        manifest_path = target_dir / "session.json"
        manifest_path.write_text(json.dumps(payload, indent=2))
