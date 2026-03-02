/**
 * Remote data source: Vercel fetches session data from your own server (e.g. jason-server over Tailscale Funnel).
 * Set REMOTE_DATA_URL to the base URL of the data server (e.g. https://f1-data.xxx.ts.net or your Cloudflare Tunnel URL).
 */

export function isRemoteDataEnabled(): boolean {
  const url = process.env.REMOTE_DATA_URL
  return typeof url === 'string' && url.length > 0
}

export function getRemoteDataUrl(): string {
  const url = process.env.REMOTE_DATA_URL
  if (!url || typeof url !== 'string') {
    throw new Error('REMOTE_DATA_URL is not set.')
  }
  return url.replace(/\/$/, '') // strip trailing slash
}

const REMOTE_FETCH_TIMEOUT_MS = 60000

export async function fetchFromRemote<T>(path: string): Promise<T> {
  const base = getRemoteDataUrl()
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REMOTE_FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeout)
    if (!res.ok) {
      throw new Error(`Remote fetch failed: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<T>
  } catch (e) {
    clearTimeout(timeout)
    if (e instanceof Error) throw e
    throw new Error(String(e))
  }
}
