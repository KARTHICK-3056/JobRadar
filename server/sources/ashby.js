// Ashby public job board API: https://developers.ashbyhq.com/docs/public-job-posting-api
import { politeFetch } from "../http.js";
import { runBoards, seedBoards } from "./base.js";

const TYPE = { FullTime: "Full-time", PartTime: "Part-time", Intern: "Internship", Contract: "Contract", Temporary: "Contract" };

export default {
  id: "ashby",
  name: "Ashby job boards",
  type: "ATS API",
  homepage: "https://developers.ashbyhq.com/docs/public-job-posting-api",
  regions: ["India", "Global"],
  notes: "Public posting API with published compensation (api.ashbyhq.com/posting-api). No robots.txt restrictions.",

  boards: (ctx) => seedBoards("ashby", ctx),

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async ({ company }) => {
      const data = await politeFetch(
        `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(company.token)}?includeCompensation=true`,
        { json: true },
      );
      return (data.jobs ?? [])
        .filter((j) => j.isListed !== false)
        .map((j) => {
          const comp = (j.compensation?.summaryComponents ?? []).find((c) => c.compensationType === "Salary" && (c.minValue || c.maxValue));
          const addr = j.address?.postalAddress ?? {};
          const locs = [j.location, ...(j.secondaryLocations ?? []).map((s) => s.location)].filter(Boolean);
          return {
            source: "ashby",
            source_job_id: j.id,
            source_url: j.jobUrl,
            apply_url: j.applyUrl ?? j.jobUrl,
            company: { id: company.id, name: company.name },
            title: j.title,
            location: [...new Set(locs)].join(" | "),
            location_hints: { remote: j.isRemote || j.workplaceType === "Remote", country: addr.addressCountry, city: addr.addressLocality },
            department: j.department ?? j.team,
            type_hint: TYPE[j.employmentType] ?? j.employmentType,
            posted_at: j.publishedAt,
            description_html: j.descriptionHtml,
            salary: comp
              ? { min: comp.minValue, max: comp.maxValue, currency: comp.currencyCode, period: /month/i.test(comp.interval ?? "") ? "month" : /year/i.test(comp.interval ?? "") ? "year" : comp.interval }
              : null,
          };
        });
    });
  },
};
