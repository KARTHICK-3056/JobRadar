import express from "express";
import multer from "multer";
import { getDb } from "./db.js";
import { getFx } from "./lib/fx.js";
import { REGIONS } from "./lib/locations.js";
import { analyzeResume, ResumeError, resumeToText } from "./lib/resume.js";
import { canonicalSkill } from "./lib/skills.js";
import { log } from "./logger.js";
import { getRun, isScraping, startScrape } from "./scrape.js";
import { NOT_SCRAPED } from "./sources/index.js";
import { companies, getJobDetail, queryJobs, sourcesView, stats } from "./store.js";

const list = (v) =>
  (Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [])
    .map((s) => String(s).trim())
    .filter(Boolean);

/** Resume profile travels with each request (skills live on the device, never on the server). */
function profileFrom(q) {
  const skills = list(q.skills).map(canonicalSkill).filter(Boolean);
  if (!skills.length) return null;
  return { skills, seniority: q.seniority || null, wantsInternship: q.intern === "1" || q.intern === "true" };
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "200kb" }));

  // Structured access log
  app.use((req, res, next) => {
    const t = Date.now();
    res.on("finish", () => {
      if (req.path === "/health") return;
      log.info("http", { method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - t });
    });
    next();
  });

  app.get("/health", (_req, res) => {
    try {
      const db = getDb();
      const jobs = db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE status='open'").get().n;
      const lastRun = db.prepare("SELECT status, finished_at FROM scrape_runs ORDER BY started_at DESC LIMIT 1").get();
      res.json({ status: "ok", uptime_s: Math.round(process.uptime()), open_jobs: jobs, scraping: isScraping(), last_run: lastRun ?? null });
    } catch (err) {
      res.status(503).json({ status: "error", error: err.message });
    }
  });

  const api = express.Router();

  api.get("/regions", (_req, res) => res.json({ default: "Chennai", regions: REGIONS.map(({ id, label, group, kind, aliases }) => ({ id, label, group, kind, aliases: aliases ?? [] })) }));

  api.get("/jobs", (req, res) => {
    const q = req.query;
    res.json(
      queryJobs({
        q: q.q,
        location: q.location,
        category: q.category,
        remote: q.remote === "true" || q.remote === "1",
        types: list(q.type ?? q.types),
        levels: list(q.level ?? q.levels),
        minSalaryLpa: q.minSalary,
        sort: q.sort,
        page: q.page,
        pageSize: q.pageSize ?? q.limit,
        ids: list(q.ids),
        profile: profileFrom(q),
      }),
    );
  });

  api.get("/jobs/:id", (req, res) => {
    const job = getJobDetail(req.params.id, { location: req.query.location, profile: profileFrom(req.query) });
    if (!job) return res.status(404).json({ error: "not_found" });
    res.json(job);
  });

  api.get("/stats", (req, res) => res.json(stats({ location: req.query.location })));
  api.get("/companies", (req, res) => res.json(companies({ location: req.query.location, limit: req.query.limit })));
  api.get("/sources", (_req, res) => res.json({ sources: sourcesView(), not_scraped: NOT_SCRAPED, last_run: getRun(null) && summarizeRun(getRun(null)) }));

  api.post("/scrape", (req, res) => {
    const region = req.query.region ?? req.body?.region ?? "Global";
    const { run, alreadyRunning } = startScrape(region, "user");
    res.status(202).json({ id: run.id, region: run.region, status: run.status, already_running: alreadyRunning });
  });

  api.get("/scrape/status", (req, res) => {
    const run = getRun(req.query.id || null);
    if (!run) return res.status(404).json({ error: "no_runs" });
    res.json(summarizeRun(run));
  });

  // Server-sent events stream of scrape progress.
  api.get("/scrape/stream", (req, res) => {
    const id = req.query.id;
    res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.flushHeaders();
    let sent = 0;
    const tick = () => {
      const run = getRun(id || null);
      if (!run) return;
      const lines = run.progress.slice(sent);
      sent = run.progress.length;
      for (const l of lines) res.write(`event: progress\ndata: ${JSON.stringify(l)}\n\n`);
      if (run.status !== "running") {
        res.write(`event: done\ndata: ${JSON.stringify(summarizeRun(run))}\n\n`);
        clearInterval(timer);
        res.end();
      }
    };
    const timer = setInterval(tick, 800);
    tick();
    req.on("close", () => clearInterval(timer));
  });

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  api.post("/resume", (req, res) => {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        const msg = err.code === "LIMIT_FILE_SIZE" ? "That file is larger than 5 MB." : "Upload failed. Please try again.";
        return res.status(400).json({ error: msg, code: err.code ?? "UPLOAD_FAILED" });
      }
      if (!req.file) return res.status(400).json({ error: "Attach a PDF, DOCX or TXT resume as the 'file' field.", code: "NO_FILE" });
      try {
        const text = await resumeToText(req.file.buffer, req.file.originalname, req.file.mimetype);
        const result = analyzeResume(text);
        if (!result.skills.length) {
          return res.status(422).json({ error: "We read your resume but didn't recognise any skills. You can add them by hand.", code: "NO_SKILLS", ...result });
        }
        // The file buffer is dropped here; nothing is written to disk or the DB.
        res.json(result);
      } catch (e) {
        if (e instanceof ResumeError) return res.status(422).json({ error: e.message, code: e.code });
        log.error("resume.failed", { err: e });
        res.status(500).json({ error: "Something went wrong reading that file.", code: "INTERNAL" });
      }
    });
  });

  api.get("/fx", async (_req, res) => {
    const fx = await getFx();
    if (!fx) return res.status(503).json({ error: "No exchange rates available yet." });
    res.json({ base: "USD", usd_inr: fx.rates.INR, rates: fx.rates, provider: fx.provider, fetched_at: fx.fetchedAt, stale: fx.stale });
  });

  app.use("/api", api);
  app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));
  app.use((err, _req, res, _next) => {
    log.error("http.unhandled", { err });
    res.status(500).json({ error: "internal_error" });
  });
  return app;
}

function summarizeRun(run) {
  return {
    id: run.id,
    region: run.region,
    trigger: run.trigger,
    status: run.status,
    started_at: run.started_at,
    finished_at: run.finished_at,
    progress: run.progress.slice(-40),
    stats: run.stats,
  };
}
