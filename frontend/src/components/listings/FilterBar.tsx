import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, LayoutGrid, Table, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  companies: string[];
  sources: { id: string; name: string }[];
  locations: string[];
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  companies,
  sources,
  locations,
  viewMode,
  onViewModeChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') || '';
  const company = searchParams.get('company') || '';
  const source = searchParams.get('source') || '';
  const location = searchParams.get('location') || '';
  const jobType = searchParams.get('job_type') || '';
  const status = searchParams.get('status') || '';
  const changeCategory = searchParams.get('change_category') || '';
  const sort = searchParams.get('sort') || 'newest';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Determine active filter chips
  const activeFilters = [
    q ? { key: 'q', label: `Search: "${q}"` } : null,
    company ? { key: 'company', label: `Company: ${company}` } : null,
    source ? { key: 'source', label: `Source: ${source}` } : null,
    location ? { key: 'location', label: `Location: ${location}` } : null,
    jobType ? { key: 'job_type', label: `Type: ${jobType}` } : null,
    status ? { key: 'status', label: `Status: ${status}` } : null,
    changeCategory ? { key: 'change_category', label: `Change: ${changeCategory}` } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="space-y-3 mb-5">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent"
          />
          {q && (
            <button
              onClick={() => removeFilter('q')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter */}
          <select
            value={company}
            onChange={(e) => updateParam('company', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={source}
            onChange={(e) => updateParam('source', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={location}
            onChange={(e) => updateParam('location', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => updateParam('status', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All status</option>
            <option value="active">Active only</option>
            <option value="removed">Removed only</option>
          </select>

          {/* Change Category */}
          <select
            value={changeCategory}
            onChange={(e) => updateParam('change_category', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All activity</option>
            <option value="added">New</option>
            <option value="edited">Edited</option>
            <option value="removed">Removed</option>
          </select>

          {/* Sort Option */}
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="newest">Newest first</option>
            <option value="closing_soon">Closing soon</option>
            <option value="company_asc">Company (A-Z)</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-surface-elevated text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-surface-elevated text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-secondary" />
            Filters:
          </span>

          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface border border-border text-secondary"
            >
              <span>{f.label}</span>
              <button
                onClick={() => removeFilter(f.key)}
                className="hover:text-foreground p-0.5"
                aria-label={`Remove filter ${f.label}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-1 font-mono"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
