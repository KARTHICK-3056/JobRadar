import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/site/company-logo";
import { companies, jobs } from "@/lib/jobs";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies hiring — hireline" },
      { name: "description", content: "Discover thoughtful companies that are hiring right now, and see their open roles." },
      { property: "og:title", content: "Companies hiring — hireline" },
      { property: "og:description", content: "Discover thoughtful companies that are hiring right now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  return (
    <div className="container-page pt-10 md:pt-14">
      <h1 className="font-display text-5xl md:text-6xl">Companies hiring now</h1>
      <p className="mt-2 max-w-lg text-muted-foreground">Teams we think are genuinely great places to work.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => {
          const open = jobs.filter((j) => j.companyId === c.id).length;
          return (
            <Link
              key={c.id}
              to="/jobs"
              search={{ q: c.name }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <CompanyLogo company={c} />
                <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{c.name}</h2>
              <p className="text-sm text-muted-foreground">{c.industry} · {c.size}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">{c.about}</p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="size-3.5" />{c.location}</span>
                <span className="rounded-full bg-highlight px-2.5 py-1 font-semibold text-highlight-foreground">
                  {open} open {open === 1 ? "role" : "roles"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
