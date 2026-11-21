import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Briefcase, Clock, Wallet, Check, Building2, Users } from "lucide-react";
import { CompanyLogo } from "@/components/site/company-logo";
import { SaveButton } from "@/components/site/save-button";
import { JobCard, Chip } from "@/components/site/job-card";
import { api, ApiError, jobDetailPath, useJob, useJobs } from "@/lib/api";
import { formatPosted, formatSalary, sourceLabel, toneFor, type JobDetail } from "@/lib/jobs";
import { useRegion } from "@/lib/use-region";
import { useResume } from "@/lib/use-resume";

export const Route = createFileRoute("/jobs/$jobId")({
  // Server-side fetch for the page title and a proper "closed" page; region-specific salary is fetched on the client.
  loader: async ({ params }) => {
    try {
      const job = await api<JobDetail>(jobDetailPath(params.jobId));
      if (job.status === "closed") throw notFound();
      return { title: job.title, company: job.company, summary: job.description_blocks.find((b) => b.t === "p")?.x ?? job.title };
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound();
      throw err;
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Job not found — JobRadar" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.title} at ${loaderData.company} — JobRadar`;
    const description = loaderData.summary.slice(0, 160);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-5xl">This job has closed</h1>
      <p className="mt-3 text-muted-foreground">It may have been filled. Plenty more are waiting.</p>
      <Link to="/jobs" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
        Browse jobs
      </Link>
    </div>
  ),
  component: JobPage,
});

/** Split scraped description blocks into an intro paragraph and titled sections of paragraphs/bullets. */
function toSections(blocks: JobDetail["description_blocks"]) {
  const intro = blocks.find((b) => b.t === "p")?.x ?? "";
  const sections: { title: string; items: { t: "p" | "li"; x: string }[] }[] = [];
  let cur: (typeof sections)[number] | null = null;
  let skippedIntro = false;
  for (const b of blocks) {
    if (b.t === "p" && !skippedIntro && b.x === intro) {
      skippedIntro = true;
      continue;
    }
    if (b.t === "h") {
      cur = { title: b.x, items: [] };
      sections.push(cur);
    } else {
      if (!cur) {
        cur = { title: "About the role", items: [] };
        sections.push(cur);
      }
      cur.items.push({ t: b.t, x: b.x });
    }
  }
  return { intro, sections: sections.filter((s) => s.items.length) };
}

function JobPage() {
  const { jobId } = Route.useParams();
  const { region } = useRegion();
  const { profile } = useResume();
  const { data: job, isPending } = useJob(jobId, region, profile);
  const { data: similarData } = useJobs({ category: job?.category, location: region, pageSize: 4 }, null, Boolean(job));
  const similar = (similarData?.jobs ?? []).filter((j) => j.id !== jobId).slice(0, 3);

  if (isPending || !job) {
    return (
      <div className="container-page pt-8 md:pt-12" aria-busy>
        <div className="h-10 w-40 animate-pulse rounded-full bg-muted" />
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const company = { name: job.company, tone: job.company_info?.tone ?? toneFor(job.company_id) };
  const info = job.company_info;
  const { intro, sections } = toSections(job.description_blocks);
  const applyHref = job.apply_url ?? job.source_url ?? undefined;
  const via = sourceLabel(job.source);

  return (
    <div className="container-page pt-8 md:pt-12">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <div className="flex items-start gap-4">
            <CompanyLogo company={company} size="lg" />
            <div>
              <p className="font-medium text-muted-foreground">{company.name}</p>
              <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">{job.title}</h1>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Fact icon={MapPin} label="Location" value={job.is_remote && !/^remote/i.test(job.location) ? `${job.location} · Remote` : job.location} />
            <Fact icon={Briefcase} label="Type" value={`${job.job_type} · ${job.seniority}`} />
            <Fact icon={Wallet} label="Salary" value={formatSalary(job)} />
            <Fact icon={Clock} label="Posted" value={formatPosted(job.posted_days_ago)} />
          </dl>

          {intro && <p className="mt-10 text-xl leading-relaxed text-foreground">{intro}</p>}

          {sections.map((s, i) => (
            <Section key={`${s.title}-${i}`} title={s.title} items={s.items} />
          ))}

          <div className="mt-10 flex flex-wrap gap-2">
            {job.skills.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">Salary range</p>
            <p className="mt-1 text-2xl font-semibold">{formatSalary(job)}</p>
            <p className="text-sm text-muted-foreground">{job.salary_display ? "per year" : "not published in the listing"}</p>
            {job.match_score != null && (
              <p className="mt-3 text-sm">
                <span className="rounded-full bg-highlight px-2.5 py-1 text-xs font-semibold text-highlight-foreground">{job.match_score}% match</span>
                {job.matched_skills?.length ? <span className="ml-2 text-muted-foreground">{job.matched_skills.join(", ")}</span> : null}
              </p>
            )}
            <div className="mt-6 flex gap-2">
              <a
                href={applyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full bg-primary px-5 py-3 text-center font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Apply now
              </a>
              <SaveButton jobId={job.id} title={job.title} className="size-12" />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Opens the original listing on {via}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <CompanyLogo company={company} size="sm" />
              <p className="font-semibold">{company.name}</p>
            </div>
            {info?.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{info.description}</p>}
            <ul className="mt-4 space-y-2 text-sm">
              {info?.industry && <li className="flex items-center gap-2"><Building2 className="size-4 text-muted-foreground" />{info.industry}</li>}
              <li className="flex items-center gap-2"><Users className="size-4 text-muted-foreground" />Listed on {via} · first seen {new Date(job.first_seen).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</li>
              {info?.hq && <li className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{info.hq}</li>}
            </ul>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl md:text-4xl">Similar roles</h2>
          <div className="mt-6 flex flex-col gap-3">
            {similar.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile: keep Apply within thumb reach */}
      <div data-mobile-apply className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{job.title}</p>
            <p className="text-xs text-muted-foreground">{formatSalary(job)}</p>
          </div>
          <SaveButton jobId={job.id} title={job.title} />
          <a
            href={applyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Apply now
          </a>
        </div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-4">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function Section({ title, items }: { title: string; items: { t: "p" | "li"; x: string }[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) =>
          item.t === "li" ? (
            <li key={i} className="flex gap-3 text-muted-foreground">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-foreground/80">{item.x}</span>
            </li>
          ) : (
            <li key={i} className="leading-relaxed text-foreground/80">
              {item.x}
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
