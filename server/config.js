import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const int = (v, d) => (v !== undefined && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : d);

export const config = {
  root,
  apiPort: int(process.env.API_PORT, 8787),
  appPort: int(process.env.APP_PORT, 8080),
  dbPath: path.resolve(root, process.env.DB_PATH || "./data/jobradar.db"),
  userAgent:
    process.env.USER_AGENT || "JobRadarBot/2.0 (+https://github.com/jobradar; student job-tracker)",
  perDomainDelayMs: int(process.env.PER_DOMAIN_DELAY_MS, 1200),
  requestTimeoutMs: int(process.env.REQUEST_TIMEOUT_MS, 20000),
  requestRetries: int(process.env.REQUEST_RETRIES, 3),
  httpCacheTtlMs: int(process.env.HTTP_CACHE_TTL_MS, 15 * 60 * 1000),
  refreshCron: process.env.REFRESH_CRON || "0 */4 * * *",
  initialScrape: (process.env.INITIAL_SCRAPE ?? "true") !== "false",
  fxTtlHours: int(process.env.FX_TTL_HOURS, 12),
  logLevel: process.env.LOG_LEVEL || "info",
};
