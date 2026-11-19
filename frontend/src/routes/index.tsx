import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  Code2,
  PenTool,
  Compass,
  BarChart3,
  Megaphone,
  HeartHandshake,
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
  MapPin,
} from "lucide-react";
import { SearchBar } from "@/components/site/search-bar";
import { JobCard } from "@/components/site/job-card";
import { CompanyLogo } from "@/components/site/company-logo";
import { categories, companies, jobs, filterJobs } from "@/lib/jobs";
import { cn } from "@/lib/utils";

interface IndexSearch {
  location?: string | undefined;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): IndexSearch => ({
    location: str(s["location"]),
  }),
  head: () => ({
    meta: [
      { title: "JobRadar — Versioned Job & Internship Tracking" },
      { name: "description", content: "Search and track verified roles across India. Real LPA compensation, live change-tracking, zero noise." },
      { property: "og:title", content: "JobRadar — Versioned Job & Internship Tracking" },
      { property: "og:description", content: "Search and track verified roles across India. Real LPA compensation, live change-tracking, zero noise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categoryIcons = {
  code: Code2,
  pen: PenTool,
  compass: Compass,
  chart: BarChart3,
  megaphone: Megaphone,
  heart: HeartHandshake,
  users: Users,
} as const;

const MAJOR_HUBS = [
  "All India",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Delhi-NCR",
] as const;

const popular = ["Bengaluru", "Chennai", "Hyderabad", "Pune", "Mumbai", "Delhi-NCR", "Remote"];

function Index() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string>(search.location || "All India");

  // Keep state synchronized if URL search param changes
  useEffect(() => {
    if (search.location) {
      setSelectedLocation(search.location);
    }
  }, [search.location]);

  // Filter jobs based on active location
  const filteredJobs = useMemo(() => {
    const loc = selectedLocation === "All India" ? "India" : selectedLocation;
    const list = filterJobs(jobs, { location: loc });
    return [...list].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  }, [selectedLocation]);

  const featured = useMemo(() => {
    return filteredJobs.slice(0, 6);
  }, [filteredJobs]);

  const getHubCount = (hub: string) => {
    const loc = hub === "All India" ? "India" : hub;
    return filterJobs(jobs, { location: loc }).length;
  };

  const handleSelectCity = (city: string) => {
    setSelectedLocation(city);
    const el = document.getElementById("latest-opportunities");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="container-page relative pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="size-1.5 rounded-full bg-highlight ring-4 ring-highlight/30" />
              {jobs.length} live verified roles tracked
            </span>
            <h1 className="animate-rise mt-6 font-display text-5xl leading-[1.02] text-foreground [animation-delay:80ms] sm:text-6xl md:text-7xl">
              Find work that <em className="marker-highlight italic">fits</em> your life.
            </h1>
            <p className="animate-rise mx-auto mt-5 max-w-xl text-lg text-muted-foreground [animation-delay:160ms]">
              Honest LPA salaries, real-time change tracking and verified Indian tech hubs. Search in seconds.
            </p>
          </div>

          <div className="animate-rise relative z-30 mx-auto mt-10 max-w-3xl [animation-delay:240ms]">
            <SearchBar
              key={selectedLocation}
              defaultLocation={selectedLocation === "All India" ? "India" : selectedLocation}
              className="relative z-30"
              onSearch={(q, location) => {
                if (q) {
                  navigate({
                    to: "/jobs",
                    search: { q, location: location || undefined },
                  });
                } else if (location) {
                  setSelectedLocation(location);
                  const el = document.getElementById("latest-opportunities");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
            <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Major Cities:</span>
              {popular.map((term) => {
                const isCurrent =
                  selectedLocation.toLowerCase() === term.toLowerCase() ||
                  (term === "India" && selectedLocation === "All India");
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectCity(term)}
                    className={cn(
                      "rounded-full border px-3 py-1 font-medium transition-all text-xs",
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-foreground/30"
                    )}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trusted by */}
          <div className="animate-rise relative z-10 mx-auto mt-16 max-w-4xl [animation-delay:320ms]">
            <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Hiring now
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {companies.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-muted-foreground">
                  <CompanyLogo company={c} size="sm" />
                  <span className="font-semibold">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page">
        <SectionHeading eyebrow="Browse" title="Explore by field" linkLabel="All jobs" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.icon];
            const count = jobs.filter((j) => j.category === cat.name).length;
            return (
              <Link
                key={cat.name}
                to="/jobs"
                search={{ category: cat.name }}
                className="group flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-highlight group-hover:text-highlight-foreground">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{count} open {count === 1 ? "role" : "roles"}</p>
                </div>
              </Link>
            );
          })}
          <Link
            to="/jobs"
            className="flex flex-col justify-between gap-6 rounded-2xl bg-primary p-5 text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-highlight text-highlight-foreground">
              <ArrowRight className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Everything</p>
              <p className="text-sm text-primary-foreground/70">{jobs.length} roles</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured jobs with live location filtering */}
      <section id="latest-opportunities" className="container-page mt-24 scroll-mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Fresh opportunities • {selectedLocation}
            </p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">
              Latest opportunities {selectedLocation !== "All India" ? `in ${selectedLocation}` : "across India"}
            </h2>
          </div>
          <Link
            to="/jobs"
            search={{ location: selectedLocation === "All India" ? "India" : selectedLocation }}
            className="group hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex"
          >
            See all in {selectedLocation} ({filteredJobs.length})
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* City Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {MAJOR_HUBS.map((hub) => {
            const count = getHubCount(hub);
            const isSelected =
              selectedLocation.toLowerCase() === hub.toLowerCase() ||
              (hub === "All India" && selectedLocation === "India");
            return (
              <button
                key={hub}
                type="button"
                onClick={() => setSelectedLocation(hub)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                <span>{hub}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Opportunity Cards */}
        <div className="mt-6 flex flex-col gap-3">
          {featured.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {featured.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
              <MapPin className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 text-lg font-semibold">No active listings in {selectedLocation} right now</h3>
              <p className="mt-1 text-sm text-muted-foreground">Scrape the live web or view jobs in nearby Indian hubs.</p>
              <Link
                to="/jobs"
                search={{ location: selectedLocation }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Search all opportunities <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/jobs"
            search={{ location: selectedLocation === "All India" ? "India" : selectedLocation }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            See all {filteredJobs.length} opportunities in {selectedLocation} &rarr;
          </Link>
        </div>
      </section>

      {/* Why */}
      <section className="container-page mt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "LPA Salaries upfront", text: "Every listing shows a real pay range in Lakhs Per Annum, so you never waste time." },
            { icon: Zap, title: "Versioned Change Tracking", text: "Detects additions, edits, deletions and deadline updates automatically." },
            { icon: Sparkles, title: "Only Real Roles", text: "Direct integration with public ATS APIs (Greenhouse & Lever). Zero fake data." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="size-6 text-foreground" />
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page my-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-16 md:py-24">
          <div className="bg-dots pointer-events-none absolute inset-0 opacity-20" />
          <h2 className="relative font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
            Ready to find your next opportunity?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-base text-primary-foreground/75 sm:text-lg">
            Explore verified roles from Indian tech hubs with transparent LPA compensation.
          </p>
          <Link
            to="/jobs"
            search={{ location: "India" }}
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-highlight px-7 py-3.5 font-semibold text-highlight-foreground transition-transform hover:scale-[1.03]"
          >
            Browse all jobs <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, linkLabel }: { eyebrow: string; title: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl md:text-5xl">{title}</h2>
      </div>
      <Link to="/jobs" className="group hidden items-center gap-1 text-sm font-semibold sm:inline-flex">
        {linkLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
