import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/site/company-logo";
import { useCompanies } from "@/lib/api";
import { sourceLabel } from "@/lib/jobs";
import { useRegion } from "@/lib/use-region";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies hiring — JobRadar" },
      { name: "description", content: "Discover verified companies that are hiring right now, and track their open roles." },
      { property: "og:title", content: "Companies hiring — JobRadar" },
      { property: "og:description", content: "Discover verified companies that are hiring right now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const { region } = useRegion();
  const { data, isPending } = useCompanies(region);
  const list = data?.companies ?? [];

  return (
    <div className="container-page pt-10 md:pt-14">
      <h1 className="font-display text-5xl md:text-6xl">Companies hiring now</h1>
      <p className="mt-2 max-w-lg text-muted-foreground">Teams we think are genuinely great places to work.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const open = c.open_roles ?? 0;
          return (
            <Link
              key={c.id}
              to="/jobs"
              search={{ q: c.name, location: region }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <CompanyLogo company={{ name: c.name, tone: c.tone }} />
                <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{c.name}</h2>
              <p className="text-sm text-muted-foreground">
                {c.industry ?? "Hiring"} · via {sourceLabel(c.source)}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">
                {c.description ?? <span className="text-muted-foreground">No company description published on its job board.</span>}
              </p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="size-3.5" />{c.hq ?? "Location not listed"}</span>
                <span className="rounded-full bg-highlight px-2.5 py-1 font-semibold text-highlight-foreground">
                  {open} open {open === 1 ? "role" : "roles"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {!isPending && list.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center text-muted-foreground">
          No companies with open roles in {data?.region.label ?? region} yet.
        </div>
      )}
    </div>
  );
}
