# Run data on your machine and point Vercel at it

You can keep session data on **your machine** (this Mac or jason-server) and have the **Vercel** website fetch it. No Neon or DB needed on Vercel. All of this is coded and run from your repo; you don’t need to touch jason-server until you want to move the data server there.

---

## Run the data server from this Mac (when jason-server is down)

You can be the “data server” from the Mac you’re coding on:

1. **This repo** already has the code. Make sure `public/data/sessions/` (and `public/data/calendar2025.json`, `public/data/tracks.json` if you use them) are present.
2. **Don’t set** `REMOTE_DATA_URL` or `DATA_SOURCE` when running locally (the app will read from files).
3. **Start the app** from the project root:
   ```bash
   npm run build && npm run start
   ```
   It runs on port 3000 and serves `/api/sessions/index` and `/api/sessions/:year/:round/:session` from the local files.
4. **Expose this Mac to the internet** so Vercel can reach it:
   - **Tailscale Funnel** (on this Mac): run `tailscale funnel 3000`. Tailscale will show a public URL (e.g. `https://jasons-macbook-pro.xxx.ts.net`). Use that as `REMOTE_DATA_URL` in Vercel (no trailing slash).
   - Or use **ngrok** / **Cloudflare Tunnel** from this Mac pointing at port 3000, and use that URL as `REMOTE_DATA_URL`.
5. **Vercel**: In the project, set `REMOTE_DATA_URL` to that public URL and redeploy. The live site will then load session data from this Mac.

When jason-server is back, you can move the same repo + data there and switch `REMOTE_DATA_URL` to jason-server’s Funnel/Tunnel URL.

---

## Flow (generic)

1. **jason-server**: Clone this repo, put `public/data/sessions/` (and optional `public/data/calendar2025.json`, `public/data/tracks.json`) on it. Run the Next.js app in “data server” mode (same app, just serving the API from local files).
2. **Expose jason-server to the internet**: Use **Tailscale Funnel** or **Cloudflare Tunnel** so Vercel (and browsers) can reach it via a public URL.
3. **Vercel**: Set `REMOTE_DATA_URL` to that public URL. The Vercel app will proxy `/api/sessions/*` to your server.

---

## 1. On jason-server (Windows)

### Option A: Run the same Next.js app (recommended)

- Install Node.js (LTS).
- Clone the repo and copy your session data into `public/data/sessions/` (and calendars/tracks if you use them).
- Do **not** set `REMOTE_DATA_URL` or `DATA_SOURCE` here (this machine serves from files).
- From the project root:
  - `npm install`
  - `npm run build`
  - `npm run start` (or run with `pm2` / NSSM so it survives reboots).
- App runs on port 3000. It will serve:
  - `GET /api/sessions/index`
  - `GET /api/sessions/:year/:round/:session`

So the “data server” is just this app running on jason-server with the JSON files present.

### Option B: Simple static file server

If you prefer not to run Next.js on the server, you could run a tiny Express (or similar) server that serves `public/data/sessions/**/session.json` and implements the same index + session JSON shape. The Vercel app expects the same API contract; Option A avoids reimplementing that.

---

## 2. Expose jason-server to the internet

Vercel runs in the cloud and cannot use Tailscale IPs. You must expose the app on jason-server with a **public URL**.

### Option A: Tailscale Funnel (easiest if you use Tailscale)

On **jason-server** (with Tailscale installed):

```bash
# One-time: enable Funnel for port 3000 (requires Tailscale auth)
tailscale funnel 3000
```

Tailscale will give you a public URL like `https://jason-server.your-tailnet-name.ts.net`.  
Use that as `REMOTE_DATA_URL` (no path), e.g.:

`REMOTE_DATA_URL=https://jason-server.your-tailnet-name.ts.net`

- Anyone can hit that URL (it’s public). Restrict who can log into jason-server / Tailscale as needed.
- Funnel terminates TLS; no need to configure HTTPS yourself.

### Option B: Cloudflare Tunnel

- Install `cloudflared` on jason-server and log in to Cloudflare.
- Create a tunnel that forwards to `http://localhost:3000`.
- Attach a public hostname (e.g. `f1-data.yourdomain.com`).
- Use that URL as `REMOTE_DATA_URL`, e.g. `REMOTE_DATA_URL=https://f1-data.yourdomain.com`.

---

## 3. Vercel

In the Vercel project:

1. **Environment variables**
   - `REMOTE_DATA_URL` = the public URL from step 2 (no trailing slash), e.g.  
     `https://jason-server.your-tailnet-name.ts.net` or `https://f1-data.yourdomain.com`
2. Do **not** set `DATA_SOURCE` or `DATABASE_URL` if you’re only using the remote server.
3. Redeploy.

The Vercel site will call `REMOTE_DATA_URL/api/sessions/index` and `REMOTE_DATA_URL/api/sessions/:year/:round/:session` and return that JSON to the client. Session data is stored and served only from jason-server; Vercel just proxies.

---

## 4. Summary

| Where        | Role |
|-------------|------|
| **jason-server** | Holds `public/data/sessions/`, runs Next.js (or compatible API) on port 3000, exposed via Funnel or Cloudflare. |
| **Vercel**       | Hosts the UI and API routes; when `REMOTE_DATA_URL` is set, those routes fetch from jason-server and return the response. |

You can SSH into jason-server to update the repo or copy new session files; restart the Node process after updates. No database or storage limit on your side beyond the disk on jason-server.
