import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Ban, Globe2 } from "lucide-react";
import { CompanyLogo } from "@/components/site/company-logo";
import { useSources, type SourceRow } from "@/lib/api";
import { toneFor } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Sources — JobRadar" },
      { name: "description", content: "Where JobRadar's listings come from, how fresh they are, and which sites we deliberately don't scrape." },
      { property: "og:title", content: "Sources — JobRadar" },
      { property: "og:description", content: "Every job on JobRadar comes from a public, scrape-friendly source." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SourcesPage,
});

const STATUS: Record<SourceRow["status"], { label: string; cls: string }> = {
  healthy: { label: "Healthy", cls: "bg-highlight text-highlight-foreground" },
  degraded: { label: "Partly failing", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  failing: { label: "Failing", cls: "bg-destructive/15 text-destructive" },
  blocked: { label: "Blocked by robots.txt", cls: "bg-destructive/15 text-destructive" },
  pending: { label: "Not run yet", cls: "bg-muted text-muted-foreground" },
};

function ago(iso: string | null) {
  if (!iso) return "never";
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

function SourcesPage() {
  const { data, isPending } = useSources();
  const sources = data?.sources ?? [];
  const total = sources.reduce((a, s) => a + s.jobs_indexed, 0);

  return (
    <div className="container-page pt-10 md:pt-14">
      <h1 className="font-display text-5xl md:text-6xl">Where our jobs come from</h1>
      <p className="mt-2 max-w-lg text-muted-foreground">
        {isPending ? "Loading sources..." : `${total.toLocaleString("en-IN")} open roles from ${sources.length} public sources, refreshed every few hours.`}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s) => {
          const st = STATUS[s.status] ?? STATUS.pending;
          return (
            <a
              key={s.id}
              href={s.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <CompanyLogo company={{ name: s.name, tone: toneFor(s.id) }} />
                <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{s.name}</h2>
              <p className="text-sm text-muted-foreground">
                {s.type} · {s.regions.join(", ")}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">{s.notes}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-muted px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Last success</dt>
                  <dd className="font-semibold">{ago(s.last_success_at)}</dd>
                </div>
                <div className="rounded-xl bg-muted px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{s.companies > 1 ? "Companies" : "India roles"}</dt>
                  <dd className="font-semibold">{s.companies > 1 ? s.companies : s.india_jobs}</dd>
                </div>
              </dl>
              {s.last_error && s.status !== "healthy" && (
                <p className="mt-3 line-clamp-2 text-xs text-destructive">Last error: {s.last_error}</p>
              )}
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
                <span className="rounded-full bg-highlight px-2.5 py-1 font-semibold text-highlight-foreground">
                  {s.jobs_indexed.toLocaleString("en-IN")} {s.jobs_indexed === 1 ? "job" : "jobs"} indexed
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <Globe2 className="size-6 text-foreground" />
          <h2 className="mt-5 text-lg font-semibold">How we collect data</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>We only use public job-board APIs, RSS feeds and careers pages that are meant to be read by machines.</li>
            <li>Before every request we check the site's robots.txt and skip anything it disallows.</li>
            <li>We identify ourselves with an honest User-Agent, wait between requests to the same site, cache responses, and back off on errors.</li>
            <li>Salaries are shown only when the employer published them. We never estimate pay or add placeholder jobs.</li>
            <li>When a listing disappears from its source we mark it closed and keep its version history.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Ban className="size-6 text-foreground" />
          <h2 className="mt-5 text-lg font-semibold">Sites we intentionally don't scrape</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            {(data?.not_scraped ?? []).map((n) => (
              <li key={n.name}>
                <span className="font-medium text-foreground">{n.name}</span>
                <span className="text-muted-foreground"> — {n.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
