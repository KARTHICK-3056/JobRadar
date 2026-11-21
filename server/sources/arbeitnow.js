// Arbeitnow public job board API (Europe-focused, many English-speaking roles in Germany).
import { politeFetch } from "../http.js";
import { runBoards } from "./base.js";

export default {
  id: "arbeitnow",
  name: "Arbeitnow",
  type: "Public API",
  homepage: "https://www.arbeitnow.com",
  regions: ["Germany", "Europe", "Remote"],
  notes: "Public JSON API (arbeitnow.com/api/job-board-api). robots.txt allows everything.",

  boards: () => [{ key: "arbeitnow", label: "Arbeitnow" }],

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async () => {
      const out = [];
      let url = "https://www.arbeitnow.com/api/job-board-api";
      for (let i = 0; i < 2 && url; i++) {
        const data = await politeFetch(url, { json: true });
        out.push(...(data.data ?? []));
        url = data.links?.next ?? null;
      }
      return out.map((j) => ({
        source: "arbeitnow",
        source_job_id: j.slug,
        source_url: j.url,
        apply_url: j.url,
        company: { name: j.company_name },
        title: j.title,
        location: [j.location, j.remote ? "Remote" : null].filter(Boolean).join(" · "),
        location_hints: { remote: j.remote, country: /germany|deutschland|berlin|münchen|munich|hamburg|frankfurt|köln|cologne|stuttgart|düsseldorf/i.test(j.location ?? "") ? "Germany" : undefined },
        type_hint: (j.job_types ?? []).join(" "),
        tags: j.tags,
        posted_at: j.created_at,
        description_html: j.description,
      }));
    });
  },
};
