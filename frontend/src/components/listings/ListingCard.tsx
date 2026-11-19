import React from 'react';
import {
  MapPin,
  Clock,
  RefreshCw,
  ExternalLink,
  Bookmark,
  Calendar,
  PlusCircle,
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
          toast.success(isSaved ? 'Listing bookmarked in Tracker' : 'Saved to Tracker');
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
      className="group relative rounded-xl p-4 border border-border bg-surface hover:bg-surface-elevated transition-colors duration-150 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Company Avatar, Title, Status & Changed Badge */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-foreground font-mono text-xs font-medium flex items-center justify-center shrink-0">
              {listing.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-xs md:text-sm text-foreground truncate">
                {listing.title}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">{listing.company}</p>
            </div>
          </div>

          {/* Quick Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-md border transition-colors ${
              isSaved
                ? 'bg-surface-elevated border-secondary text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
            title={isSaved ? 'Saved in Tracker' : 'Save to Tracker'}
            aria-label="Save to Tracker"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Badges Row: Status, Job Type, Change indicator */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Status chip */}
          {listing.status === 'active' ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-added/10 text-added border border-added/20">
              Active
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-removed/10 text-removed border border-removed/20">
              Removed
            </span>
          )}

          {/* Job Type chip */}
          {listing.job_type && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-secondary border border-border capitalize">
              {listing.job_type.replace('_', ' ')}
            </span>
          )}

          {/* Changed Indicator */}
          {listing.last_change_category === 'edited' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-edited/10 text-edited border border-edited/20">
              <RefreshCw className="w-3 h-3" />
              Edited
            </span>
          )}
          {listing.last_change_category === 'added' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-added/10 text-added border border-added/20">
              <PlusCircle className="w-3 h-3" />
              New
            </span>
          )}
        </div>

        {/* Location & Deadline Row */}
        <div className="space-y-1 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="truncate text-secondary text-[11px]">{listing.location || '—'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
            {listing.deadline ? (
              <span
                className={`font-mono text-[11px] ${
                  isUrgent ? 'text-removed font-medium' : 'text-secondary'
                }`}
              >
                {deadlineLabel}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">No deadline specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Source attribution & Seen timestamps */}
      <div className="pt-2.5 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <a
          href={listing.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-secondary hover:text-foreground transition-colors"
          title={`Open original posting on ${sourceDomain}`}
        >
          <span>{sourceDomain}</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Seen {formatRelativeTime(listing.last_seen)}</span>
        </div>
      </div>
    </div>
  );
};
