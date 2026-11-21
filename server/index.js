import cron from "node-cron";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { getDb } from "./db.js";
import { getFx } from "./lib/fx.js";
import { log } from "./logger.js";
import { isScraping, registerSources, scrapeNow } from "./scrape.js";

getDb();
registerSources();

const app = createApp();
const server = app.listen(config.apiPort, "127.0.0.1", () => {
  log.info("api.listening", { port: config.apiPort, db: config.dbPath });
});

getFx().catch((err) => log.warn("fx.initial_failed", { err: err.message }));

async function bootScrape() {
  const n = getDb().prepare("SELECT COUNT(*) AS n FROM jobs").get().n;
  if (n > 0 || !config.initialScrape) return;
  log.info("boot.initial_scrape", { regions: ["Chennai", "Global"] });
  // Chennai first (India-relevant boards only, so the default view fills fast), then everything for Global.
  await scrapeNow("Chennai", "boot");
  await scrapeNow("Global", "boot");
}
bootScrape().catch((err) => log.error("boot.scrape_failed", { err }));

cron.schedule(config.refreshCron, async () => {
  if (isScraping()) return log.info("schedule.skip", { reason: "scrape already running" });
  log.info("schedule.refresh");
  await getFx({ force: true }).catch(() => {});
  await scrapeNow("Global", "schedule").catch((err) => log.error("schedule.failed", { err }));
});
// FX refresh twice a day independent of scraping.
cron.schedule("15 */12 * * *", () => getFx({ force: true }).catch(() => {}));

const shutdown = () => {
  log.info("api.shutdown");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (err) => log.error("unhandled_rejection", { err }));
