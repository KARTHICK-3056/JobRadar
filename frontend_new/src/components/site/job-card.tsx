import { Link } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import { formatPosted, formatSalary, getCompany, type Job } from "@/lib/jobs";
import { CompanyLogo } from "./company-logo";
import { SaveButton } from "./save-button";

export function JobCard({ job }: { job: Job }) {
  const company = getCompany(job.companyId);
  return (
    <Link
      to="/jobs/$jobId"
      params={{ jobId: job.id }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-5 sm:p-6"
    >
      <CompanyLogo company={company} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{company.name}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatPosted(job.postedDaysAgo)}
          </span>
        </div>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground group-hover:underline group-hover:decoration-highlight group-hover:decoration-[3px] group-hover:underline-offset-4">
          {job.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip>
            <MapPin className="size-3.5" />
            {job.location}
          </Chip>
          {job.remote && job.location !== "Remote" && <Chip>Remote friendly</Chip>}
          <Chip>{job.type}</Chip>
          <Chip>{job.level}</Chip>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span className="text-sm font-semibold text-foreground">{formatSalary(job)}</span>
        <SaveButton jobId={job.id} title={job.title} />
      </div>
    </Link>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}
