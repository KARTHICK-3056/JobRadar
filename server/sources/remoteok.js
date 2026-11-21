// Remote OK public JSON API. Their terms ask for a link back to the original listing, which we always keep.
import { politeFetch } from "../http.js";
import { runBoards } from "./base.js";

export default {
  id: "remoteok",
  name: "Remote OK",
  type: "Public API",
  homepage: "https://remoteok.com",
  regions: ["Remote", "Global"],
  notes: "remoteok.com/api. Content-Signal search=yes. Every job links back to Remote OK, as their API terms require.",

  boards: () => [{ key: "remoteok", label: "Remote OK" }],

  async fetch(ctx) {
    return runBoards(ctx, ctx.boards, async () => {
      const data = await politeFetch("https://remoteok.com/api", { json: true });
      return (Array.isArray(data) ? data : [])
        .filter((j) => j && j.id && j.position)
        .map((j) => ({
          source: "remoteok",
          source_job_id: j.id,
          source_url: j.url,
          apply_url: j.url, // apply_url on Remote OK redirects through their tracker; link to the listing itself
          company: { name: j.company },
          title: j.position,
          location: j.location ? `Remote · ${j.location}` : "Remote",
          location_hints: { remote: true },
          tags: j.tags,
          posted_at: j.date ?? j.epoch,
          description_html: j.description,
          // Remote OK publishes annual USD salary ranges when the employer provides them (0 means none).
          salary: j.salary_min > 0 || j.salary_max > 0 ? { min: j.salary_min || j.salary_max, max: j.salary_max || j.salary_min, currency: "USD", period: "year" } : null,
        }));
    });
  },
};
