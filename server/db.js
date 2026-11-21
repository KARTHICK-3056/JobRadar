// SQLite storage using Node's built-in driver (node:sqlite, Node >= 22.13). No native build needed.
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";

let db;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
  id              TEXT PRIMARY KEY,          -- e.g. "greenhouse"
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,             -- "ATS API" | "Careers page" | "RSS" | "HTML scrape" | "Public API"
  homepage        TEXT,
  regions         TEXT NOT NULL DEFAULT '[]',-- JSON array of human-readable coverage
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | healthy | degraded | failing | blocked
  last_run_at     TEXT,
  last_success_at TEXT,
  last_error      TEXT,
  last_fetched    INTEGER DEFAULT 0,         -- jobs returned by the last run
  boards_ok       INTEGER DEFAULT 0,
  boards_failed   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS companies (
  id              TEXT PRIMARY KEY,          -- slug
  name            TEXT NOT NULL,
  industry        TEXT,
  hq              TEXT,
  website         TEXT,
  description     TEXT,                      -- scraped (ATS board intro or site meta description)
  description_source TEXT,
  logo_initials   TEXT,
  tone            INTEGER,
  source          TEXT,
  source_url      TEXT,
  scraped_at      TEXT,
  content_hash    TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id               TEXT PRIMARY KEY,         -- dedupe hash of title+company+location
  source           TEXT NOT NULL,
  source_job_id    TEXT,
  board_key        TEXT,                     -- scope used for close detection, e.g. "greenhouse:stripe"
  source_url       TEXT,
  apply_url        TEXT,
  company_id       TEXT,
  company          TEXT NOT NULL,
  company_logo_initials TEXT,
  title            TEXT NOT NULL,
  location_raw     TEXT,
  location_city    TEXT,
  location_country TEXT,
  cities           TEXT NOT NULL DEFAULT '[]',
  countries        TEXT NOT NULL DEFAULT '[]',
  is_remote        INTEGER NOT NULL DEFAULT 0,
  job_type         TEXT,
  seniority        TEXT,
  category         TEXT,
  department       TEXT,
  skills           TEXT NOT NULL DEFAULT '[]',
  salary_min       REAL,
  salary_max       REAL,
  salary_currency  TEXT,
  salary_period    TEXT,                     -- year | month
  posted_at        TEXT,
  description      TEXT,                     -- plain text
  description_blocks TEXT,                   -- JSON [{t:"h"|"p"|"li", x:"..."}]
  quality          REAL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'open', -- open | closed
  first_seen       TEXT NOT NULL,
  last_seen        TEXT NOT NULL,
  scraped_at       TEXT NOT NULL,
  closed_at        TEXT,
  content_hash     TEXT NOT NULL,
  version          INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_board ON jobs(board_key);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);

CREATE TABLE IF NOT EXISTS job_versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id      TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL,
  changed_at  TEXT NOT NULL,
  change_type TEXT NOT NULL,                 -- created | updated | closed | reopened
  changes     TEXT NOT NULL DEFAULT '{}'     -- JSON {field: {from, to}}
);
CREATE INDEX IF NOT EXISTS idx_versions_job ON job_versions(job_id);

CREATE TABLE IF NOT EXISTS scrape_runs (
  id          TEXT PRIMARY KEY,
  region      TEXT NOT NULL,
  trigger     TEXT NOT NULL,                 -- boot | schedule | user | cli
  status      TEXT NOT NULL,                 -- running | done | failed
  started_at  TEXT NOT NULL,
  finished_at TEXT,
  progress    TEXT NOT NULL DEFAULT '[]',    -- JSON log lines
  stats       TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS fx_rates (
  base       TEXT NOT NULL,
  quote      TEXT NOT NULL,
  rate       REAL NOT NULL,
  provider   TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  PRIMARY KEY (base, quote)
);

CREATE TABLE IF NOT EXISTS http_cache (
  url        TEXT PRIMARY KEY,
  status     INTEGER,
  body       TEXT,
  fetched_at INTEGER NOT NULL
);
`;

export function getDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  db = new DatabaseSync(config.dbPath);
  db.exec(SCHEMA);
  return db;
}

/** Open an isolated in-memory DB (used by tests). */
export function useMemoryDb() {
  db = new DatabaseSync(":memory:");
  db.exec(SCHEMA.replace("PRAGMA journal_mode = WAL;", ""));
  return db;
}

export function tx(fn) {
  const d = getDb();
  d.exec("BEGIN");
  try {
    const r = fn(d);
    d.exec("COMMIT");
    return r;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

export const nowIso = () => new Date().toISOString();
export const parseJson = (s, d) => {
  if (s == null) return d;
  try {
    return JSON.parse(s);
  } catch {
    return d;
  }
};
