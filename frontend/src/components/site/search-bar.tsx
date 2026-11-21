import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegions, type RegionOption } from "@/lib/api";
import { regionId } from "@/lib/use-region";

// Shown before /api/regions answers (and as a safety net if it fails).
const FALLBACK_OPTIONS: RegionOption[] = [
  { id: "Global", label: "Global (top results)", group: "Popular", kind: "global" },
  { id: "India", label: "India (all)", group: "Popular", kind: "india" },
  { id: "Remote", label: "Remote", group: "Popular", kind: "remote" },
  { id: "Chennai", label: "Chennai", group: "India", kind: "city" },
  { id: "Bengaluru", label: "Bengaluru", group: "India", kind: "city" },
];

type Opt = RegionOption & { aliases?: string[] };

const labelFor = (opts: Opt[], value: string) => opts.find((o) => o.id.toLowerCase() === regionId(value).toLowerCase())?.label ?? value;

export function SearchBar({
  defaultQ = "",
  defaultLocation = "Chennai",
  className,
  onSearch,
}: {
  defaultQ?: string | undefined;
  defaultLocation?: string | undefined;
  className?: string;
  onSearch?: (q: string, location: string) => void;
}) {
  const navigate = useNavigate();
  const { data } = useRegions();
  const options: Opt[] = (data?.regions as Opt[] | undefined) ?? FALLBACK_OPTIONS;
  const [q, setQ] = useState(defaultQ);
  const [selected, setSelected] = useState(regionId(defaultLocation));
  const [text, setText] = useState(() => labelFor(options, defaultLocation));
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const locationWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Once region labels arrive, show the friendly label for the current selection.
  useEffect(() => {
    if (!typing) setText(labelFor(options, selected));
  }, [data, selected, typing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Searchable: match id, label and aliases (Bangalore -> Bengaluru, Gurgaon -> Delhi NCR...).
  const suggestions = useMemo(() => {
    const query = typing ? text.trim().toLowerCase() : "";
    if (!query) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query) ||
        (o.aliases ?? []).some((a) => a.includes(query) || query.includes(a)),
    );
  }, [text, typing, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setTyping(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const go = (query: string, loc: string) => {
    if (onSearch) return onSearch(query, loc);
    navigate({ to: "/jobs", search: { q: query || undefined, location: loc || undefined } });
  };

  const selectSuggestion = (opt: Opt) => {
    setSelected(opt.id);
    setText(opt.label);
    setTyping(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    go(q, opt.id);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    // Free text resolves to the best matching option; otherwise it is passed through (server resolves aliases).
    let loc = selected;
    if (typing && text.trim()) {
      loc = suggestions[0]?.id ?? text.trim();
      setSelected(loc);
      setTyping(false);
    }
    go(q, loc);
  };

  let lastGroup = "";

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

      {/* Location combobox */}
      <div ref={locationWrapperRef} className="relative z-30 flex-1">
        <label className="flex items-center gap-3 rounded-full px-4 py-3 transition-colors focus-within:bg-muted">
          <MapPin className="size-5 shrink-0 text-primary" />
          <span className="sr-only">Location</span>
          <input
            ref={inputRef}
            role="combobox"
            value={text}
            onFocus={(e) => {
              setShowSuggestions(true);
              e.currentTarget.select();
            }}
            onChange={(e) => {
              setText(e.target.value);
              setTyping(true);
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
                } else if (e.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
                  e.preventDefault();
                  selectSuggestion(suggestions[selectedIndex]!);
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                  setSelectedIndex(-1);
                  setTyping(false);
                }
              }
            }}
            placeholder="City or 'India' or 'remote'"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="location-options"
          />
        </label>

        {showSuggestions && suggestions.length > 0 && (
          <div
            id="location-options"
            role="listbox"
            className="absolute left-0 right-0 sm:left-0 sm:right-auto sm:min-w-[320px] top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-popover text-popover-foreground p-1.5 shadow-2xl"
          >
            {suggestions.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const isCurrent = selected.toLowerCase() === item.id.toLowerCase();
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              return (
                <div key={item.id}>
                  {header && (
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {header === "Popular" ? "Location suggestions" : header}
                    </div>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => selectSuggestion(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      isSelected ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <MapPin className={cn("size-4 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                      <span>{item.label}</span>
                    </span>
                    {isCurrent && <Check className="size-4 text-primary" />}
                  </button>
                </div>
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
