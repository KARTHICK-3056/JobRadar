// Structured JSON-lines logger. One line per event, easy to grep or ship to a log store.
import { config } from "./config.js";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const min = LEVELS[config.logLevel] ?? 20;

function emit(level, msg, fields = {}) {
  if ((LEVELS[level] ?? 20) < min) return;
  const rec = { ts: new Date().toISOString(), level, msg, ...fields };
  if (fields.err instanceof Error) rec.err = { message: fields.err.message, stack: fields.err.stack?.split("\n").slice(0, 4).join(" | ") };
  const line = JSON.stringify(rec);
  if (level === "error" || level === "warn") process.stderr.write(line + "\n");
  else process.stdout.write(line + "\n");
}

export const log = {
  debug: (m, f) => emit("debug", m, f),
  info: (m, f) => emit("info", m, f),
  warn: (m, f) => emit("warn", m, f),
  error: (m, f) => emit("error", m, f),
  child: (base) => ({
    debug: (m, f) => emit("debug", m, { ...base, ...f }),
    info: (m, f) => emit("info", m, { ...base, ...f }),
    warn: (m, f) => emit("warn", m, { ...base, ...f }),
    error: (m, f) => emit("error", m, { ...base, ...f }),
  }),
};
