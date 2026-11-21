// Re-verify every board token in server/data/companies.json against the live APIs and drop dead ones.
// Usage: npm run verify-companies            (report only)
//        npm run verify-companies -- --write (rewrite companies.json without dead tokens)
import fs from "node:fs";
import path from "node:path";
import { config } from "../server/config.js";
import { getDb } from "../server/db.js";
import { politeFetch } from "../server/http.js";

getDb();
const file = path.join(config.root, "server", "data", "companies.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const probe = {
  greenhouse: async (t) => (await politeFetch(`https://boards-api.greenhouse.io/v1/boards/${t}/jobs`, { json: true, cacheTtlMs: 0 })).jobs.length,
  lever: async (t) => (await politeFetch(`https://api.lever.co/v0/postings/${t}?mode=json`, { json: true, cacheTtlMs: 0 })).length,
  ashby: async (t) => (await politeFetch(`https://api.ashbyhq.com/posting-api/job-board/${t}`, { json: true, cacheTtlMs: 0 })).jobs.length,
  "zoho-rss": async (t) => ((await politeFetch(`https://${t}/rss`, { cacheTtlMs: 0 })).match(/<item>/g) ?? []).length,
};
const alive = [];
for (const c of data.companies) {
  try {
    const n = await probe[c.ats](c.token);
    console.log(`${n > 0 ? "OK  " : "EMPTY"} ${c.ats.padEnd(10)} ${c.token.padEnd(34)} ${n} jobs`);
    if (n > 0) alive.push(c);
  } catch (err) {
    console.log(`DEAD ${c.ats.padEnd(10)} ${c.token.padEnd(34)} ${err.message}`);
  }
}
console.log(`\n${alive.length}/${data.companies.length} boards alive`);
if (process.argv.includes("--write")) {
  fs.writeFileSync(file, JSON.stringify({ ...data, verified_at: new Date().toISOString().slice(0, 10), companies: alive }, null, 1));
  console.log("companies.json updated");
}
process.exit(0);
