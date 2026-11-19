import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-page flex flex-col gap-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary font-display text-base text-highlight">
            h
          </span>
          <span className="font-semibold text-foreground">hireline</span>
          <span className="ml-2">Find work that fits your life.</span>
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
