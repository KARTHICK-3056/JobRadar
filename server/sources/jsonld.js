// Generic company careers pages that embed schema.org JobPosting JSON-LD.
// Configure pages in server/data/careers-pages.json: [{ "company": "Acme", "url": "https://acme.com/careers" }].
// Each listed page (and any same-site job links on it that also carry JobPosting JSON-LD) is parsed.
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { config } from "../config.js";
import { politeFetch } from "../http.js";
import { slugify } from "../lib/normalize.js";
import { runBoards } from "./base.js";

const CONFIG = path.join(config.root, "server", "data", "careers-pages.json");

export function extractJobPostings(html) {
  const $ = cheerio.load(html);
  const found = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    const t = node["@type"];
    if (t === "JobPosting" || (Array.isArray(t) && t.includes("JobPosting"))) found.push(node);
    if (node["@graph"]) visit(node["@graph"]);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      visit(JSON.parse($(el).text()));
    } catch {
      /* malformed block */
    }
  });
  return found;
}

export function jobPostingToRaw(jp, pageUrl, companyName) {
  const locs = [].concat(jp.jobLocation ?? []).map((l) => {
    const a = l?.address ?? {};
    return [a.addressLocality, a.addressRegion, typeof a.addressCountry === "string" ? a.addressCountry : a.addressCountry?.name].filter(Boolean).join(", ");
  });
  const remote = jp.jobLocationType === "TELECOMMUTE";
  const bs = jp.baseSalary?.value ?? {};
  const unit = String(bs.unitText ?? jp.baseSalary?.unitText ?? "").toUpperCase();
  return {
    source: "careers-jsonld",
    source_job_id: jp.identifier?.value ?? jp.url ?? `${pageUrl}#${jp.title}`,
    source_url: jp.url ?? pageUrl,
    apply_url: jp.url ?? pageUrl,
    company: { name: jp.hiringOrganization?.name ?? companyName },
    title: jp.title,
    location: [...locs, remote ? "Remote" : null].filter(Boolean).join(" | "),
    location_hints: { remote },
    type_hint: [].concat(jp.employmentType ?? []).join(" "),
    posted_at: jp.datePosted,
    description_html: jp.description,
    salary:
      bs.minValue || bs.maxValue || bs.value
        ? { min: bs.minValue ?? bs.value, max: bs.maxValue ?? bs.value, currency: jp.baseSalary?.currency, period: unit === "MONTH" ? "month" : unit === "YEAR" ? "year" : unit.toLowerCase() || "year" }
        : null,
  };
}

function loadPages() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG, "utf8")).pages ?? [];
  } catch {
    return [];
  }
}

export default {
  id: "careers-jsonld",
  name: "Company careers pages (JSON-LD)",
  type: "Careers page",
  homepage: "https://schema.org/JobPosting",
  regions: ["Configured per page"],
  notes: "Parses schema.org JobPosting JSON-LD from configured careers pages. Pages are listed in server/data/careers-pages.json.",
  enabled: () => loadPages().length > 0,

  boards: () => loadPages().map((p) => ({ key: `jsonld:${slugify(p.company)}`, label: p.company, page: p })),

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async ({ page }) => {
      const html = await politeFetch(page.url, { accept: "text/html" });
      let postings = extractJobPostings(html).map((jp) => jobPostingToRaw(jp, page.url, page.company));
      if (!postings.length && page.followLinks) {
        const $ = cheerio.load(html);
        const base = new URL(page.url);
        const links = [...new Set($("a[href]").map((_, a) => new URL($(a).attr("href"), base).href).get())]
          .filter((h) => h.startsWith(base.origin) && new RegExp(page.followLinks).test(h))
          .slice(0, page.maxLinks ?? 40);
        for (const href of links) {
          try {
            postings.push(...extractJobPostings(await politeFetch(href, { accept: "text/html" })).map((jp) => jobPostingToRaw(jp, href, page.company)));
          } catch (err) {
            ctx.log?.warn("jsonld.detail_failed", { href, err: err.message });
          }
        }
      }
      return postings;
    });
  },
};
