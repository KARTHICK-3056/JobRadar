// Polite HTTP client: robots.txt compliance, honest User-Agent, per-domain delay,
// response caching and retries with exponential backoff. Every scraper goes through this.
import { config } from "./config.js";
import { getDb } from "./db.js";
import { log } from "./logger.js";
import { isAllowed, parseRobots } from "./robots.js";

const lastHit = new Map(); // host -> timestamp of last request
const hostQueues = new Map(); // host -> promise chain (serialises requests per host)
const robotsCache = new Map(); // origin -> {rules, fetchedAt}
const ROBOTS_TTL = 6 * 60 * 60 * 1000;

export class RobotsDisallowedError extends Error {
  constructor(url) {
    super(`robots.txt disallows ${url}`);
    this.code = "ROBOTS_DISALLOWED";
  }
}
export class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status} for ${url}`);
    this.status = status;
    this.code = "HTTP_" + status;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function withHostLock(host, fn) {
  const prev = hostQueues.get(host) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(async () => {
    const wait = (lastHit.get(host) ?? 0) + config.perDomainDelayMs - Date.now();
    if (wait > 0) await sleep(wait);
    try {
      return await fn();
    } finally {
      lastHit.set(host, Date.now());
    }
  });
  hostQueues.set(host, next.catch(() => {}));
  return next;
}

async function rawFetch(url, { accept, method = "GET", body, headers = {}, timeoutMs = config.requestTimeoutMs } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method,
      body,
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": config.userAgent, Accept: accept ?? "*/*", ...headers },
    });
  } finally {
    clearTimeout(t);
  }
}

async function getRobots(origin) {
  const hit = robotsCache.get(origin);
  if (hit && Date.now() - hit.fetchedAt < ROBOTS_TTL) return hit.rules;
  let rules = null; // null = no robots file -> everything allowed
  try {
    const host = new URL(origin).host;
    const res = await withHostLock(host, () => rawFetch(origin + "/robots.txt", { accept: "text/plain" }));
    const type = res.headers.get("content-type") ?? "";
    if (res.status >= 200 && res.status < 300 && !type.includes("html")) {
      rules = parseRobots(await res.text());
    } else if (res.status === 401 || res.status === 403) {
      // RFC 9309: 4xx means "no restrictions"; we treat it as allowed but log it.
      rules = null;
    }
  } catch (err) {
    log.warn("robots.fetch_failed", { origin, err: err.message });
    rules = null;
  }
  robotsCache.set(origin, { rules, fetchedAt: Date.now() });
  return rules;
}

/** Throws RobotsDisallowedError when our UA may not fetch this URL. */
export async function assertRobotsAllowed(url) {
  const u = new URL(url);
  const rules = await getRobots(u.origin);
  if (rules && !isAllowed(rules, config.userAgent, u.pathname + u.search)) throw new RobotsDisallowedError(url);
}

/**
 * Fetch a URL politely. Returns the body as text (or parsed JSON when json=true).
 * Retries 429/5xx/network errors with exponential backoff. Caches 2xx bodies in SQLite.
 */
export async function politeFetch(
  url,
  { json = false, accept, cacheTtlMs = config.httpCacheTtlMs, method = "GET", body, headers, retries = config.requestRetries, timeoutMs = config.requestTimeoutMs } = {},
) {
  await assertRobotsAllowed(url);
  const db = getDb();
  if (method === "GET" && cacheTtlMs > 0) {
    const row = db.prepare("SELECT body, fetched_at FROM http_cache WHERE url = ?").get(url);
    if (row && Date.now() - row.fetched_at < cacheTtlMs) return json ? JSON.parse(row.body) : row.body;
  }
  const host = new URL(url).host;
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      const res = await withHostLock(host, () =>
        rawFetch(url, { accept: accept ?? (json ? "application/json" : "*/*"), method, body, headers, timeoutMs }),
      );
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get("retry-after"));
        lastErr = new HttpError(res.status, url);
        if (attempt < retries) {
          await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 30000) : 1000 * 2 ** attempt);
          attempt++;
          continue;
        }
        throw lastErr;
      }
      if (!res.ok) throw new HttpError(res.status, url);
      const text = await res.text();
      if (method === "GET" && cacheTtlMs > 0) {
        db.prepare("INSERT OR REPLACE INTO http_cache(url, status, body, fetched_at) VALUES (?,?,?,?)").run(url, res.status, text, Date.now());
      }
      return json ? JSON.parse(text) : text;
    } catch (err) {
      if (err instanceof HttpError && err.status < 500 && err.status !== 429) throw err;
      if (err instanceof SyntaxError) throw err;
      lastErr = err;
      if (attempt >= retries) break;
      await sleep(1000 * 2 ** attempt);
      attempt++;
    }
  }
  throw lastErr;
}

export function pruneHttpCache(maxAgeMs = 24 * 60 * 60 * 1000) {
  getDb().prepare("DELETE FROM http_cache WHERE fetched_at < ?").run(Date.now() - maxAgeMs);
}
