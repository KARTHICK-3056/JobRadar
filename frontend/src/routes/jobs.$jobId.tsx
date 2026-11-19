import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Briefcase, Clock, Wallet, Check, Building2, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyLogo } from "@/components/site/company-logo";
import { SaveButton } from "@/components/site/save-button";
import { JobCard, Chip } from "@/components/site/job-card";
import { formatPosted, formatSalary, getCompany, getJob, jobs } from "@/lib/jobs";

export const Route = createFileRoute("/jobs/$jobId")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { job, company: getCompany(job.companyId) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Job not found — hireline" }, { name: "robots", content: "noindex" }] };
    const { job, company } = loaderData;
    const title = `${job.title} at ${company.name} — hireline`;
    return {
      meta: [
        { title },
        { name: "description", content: job.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: job.summary },
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

function JobPage() {
  const { job, company } = Route.useLoaderData();
  const [applyOpen, setApplyOpen] = useState(false);
  const similar = jobs.filter((j) => j.id !== job.id && j.category === job.category).slice(0, 3);

  return (
    <div className="container-page pt-8 md:pt-12">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="flex items-start gap-4">
            <CompanyLogo company={company} size="lg" />
            <div>
              <p className="font-medium text-muted-foreground">{company.name}</p>
              <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">{job.title}</h1>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Fact icon={MapPin} label="Location" value={job.remote && job.location !== "Remote" ? `${job.location} · Remote` : job.location} />
            <Fact icon={Briefcase} label="Type" value={`${job.type} · ${job.level}`} />
            <Fact icon={Wallet} label="Salary" value={formatSalary(job)} />
            <Fact icon={Clock} label="Posted" value={formatPosted(job.postedDaysAgo)} />
          </dl>

          <p className="mt-10 text-xl leading-relaxed text-foreground">{job.summary}</p>

          <Section title="What you'll do" items={job.responsibilities} />
          <Section title="What we're looking for" items={job.requirements} />
          <Section title="What you'll get" items={job.benefits} />

          <div className="mt-10 flex flex-wrap gap-2">
            {job.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">Salary range</p>
            <p className="mt-1 text-2xl font-semibold">{formatSalary(job)}</p>
            <p className="text-sm text-muted-foreground">per year</p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setApplyOpen(true)}
                className="flex-1 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Apply now
              </button>
              <SaveButton jobId={job.id} title={job.title} className="size-12" />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Takes about a minute</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <CompanyLogo company={company} size="sm" />
              <p className="font-semibold">{company.name}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{company.about}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Building2 className="size-4 text-muted-foreground" />{company.industry}</li>
              <li className="flex items-center gap-2"><Users className="size-4 text-muted-foreground" />{company.size}</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{company.location}</li>
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
          <button
            onClick={() => setApplyOpen(true)}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Apply now
          </button>
        </div>
      </div>

      <ApplyDialog open={applyOpen} onOpenChange={setApplyOpen} title={job.title} companyName={company.name} />
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

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-muted-foreground">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className="text-foreground/80">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ApplyDialog({
  open,
  onOpenChange,
  title,
  companyName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  companyName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">Apply to {companyName}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <form
          className="mt-2 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
            toast.success("Application sent", { description: `${companyName} will be in touch soon.` });
          }}
        >
          <Field label="Full name" name="name" placeholder="Alex Morgan" required />
          <Field label="Email" name="email" type="email" placeholder="alex@email.com" required />
          <Field label="Portfolio or LinkedIn" name="link" type="url" placeholder="https://" />
          <label className="block">
            <span className="text-sm font-medium">A short note (optional)</span>
            <textarea
              rows={3}
              placeholder="Why this role?"
              className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/15"
            />
          </label>
          <button type="submit" className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.01]">
            Send application
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/15"
      />
    </label>
  );
}
