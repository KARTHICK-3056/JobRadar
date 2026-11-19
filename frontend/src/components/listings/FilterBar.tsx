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
    <div className="space-y-3 mb-6">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Search by role, company, or skills..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface/80 border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          {q && (
            <button
              onClick={() => removeFilter('q')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
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
            className="px-3 py-2 rounded-xl bg-surface/80 border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <option value="">All Companies</option>
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
            className="px-3 py-2 rounded-xl bg-surface/80 border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <option value="">All Sources</option>
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
            className="px-3 py-2 rounded-xl bg-surface/80 border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <option value="">All Locations</option>
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
            className="px-3 py-2 rounded-xl bg-surface/80 border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="removed">Removed (Confirmed)</option>
          </select>

          {/* Change Category */}
          <select
            value={changeCategory}
            onChange={(e) => updateParam('change_category', e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface/80 border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <option value="">All Activity</option>
            <option value="added">New Listings</option>
            <option value="edited">Changed Listings</option>
            <option value="removed">Removed</option>
          </select>

          {/* Sort Option */}
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface/80 border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-cyan-500/40 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="closing_soon">Closing Soon</option>
            <option value="company_asc">Company (A-Z)</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="flex items-center rounded-xl border border-border bg-surface/60 p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-150">
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            Active filters:
          </span>

          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25"
            >
              <span>{f.label}</span>
              <button
                onClick={() => removeFilter(f.key)}
                className="hover:text-white p-0.5"
                aria-label={`Remove filter ${f.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-400 transition-colors ml-2 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
