// Jobicy public remote-jobs API (jobicy.com/api/v2/remote-jobs).
import { politeFetch } from "../http.js";
import { runBoards } from "./base.js";

export default {
  id: "jobicy",
  name: "Jobicy",
  type: "Public API",
  homepage: "https://jobicy.com",
  regions: ["Remote", "Global"],
  notes: "Public JSON API (max 100 most recent remote jobs). Content-Signal search=yes.",

  boards: () => [{ key: "jobicy", label: "Jobicy" }],

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async () => {
      const data = await politeFetch("https://jobicy.com/api/v2/remote-jobs?count=100", { json: true });
      return (data.jobs ?? []).map((j) => ({
        source: "jobicy",
        source_job_id: j.id,
        source_url: j.url,
        apply_url: j.url,
        company: { name: j.companyName },
        title: j.jobTitle,
        location: `Remote · ${j.jobGeo ?? "Anywhere"}`,
        location_hints: { remote: true },
        department: (j.jobIndustry ?? [])[0],
        type_hint: (j.jobType ?? []).join(" "),
        posted_at: j.pubDate,
        description_html: j.jobDescription,
        salary: j.annualSalaryMin || j.annualSalaryMax ? { min: j.annualSalaryMin, max: j.annualSalaryMax, currency: j.salaryCurrency, period: "year" } : null,
      }));
    });
  },
};
