import arbeitnow from "./arbeitnow.js";
import ashby from "./ashby.js";
import greenhouse from "./greenhouse.js";
import hackernews from "./hackernews.js";
import himalayas from "./himalayas.js";
import jobicy from "./jobicy.js";
import jsonld from "./jsonld.js";
import lever from "./lever.js";
import remoteok from "./remoteok.js";
import weworkremotely from "./weworkremotely.js";
import zoho from "./zoho.js";

/** Registered sources, in priority order (earlier = more authoritative when the same job appears twice). */
export const SOURCES = [greenhouse, lever, ashby, zoho, jsonld, remoteok, weworkremotely, himalayas, jobicy, hackernews, arbeitnow];

export const sourcePriority = (id) => {
  const i = SOURCES.findIndex((s) => s.id === id);
  return i < 0 ? 99 : i;
};

/** Which sources to run for a region. India regions skip Europe-only boards. */
export function sourcesForRegion(region) {
  return SOURCES.filter((s) => {
    if (s.enabled && !s.enabled()) return false;
    if (region.india && s.id === "arbeitnow") return false;
    return true;
  });
}

/** Sites we deliberately do not scrape, shown on the Sources page. */
export const NOT_SCRAPED = [
  { name: "LinkedIn", reason: "Terms of service forbid automated access; robots.txt requires written permission." },
  { name: "Naukri", reason: "Terms forbid scraping and the site actively blocks bots." },
  { name: "Indeed", reason: "Terms forbid scraping; aggressive bot protection." },
  { name: "Glassdoor", reason: "Terms forbid scraping; content is behind login walls." },
  { name: "Wellfound (AngelList Talent)", reason: "Actively blocks automated clients; job data requires a logged-in session." },
  { name: "Internshala", reason: "robots.txt disallows internship/job search and detail pages." },
  { name: "Cutshort", reason: "robots.txt disallows job pages (/view/j/, /vj/)." },
  { name: "Instahyre", reason: "Listings are only served to logged-in candidates." },
  { name: "SmartRecruiters API", reason: "api.smartrecruiters.com robots.txt disallows all bots except LinkedInBot. This rules out Freshworks and Swiggy, which hire through it." },
  { name: "Remotive API", reason: "remotive.com robots.txt disallows /api/*." },
];
