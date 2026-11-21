// Hacker News "Ask HN: Who is hiring?" via the official Algolia HN API (hn.algolia.com, no robots restrictions).
// Comments follow a loose convention: "Company | Role | Location | REMOTE | ...". We only keep comments where
// we can confidently identify a company, a role and a location, and we never invent missing fields.
import * as cheerio from "cheerio";
import { politeFetch } from "../http.js";
import { parseLocation } from "../lib/locations.js";
import { runBoards } from "./base.js";

const ROLE_RE = /\b(engineer|developer|scientist|designer|manager|analyst|architect|intern|sre|devops|lead|researcher|specialist|founding|head of|director|programmer|consultant|swe|full[- ]?stack|front[- ]?end|back[- ]?end|ml|data)\b/i;

export function parseHnComment(c) {
  if (!c?.text) return null;
  const $ = cheerio.load(`<div>${c.text}</div>`);
  const firstLine = ($("div").contents().first().text() || $("div").text().split("\n")[0] || "").trim();
  const parts = firstLine.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const company = parts[0].replace(/\(.*?\)/g, "").replace(/https?:\/\/\S+/g, "").trim();
  if (!company || company.length > 60) return null;
  const rest = parts.slice(1);
  const role = rest.find((p) => ROLE_RE.test(p) && p.length < 120);
  const locPart = rest.find((p) => p !== role && (parseLocation(p).countries.length || parseLocation(p).isRemote || /onsite|hybrid/i.test(p)));
  if (!role || !locPart) return null;
  const remotePart = rest.find((p) => /\bremote\b/i.test(p));
  const location = [locPart, remotePart && remotePart !== locPart ? remotePart : null].filter(Boolean).join(" · ");
  const url = `https://news.ycombinator.com/item?id=${c.id}`;
  return {
    source: "hackernews",
    source_job_id: c.id,
    source_url: url,
    apply_url: url,
    company: { name: company },
    title: role.split(/,| and |\/|;/)[0].replace(/^\s*(hiring|roles?:)\s*/i, "").trim(),
    location,
    posted_at: c.created_at,
    description_html: c.text,
  };
}

export default {
  id: "hackernews",
  name: "HN: Who is hiring?",
  type: "Public API",
  homepage: "https://news.ycombinator.com/submitted?id=whoishiring",
  regions: ["Global", "Remote"],
  notes: "Top-level comments of the latest monthly thread, via hn.algolia.com. Only well-formed 'Company | Role | Location' posts are kept.",

  boards: () => [{ key: "hackernews", label: "HN Who is hiring" }],

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async () => {
      const search = await politeFetch("https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=6", { json: true });
      const thread = (search.hits ?? []).find((h) => /who is hiring/i.test(h.title));
      if (!thread) return [];
      const item = await politeFetch(`https://hn.algolia.com/api/v1/items/${thread.objectID}`, { json: true });
      return (item.children ?? []).map(parseHnComment).filter(Boolean);
    });
  },
};
