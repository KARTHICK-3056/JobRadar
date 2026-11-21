// Minimal RFC 9309 robots.txt parser: groups by user-agent, longest-match Allow/Disallow, * and $ wildcards.

export function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") {
      if (!lastWasAgent || !current) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (key === "allow" || key === "disallow") current.rules.push({ allow: key === "allow", path: value });
  }
  return groups;
}

function toRegex(pattern) {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split("*")
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp("^" + body + (anchored ? "$" : ""));
}

/** Is `path` allowed for `userAgent` under the parsed robots groups? */
export function isAllowed(groups, userAgent, path) {
  const ua = userAgent.toLowerCase();
  const token = ua.split(/[/\s]/)[0];
  let group = groups.find((g) => g.agents.some((a) => a !== "*" && (token.includes(a) || a.includes(token))));
  if (!group) {
    const stars = groups.filter((g) => g.agents.includes("*"));
    if (!stars.length) return true;
    group = { rules: stars.flatMap((g) => g.rules) };
  }
  let best = null;
  for (const r of group.rules) {
    if (r.path === "") continue; // "Disallow:" with empty value allows everything
    if (toRegex(r.path).test(path)) {
      if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
    }
  }
  return best ? best.allow : true;
}
