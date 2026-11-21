// Greenhouse public Job Board API: https://developers.greenhouse.io/job-board.html
import { politeFetch } from "../http.js";
import { runBoards, seedBoards } from "./base.js";

const API = "https://boards-api.greenhouse.io/v1/boards";

export default {
  id: "greenhouse",
  name: "Greenhouse job boards",
  type: "ATS API",
  homepage: "https://developers.greenhouse.io/job-board.html",
  regions: ["India", "Global"],
  notes: "Public Job Board API, one request per company board (boards-api.greenhouse.io). robots.txt only disallows /embed/.",

  boards: (ctx) => seedBoards("greenhouse", ctx),

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async ({ company }) => {
      const data = await politeFetch(`${API}/${encodeURIComponent(company.token)}/jobs?content=true`, { json: true });
      // Board intro text is the company's own description of itself.
      try {
        const board = await politeFetch(`${API}/${encodeURIComponent(company.token)}`, { json: true, cacheTtlMs: 24 * 3600e3 });
        if (board?.content) ctx.companyInfo?.(company.id, { description_html: board.content, description_source: "Greenhouse board" });
      } catch {
        /* optional */
      }
      return (data.jobs ?? []).map((j) => {
        const officeLocs = (j.offices ?? []).map((o) => o.location || o.name).filter(Boolean);
        const meta = Object.fromEntries((j.metadata ?? []).filter((m) => m.value != null).map((m) => [m.name, m.value]));
        const typeHint = Object.entries(meta).find(([k]) => /employment|job type|time type|worker type/i.test(k))?.[1];
        return {
          source: "greenhouse",
          source_job_id: j.id,
          source_url: j.absolute_url,
          apply_url: j.absolute_url,
          company: { id: company.id, name: company.name },
          title: j.title,
          location: [j.location?.name, ...officeLocs].filter(Boolean).join(" | "),
          department: j.departments?.[0]?.name,
          type_hint: Array.isArray(typeHint) ? typeHint.join(" ") : typeHint,
          posted_at: j.first_published ?? j.updated_at,
          description_html: j.content,
        };
      });
    });
  },
};
