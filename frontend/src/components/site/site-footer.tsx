import { Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-page flex flex-col gap-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-highlight shadow-sm">
            <Radar className="size-4" />
          </span>
          <span className="font-bold text-foreground">JobRadar</span>
          <span className="ml-2 text-muted-foreground">Versioned change-tracking for student jobs and internships.</span>
        </div>
        <nav className="flex gap-6" aria-label="Footer">
          <Link to="/jobs" className="hover:text-foreground">Find jobs</Link>
          <Link to="/companies" className="hover:text-foreground">Companies</Link>
          <Link to="/saved" className="hover:text-foreground">Saved</Link>
        </nav>
      </div>
    </footer>
  );
}
