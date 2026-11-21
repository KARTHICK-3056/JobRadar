// Scrape orchestrator: runs sources for a region, upserts jobs with dedupe + version history,
// closes jobs that disappeared from a successfully-fetched board, and reports progress.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { config } from "./config.js";
import { getDb, nowIso, parseJson } from "./db.js";
import { politeFetch, pruneHttpCache } from "./http.js";
import { isIndiaRegion, resolveRegion } from "./lib/locations.js";
import { htmlToBlocks, initials, slugify } from "./lib/normalize.js";
import { log } from "./logger.js";
import { SOURCES, sourcePriority, sourcesForRegion } from "./sources/index.js";
import { invalidateJobCache } from "./store.js";

export function loadSeed() {
  const file = path.join(config.root, "server", "data", "companies.json");
  return JSON.parse(fs.readFileSync(file, "utf8")).companies;
}

const runs = new Map(); // id -> live run state
let current = null; // promise of the running scrape

export function getRun(id) {
  if (id && runs.has(id)) return runs.get(id);
  if (!id && current) return [...runs.values()].at(-1);
  const row = id
    ? getDb().prepare("SELECT * FROM scrape_runs WHERE id = ?").get(id)
    : getDb().prepare("SELECT * FROM scrape_runs ORDER BY started_at DESC LIMIT 1").get();
  if (!row) return null;
  return { ...row, progress: parseJson(row.progress, []), stats: parseJson(row.stats, {}) };
}

export const isScraping = () => Boolean(current);

/** Start a scrape in the background. If one is already running, returns that run instead. */
export function startScrape(regionInput, trigger = "user") {
  if (current) return { run: [...runs.values()].at(-1), alreadyRunning: true };
  const region = resolveRegion(regionInput);
  const id = crypto.randomUUID();
  const run = { id, region: region.id, trigger, status: "running", started_at: nowIso(), finished_at: null, progress: [], stats: {} };
  runs.set(id, run);
  if (runs.size > 20) runs.delete(runs.keys().next().value);
  getDb()
    .prepare("INSERT INTO scrape_runs(id, region, trigger, status, started_at) VALUES (?,?,?,?,?)")
    .run(id, region.id, trigger, "running", run.started_at);
  current = executeScrape(run, region)
    .catch((err) => {
      run.status = "failed";
      run.progress.push({ at: nowIso(), msg: `Scrape failed: ${err.message}` });
      log.error("scrape.failed", { run: id, err });
    })
    .finally(() => {
      run.finished_at = nowIso();
      if (run.status === "running") run.status = "done";
      getDb()
        .prepare("UPDATE scrape_runs SET status=?, finished_at=?, progress=?, stats=? WHERE id=?")
        .run(run.status, run.finished_at, JSON.stringify(run.progress.slice(-300)), JSON.stringify(run.stats), id);
      current = null;
    });
  return { run, alreadyRunning: false };
}

/** Await a full scrape (CLI / boot). */
export async function scrapeNow(regionInput, trigger = "cli") {
  const { run } = startScrape(regionInput, trigger);
  while (current) await current;
  return getRun(run.id);
}

function indiaBoardKeys() {
  const rows = getDb().prepare("SELECT DISTINCT board_key FROM jobs WHERE status='open' AND countries LIKE '%\"India\"%'").all();
  return new Set(rows.map((r) => r.board_key));
}

async function executeScrape(run, region) {
  const say = (msg) => {
    run.progress.push({ at: nowIso(), msg });
    log.info("scrape.progress", { run: run.id, msg });
  };
  const seed = loadSeed();
  const regionCtx = { ...region, india: isIndiaRegion(region) };
  const indiaBoards = indiaBoardKeys();
  const sources = sourcesForRegion(regionCtx);
  say(`Scraping ${sources.length} sources for ${region.label ?? region.id}`);
  seedCompanies(seed);

  const companyInfo = new Map();
  const results = await Promise.all(
    sources.map(async (src) => {
      const boardResults = {};
      const boards = src.boards({ seed, region: regionCtx, indiaBoards });
      const ctx = {
        region: regionCtx,
        boards,
        log: log.child({ source: src.id }),
        progress: (m) => say(`[${src.name}] ${m}`),
        report: (key, r) => (boardResults[key] = r),
        companyInfo: (id, info) => companyInfo.set(id, info),
      };
      const started = Date.now();
      let jobs = [];
      try {
        jobs = await src.fetch(ctx);
      } catch (err) {
        // Defensive: sources already isolate per-board errors, but never let one source kill the run.
        log.error("source.crashed", { source: src.id, err });
        say(`[${src.name}] crashed: ${err.message}`);
      }
      return { src, jobs, boardResults, ms: Date.now() - started };
    }),
  );

  const stats = { region: region.id, sources: {}, inserted: 0, updated: 0, merged: 0, unchanged: 0, closed: 0, reopened: 0, duplicates: 0 };
  for (const r of results) {
    const s = applyResults(r.src, r.jobs, r.boardResults);
    stats.inserted += s.inserted;
    stats.updated += s.updated;
    stats.merged += s.merged;
    stats.unchanged += s.unchanged;
    stats.closed += s.closed;
    stats.reopened += s.reopened;
    stats.duplicates += s.duplicates;
    const boardVals = Object.values(r.boardResults);
    const ok = boardVals.filter((b) => b.ok).length;
    const failed = boardVals.filter((b) => !b.ok);
    stats.sources[r.src.id] = { fetched: r.jobs.length, boards_ok: ok, boards_failed: failed.length, ms: r.ms, errors: failed.slice(0, 5).map((f) => f.error) };
    updateSourceHealth(r.src, r.jobs.length, ok, failed);
  }
  invalidateJobCache(); // new jobs are visible immediately
  for (const [id, info] of companyInfo) setCompanyDescription(id, info);
  ensureFeedCompanies();
  pruneHttpCache();
  run.stats = stats;
  say(`Done: ${stats.inserted} new, ${stats.updated} updated, ${stats.closed} closed, ${stats.reopened} reopened.`);
  log.info("scrape.done", { run: run.id, ...stats, sources: undefined });
  // Company descriptions from homepages are a nice-to-have: fetch them in the background, never blocking the run.
  enrichCompanies((m) => log.info("company.enrich", { msg: m })).catch((err) => log.warn("company.enrich_failed", { err: err.message }));
}

// ------------------------------------------------------------------------------------------------
// Upsert + versioning
// ------------------------------------------------------------------------------------------------
const VERSIONED_FIELDS = ["title", "location_raw", "job_type", "seniority", "salary_min", "salary_max", "salary_currency", "salary_period", "description"];

export function applyResults(src, jobs, boardResults) {
  const db = getDb();
  const now = nowIso();
  const s = { inserted: 0, updated: 0, merged: 0, unchanged: 0, closed: 0, reopened: 0, duplicates: 0 };
  const seenByBoard = new Map();
  const seenIds = new Set();
  const getJob = db.prepare("SELECT * FROM jobs WHERE id = ?");
  const insert = db.prepare(`INSERT INTO jobs (id, source, source_job_id, board_key, source_url, apply_url, company_id, company, company_logo_initials,
      title, location_raw, location_city, location_country, cities, countries, is_remote, job_type, seniority, category, department, skills,
      salary_min, salary_max, salary_currency, salary_period, posted_at, description, description_blocks, quality, status, first_seen, last_seen,
      scraped_at, content_hash, version)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'open',?,?,?,?,1)`);
  const update = db.prepare(`UPDATE jobs SET source=?, source_job_id=?, board_key=?, source_url=?, apply_url=?, company_id=?, company=?, company_logo_initials=?,
      title=?, location_raw=?, location_city=?, location_country=?, cities=?, countries=?, is_remote=?, job_type=?, seniority=?, category=?, department=?, skills=?,
      salary_min=?, salary_max=?, salary_currency=?, salary_period=?, posted_at=COALESCE(?, posted_at), description=?, description_blocks=?, quality=?,
      status='open', closed_at=NULL, last_seen=?, scraped_at=?, content_hash=?, version=? WHERE id=?`);
  const touch = db.prepare("UPDATE jobs SET last_seen=?, scraped_at=?, status='open', closed_at=NULL, skills=?, category=?, version=? WHERE id=?");
  const addVersion = db.prepare("INSERT INTO job_versions(job_id, version, changed_at, change_type, changes) VALUES (?,?,?,?,?)");

  const skillsJson = (j) => JSON.stringify({ all: j.skills, title: j.title_skills });

  db.exec("BEGIN");
  try {
    for (const j of jobs) {
      if (seenIds.has(j.id)) {
        s.duplicates++;
        continue;
      }
      seenIds.add(j.id);
      if (!seenByBoard.has(j.board_key)) seenByBoard.set(j.board_key, new Set());
      seenByBoard.get(j.board_key).add(j.id);
      const existing = getJob.get(j.id);
      if (existing && existing.source !== j.source && existing.status === "open" && sourcePriority(existing.source) < sourcePriority(j.source)) {
        s.duplicates++; // same job already known from a more authoritative source
        continue;
      }
      const vals = [j.source, j.source_job_id, j.board_key, j.source_url, j.apply_url, j.company_id, j.company, j.company_logo_initials,
        j.title, j.location_raw, j.location_city, j.location_country, JSON.stringify(j.cities), JSON.stringify(j.countries), j.is_remote,
        j.job_type, j.seniority, j.category, j.department, skillsJson(j), j.salary_min, j.salary_max, j.salary_currency, j.salary_period,
        j.posted_at, j.description, JSON.stringify(j.description_blocks), j.quality];
      if (!existing) {
        insert.run(j.id, ...vals, now, now, now, j.content_hash);
        addVersion.run(j.id, 1, now, "created", JSON.stringify({ source: j.source, salary: j.salary_min != null ? [j.salary_min, j.salary_max, j.salary_currency] : null }));
        s.inserted++;
        continue;
      }
      const reopened = existing.status === "closed";
      if (existing.content_hash === j.content_hash) {
        const v = reopened ? existing.version + 1 : existing.version;
        touch.run(now, now, skillsJson(j), j.category, v, j.id);
        if (reopened) {
          addVersion.run(j.id, v, now, "reopened", "{}");
          s.reopened++;
        } else s.unchanged++;
        continue;
      }
      const changes = {};
      for (const f of VERSIONED_FIELDS) {
        if ((existing[f] ?? null) !== (j[f] ?? null)) {
          changes[f] = f === "description" ? { from: `${String(existing[f] ?? "").length} chars`, to: `${String(j[f] ?? "").length} chars` } : { from: existing[f], to: j[f] };
        }
      }
      const v = existing.version + 1;
      update.run(...vals.slice(0, 24), j.posted_at, j.description, JSON.stringify(j.description_blocks), j.quality, now, now, j.content_hash, v, j.id);
      // A more authoritative source taking over the same job (e.g. aggregator -> company ATS) is a merge, not an edit.
      const merged = existing.source !== j.source;
      if (merged) changes.source = { from: existing.source, to: j.source };
      addVersion.run(j.id, v, now, reopened ? "reopened" : merged ? "merged" : "updated", JSON.stringify(changes));
      if (reopened) s.reopened++;
      else if (merged) s.merged = (s.merged ?? 0) + 1;
      else s.updated++;
    }
    // Close jobs that vanished from boards we fetched successfully this run.
    const openOnBoard = db.prepare("SELECT id, version FROM jobs WHERE board_key = ? AND status = 'open'");
    const close = db.prepare("UPDATE jobs SET status='closed', closed_at=?, version=? WHERE id=?");
    for (const [key, r] of Object.entries(boardResults)) {
      if (!r.ok) continue;
      const seen = seenByBoard.get(key) ?? new Set();
      // Safety valve: a board that suddenly returns nothing is more likely broken than empty.
      const open = openOnBoard.all(key);
      if (seen.size === 0 && open.length > 5) continue;
      for (const row of open) {
        if (seen.has(row.id)) continue;
        close.run(now, row.version + 1, row.id);
        addVersion.run(row.id, row.version + 1, now, "closed", "{}");
        s.closed++;
      }
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return s;
}

// ------------------------------------------------------------------------------------------------
// Sources & companies
// ------------------------------------------------------------------------------------------------
export function registerSources() {
  const db = getDb();
  const up = db.prepare(`INSERT INTO sources(id, name, type, homepage, regions, notes) VALUES (?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, type=excluded.type, homepage=excluded.homepage, regions=excluded.regions, notes=excluded.notes`);
  for (const s of SOURCES) {
    if (s.enabled && !s.enabled()) continue;
    up.run(s.id, s.name, s.type, s.homepage, JSON.stringify(s.regions), s.notes);
  }
}

function updateSourceHealth(src, fetched, ok, failed) {
  const total = ok + failed.length;
  const blocked = failed.length && failed.every((f) => f.blocked);
  const status = total === 0 ? "pending" : blocked ? "blocked" : failed.length === 0 ? "healthy" : ok === 0 ? "failing" : "degraded";
  const now = nowIso();
  getDb()
    .prepare(`UPDATE sources SET status=?, last_run_at=?, last_success_at=CASE WHEN ? > 0 THEN ? ELSE last_success_at END,
      last_error=?, last_fetched=?, boards_ok=?, boards_failed=? WHERE id=?`)
    .run(status, now, ok, now, failed[0]?.error ?? null, fetched, ok, failed.length, src.id);
}

const TONES = 6;
const toneFor = (id) => (([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES) + 1);

function seedCompanies(seed) {
  const db = getDb();
  const up = db.prepare(`INSERT INTO companies(id, name, industry, hq, website, logo_initials, tone, source, source_url)
    VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, industry=excluded.industry, hq=excluded.hq,
    website=excluded.website, source=excluded.source, source_url=excluded.source_url`);
  for (const c of seed) {
    const url = { greenhouse: `https://boards.greenhouse.io/${c.token}`, lever: `https://jobs.lever.co/${c.token}`, ashby: `https://jobs.ashbyhq.com/${c.token}`, "zoho-rss": `https://${c.token}` }[c.ats];
    up.run(c.id, c.name, c.industry, c.hq, c.website, initials(c.name), toneFor(c.id), c.ats, url);
  }
}

/** Companies that only appear through job feeds get a minimal row (name + where we saw them). */
function ensureFeedCompanies() {
  const db = getDb();
  const rows = db.prepare("SELECT company_id, company, source, MIN(source_url) AS url FROM jobs WHERE company_id NOT IN (SELECT id FROM companies) GROUP BY company_id").all();
  const ins = db.prepare("INSERT OR IGNORE INTO companies(id, name, logo_initials, tone, source, source_url) VALUES (?,?,?,?,?,?)");
  for (const r of rows) ins.run(r.company_id, r.company, initials(r.company), toneFor(r.company_id), r.source, r.url);
}

function setCompanyDescription(id, { description_html, description_source }) {
  const { text } = htmlToBlocks(description_html);
  const first = text.split("\n").find((l) => l.length > 60) ?? text.split("\n")[0];
  if (!first) return;
  getDb()
    .prepare("UPDATE companies SET description=?, description_source=?, scraped_at=? WHERE id=?")
    .run(first.replace(/^•\s*/, "").slice(0, 400), description_source, nowIso(), id);
}

/** Fill missing company descriptions from the company's own homepage meta description (robots-aware). */
let enriching = false;
async function enrichCompanies(say) {
  if (enriching) return;
  enriching = true;
  try {
    await enrichCompaniesInner(say);
  } finally {
    enriching = false;
  }
}
async function enrichCompaniesInner(say) {
  const db = getDb();
  const missing = db.prepare("SELECT id, website FROM companies WHERE (description IS NULL OR description = '') AND website IS NOT NULL").all().slice(0, 25);
  let n = 0;
  for (const c of missing) {
    try {
      const html = await politeFetch(c.website, { accept: "text/html", cacheTtlMs: 7 * 24 * 3600e3, retries: 0, timeoutMs: 8000 });
      const $ = cheerio.load(html);
      const d = ($('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "").trim();
      if (d.length > 30) {
        db.prepare("UPDATE companies SET description=?, description_source=?, scraped_at=? WHERE id=?").run(d.slice(0, 400), `${new URL(c.website).host} meta description`, nowIso(), c.id);
        n++;
      }
    } catch (err) {
      log.debug("company.enrich_failed", { id: c.id, err: err.message });
    }
  }
  if (n) say(`Fetched ${n} company descriptions from their websites`);
}

export { slugify };
