# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 13 (App Router) web app: **F1 Corner Analysis** (`f1-corner-analysis-ui`). It renders interactive F1 corner telemetry analysis. There is no separate backend — API routes live inside the Next.js app (`app/api/*`).

### Running the app (the only service)

- Dev server: `npm run dev` (serves UI + API routes on `http://localhost:3000`).
- Production-style: `npm run build` then `npm run start`.
- The app runs fully standalone: session telemetry is pre-generated JSON committed under `public/data/sessions/` and read directly in local dev, so **no database, API key, or Python is required** to run or test the core product.
- Data-source precedence (see `app/api/sessions/index/route.ts`): `REMOTE_DATA_URL` → `DATABASE_URL`/`SUPABASE_DB_URL` (with `DATA_SOURCE=database`) → local files. On Vercel (`VERCEL=1`) local-file mode is disabled; local dev does not have this restriction.

### Non-obvious caveats

- The dev server logs `Watchpack Error ... EACCES: permission denied, watch '/etc/credstore'` (and `/root/.ssh`) on startup. These are harmless — Next's file watcher probes system dirs it can't read; the app works fine.
- `npm run lint` is **not usable out of the box**: the repo ships no ESLint config, so `next lint` drops into an interactive "How would you like to configure ESLint?" prompt and does nothing non-interactively. Type checking still runs as part of `npm run build`.
- Optional integrations are opt-in via env vars and default to off:
  - Chatbot (`app/api/chat`) needs `GEMINI_API_KEY` (Google Gemini). `classifyQuery` throws without it, so only the chatbot feature fails; everything else works.
  - Database path needs `DATABASE_URL` (or `SUPABASE_DB_URL`) + `DATA_SOURCE=database`. Helpers: `npm run db:verify`, `npm run import:sessions`.
- The Python pipeline under `scripts/` (FastF1) is an **offline authoring tool** used to regenerate the JSON in `public/data/`. It is not needed at runtime; don't set it up just to run/test the app.
