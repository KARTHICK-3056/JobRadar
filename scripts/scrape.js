// CLI: npm run scrape -- Chennai   (or Global, India, Bengaluru, Remote ...)
import { getDb } from "../server/db.js";
import { getFx } from "../server/lib/fx.js";
import { registerSources, scrapeNow } from "../server/scrape.js";
import { sourcesView } from "../server/store.js";

const regions = process.argv.slice(2).length ? process.argv.slice(2) : ["Chennai", "Global"];
getDb();
registerSources();
await getFx().catch(() => null);
for (const r of regions) {
  const run = await scrapeNow(r, "cli");
  console.log(`\n== ${r}: ${run.status}`, JSON.stringify(run.stats, null, 1));
}
console.log("\nSource                     open jobs  india  boards ok/failed  status");
for (const s of sourcesView()) console.log(`${s.name.padEnd(26)} ${String(s.jobs_indexed).padStart(9)}  ${String(s.india_jobs).padStart(5)}  ${String(s.boards_ok).padStart(9)}/${s.boards_failed}  ${s.status}${s.last_error ? "  (" + s.last_error.slice(0, 80) + ")" : ""}`);
process.exit(0);
