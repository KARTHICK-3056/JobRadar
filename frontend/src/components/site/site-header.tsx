import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Bookmark, Radar } from "lucide-react";
import { useSavedJobs } from "@/lib/use-saved-jobs";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/jobs", label: "Find jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/saved", label: "Saved" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { saved } = useSavedJobs();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-highlight shadow-sm">
            <Radar className="size-4.5" />
          </span>
          <span className="text-lg font-bold tracking-tight">JobRadar</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={item.to === "/jobs" ? { location: "India" } : undefined}
              className="relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {item.label}
              {item.to === "/saved" && saved.length > 0 && (
                <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-highlight px-1.5 text-[11px] font-semibold text-highlight-foreground">
                  {saved.length}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/jobs"
            search={{ location: "India" }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-100"
          >
            Start searching
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border border-border md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <nav className="container-page flex flex-col py-3" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={item.to === "/jobs" ? { location: "India" } : undefined}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium"
              activeProps={{ className: "bg-muted" }}
            >
              {item.label}
              {item.to === "/saved" && (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Bookmark className="size-4" /> {saved.length}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
