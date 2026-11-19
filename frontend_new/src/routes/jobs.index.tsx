import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import { SearchBar } from "@/components/site/search-bar";
import { JobCard } from "@/components/site/job-card";
import { categories, filterJobs, jobs, jobTypes, levels, type JobType, type Level } from "@/lib/jobs";
import { cn } from "@/lib/utils";

type Sort = "newest" | "salary";

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
  validateSearch: (s: Record<string, unknown>): JobsSearch => ({
    q: str(s["q"]),
    location: str(s["location"]),
    category: str(s["category"]),
    types: Array.isArray(s["types"]) ? (s["types"].filter((t) => jobTypes.includes(t)) as JobType[]) : undefined,
    levels: Array.isArray(s["levels"]) ? (s["levels"].filter((l) => levels.includes(l)) as Level[]) : undefined,
    remote: s["remote"] === true || s["remote"] === "true" ? true : undefined,
    minSalary: typeof s["minSalary"] === "number" ? s["minSalary"] : undefined,
    sort: s["sort"] === "salary" ? "salary" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Find jobs — hireline" },
      { name: "description", content: "Search and filter open roles by field, job type, level, salary and location." },
      { property: "og:title", content: "Find jobs — hireline" },
      { property: "og:description", content: "Search and filter open roles by field, job type, level, salary and location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

const salarySteps = [0, 50, 80, 100, 130];

function JobsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const update = (patch: Partial<JobsSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  const results = useMemo(() => {
    const list = filterJobs(jobs, {
      q: search.q,
      location: search.location,
      category: search.category,
      types: search.types,
      levels: search.levels,
      remoteOnly: search.remote,
      minSalary: search.minSalary,
    });
    return [...list].sort((a, b) =>
      search.sort === "salary" ? b.salaryMax - a.salaryMax : a.postedDaysAgo - b.postedDaysAgo,
    );
  }, [search]);

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

  const clearAll = () =>
    navigate({ search: { q: search.q, location: search.location }, replace: true, resetScroll: false });

  return (
    <div className="container-page pt-10 md:pt-14">
      <h1 className="font-display text-5xl md:text-6xl">Find your next role</h1>
      <p className="mt-2 text-muted-foreground">Search by title, skill or company — then narrow it down.</p>

      <SearchBar
        key={`${search.q ?? ""}|${search.location ?? ""}`}
        className="mt-8"
        defaultQ={search.q}
        defaultLocation={search.location}
        onSearch={(q, location) => update({ q: q || undefined, location: location || undefined })}
      />

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

            <FilterGroup title="Minimum salary">
              <div className="grid grid-cols-3 gap-2">
                {salarySteps.map((s) => (
                  <Pill
                    key={s}
                    active={(search.minSalary ?? 0) === s}
                    onClick={() => update({ minSalary: s || undefined })}
                  >
                    {s === 0 ? "Any" : `$${s}k+`}
                  </Pill>
                ))}
              </div>
            </FilterGroup>
          </div>
        </aside>

        {/* Results */}
        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{results.length}</span>{" "}
              {results.length === 1 ? "job" : "jobs"} found
            </p>
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
                {(["newest", "salary"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => update({ sort: s === "newest" ? undefined : s })}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-medium transition-colors",
                      (search.sort ?? "newest") === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s === "newest" ? "Newest" : "Top salary"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(search.q || search.location || activeCount > 0) && (
            <div className="mb-5 flex flex-wrap gap-2">
              {search.q && <ActiveTag onRemove={() => update({ q: undefined })}>“{search.q}”</ActiveTag>}
              {search.location && <ActiveTag onRemove={() => update({ location: undefined })}>{search.location}</ActiveTag>}
              {search.category && <ActiveTag onRemove={() => update({ category: undefined })}>{search.category}</ActiveTag>}
              {search.remote && <ActiveTag onRemove={() => update({ remote: undefined })}>Remote</ActiveTag>}
              {search.types?.map((t) => (
                <ActiveTag key={t} onRemove={() => update({ types: toggleIn(search.types, t) })}>{t}</ActiveTag>
              ))}
              {search.levels?.map((l) => (
                <ActiveTag key={l} onRemove={() => update({ levels: toggleIn(search.levels, l) })}>{l}</ActiveTag>
              ))}
              {search.minSalary && <ActiveTag onRemove={() => update({ minSalary: undefined })}>${search.minSalary}k+</ActiveTag>}
            </div>
          )}

          {results.length > 0 ? (
            <div className="flex flex-col gap-3">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchX className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">No jobs match yet</h3>
              <p className="mt-1 max-w-sm text-muted-foreground">Try a broader keyword or remove a filter or two.</p>
              <Link to="/jobs" className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Reset search
              </Link>
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
