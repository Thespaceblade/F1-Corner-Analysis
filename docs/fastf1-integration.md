# FastF1 Integration Plan

## Goals

- Surface race-weekend telemetry (lap times, corner speeds, sector deltas) for any driver/track/session combination inside the Next.js UI.
- Keep the build system static-friendly: transformed telemetry should live as JSON assets that can be statically hosted or cached, while the UI falls back to API routes for incremental updates.
- Provide a repeatable ingestion workflow so new seasons or sessions can be imported without hand-editing files.

## High-Level Data Flow

1. **Ingest** – A Python pipeline built on the `fastf1` library downloads raw telemetry/metadata for a requested session.
2. **Transform** – Normalize to a compact JSON schema (`session.json`, `laps.json`, `corners.json`) that the UI understands and that aligns with `tracks.json`.
3. **Store** – Persist the transformed artifacts in `public/data/sessions/{year}/{round}/{session}/`.
4. **Distribute** – Expose the stored JSON through:
   - Static file imports (for pre-generated bundles).
   - App Router API endpoints (`/api/sessions/...`) for more dynamic queries or when we eventually add server-side caching.
5. **Consume** – Front-end data hooks fetch the JSON and hydrate client components such as the chart/track overlays.

## Pipeline Architecture

```
scripts/
  fastf1_pipeline/
    __init__.py
    config.py           # centralizes storage paths & defaults
    transforms.py       # shape raw fastf1 data into UI-ready JSON
    fetch.py            # wraps fastf1 session fetching
  fetch_fastf1_data.py  # CLI entry point (python scripts/fetch_fastf1_data.py --year 2025 --round bahrain --session Q)

public/data/sessions/{year}/{round}/{session}/
  session.json          # headline session metadata (drivers, status, laps)
  laps.json             # per-driver lap traces (downsampled if needed)
  corners.json          # per-driver corner aggregates
```

Later we can add a lightweight SQLite/duckDB layer for ad-hoc analysis, but JSON keeps the UI simple today.

## Front-End Consumption

- `lib/sessionDataClient.ts` exposes helpers to load session JSON either through `fetch` (client) or direct file access (`import`) on the server.
- `app/api/sessions/[year]/[round]/[session]/route.ts` provides a canonical API surface that simply reads the generated files and returns them; it also gives us a hook for runtime caching or validation.
- Components (e.g., ChartPanel) will call the helper with `(year, trackId, sessionType, drivers[])` to receive normalized structures.

## Next Steps Checklist

1. Flesh out `fastf1_pipeline.fetch` to download telemetry and cache raw parquet files locally.
2. Implement `transforms.py` utilities that collapse telemetry down to corner-level stats used by the UI.
3. Decide on downsampling strategy for lap traces so bundle sizes stay manageable.
4. Update the front-end components to request the new API when users pick drivers/tracks.
5. Add automated jobs (GitHub Actions or manual scripts) to regenerate data when upstream telemetry updates.

This scaffold gives us the touchpoints needed to incrementally bring FastF1 data online without blocking current UI work.
