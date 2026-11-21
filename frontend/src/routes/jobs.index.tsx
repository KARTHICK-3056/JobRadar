import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X, SearchX, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SearchBar } from "@/components/site/search-bar";
import { JobCard } from "@/components/site/job-card";
import { ResumeUpload } from "@/components/site/resume-upload";
import { categories, jobTypes, levels, type JobType, type Level } from "@/lib/jobs";
import { scrapeStatus, startScrape, useInfiniteJobs, useRegions } from "@/lib/api";
import { regionId, useRegion } from "@/lib/use-region";
import { useResume } from "@/lib/use-resume";
import { cn } from "@/lib/utils";

type Sort = "newest" | "salary" | "match";

export interface JobsSearch {
  q?: string | undefined;
  location?: string | undefined;
  category?: string | undefined;
  types?: JobType[] | undefined;
  levels?: Level[] | undefined;
  remote?: boolean | undefined;
  minSalary?: number | undefined;
  sort?: Sort | undefined;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);

export const Route = createFileRoute("/jobs/")({
  validateSearch: (s: Record<string, unknown>): JobsSearch => {
    return {
      q: str(s["q"]),
      // No location in the URL means "use the region remembered on this device" (default Chennai).
      location: str(s["location"]),
      category: str(s["category"]),
      types: Array.isArray(s["types"]) ? (s["types"].filter((t) => jobTypes.includes(t)) as JobType[]) : undefined,
      levels: Array.isArray(s["levels"]) ? (s["levels"].filter((l) => levels.includes(l)) as Level[]) : undefined,
      remote: s["remote"] === true || s["remote"] === "true" ? true : undefined,
      minSalary: typeof s["minSalary"] === "number" ? s["minSalary"] : undefined,
      sort: s["sort"] === "salary" ? "salary" : s["sort"] === "match" ? "match" : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Find jobs — JobRadar" },
      { name: "description", content: "Search and filter verified roles by field, job type, level, salary (LPA) and location across India." },
      { property: "og:title", content: "Find jobs — JobRadar" },
      { property: "og:description", content: "Search and filter verified roles by field, job type, level, salary (LPA) and location across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

const salarySteps = [0, 6, 10, 15, 25, 40];

function JobsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { region, setRegion } = useRegion();
  const { profile } = useResume();
  const { data: regionData } = useRegions();
  const [showFilters, setShowFilters] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // A location in the URL is a region choice: remember it on this device.
  useEffect(() => {
    if (search.location) setRegion(search.location === "all" ? "Global" : search.location);
  }, [search.location, setRegion]);
  useEffect(() => () => (pollRef.current ? clearInterval(pollRef.current) : undefined), []);

  const location = search.location ? regionId(search.location) : region;
  const locationLabel = regionData?.regions.find((r) => r.id === location)?.label ?? location;
  const sort: Sort = search.sort === "match" && !profile ? "newest" : (search.sort ?? (profile ? "match" : "newest"));

  const jobsQuery = useInfiniteJobs(
    {
      q: search.q,
      location,
      category: search.category,
      remote: search.remote,
      types: search.types,
      levels: search.levels,
      minSalary: search.minSalary,
      sort,
      pageSize: 30,
    },
    profile,
  );
  const first = jobsQuery.data?.pages[0];
  const results = jobsQuery.data?.pages.flatMap((p) => p.jobs) ?? [];
  const total = first?.total ?? 0;

  const update = (patch: Partial<JobsSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  const runScrape = async () => {
    setIsScraping(true);
    setScrapeMessage(null);
    try {
      const { id } = await startScrape(location);
      pollRef.current = setInterval(async () => {
        try {
          const run = await scrapeStatus(id);
          const last = run.progress.at(-1)?.msg;
          if (last) setScrapeMessage(last);
          if (run.status !== "running") {
            if (pollRef.current) clearInterval(pollRef.current);
            setIsScraping(false);
            await queryClient.invalidateQueries();
            const n = run.stats.inserted ?? 0;
            setScrapeMessage(`Scraped live: ${n} new verified ${n === 1 ? "opportunity" : "opportunities"} for ${locationLabel}`);
            if (run.status === "done") toast.success(`Live scrape finished for ${locationLabel}`, { description: `${n} new, ${run.stats.updated ?? 0} updated, ${run.stats.closed ?? 0} closed` });
            else toast.error("The scrape hit an error. Check the Sources page for details.");
          }
        } catch {
          /* transient; keep polling */
        }
      }, 1500);
    } catch (err) {
      setIsScraping(false);
      toast.error(err instanceof Error ? err.message : "Could not start a scrape");
    }
  };

  const activeCount =
    (search.category ? 1 : 0) +
    (search.types?.length ?? 0) +
    (search.levels?.length ?? 0) +
    (search.remote ? 1 : 0) +
    (search.minSalary ? 1 : 0);

  const toggleIn = <T,>(list: T[] | undefined, value: T) => {
    const next = list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];
    return next.length ? next : undefined;
  };

  const clearAll = () => navigate({ search: { q: search.q, location: search.location }, replace: true, resetScroll: false });

  const sorts: Sort[] = profile ? ["match", "newest", "salary"] : ["newest", "salary"];

  return (
    <div className="container-page pt-10 md:pt-14">
      <h1 className="font-display text-5xl md:text-6xl">Find your next role</h1>
      <p className="mt-2 text-muted-foreground">Search by title, skill or company — then narrow it down.</p>

      <SearchBar
        key={`${search.q ?? ""}|${location}`}
        className="mt-8"
        defaultQ={search.q}
        defaultLocation={location}
        onSearch={(q, loc) => {
          const id = regionId(loc || location);
          setRegion(id);
          update({ q: q || undefined, location: id });
        }}
      />
      <ResumeUpload className="mt-4" align="start" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className={cn("lg:block", showFilters ? "block" : "hidden")}>
          <div className="space-y-8 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <FilterGroup title="Remote">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <span className="text-sm font-medium">Remote friendly only</span>
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={!!search.remote}
                  onChange={(e) => update({ remote: e.target.checked || undefined })}
                />
                <span className="relative h-6 w-10 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-card after:shadow-soft after:transition-transform peer-checked:after:translate-x-4" />
              </label>
            </FilterGroup>

            <FilterGroup title="Field">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Pill
                    key={c.name}
                    active={search.category === c.name}
                    onClick={() => update({ category: search.category === c.name ? undefined : c.name })}
                  >
                    {c.name}
                  </Pill>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Job type">
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((t) => (
                  <Pill key={t} active={!!search.types?.includes(t)} onClick={() => update({ types: toggleIn(search.types, t) })}>
                    {t}
                  </Pill>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Experience">
              <div className="flex flex-wrap gap-2">
                {levels.map((l) => (
                  <Pill key={l} active={!!search.levels?.includes(l)} onClick={() => update({ levels: toggleIn(search.levels, l) })}>
                    {l}
                  </Pill>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Minimum salary (LPA)">
              <div className="grid grid-cols-3 gap-2">
                {salarySteps.map((s) => (
                  <Pill
                    key={s}
                    active={(search.minSalary ?? 0) === s}
                    onClick={() => update({ minSalary: s || undefined })}
                  >
                    {s === 0 ? "Any" : `₹${s} LPA+`}
                  </Pill>
                ))}
              </div>
            </FilterGroup>
          </div>
        </aside>

        {/* Results */}
        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{total.toLocaleString("en-IN")}</span>{" "}
                {total === 1 ? "job" : "jobs"} found
              </p>
              {isScraping && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <RefreshCw className="size-3 animate-spin" />
                  {scrapeMessage ?? `Scraping web live for ${locationLabel}...`}
                </span>
              )}
              {!isScraping && scrapeMessage && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-3" />
                  {scrapeMessage}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeCount > 0 && (
                  <span className="rounded-full bg-highlight px-1.5 text-xs font-semibold text-highlight-foreground">{activeCount}</span>
                )}
              </button>
              <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
                {sorts.map((s) => (
                  <button
                    key={s}
                    onClick={() => update({ sort: s })}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-medium transition-colors",
                      sort === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s === "newest" ? "Newest" : s === "salary" ? "Top salary" : "Best match"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(search.q || location || activeCount > 0) && (
            <div className="mb-5 flex flex-wrap gap-2">
              {search.q && <ActiveTag onRemove={() => update({ q: undefined })}>“{search.q}”</ActiveTag>}
              {location !== "Global" && (
                <ActiveTag
                  onRemove={() => {
                    setRegion("Global");
                    update({ location: "Global" });
                  }}
                >
                  {locationLabel}
                </ActiveTag>
              )}
              {search.category && <ActiveTag onRemove={() => update({ category: undefined })}>{search.category}</ActiveTag>}
              {search.remote && <ActiveTag onRemove={() => update({ remote: undefined })}>Remote</ActiveTag>}
              {search.types?.map((t) => (
                <ActiveTag key={t} onRemove={() => update({ types: toggleIn(search.types, t) })}>{t}</ActiveTag>
              ))}
              {search.levels?.map((l) => (
                <ActiveTag key={l} onRemove={() => update({ levels: toggleIn(search.levels, l) })}>{l}</ActiveTag>
              ))}
              {search.minSalary && <ActiveTag onRemove={() => update({ minSalary: undefined })}>₹{search.minSalary} LPA+</ActiveTag>}
            </div>
          )}

          {first?.fallback && (
            <p className="mb-4 text-sm text-muted-foreground">
              Only {first.fallback.exact_count} matching {first.fallback.exact_count === 1 ? "role" : "roles"} in {locationLabel} right now, so we're also showing roles across India and remote-India.
            </p>
          )}

          {results.length > 0 ? (
            <div className="flex flex-col gap-3">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {jobsQuery.hasNextPage && (
                <button
                  onClick={() => jobsQuery.fetchNextPage()}
                  disabled={jobsQuery.isFetchingNextPage}
                  className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-foreground/30 disabled:opacity-60"
                >
                  {jobsQuery.isFetchingNextPage ? "Loading..." : `Show more (${(total - results.length).toLocaleString("en-IN")} left)`}
                </button>
              )}
            </div>
          ) : jobsQuery.isPending ? (
            <div className="flex flex-col gap-3" aria-busy>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchX className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">No local jobs match currently</h3>
              <p className="mt-1 max-w-sm text-muted-foreground">Scrape the live web for verified opportunities in {locationLabel}.</p>
              <button
                onClick={runScrape}
                disabled={isScraping}
                className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                {isScraping ? "Scraping web..." : `Scrape live ${locationLabel} jobs now`}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-foreground/30",
      )}
    >
      {children}
    </button>
  );
}

function ActiveTag({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-highlight py-1 pl-3 pr-1 text-sm font-medium text-highlight-foreground">
      {children}
      <button onClick={onRemove} aria-label="Remove filter" className="rounded-full p-0.5 hover:bg-highlight-foreground/10">
        <X className="size-3.5" />
      </button>
    </span>
  );
}
