# Database options for F1 Corner Analysis

The app needs a **Postgres** database when session JSON files are not deployed (e.g. on Vercel). Here are practical options, including free and self-hosted.

---

## 1. Free cloud Postgres (best for Vercel)

### Neon or Supabase (recommended – already integrated)

- **Free tier**: 0.5 GB storage, 1 project, serverless Postgres.
- **Why it fits**: The app now uses a standard Postgres pool (`pg`) and works with Neon/Supabase/any Postgres connection string.
- **Steps**:
  1. Sign up at [neon.tech](https://neon.tech).
  2. Create a project and copy the connection string (e.g. `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`).
  3. In Vercel: **Settings → Environment Variables**:
     - `DATA_SOURCE` = `database`
    - `DATABASE_URL` = your Neon/Supabase connection string.
      - Optional alias supported: `SUPABASE_DB_URL` (if you prefer separate env naming).
  4. Run the schema once: open Neon’s SQL editor and paste `scripts/sql/schema.sql`, then run it.
  5. Populate data using your existing scripts (or a one-off script that reads your JSON and inserts into Neon).

**Limits**: 0.5 GB is enough for many sessions; if you outgrow it, you can export/trim or upgrade.

---

### Other free Postgres options

| Service   | Free tier        | Notes |
|----------|------------------|--------|
| **Supabase** | 500 MB, 2 projects | Postgres. Fully supported via `DATABASE_URL` (or `SUPABASE_DB_URL`). |
| **Railway**  | $5 free credit/month | Postgres add-on; good for small usage. |
| **Render**   | Free Postgres (sleeps) | DB sleeps after inactivity; first request can be slow. |
| **ElephantSQL** | 20 MB free | Very small; only for minimal data. |

The app is built for **Postgres + connection URL** (`pg` pool), so Neon and Supabase are both drop-in options.

---

## 2. Your PC server + Tailscale

You have:

- A PC server you can SSH into.
- Tailscale (so you can reach that server from your devices).

Important: **Vercel runs in Vercel’s cloud, not on your machine.** Serverless functions do not join your Tailscale network, so they **cannot** connect to a database that is only reachable via Tailscale (e.g. `100.x.x.x`).

So you have two different patterns:

### Option A: Database on your server, app on Vercel (not straightforward)

- If the DB is **only** on Tailscale: Vercel cannot reach it.
- To have Vercel use your server’s Postgres you’d have to expose Postgres to the internet (port forward or reverse proxy) and lock it down (strong password, firewall, maybe IP allowlist). Doable but more ops and security work; usually not worth it when free cloud Postgres exists.

### Option B: App and database both on your server (Tailscale-only) ✅

- Run **Postgres** on your PC server (Docker or native install).
- Run the **Next.js app** there too (e.g. `next build && next start` or in Docker).
- Don’t deploy the app on Vercel (or use Vercel only for a different branch).
- You (and anyone you give Tailscale access to) open the app via your server’s Tailscale IP (e.g. `http://100.x.x.x:3000`).
- **Pros**: Fully under your control, no cloud DB limits, traffic stays on Tailscale.
- **Cons**: You maintain the server and backups; not “public internet” unless you expose it.

Summary: **Tailscale is great for accessing your own deployment (app + DB on your server). It is not a way to let Vercel talk to a DB that only lives on Tailscale.**

---

## 3. Recommended path

- **For the Vercel deployment (public or shared)**: Use **Neon** free tier. Set `DATA_SOURCE=database` and `DATABASE_URL` in Vercel, run `scripts/sql/schema.sql` in Neon, then load your session data into Neon.
- **For a private, at-home setup**: Run Postgres + the app on your PC server and use Tailscale to reach it (Option B). You can use the same codebase and the same `DATABASE_URL` pointing to local Postgres.
