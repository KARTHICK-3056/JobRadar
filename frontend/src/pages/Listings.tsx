import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, SlidersHorizontal, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { useListings, useSources } from '../hooks/useJobRadar';
import { FilterBar } from '../components/listings/FilterBar';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingTable } from '../components/listings/ListingTable';
import { ListingDrawer } from '../components/listings/ListingDrawer';
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border text-secondary flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Internship and job directory
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-surface border border-border" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        /* Helpful Empty State */
        <div className="text-center py-16 px-4 rounded-xl border border-border bg-surface">
          <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border text-secondary flex items-center justify-center mx-auto mb-3">
            <SearchX className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-medium text-foreground mb-1">
            No matching listings found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Your current search or filter combination didn't match any tracked positions.
          </p>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-secondary" />
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md bg-surface border border-border hover:bg-surface-elevated text-foreground disabled:opacity-30 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md bg-surface border border-border hover:bg-surface-elevated text-foreground disabled:opacity-30 transition-colors"
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
