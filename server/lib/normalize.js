// Turns a raw scraped posting into the single normalized job schema, plus dedupe/content hashes.
import crypto from "node:crypto";
import * as cheerio from "cheerio";
import { classifyCategory, classifyJobType, classifySeniority } from "./classify.js";
import { parseLocation } from "./locations.js";
import { normCurrency, parseSalaryText, plausible } from "./salary.js";
import { extractSkills } from "./skills.js";

const sha = (s) => crypto.createHash("sha1").update(s).digest("hex");

export const slugify = (s) =>
  String(s ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function initials(name) {
  const words = String(name ?? "").replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).replace(/^./, (c) => c.toUpperCase());
  return (words[0][0] + words[1][0]).toUpperCase();
}

const normKey = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Cross-source dedupe key: title + company + primary location. */
export function dedupeHash(title, company, location) {
  return sha(`${normKey(title)}|${normKey(company)}|${normKey(location)}`).slice(0, 16);
}

/** Hash of fields whose change should create a new version. */
export function contentHash(job) {
  return sha(
    // Hash the full source location (not the shortened display string) so display tweaks never create versions.
    JSON.stringify([job.title, job.location_full ?? job.location_raw, job.job_type, job.salary_min, job.salary_max, job.salary_currency, job.salary_period, job.description]),
  );
}

/** Decode entity-escaped HTML (Greenhouse returns &lt;p&gt;...) and convert to text + structured blocks. */
export function htmlToBlocks(html) {
  if (!html) return { text: "", blocks: [] };
  let src = String(html);
  if (/&lt;\/?[a-z]/i.test(src) && !/<\/?[a-z]/i.test(src.slice(0, 200))) src = cheerio.load(`<div>${src}</div>`).text();
  const $ = cheerio.load(`<div id="__root">${src}</div>`);
  $("script, style, noscript, iframe, img, svg, form, button").remove();
  const blocks = [];
  const push = (t, x) => {
    const clean = x.replace(/\s+/g, " ").trim();
    if (!clean) return;
    if (t !== "li" && clean.length < 2) return;
    blocks.push({ t, x: clean.slice(0, 1200) });
  };
  const walk = (el) => {
    $(el)
      .contents()
      .each((_, node) => {
        if (node.type === "text") {
          const x = $(node).text();
          if (x.trim()) push("p", x);
          return;
        }
        if (node.type !== "tag") return;
        const tag = node.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) return push("h", $(node).text());
        if (tag === "li") return push("li", $(node).text());
        if (tag === "ul" || tag === "ol" || tag === "div" || tag === "section" || tag === "article" || tag === "span" && $(node).find("p,li,div,ul").length) return walk(node);
        if (tag === "p" || tag === "span" || tag === "a" || tag === "em" || tag === "i") {
          const x = $(node).text();
          const strongOnly = $(node).children().length === 1 && $(node).children("strong,b").length === 1 && $(node).children("strong,b").text().trim() === x.trim();
          if (strongOnly && x.trim().length < 80) return push("h", x.replace(/:$/, ""));
          return push("p", x);
        }
        if (tag === "strong" || tag === "b") {
          const x = $(node).text();
          return push(x.trim().length < 80 ? "h" : "p", x.replace(/:\s*$/, ""));
        }
        if (tag === "br") return;
        if (tag === "table") return push("p", $(node).text());
        walk(node);
      });
  };
  walk($("#__root")[0]);
  // Merge consecutive tiny paragraphs produced by inline formatting
  const merged = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (prev && prev.t === "p" && b.t === "p" && prev.x.length < 60 && !/[.:!?]$/.test(prev.x)) prev.x = `${prev.x} ${b.x}`;
    else merged.push({ ...b });
  }
  const capped = merged.slice(0, 120);
  const text = capped.map((b) => (b.t === "li" ? `• ${b.x}` : b.x)).join("\n");
  return { text: text.slice(0, 20000), blocks: capped };
}

export function textToBlocks(text) {
  const lines = String(text ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const blocks = lines.map((l) => (/^[•*\-–]\s+/.test(l) ? { t: "li", x: l.replace(/^[•*\-–]\s+/, "") } : { t: "p", x: l }));
  return { text: lines.join("\n").slice(0, 20000), blocks: blocks.slice(0, 120) };
}

function decodeEntities(s) {
  const str = String(s ?? "");
  if (!/&(#x?[0-9a-f]+|[a-z]+);/i.test(str)) return str;
  return cheerio.load(`<p>${str}</p>`)("p").text();
}

/** "A | A, State | B | C" -> "A +2 more": first listed location, deduped, with a count of the rest. */
export function displayLocation(locRaw) {
  const parts = [];
  for (const p of String(locRaw ?? "").split(/\s\|\s|;\s*/).map((x) => x.trim()).filter(Boolean)) {
    const key = (p2) => parseLocation(p2).city ?? p2.toLowerCase().split(",")[0].trim();
    if (!parts.some((q) => key(q) === key(p) || q.toLowerCase().includes(p.toLowerCase().split(",")[0].trim()))) parts.push(p);
  }
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]} +${parts.length - 1} more`;
}

function toIso(d) {
  if (!d) return null;
  const n = typeof d === "number" ? (d < 1e12 ? d * 1000 : d) : Date.parse(d);
  if (!Number.isFinite(n)) return null;
  const dt = new Date(n);
  if (dt.getTime() > Date.now() + 86400000) return null; // future-dated noise
  return dt.toISOString();
}

/**
 * raw: {
 *   source, source_job_id, board_key, source_url, apply_url,
 *   company: { id?, name }, title, location, location_hints?: {remote, city, country},
 *   department?, type_hint?, posted_at?, description_html? | description_text?,
 *   salary?: {min, max, currency, period}
 * }
 */
export function normalizeJob(raw, { now = new Date().toISOString() } = {}) {
  const title = decodeEntities(raw.title).replace(/\s+/g, " ").trim();
  const companyName = decodeEntities(raw.company?.name).replace(/\s+/g, " ").trim();
  if (!title || !companyName) return null;
  const desc = raw.description_html ? htmlToBlocks(raw.description_html) : textToBlocks(raw.description_text ?? "");
  const locRaw = String(raw.location ?? "").replace(/\s+/g, " ").trim();
  const loc = parseLocation(locRaw, raw.location_hints ?? {});
  const jobType = classifyJobType(title, `${raw.type_hint ?? ""}`);
  const seniority = classifySeniority(title, { jobType });
  const category = classifyCategory(title, raw.department);

  // Salary: structured field from the source first, else only an explicit range published in the text.
  let sal = null;
  if (raw.salary && (raw.salary.min != null || raw.salary.max != null)) {
    const ccy = normCurrency(raw.salary.currency) ?? null;
    const period = /month/i.test(raw.salary.period ?? "") ? "month" : /hour|day|week/i.test(raw.salary.period ?? "") ? null : "year";
    const min = Number(raw.salary.min) || null;
    const max = Number(raw.salary.max) || min;
    // Structured fields are still sanity-checked: we drop (never "fix") values outside plausible annual ranges.
    if (ccy && period && (min || max) && plausible(min ?? max, max, ccy, period)) sal = { min: min ?? max, max, currency: ccy, period };
  }
  if (!sal) sal = parseSalaryText(`${raw.salary_text ?? ""}\n${desc.text}`);

  const titleSkills = extractSkills(title);
  const skills = [...new Set([...titleSkills, ...extractSkills(`${title}\n${raw.tags?.join(", ") ?? ""}\n${desc.text}`)])];

  const job = {
    id: dedupeHash(title, companyName, loc.city ?? (loc.isRemote ? "remote" : locRaw)),
    source: raw.source,
    source_job_id: raw.source_job_id != null ? String(raw.source_job_id) : null,
    board_key: raw.board_key ?? raw.source,
    source_url: raw.source_url ?? null,
    apply_url: raw.apply_url ?? raw.source_url ?? null,
    company_id: raw.company?.id ?? slugify(companyName),
    company: companyName,
    company_logo_initials: initials(companyName),
    title,
    location_raw: displayLocation(locRaw) || (loc.isRemote ? "Remote" : ""),
    location_city: loc.city,
    location_country: loc.country,
    cities: loc.cities,
    countries: loc.countries,
    is_remote: loc.isRemote ? 1 : 0,
    job_type: jobType,
    seniority,
    category,
    department: raw.department ?? null,
    skills,
    title_skills: titleSkills,
    salary_min: sal?.min ?? null,
    salary_max: sal?.max ?? null,
    salary_currency: sal?.currency ?? null,
    salary_period: sal?.period ?? null,
    posted_at: toIso(raw.posted_at),
    description: desc.text,
    description_blocks: desc.blocks,
    scraped_at: now,
  };
  job.quality = qualityScore(job);
  job.content_hash = contentHash({ ...job, location_full: locRaw });
  return job;
}

/** 0..1 data-quality score used to rank "Global (top results)". */
export function qualityScore(j) {
  let q = 0;
  if (j.posted_at) q += 0.2;
  if (j.salary_min != null) q += 0.25;
  if ((j.description ?? "").length > 400) q += 0.2;
  if (j.skills.length >= 3) q += 0.15;
  if (j.location_city || j.location_country || j.is_remote) q += 0.1;
  if (j.apply_url) q += 0.1;
  return Math.round(q * 100) / 100;
}
