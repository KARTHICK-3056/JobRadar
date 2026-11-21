// Himalayas public remote-jobs API (himalayas.app/jobs/api).
import { politeFetch } from "../http.js";
import { runBoards } from "./base.js";

const PAGES = 5; // 20 per page

export default {
  id: "himalayas",
  name: "Himalayas",
  type: "Public API",
  homepage: "https://himalayas.app/jobs",
  regions: ["Remote", "Global", "Remote India"],
  notes: "Public JSON API with published salary ranges and location restrictions. robots.txt allows /jobs/api.",

  boards: () => [{ key: "himalayas", label: "Himalayas" }],

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async () => {
      const all = [];
      for (let p = 0; p < PAGES; p++) {
        const data = await politeFetch(`https://himalayas.app/jobs/api?limit=20&offset=${p * 20}`, { json: true });
        const jobs = data.jobs ?? [];
        all.push(...jobs);
        if (jobs.length < 20) break;
      }
      return all.map((j) => {
        const restr = j.locationRestrictions ?? [];
        return {
          source: "himalayas",
          source_job_id: j.guid ?? j.applicationLink,
          source_url: j.guid ?? j.applicationLink,
          apply_url: j.applicationLink ?? j.guid,
          company: { name: j.companyName },
          title: String(j.title ?? "").split(" | ")[0],
          location: restr.length ? `Remote · ${restr.join(", ")}` : "Remote · Anywhere",
          location_hints: { remote: true },
          department: (j.parentCategories ?? [])[0],
          type_hint: j.employmentType,
          tags: j.categories,
          posted_at: j.pubDate,
          description_html: j.description,
          salary: j.minSalary || j.maxSalary ? { min: j.minSalary, max: j.maxSalary, currency: j.currency, period: /month/i.test(j.salaryPeriod ?? "") ? "month" : /annual|year/i.test(j.salaryPeriod ?? "annual") ? "year" : j.salaryPeriod } : null,
        };
      });
    });
  },
};
