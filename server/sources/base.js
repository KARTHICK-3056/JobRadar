// Common scaffolding for sources.
//
// Every source module default-exports an object with this interface:
//   id, name, type, homepage, regions[], notes
//   boards({ seed, region }) -> [{ key, company? }]   // units fetched independently (one per company for ATS)
//   fetch(ctx) -> Promise<NormalizedJob[]>              // ctx: { boards, region, report, progress, log }
// `ctx.report(boardKey, { ok, count, error })` records per-board results; boards that succeeded are used to
// detect closed jobs. A thrown error inside one board never escapes: see runBoards().
//
// Adding a new source = adding one file in this folder and listing it in ./index.js.
import { normalizeJob } from "../lib/normalize.js";

export async function runBoards(ctx, boards, fn) {
  const out = [];
  for (const board of boards) {
    try {
      const raws = await fn(board);
      const now = new Date().toISOString();
      const jobs = raws.map((r) => normalizeJob({ board_key: board.key, ...r }, { now })).filter(Boolean);
      ctx.report(board.key, { ok: true, count: jobs.length });
      ctx.progress?.(`${board.label ?? board.key}: ${jobs.length} jobs`);
      out.push(...jobs);
    } catch (err) {
      ctx.report(board.key, { ok: false, error: err.message, blocked: err.code === "ROBOTS_DISALLOWED" });
      ctx.progress?.(`${board.label ?? board.key}: failed (${err.message})`);
      ctx.log?.warn("source.board_failed", { board: board.key, err: err.message });
    }
  }
  return out;
}

/** Boards for ATS sources: seed companies of this ATS, narrowed for India regions to India-relevant boards. */
export function seedBoards(ats, { seed, region, indiaBoards }) {
  const list = seed.filter((c) => c.ats === ats);
  const narrowed =
    region && region.kind !== "global" && region.india
      ? list.filter((c) => c.india || indiaBoards?.has(`${ats}:${c.token}`))
      : list;
  return narrowed.map((c) => ({ key: `${ats}:${c.token}`, label: `${c.name} (${ats})`, company: c }));
}
