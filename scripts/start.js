// One command to run everything: the API (127.0.0.1:API_PORT) and the frontend on :8080,
// which proxies /api and /health to the API. Ctrl+C stops both.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";

if (!fs.existsSync(path.join(root, "frontend", "node_modules"))) {
  console.error("frontend/node_modules is missing. Run `npm install` in the project root first.");
  process.exit(1);
}

const procs = [];
function run(name, cmd, args, opts = {}) {
  const p = spawn(cmd, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"], shell: isWin, env: process.env, ...opts });
  const tag = (s) => s.toString().split(/\r?\n/).filter(Boolean).map((l) => `[${name}] ${l}`).join("\n") + "\n";
  p.stdout.on("data", (d) => process.stdout.write(tag(d)));
  p.stderr.on("data", (d) => process.stderr.write(tag(d)));
  p.on("exit", (code) => {
    console.log(`[${name}] exited with code ${code}`);
    shutdown(code ?? 0);
  });
  procs.push(p);
}

let stopping = false;
function shutdown(code) {
  if (stopping) return;
  stopping = true;
  for (const p of procs) {
    try {
      if (isWin) spawn("taskkill", ["/pid", String(p.pid), "/T", "/F"], { stdio: "ignore" });
      else p.kill("SIGTERM");
    } catch {}
  }
  setTimeout(() => process.exit(code), 500);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("api", process.execPath, ["--disable-warning=ExperimentalWarning", "server/index.js"], { shell: false });
run("web", "npm", ["--prefix", "frontend", "run", "dev"]);
