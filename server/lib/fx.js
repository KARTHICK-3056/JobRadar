// Live FX rates (USD base) from free APIs, cached 12h in SQLite with the last-known value as fallback.
import { config } from "../config.js";
import { getDb, nowIso } from "../db.js";
import { log } from "../logger.js";

const PROVIDERS = [
  {
    name: "open.er-api.com",
    url: "https://open.er-api.com/v6/latest/USD",
    pick: (j) => (j?.result === "success" ? j.rates : null),
  },
  {
    name: "frankfurter.app",
    url: "https://api.frankfurter.app/latest?from=USD",
    pick: (j) => (j?.rates ? { ...j.rates, USD: 1 } : null),
  },
];

let memo = null; // { rates, fetchedAt, provider, stale }
let inflight = null;

function loadStored() {
  const rows = getDb().prepare("SELECT quote, rate, provider, fetched_at FROM fx_rates WHERE base = 'USD'").all();
  if (!rows.length) return null;
  const rates = { USD: 1 };
  for (const r of rows) rates[r.quote] = r.rate;
  return { rates, fetchedAt: rows[0].fetched_at, provider: rows[0].provider };
}

async function refresh() {
  for (const p of PROVIDERS) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(p.url, { headers: { "User-Agent": config.userAgent, Accept: "application/json" }, signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rates = p.pick(await res.json());
      if (!rates?.INR) throw new Error("no INR rate in response");
      const db = getDb();
      const at = nowIso();
      const ins = db.prepare("INSERT OR REPLACE INTO fx_rates(base, quote, rate, provider, fetched_at) VALUES ('USD', ?, ?, ?, ?)");
      db.exec("BEGIN");
      for (const [q, r] of Object.entries(rates)) if (typeof r === "number" && r > 0) ins.run(q, r, p.name, at);
      db.exec("COMMIT");
      log.info("fx.refreshed", { provider: p.name, usd_inr: rates.INR });
      return { rates: { ...rates, USD: 1 }, fetchedAt: at, provider: p.name, stale: false };
    } catch (err) {
      log.warn("fx.provider_failed", { provider: p.name, err: err.message });
    }
  }
  return null;
}

/** Returns { rates, fetchedAt, provider, stale } or null when we have never fetched any rate. */
export async function getFx({ force = false } = {}) {
  const ttl = config.fxTtlHours * 3600 * 1000;
  if (!memo) memo = loadStored();
  const fresh = memo && Date.now() - Date.parse(memo.fetchedAt) < ttl;
  if (fresh && !force) return { ...memo, stale: false };
  inflight ??= refresh().finally(() => (inflight = null));
  const got = await inflight;
  if (got) memo = got;
  return memo ? { ...memo, stale: !got } : null;
}

/** Synchronous accessor for hot paths; returns whatever is cached (may be null). */
export function cachedRates() {
  if (!memo) memo = loadStored();
  return memo?.rates ?? null;
}
