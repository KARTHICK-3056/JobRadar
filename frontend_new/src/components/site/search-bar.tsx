import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  defaultQ = "",
  defaultLocation = "",
  className,
  onSearch,
}: {
  defaultQ?: string | undefined;
  defaultLocation?: string | undefined;
  className?: string;
  onSearch?: (q: string, location: string) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState(defaultQ);
  const [location, setLocation] = useState(defaultLocation);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSearch) return onSearch(q, location);
        navigate({ to: "/jobs", search: { q: q || undefined, location: location || undefined } });
      }}
      className={cn(
        "flex w-full flex-col gap-2 rounded-3xl border border-border bg-card p-2 shadow-lift sm:flex-row sm:items-center sm:rounded-full",
        className,
      )}
    >
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-3 transition-colors focus-within:bg-muted">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <span className="sr-only">Job title or keyword</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Job title, skill or company"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </label>
      <div className="hidden h-8 w-px bg-border sm:block" />
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-3 transition-colors focus-within:bg-muted">
        <MapPin className="size-5 shrink-0 text-muted-foreground" />
        <span className="sr-only">Location</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or “remote”"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </label>
      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-100"
      >
        Search
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
