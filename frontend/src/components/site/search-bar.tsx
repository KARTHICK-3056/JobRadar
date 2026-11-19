import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { jobs } from "@/lib/jobs";

const PRESET_INDIAN_LOCATIONS = [
  "India",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Mumbai, Maharashtra",
  "Gurgaon / Delhi NCR",
  "Noida, Uttar Pradesh",
  "Chennai, Tamil Nadu",
  "Remote (India)",
];

export function SearchBar({
  defaultQ = "",
  defaultLocation = "India",
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const locationWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Collect all unique locations from active jobs + curated Indian hubs
  const allLocations = useMemo(() => {
    const fromJobs = jobs
      .map((j) => j.location)
      .filter((l): l is string => Boolean(l && l.trim()));
    const set = new Set<string>([...PRESET_INDIAN_LOCATIONS, ...fromJobs]);
    return Array.from(set);
  }, []);

  // Filter suggestions based on typed text
  const suggestions = useMemo(() => {
    const query = location.trim().toLowerCase();
    if (!query) {
      return PRESET_INDIAN_LOCATIONS;
    }
    return allLocations.filter((loc) => {
      const lLower = loc.toLowerCase();
      if (lLower.includes(query)) return true;
      if (query.includes("bangalore") && lLower.includes("bengaluru")) return true;
      if (query.includes("bengaluru") && lLower.includes("bangalore")) return true;
      return false;
    });
  }, [location, allLocations]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationWrapperRef.current &&
        !locationWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (selectedLoc: string) => {
    setLocation(selectedLoc);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch(q, selectedLoc);
    } else {
      navigate({
        to: "/jobs",
        search: { q: q || undefined, location: selectedLoc || undefined },
      });
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) return onSearch(q, location);
    navigate({
      to: "/jobs",
      search: { q: q || undefined, location: location || undefined },
    });
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "relative z-30 flex w-full flex-col gap-2 rounded-3xl border border-border bg-card p-2 shadow-lift sm:flex-row sm:items-center sm:rounded-full",
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

      {/* Location Input with Autocomplete Suggestions */}
      <div ref={locationWrapperRef} className="relative z-30 flex-1">
        <label className="flex items-center gap-3 rounded-full px-4 py-3 transition-colors focus-within:bg-muted">
          <MapPin className="size-5 shrink-0 text-primary" />
          <span className="sr-only">Location</span>
          <input
            ref={inputRef}
            value={location}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onKeyDown={(e) => {
              if (!showSuggestions && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                setShowSuggestions(true);
                return;
              }
              if (showSuggestions && suggestions.length > 0) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedIndex((prev) => (prev + 1) % suggestions.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
                } else if (e.key === "Enter" && selectedIndex >= 0) {
                  e.preventDefault();
                  selectSuggestion(suggestions[selectedIndex]);
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                  setSelectedIndex(-1);
                }
              }
            }}
            placeholder="City or 'India' or 'remote'"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
        </label>

        {/* Suggestions Popover */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 sm:left-0 sm:right-auto sm:min-w-[320px] top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-border bg-popover text-popover-foreground p-1.5 shadow-2xl"
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Location suggestions
            </div>
            {suggestions.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const isCurrent = location.trim().toLowerCase() === item.toLowerCase();
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => selectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    isSelected ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin className={cn("size-4 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                    <span>{item}</span>
                  </span>
                  {isCurrent && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

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
