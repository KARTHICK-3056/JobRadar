// Read side: an in-memory index of open jobs (without descriptions) for fast filtering, plus query helpers.
import { getDb, parseJson } from "./db.js";
import { cachedRates } from "./lib/fx.js";
import { isIndiaRegion, jobInRegion, resolveRegion } from "./lib/locations.js";
import { scoreJob } from "./lib/match.js";
import { annual, convert, salaryView } from "./lib/salary.js";
import { CATEGORIES } from "./lib/classify.js";

let cache = null;

export function invalidateJobCache() {
  cache = null;
}

function rowToJob(r) {
  const skills = parseJson(r.skills, []);
  return {
    ...r,
    cities: parseJson(r.cities, []),
    countries: parseJson(r.countries, []),
    skills: Array.isArray(skills) ? skills : skills.all ?? [],
    title_skills: Array.isArray(skills) ? [] : skills.title ?? [],
    is_remote: Boolean(r.is_remote),
    search_text: `${r.title} ${r.company} ${r.category} ${r.location_raw ?? ""} ${(Array.isArray(skills) ? skills : skills.all ?? []).join(" ")}`.toLowerCase(),
  };
}

const LIST_COLS = `id, source, source_url, apply_url, company_id, company, company_logo_initials, title, location_raw, location_city,
  location_country, cities, countries, is_remote, job_type, seniority, category, department, skills, salary_min, salary_max,
  salary_currency, salary_period, posted_at, first_seen, last_seen, scraped_at, quality, status`;

function openJobs() {
  if (cache) return cache;
  const rows = getDb().prepare(`SELECT ${LIST_COLS} FROM jobs WHERE status = 'open'`).all();
  cache = rows.map(rowToJob);
  return cache;
}

const postedTs = (j) => Date.parse(j.posted_at ?? j.first_seen) || 0;

function usdAnnualMax(j, rates) {
  if (j.salary_max == null && j.salary_min == null) return null;
  const a = annual(j.salary_min, j.salary_max, j.salary_period);
  return convert(a.max ?? a.min, j.salary_currency ?? "USD", "USD", rates);
}

/** Shape a job for the API: salary display for the region, posted-days, optional match. */
export function presentJob(j, { region, rates, profile }) {
  const india = isIndiaRegion(region);
  const sv = salaryView(j, { india, rates });
  const days = Math.max(0, Math.floor((Date.now() - postedTs(j)) / 86400000));
  const out = {
    id: j.id,
    title: j.title,
    company: j.company,
    company_id: j.company_id,
    company_logo_initials: j.company_logo_initials,
    location: j.location_raw || (j.is_remote ? "Remote" : "Location not listed"),
    location_city: j.location_city,
    location_country: j.location_country,
    is_remote: j.is_remote,
    job_type: j.job_type,
    seniority: j.seniority,
    category: j.category,
    skills: j.skills,
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    salary_currency: j.salary_currency,
    salary_period: j.salary_period,
    salary_display: sv.display,
    salary_usd_max: sv.usdMax ?? null,
    posted_at: j.posted_at,
    posted_days_ago: days,
    first_seen: j.first_seen,
    last_seen: j.last_seen,
    scraped_at: j.scraped_at,
    source: j.source,
    source_url: j.source_url,
    apply_url: j.apply_url,
    status: j.status,
  };
  if (profile?.skills?.length) Object.assign(out, scoreJob(profile, j));
  return out;
}

function applyFilters(list, f, rates) {
  const q = f.q?.trim().toLowerCase();
  const terms = q ? q.split(/\s+/).filter(Boolean) : [];
  const minLpa = Number(f.minSalaryLpa) || 0;
  return list.filter((j) => {
    if (terms.length && !terms.every((t) => j.search_text.includes(t))) return false;
    if (f.category && j.category.toLowerCase() !== f.category.toLowerCase()) return false;
    if (f.remote && !j.is_remote) return false;
    if (f.types?.length && !f.types.includes(j.job_type)) return false;
    if (f.levels?.length && !f.levels.includes(j.seniority)) return false;
    if (f.companyId && j.company_id !== f.companyId) return false;
    if (minLpa) {
      const a = annual(j.salary_min, j.salary_max, j.salary_period);
      const inr = convert(a.max ?? a.min, j.salary_currency ?? "USD", "INR", rates);
      if (inr == null || inr / 1e5 < minLpa) return false;
    }
    return true;
  });
}

const FALLBACK_MIN = 5;

/**
 * Query open jobs.
 * opts: { q, location, category, remote, types[], levels[], minSalaryLpa, sort, page, pageSize, profile, ids[] }
 */
export function queryJobs(opts = {}) {
  const region = resolveRegion(opts.location);
  const rates = cachedRates();
  const all = openJobs();
  let fallback = null;
  let list;
  if (opts.ids?.length) {
    const want = new Set(opts.ids);
    const rows = getDb()
      .prepare(`SELECT ${LIST_COLS} FROM jobs WHERE id IN (${opts.ids.map(() => "?").join(",")})`)
      .all(...opts.ids)
      .map(rowToJob);
    list = rows.filter((r) => want.has(r.id));
  } else {
    list = applyFilters(all.filter((j) => jobInRegion(j, region)), opts, rates);
    // Thin city results: widen to India (all) + Remote India, clearly flagged. Never pad with anything fake.
    if ((region.kind === "city" || region.kind === "metro") && region.country === "India" && list.length < FALLBACK_MIN) {
      const exact = new Set(list.map((j) => j.id));
      const wider = applyFilters(
        all.filter((j) => !exact.has(j.id) && (jobInRegion(j, { kind: "india" }) || jobInRegion(j, { kind: "remote-india" }))),
        opts,
        rates,
      );
      if (wider.length) {
        fallback = { from: region.id, to: "India (all) + Remote India", exact_count: list.length, added: wider.length };
        list = [...list.map((j) => ({ ...j, _exact: true })), ...wider];
      }
    }
  }

  const sort = opts.sort === "salary" ? "salary" : opts.sort === "match" && opts.profile?.skills?.length ? "match" : "newest";
  const scored = list.map((j) => ({ j, view: presentJob(j, { region, rates, profile: opts.profile }) }));
  const exactFirst = (a, b) => (b.j._exact ? 1 : 0) - (a.j._exact ? 1 : 0);
  if (sort === "salary") {
    scored.sort((a, b) => {
      const ua = usdAnnualMax(a.j, rates);
      const ub = usdAnnualMax(b.j, rates);
      if (ua == null && ub == null) return postedTs(b.j) - postedTs(a.j);
      if (ua == null) return 1; // no salary -> last
      if (ub == null) return -1;
      return ub - ua;
    });
  } else if (sort === "match") {
    scored.sort((a, b) => (b.view.match_score ?? 0) - (a.view.match_score ?? 0) || postedTs(b.j) - postedTs(a.j));
  } else if (region.kind === "global") {
    // Global top results: recency blended with data quality.
    const rank = (j) => postedTs(j) / 86400000 + j.quality * 10;
    scored.sort((a, b) => rank(b.j) - rank(a.j));
  } else {
    scored.sort((a, b) => exactFirst(a, b) || postedTs(b.j) - postedTs(a.j));
  }

  const pageSize = Math.min(Math.max(Number(opts.pageSize) || 30, 1), 100);
  const page = Math.max(Number(opts.page) || 1, 1);
  const total = scored.length;
  return {
    region: { id: region.id, label: region.label ?? region.id, kind: region.kind, india: isIndiaRegion(region) },
    total,
    page,
    page_size: pageSize,
    pages: Math.ceil(total / pageSize),
    sort,
    fallback,
    fx: rates ? { usd_inr: rates.INR } : null,
    jobs: scored.slice((page - 1) * pageSize, page * pageSize).map((s) => s.view),
  };
}

export function getJobDetail(id, { location, profile } = {}) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
  if (!row) return null;
  const j = rowToJob(row);
  const region = resolveRegion(location);
  const view = presentJob(j, { region, rates: cachedRates(), profile });
  const versions = db
    .prepare("SELECT version, changed_at, change_type, changes FROM job_versions WHERE job_id = ? ORDER BY version DESC LIMIT 50")
    .all(id)
    .map((v) => ({ ...v, changes: parseJson(v.changes, {}) }));
  const company = db.prepare("SELECT * FROM companies WHERE id = ?").get(j.company_id) ?? null;
  return {
    ...view,
    description: row.description,
    description_blocks: parseJson(row.description_blocks, []),
    department: row.department,
    closed_at: row.closed_at,
    version: row.version,
    versions,
    company_info: company && presentCompany(company, null),
  };
}

export function stats({ location } = {}) {
  const region = resolveRegion(location);
  const all = openJobs();
  const inRegion = all.filter((j) => jobInRegion(j, region));
  const categories = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  for (const j of inRegion) if (j.category in categories) categories[j.category]++;
  const hubs = ["India", "Bengaluru", "Chennai", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Remote", "Global"];
  const hub_counts = Object.fromEntries(hubs.map((h) => [h, all.filter((j) => jobInRegion(j, resolveRegion(h))).length]));
  const last = getDb().prepare("SELECT MAX(last_success_at) AS t FROM sources").get();
  return {
    region: { id: region.id, label: region.label ?? region.id, kind: region.kind, india: isIndiaRegion(region) },
    total: inRegion.length,
    total_all_regions: all.length,
    categories,
    hub_counts,
    with_salary: inRegion.filter((j) => j.salary_min != null).length,
    remote: inRegion.filter((j) => j.is_remote).length,
    internships: inRegion.filter((j) => j.job_type === "Internship").length,
    last_scraped_at: last?.t ?? null,
  };
}

function presentCompany(c, openRoles) {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry,
    hq: c.hq,
    website: c.website,
    description: c.description,
    description_source: c.description_source,
    logo_initials: c.logo_initials,
    tone: c.tone ?? 3,
    source: c.source,
    source_url: c.source_url,
    open_roles: openRoles,
  };
}

export function companies({ location, limit } = {}) {
  const region = resolveRegion(location);
  const counts = new Map();
  for (const j of openJobs()) if (jobInRegion(j, region)) counts.set(j.company_id, (counts.get(j.company_id) ?? 0) + 1);
  const rows = getDb().prepare("SELECT * FROM companies").all();
  const list = rows
    .map((c) => presentCompany(c, counts.get(c.id) ?? 0))
    .filter((c) => c.open_roles > 0)
    .sort((a, b) => b.open_roles - a.open_roles || a.name.localeCompare(b.name));
  return {
    region: { id: region.id, label: region.label ?? region.id, india: isIndiaRegion(region) },
    total: list.length,
    companies: limit ? list.slice(0, Number(limit)) : list,
  };
}

export function sourcesView() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM sources ORDER BY id").all();
  const counts = Object.fromEntries(db.prepare("SELECT source, COUNT(*) AS n FROM jobs WHERE status='open' GROUP BY source").all().map((r) => [r.source, r.n]));
  const india = Object.fromEntries(
    db.prepare("SELECT source, COUNT(*) AS n FROM jobs WHERE status='open' AND countries LIKE '%\"India\"%' GROUP BY source").all().map((r) => [r.source, r.n]),
  );
  const companiesPer = Object.fromEntries(db.prepare("SELECT source, COUNT(DISTINCT company_id) AS n FROM jobs WHERE status='open' GROUP BY source").all().map((r) => [r.source, r.n]));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    homepage: r.homepage,
    regions: parseJson(r.regions, []),
    notes: r.notes,
    status: r.status,
    last_run_at: r.last_run_at,
    last_success_at: r.last_success_at,
    last_error: r.last_error,
    boards_ok: r.boards_ok,
    boards_failed: r.boards_failed,
    jobs_indexed: counts[r.id] ?? 0,
    india_jobs: india[r.id] ?? 0,
    companies: companiesPer[r.id] ?? 0,
  }));
}
