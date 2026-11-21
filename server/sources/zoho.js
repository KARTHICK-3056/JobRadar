// Zoho Corp careers RSS feed (Zoho Recruit). robots.txt explicitly allows /jobs/*.
import * as cheerio from "cheerio";
import { politeFetch } from "../http.js";
import { runBoards, seedBoards } from "./base.js";

export function parseZohoRss(xml, company) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const out = [];
  $("item").each((_, el) => {
    const title = $(el).find("title").text().trim();
    const link = $(el).find("link").text().trim();
    const html = $(el).find("description").text();
    const cat = /Category:\s*([^<]+)</i.exec(html)?.[1]?.trim();
    const loc = /Location:\s*([^<]+)</i.exec(html)?.[1]?.trim() ?? "";
    // "Tamil Nadu Tamil Nadu India" -> dedupe repeated words for a cleaner display string.
    const location = [...new Set(loc.split(/\s{1,}/))].join(" ").replace(/\s+/g, " ");
    const body = html.replace(/^[\s\S]*?Location:[^<]*<br>\s*(<br>\s*)*/i, "");
    out.push({
      source: "zoho-careers",
      source_job_id: /\/(\d{6,})\//.exec(link)?.[1] ?? link,
      source_url: link.replace(/\?source=RSS$/, ""),
      apply_url: link.replace(/\?source=RSS$/, ""),
      company: { id: company.id, name: company.name },
      title,
      location,
      department: cat,
      posted_at: $(el).find("pubDate").text().trim() || null,
      description_html: body,
    });
  });
  return out;
}

export default {
  id: "zoho-careers",
  name: "Zoho careers (RSS)",
  type: "RSS",
  homepage: "https://careers.zohocorp.com/jobs/Careers",
  regions: ["Chennai", "Tamil Nadu", "India"],
  notes: "Zoho Recruit's public RSS feed of Zoho Corp openings. robots.txt allows /jobs/*.",

  boards: (ctx) => seedBoards("zoho-rss", ctx),

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async ({ company }) => {
      const xml = await politeFetch(`https://${company.token}/rss`, { accept: "application/rss+xml, application/xml, text/xml" });
      return parseZohoRss(xml, company);
    });
  },
};
