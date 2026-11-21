# JobRadar

Versioned change-tracking for student jobs and internships. Every listing is a **real** posting fetched from a
public, scrape-friendly source. There is no mock, placeholder or seeded job data anywhere in the app.

- **Frontend**: TanStack Start + React 19 + Tailwind v4 (`frontend/`). Served on **http://localhost:8080**.
- **Backend**: Node 22 + Express (`server/`), SQLite via Node's built-in `node:sqlite`, node-cron scheduler.
  Runs on `127.0.0.1:8787`. The frontend dev server proxies `/api` and `/health` to it, so everything is reachable on port 8080.

## Run it

Requirements: **Node.js 22.13+** (for the built-in `node:sqlite`).

```bash
npm install        # installs backend deps, then frontend deps (postinstall)
cp .env.example .env   # optional, defaults are fine
npm start          # API + frontend, open http://localhost:8080
```

On first boot (empty DB) the server scrapes **Chennai** first, then **Global**. Chennai takes about a minute and
Global about 3–4 minutes, because every site is fetched politely with per-domain delays. The UI is usable while it runs.

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Unit + pipeline tests (`node:test`): skills, city aliases, currency/LPA, scoring, normalizer, dedupe, versioning, robots.txt, source parsers |
| `npm run scrape -- Chennai Global` | One-off scrape from the CLI, prints per-source counts |
| `npm run verify-companies` | Re-checks every board token in `server/data/companies.json` (`-- --write` drops dead ones) |
| `npm run api` | API only (port 8787) |
| `curl localhost:8080/health` | Health check (open jobs, scrape state, last run) |

## Data sources

Each source is one file in `server/sources/` implementing the same interface
(`boards()` → units to fetch, `fetch(ctx)` → normalized jobs[]). A failing board or source is isolated and
logged, and never crashes the app. To add a source, add a file and list it in `server/sources/index.js`.

| Source | Type | Coverage |
| --- | --- | --- |
| Greenhouse (`boards-api.greenhouse.io`) | ATS API | 58 companies incl. Razorpay, Groww, InMobi, Druva, HighRadius, Zuora, FourKites, slice, Stripe, Databricks… |
| Lever (`api.lever.co`) | ATS API | CRED, Meesho, Paytm, Zeta, Mindtickle, Pocket FM, Porter, Fi, Spotify, Palantir, Toptal |
| Ashby (`api.ashbyhq.com`) | ATS API | Sarvam AI, Atlan, Plane, SigNoz, OpenAI, Notion, Snowflake, Ramp… (incl. published compensation) |
| Zoho Careers | RSS | Zoho Corp (Chennai / Tamil Nadu) |
| Remote OK, We Work Remotely, Himalayas, Jobicy | Public API / RSS | Remote roles |
| HN "Who is hiring?" (Algolia API) | Public API | Well-formed `Company \| Role \| Location` posts |
| Arbeitnow | Public API | Europe / Germany |
| Company careers pages (schema.org `JobPosting` JSON-LD) | Careers page | Configure in `server/data/careers-pages.json` (empty by default, see below) |

**Not scraped, on purpose** (also listed on the `/sources` page): LinkedIn, Naukri, Indeed, Glassdoor (terms forbid it),
Wellfound (blocks bots), Internshala and Cutshort (robots.txt disallows job pages), Instahyre (login-only),
the SmartRecruiters API (its robots.txt disallows all bots, which rules out Freshworks and Swiggy), and the Remotive API (robots.txt disallows `/api/`).

Politeness: every request first checks robots.txt (`server/robots.js`), sends an honest `User-Agent` (set it in `.env`),
waits `PER_DOMAIN_DELAY_MS` between hits to the same host, caches responses for 15 minutes, and retries 429/5xx with
exponential backoff (honouring `Retry-After`).

## How it works

- **Normalization** (`server/lib/normalize.js`): one schema for every job. Fields: title, company, initials, city/country (with
  aliases such as Bangalore→Bengaluru, Gurgaon→Gurugram, Bombay→Mumbai), remote flag, job type, seniority, category
  (keyword rules), skills (dictionary of ~200 skills with synonyms such as JS, k8s and Node), salary, posted date, description,
  apply URL, source and source URL, scraped_at and a content hash.
- **Salary**: only what the posting publishes, either from structured ATS fields or an explicit range in the text that sits next to
  pay words (not deal sizes or funding). Implausible values are dropped, never "fixed". No salary shows as "Salary not disclosed".
- **Dedupe & versions**: jobs are keyed by a hash of title + company + location across sources. The more authoritative
  source wins (ATS beats feeds). Changes to salary, title, location, type or description create a row in `job_versions`.
  Jobs that disappear from a board that was fetched successfully are marked **closed**, and they are reopened if they come back.
  `first_seen` and `last_seen` are tracked.
- **Regions** (`server/lib/locations.js`): Global (top results, ranked by recency + data quality), India (all), Remote,
  Remote (India), 24 Indian cities incl. Delhi NCR (Delhi, Gurugram, Noida), plus global countries and cities. Thin Indian
  cities (< 5 roles) fall back to India (all) + Remote India, and the UI says so.
- **Currency** (`server/lib/fx.js`, `server/lib/salary.js`): live USD rates from open.er-api.com (frankfurter.app as fallback),
  cached 12 h in SQLite with the last known rates kept as a fallback. India regions show `₹6 - ₹10 LPA (~$7k - $12k)`,
  everywhere else shows USD (`$60k - $90k`). "Top salary" sorts on normalized annual USD, with undisclosed salaries last.
- **Resume matching**: `POST /api/resume` (PDF/DOCX/TXT, ≤ 5 MB) is parsed in memory and never stored. It returns skills,
  years of experience and seniority. Skills are kept in `localStorage` as editable chips and sent with job queries. The score
  is weighted skill overlap (title skills ×2, discounted for postings that list very few skills) plus small boosts for seniority
  and internships.
- **Scheduler**: refreshes everything every 4 h (`REFRESH_CRON`) and FX twice a day. `POST /api/scrape?region=` runs a
  targeted scrape in the background. Progress is available via `GET /api/scrape/status?id=` (polling) or
  `GET /api/scrape/stream?id=` (SSE).

## API

```
GET  /api/jobs?q=&location=&category=&remote=&type=&level=&minSalary=&sort=newest|salary|match&page=&pageSize=&skills=&ids=
GET  /api/jobs/:id?location=           (includes description blocks + version history)
GET  /api/stats?location=              (role count, category counts, hub counts)
GET  /api/companies?location=&limit=
GET  /api/sources
GET  /api/regions
POST /api/scrape?region=
GET  /api/scrape/status?id=   |   GET /api/scrape/stream?id=   (SSE)
POST /api/resume                        (multipart field "file")
GET  /api/fx
GET  /health
```

## Layout

```
server/
  index.js            boot, scheduler, initial scrape
  app.js              Express routes
  scrape.js           orchestrator: upsert, dedupe, versions, close detection, source health
  store.js            in-memory index of open jobs + queries (region, filters, sort, fallback, match)
  http.js robots.js   polite fetch (robots, UA, per-domain delay, cache, retries)
  lib/                locations, skills, classify, salary, fx, normalize, match, resume
  sources/            one file per source
  data/companies.json verified board tokens (India + global)
frontend/             unchanged design; data now comes from /api (src/lib/api.ts)
tests/                node:test suites
```
