import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { JobCard } from "@/components/site/job-card";
import { jobs } from "@/lib/jobs";
import { useSavedJobs } from "@/lib/use-saved-jobs";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved jobs — JobRadar" },
      { name: "description", content: "The roles you've saved to come back to later." },
      { property: "og:title", content: "Saved jobs — JobRadar" },
      { property: "og:description", content: "The roles you've saved to come back to later." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { saved } = useSavedJobs();
  const list = jobs.filter((j) => saved.includes(j.id));

  return (
    <div className="container-page pt-10 md:pt-14">
      <h1 className="font-display text-5xl md:text-6xl">Saved jobs</h1>
      <p className="mt-2 text-muted-foreground">Roles you've bookmarked, kept safe on this device.</p>

      {list.length > 0 ? (
        <div className="mt-10 flex flex-col gap-3">
          {list.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
            <Bookmark className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Nothing saved yet</h2>
          <p className="mt-1 max-w-sm text-muted-foreground">Tap the bookmark on any job to keep it here for later.</p>
          <Link to="/jobs" className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Browse jobs
          </Link>
        </div>
      )}
    </div>
  );
}
