import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Code2, PenTool, Compass, BarChart3, Megaphone, HeartHandshake, Users, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { SearchBar } from "@/components/site/search-bar";
import { JobCard } from "@/components/site/job-card";
import { CompanyLogo } from "@/components/site/company-logo";
import { categories, companies, jobs } from "@/lib/jobs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "hireline — Find work that fits your life" },
      { name: "description", content: "Search thousands of roles from thoughtful companies. Simple filters, honest salaries, no noise." },
      { property: "og:title", content: "hireline — Find work that fits your life" },
      { property: "og:description", content: "Search roles from thoughtful companies. Simple filters, honest salaries, no noise." },
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

const popular = ["Designer", "React", "Remote", "Product", "Data"];

function Index() {
  const featured = [...jobs].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo).slice(0, 5);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="container-page relative pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="size-1.5 rounded-full bg-highlight ring-4 ring-highlight/30" />
              {jobs.length * 107} new roles this week
            </span>
            <h1 className="animate-rise mt-6 font-display text-5xl leading-[1.02] text-foreground [animation-delay:80ms] sm:text-6xl md:text-7xl">
              Find work that <em className="marker-highlight italic">fits</em> your life.
            </h1>
            <p className="animate-rise mx-auto mt-5 max-w-xl text-lg text-muted-foreground [animation-delay:160ms]">
              Honest salaries, clear roles and companies worth working for. Search in seconds — no noise, no spam.
            </p>
          </div>

          <div className="animate-rise mx-auto mt-10 max-w-3xl [animation-delay:240ms]">
            <SearchBar />
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              {popular.map((term) => (
                <Link
                  key={term}
                  to="/jobs"
                  search={{ q: term === "Remote" ? undefined : term, remote: term === "Remote" ? true : undefined }}
                  className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground transition-colors hover:border-foreground/30"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          {/* Trusted by */}
          <div className="animate-rise mx-auto mt-16 max-w-4xl [animation-delay:320ms]">
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

      {/* Featured jobs */}
      <section className="container-page mt-24">
        <SectionHeading eyebrow="Fresh" title="Latest opportunities" linkLabel="See all" />
        <div className="mt-8 flex flex-col gap-3">
          {featured.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="container-page mt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Salaries upfront", text: "Every listing shows a real pay range, so you never waste time." },
            { icon: Zap, title: "Apply in one minute", text: "A short, simple form. No account or endless steps needed." },
            { icon: Sparkles, title: "Only real roles", text: "Every company is reviewed by a person before it can post." },
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
      <section className="container-page mt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground md:px-16 md:py-20">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-highlight/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-highlight/15 blur-3xl" />
          <h2 className="relative font-display text-4xl leading-tight md:text-6xl">
            Your next chapter <em className="italic text-highlight">starts here.</em>
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-primary-foreground/70">
            Save the roles you love and come back anytime. We'll keep them right where you left them.
          </p>
          <Link
            to="/jobs"
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
