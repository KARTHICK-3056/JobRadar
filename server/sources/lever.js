// Lever public Postings API: https://github.com/lever/postings-api
import { politeFetch } from "../http.js";
import { runBoards, seedBoards } from "./base.js";

export default {
  id: "lever",
  name: "Lever job boards",
  type: "ATS API",
  homepage: "https://github.com/lever/postings-api",
  regions: ["India", "Global"],
  notes: "Public Postings API (api.lever.co/v0/postings). robots.txt allows all with Crawl-delay: 1, which we honour.",

  boards: (ctx) => seedBoards("lever", ctx),

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async ({ company }) => {
      const data = await politeFetch(`https://api.lever.co/v0/postings/${encodeURIComponent(company.token)}?mode=json`, { json: true });
      return (Array.isArray(data) ? data : []).map((p) => {
        const c = p.categories ?? {};
        const lists = (p.lists ?? []).map((l) => `<h3>${l.text}</h3><ul>${l.content}</ul>`).join("");
        const sr = p.salaryRange;
        return {
          source: "lever",
          source_job_id: p.id,
          source_url: p.hostedUrl,
          apply_url: p.applyUrl ?? p.hostedUrl,
          company: { id: company.id, name: company.name },
          title: p.text,
          location: [...new Set([c.location, ...(c.allLocations ?? [])].filter(Boolean))].join(" | "),
          location_hints: { remote: p.workplaceType === "remote", country: p.country },
          department: c.team ?? c.department,
          type_hint: c.commitment,
          posted_at: p.createdAt,
          description_html: `${p.description ?? ""}${lists}${p.additional ?? ""}`,
          salary: sr ? { min: sr.min, max: sr.max, currency: sr.currency, period: /month/i.test(sr.interval ?? "") ? "month" : /year|annual/i.test(sr.interval ?? "") ? "year" : sr.interval } : null,
        };
      });
    });
  },
};
