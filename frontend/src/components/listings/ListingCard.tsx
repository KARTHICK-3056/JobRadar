import React from 'react';
import {
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Bookmark,
  Calendar,
} from 'lucide-react';
import type { Listing } from '../../types';
import { formatRelativeTime, getDaysRemaining } from '../../lib/utils';
import { useTracker, useUpdateTracker } from '../../hooks/useJobRadar';
import { toast } from 'sonner';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const { data: trackerList } = useTracker();
  const updateTrackerMutation = useUpdateTracker();

  const isSaved = trackerList?.some((t) => t.entity_id === listing.entity_id);
  const { label: deadlineLabel, isUrgent } = getDaysRemaining(listing.deadline);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTrackerMutation.mutate(
      { entityId: listing.entity_id, status: 'saved' },
      {
        onSuccess: () => {
          toast.success(isSaved ? 'Listing bookmarked in Tracker' : 'Saved to Tracker!');
        },
      }
    );
  };

  // Extract domain for source attribution
  let sourceDomain = 'source';
  try {
    sourceDomain = new URL(listing.canonical_url).hostname.replace('www.', '');
  } catch {
    sourceDomain = listing.source_id;
  }

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl p-5 border border-border bg-surface/70 hover:bg-surface-elevated/90 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-card-hover cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Company Avatar, Title, Status & Changed Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-sm flex items-center justify-center shrink-0">
              {listing.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm md:text-base text-foreground truncate group-hover:text-cyan-400 transition-colors">
                {listing.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{listing.company}</p>
            </div>
          </div>

          {/* Quick Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                : 'border-border/60 text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/30'
            }`}
            title={isSaved ? 'Saved in Tracker' : 'Save to Tracker'}
            aria-label="Save to Tracker"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Badges Row: Status, Job Type, Change indicator */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {/* Status chip */}
          {listing.status === 'active' ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Removed
            </span>
          )}

          {/* Job Type chip */}
          {listing.job_type && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-muted-foreground border border-border capitalize">
              {listing.job_type.replace('_', ' ')}
            </span>
          )}

          {/* Changed Indicator */}
          {listing.last_change_category === 'edited' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <RefreshCw className="w-3 h-3" />
              Changed
            </span>
          )}
          {listing.last_change_category === 'added' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              New
            </span>
          )}
        </div>

        {/* Location & Deadline Row */}
        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{listing.location || '—'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {listing.deadline ? (
              <span
                className={`font-mono font-medium ${
                  isUrgent ? 'text-rose-400 font-semibold' : 'text-foreground'
                }`}
              >
                {deadlineLabel}
              </span>
            ) : (
              <span>No deadline specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Source attribution & Seen timestamps */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <a
          href={listing.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-cyan-400/80 hover:text-cyan-300 hover:underline transition-colors"
          title={`Open original posting on ${sourceDomain}`}
        >
          <span>Source: {sourceDomain}</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center gap-1" title={`First seen: ${new Date(listing.first_seen).toLocaleString()}`}>
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span>Seen {formatRelativeTime(listing.last_seen)}</span>
        </div>
      </div>
    </div>
  );
};
