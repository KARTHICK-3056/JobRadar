// We Work Remotely public RSS feed.
import * as cheerio from "cheerio";
import { politeFetch } from "../http.js";
import { runBoards } from "./base.js";

export function parseWwrRss(xml) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const out = [];
  $("item").each((_, el) => {
    const full = $(el).find("title").text().trim();
    const idx = full.indexOf(":");
    const company = idx > 0 ? full.slice(0, idx).trim() : "";
    const title = idx > 0 ? full.slice(idx + 1).trim() : full;
    const link = $(el).find("link").text().trim() || $(el).find("guid").text().trim();
    const region = $(el).find("region").text().trim();
    out.push({
      source: "weworkremotely",
      source_job_id: $(el).find("guid").text().trim() || link,
      source_url: link,
      apply_url: link,
      company: { name: company },
      title,
      location: region ? `Remote · ${region}` : "Remote",
      location_hints: { remote: true },
      department: $(el).find("category").text().trim(),
      type_hint: $(el).find("type").text().trim(),
      posted_at: $(el).find("pubDate").text().trim(),
      description_html: $(el).find("description").text(),
    });
  });
  return out;
}

export default {
  id: "weworkremotely",
  name: "We Work Remotely",
  type: "RSS",
  homepage: "https://weworkremotely.com",
  regions: ["Remote", "Global"],
  notes: "Public RSS feed (weworkremotely.com/remote-jobs.rss). robots.txt allows /.",

  boards: () => [{ key: "weworkremotely", label: "We Work Remotely" }],

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async () => parseWwrRss(await politeFetch("https://weworkremotely.com/remote-jobs.rss", { accept: "application/rss+xml, text/xml" })));
  },
};
