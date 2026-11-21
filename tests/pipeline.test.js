// Upsert/versioning/close-detection and query behaviour against an in-memory DB.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { useMemoryDb } from "../server/db.js";
import { normalizeJob } from "../server/lib/normalize.js";
import { parseHnComment } from "../server/sources/hackernews.js";
import { extractJobPostings, jobPostingToRaw } from "../server/sources/jsonld.js";
import { parseWwrRss } from "../server/sources/weworkremotely.js";
import { parseZohoRss } from "../server/sources/zoho.js";

let applyResults, queryJobs, invalidateJobCache, db;
before(async () => {
  db = useMemoryDb();
  ({ applyResults } = await import("../server/scrape.js"));
  ({ queryJobs, invalidateJobCache } = await import("../server/store.js"));
});

const src = { id: "greenhouse" };
const mk = (over = {}) =>
  normalizeJob({
    source: "greenhouse",
    board_key: "greenhouse:acme",
    source_job_id: over.id ?? "1",
    source_url: "https://boards.greenhouse.io/acme/jobs/1",
    company: { id: "acme", name: "Acme" },
    title: over.title ?? "Backend Engineer",
    location: over.location ?? "Chennai, India",
    description_html: over.html ?? "<p>Python and PostgreSQL. Salary range ₹10L - ₹14L.</p>",
    posted_at: "2026-11-10T00:00:00Z",
  });

describe("pipeline: upsert, versions, close detection", () => {
  it("inserts, then records an update version when salary changes", () => {
    let s = applyResults(src, [mk()], { "greenhouse:acme": { ok: true } });
    assert.equal(s.inserted, 1);
    s = applyResults(src, [mk({ html: "<p>Python and PostgreSQL. Salary range ₹12L - ₹16L.</p>" })], { "greenhouse:acme": { ok: true } });
    assert.equal(s.updated, 1);
    const v = db.prepare("SELECT change_type, changes FROM job_versions ORDER BY version").all();
    assert.deepEqual(v.map((r) => r.change_type), ["created", "updated"]);
    assert.ok(JSON.parse(v[1].changes).salary_min);
  });
  it("is idempotent for unchanged content", () => {
    const s = applyResults(src, [mk({ html: "<p>Python and PostgreSQL. Salary range ₹12L - ₹16L.</p>" })], { "greenhouse:acme": { ok: true } });
    assert.equal(s.unchanged, 1);
  });
  it("closes jobs that disappear from a successfully fetched board, and reopens them", () => {
    const other = mk({ id: "2", title: "Frontend Engineer", html: "<p>React and TypeScript.</p>" });
    let s = applyResults(src, [other], { "greenhouse:acme": { ok: true } });
    assert.equal(s.closed, 1);
    const closed = db.prepare("SELECT status FROM jobs WHERE title = 'Backend Engineer'").get();
    assert.equal(closed.status, "closed");
    s = applyResults(src, [other, mk({ html: "<p>Python and PostgreSQL. Salary range ₹12L - ₹16L.</p>" })], { "greenhouse:acme": { ok: true } });
    assert.equal(s.reopened, 1);
  });
  it("does not close anything when the board fetch failed", () => {
    const s = applyResults(src, [], { "greenhouse:acme": { ok: false, error: "HTTP 500" } });
    assert.equal(s.closed, 0);
  });
  it("prefers the more authoritative source for cross-source duplicates", () => {
    const dup = normalizeJob({ source: "remoteok", board_key: "remoteok", company: { name: "Acme" }, title: "Frontend Engineer", location: "Chennai, India", description_text: "dup" });
    const s = applyResults({ id: "remoteok" }, [dup], { remoteok: { ok: true } });
    assert.equal(s.duplicates, 1);
    assert.equal(db.prepare("SELECT source FROM jobs WHERE title='Frontend Engineer'").get().source, "greenhouse");
  });
  it("queries by region with India currency display and USD elsewhere", () => {
    db.prepare("INSERT OR REPLACE INTO fx_rates(base, quote, rate, provider, fetched_at) VALUES ('USD','INR',85,'test',?)").run(new Date().toISOString());
    invalidateJobCache();
    const r = queryJobs({ location: "Madras" });
    assert.equal(r.region.id, "Chennai");
    assert.equal(r.total, 2);
    const withSalary = r.jobs.find((j) => j.salary_display);
    assert.match(withSalary.salary_display, /^₹12 - ₹16 LPA \(~\$14k - \$19k\)$/);
    const g = queryJobs({ location: "Global" });
    assert.match(g.jobs.find((j) => j.salary_display).salary_display, /^\$14k - \$19k$/);
  });
  it("falls back to India-wide jobs for thin cities, and says so", () => {
    const r = queryJobs({ location: "Coimbatore" });
    assert.ok(r.fallback);
    assert.equal(r.fallback.exact_count, 0);
    assert.equal(r.total, 2);
  });
  it("sorts by salary with undisclosed salaries last, and by match score", () => {
    const r = queryJobs({ location: "Chennai", sort: "salary" });
    assert.ok(r.jobs[0].salary_display);
    assert.equal(r.jobs.at(-1).salary_display, null);
    const m = queryJobs({ location: "Chennai", sort: "match", profile: { skills: ["Python", "PostgreSQL"] } });
    assert.equal(m.sort, "match");
    assert.ok(m.jobs[0].match_score >= m.jobs[1].match_score);
    assert.deepEqual(m.jobs[0].matched_skills.sort(), ["PostgreSQL", "Python"]);
  });
});

describe("source parsers", () => {
  it("parses Zoho RSS", () => {
    const xml = `<rss><channel><item><title><![CDATA[Software Developers]]></title><link>https://careers.zohocorp.com/jobs/Careers/193779000024446019/Software-Developers?source=RSS</link><description><![CDATA[Category: Technology <br><br>Location: Tamil Nadu Tamil Nadu India <br><br><ul><li>Build things</li></ul>]]></description><pubDate>Mon, 29 Sep 2025 10:00:13 IST</pubDate></item></channel></rss>`;
    const [j] = parseZohoRss(xml, { id: "zoho", name: "Zoho" });
    assert.equal(j.title, "Software Developers");
    assert.equal(j.location, "Tamil Nadu India");
    assert.equal(j.source_url, "https://careers.zohocorp.com/jobs/Careers/193779000024446019/Software-Developers");
    assert.equal(normalizeJob(j).location_country, "India");
  });
  it("parses We Work Remotely RSS", () => {
    const xml = `<rss><channel><item><title>Acme: Senior Rails Developer</title><region>Anywhere in the World</region><link>https://weworkremotely.com/x</link><guid>https://weworkremotely.com/x</guid><description>&lt;p&gt;Ruby on Rails&lt;/p&gt;</description><pubDate>Tue, 18 Nov 2026 10:00:00 +0000</pubDate></item></channel></rss>`;
    const [j] = parseWwrRss(xml);
    assert.equal(j.company.name, "Acme");
    assert.equal(j.title, "Senior Rails Developer");
    assert.ok(normalizeJob(j).is_remote);
  });
  it("parses well-formed HN comments and skips the rest", () => {
    const ok = parseHnComment({ id: 1, created_at: "2026-11-02T00:00:00Z", text: "Acme | Senior Backend Engineer | Bengaluru, India | ONSITE<p>We use Go." });
    assert.equal(ok.company.name, "Acme");
    assert.equal(ok.title, "Senior Backend Engineer");
    assert.equal(parseHnComment({ id: 2, text: "Great thread, thanks!" }), null);
  });
  it("extracts schema.org JobPosting JSON-LD", () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"JobPosting","title":"Data Analyst","datePosted":"2026-11-01","hiringOrganization":{"name":"Acme"},"jobLocation":{"address":{"addressLocality":"Pune","addressCountry":"IN"}},"baseSalary":{"currency":"INR","value":{"minValue":600000,"maxValue":900000,"unitText":"YEAR"}},"description":"<p>SQL</p>"}]}</script>`;
    const [jp] = extractJobPostings(html);
    const j = normalizeJob(jobPostingToRaw(jp, "https://acme.com/careers", "Acme"));
    assert.equal(j.location_city, "Pune");
    assert.deepEqual([j.salary_min, j.salary_max, j.salary_currency], [600000, 900000, "INR"]);
  });
});
