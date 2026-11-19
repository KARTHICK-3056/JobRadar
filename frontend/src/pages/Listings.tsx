import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useListings, useSources } from '../hooks/useJobRadar';
import { FilterBar } from '../components/listings/FilterBar';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingTable } from '../components/listings/ListingTable';
import { ListingDrawer } from '../components/listings/ListingDrawer';
import { RadarGraphic } from '../components/common/RadarGraphic';
import type { Listing } from '../types';

export const Listings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Convert searchParams to plain object for useListings hook
  const params: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    params[key] = val;
  });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 20;

  const { data, isLoading } = useListings({ ...params, page, page_size: pageSize });
  const { data: sourcesData } = useSources();

  const listings = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Extract unique companies and locations from listings for filter dropdowns
  const uniqueCompanies = Array.from(new Set(listings.map((l) => l.company))).sort();
  const uniqueLocations = Array.from(
    new Set(listings.map((l) => l.location).filter(Boolean) as string[])
  ).sort();
  const sourcesList = (sourcesData || []).map((s) => ({ id: s.id, name: s.name }));

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Internship & Job Listings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Displaying {listings.length} of {total} tracked opportunities
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        companies={uniqueCompanies}
        sources={sourcesList}
        locations={uniqueLocations}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-surface/50 border border-border/50" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        /* Helpful Empty State with Radar Graphic */
        <div className="text-center py-16 px-4 rounded-3xl border border-border bg-surface/40 backdrop-blur-xl">
          <div className="flex justify-center mb-4">
            <RadarGraphic size={140} />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            No matching job listings found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Your current search or filter combination didn't match any tracked positions. Try clearing your filters.
          </p>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors inline-flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((job) => (
            <ListingCard
              key={job.entity_id}
              listing={job}
              onClick={() => setSelectedListing(job)}
            />
          ))}
        </div>
      ) : (
        <ListingTable
          listings={listings}
          onSelectListing={(job) => setSelectedListing(job)}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-mono text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-elevated text-foreground disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-elevated text-foreground disabled:opacity-40 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Right-Side Detailed Drawer */}
      <ListingDrawer
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
};
