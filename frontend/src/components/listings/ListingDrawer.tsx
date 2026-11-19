import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Send,
} from 'lucide-react';
import type { Listing, TrackerStage } from '../../types';
import { useListingDetail, useTracker, useUpdateTracker } from '../../hooks/useJobRadar';
import { formatRelativeTime, formatExactDate } from '../../lib/utils';
import { toast } from 'sonner';

interface ListingDrawerProps {
  listing: Listing | null;
  onClose: () => void;
}

export const ListingDrawer: React.FC<ListingDrawerProps> = ({ listing, onClose }) => {
  const { data: detail, isLoading } = useListingDetail(listing?.entity_id || null);
  const { data: trackerList } = useTracker();
  const updateTrackerMutation = useUpdateTracker();

  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedStage, setSelectedStage] = useState<TrackerStage>('saved');
  const [notes, setNotes] = useState('');

  // Sync tracker item for this entity
  const currentTracker = trackerList?.find((t) => t.entity_id === listing?.entity_id);

  useEffect(() => {
    if (currentTracker) {
      setSelectedStage(currentTracker.status);
      setNotes(currentTracker.notes || '');
    } else {
      setSelectedStage('saved');
      setNotes('');
    }
  }, [currentTracker, listing]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!listing) return null;

  const handleCopyHash = () => {
    if (listing.content_hash) {
      navigator.clipboard.writeText(listing.content_hash);
      setCopiedHash(true);
      toast.success('Content hash copied');
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleSaveTracker = () => {
    updateTrackerMutation.mutate(
      {
        entityId: listing.entity_id,
        status: selectedStage,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(`Application stage set to ${selectedStage.replace('_', ' ')}`);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-xl bg-surface border-l border-border shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
          {/* Header */}
          <div className="p-5 border-b border-border bg-surface sticky top-0 z-10">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <span className="text-xs font-mono text-secondary">
                  {listing.company}
                </span>
                <h2 className="text-lg font-medium text-foreground mt-0.5 leading-snug">
                  {listing.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View Original Source Button */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={listing.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-elevated text-secondary hover:text-foreground border border-border transition-colors"
              >
                <span>View original posting</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {listing.status === 'active' ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-added/10 text-added border border-added/20">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-removed/10 text-removed border border-removed/20">
                  Removed
                </span>
              )}
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-5 space-y-5 flex-1">
            {/* Student Tracker Stage Selector */}
            <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  Application stage
                </span>
                <span className="text-[11px] text-secondary font-mono">
                  {currentTracker ? 'Tracked' : 'Not tracked'}
                </span>
              </div>

              {/* Stage Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'saved', label: 'Saved' },
                  { id: 'applied', label: 'Applied' },
                  { id: 'online_test', label: 'Online Test' },
                  { id: 'interview', label: 'Interview' },
                  { id: 'offer', label: 'Offer' },
                  { id: 'rejected', label: 'Rejected' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStage(st.id as TrackerStage)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      selectedStage === st.id
                        ? 'bg-surface text-foreground font-medium border border-secondary'
                        : 'bg-surface border border-border text-secondary hover:text-foreground'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Personal Notes Textarea */}
              <div className="space-y-1.5 pt-1">
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes: resume version, contact, interview topics..."
                  className="w-full p-2.5 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent resize-none font-sans"
                />
                <button
                  onClick={handleSaveTracker}
                  disabled={updateTrackerMutation.isPending}
                  className="w-full py-1.5 rounded-md text-xs font-medium bg-surface hover:bg-surface-elevated border border-border text-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-secondary" />
                  Save application status
                </button>
              </div>
            </div>

            {/* Version History & Diff Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-secondary" />
                  <h3 className="font-medium text-xs text-foreground">
                    Version history and diffs
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {detail?.versions?.length || 1} versions
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-surface-elevated" />
                  <div className="h-16 rounded-lg bg-surface-elevated" />
                </div>
              ) : (
                <div className="relative border-l border-border ml-2.5 space-y-4 py-1">
                  {(detail?.versions || []).map((ver, idx, arr) => {
                    const previousVersion = arr[idx + 1];

                    return (
                      <div key={ver.version_no} className="relative pl-5">
                        {/* Timeline dot */}
                        <div className="absolute -left-1 top-2 w-2 h-2 rounded-full bg-secondary border-2 border-surface" />

                        <div className="p-3 rounded-lg border border-border bg-surface space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-foreground font-medium text-[11px]">
                              Version {ver.version_no}
                            </span>
                            <span
                              className="text-muted-foreground font-mono text-[11px]"
                              title={formatExactDate(ver.detected_at)}
                            >
                              {formatRelativeTime(ver.detected_at)}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-muted-foreground">
                            Run ID: {ver.run_id.substring(0, 10)}...
                          </div>

                          {/* Field level diff comparison if previous version exists */}
                          {previousVersion ? (
                            <div className="pt-2 border-t border-border space-y-1">
                              <span className="text-[10px] font-mono text-secondary block">
                                Field changes
                              </span>
                              {Object.keys(ver.fields || {}).map((fKey) => {
                                const oldVal = previousVersion.fields?.[fKey];
                                const newVal = ver.fields?.[fKey];
                                if (oldVal === newVal) return null;

                                return (
                                  <div key={fKey} className="text-xs space-y-0.5">
                                    <span className="font-mono text-muted-foreground text-[11px] capitalize">
                                      {fKey}:
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="line-through text-removed font-mono text-[11px]">
                                        {oldVal || 'NULL'}
                                      </span>
                                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-added font-mono text-[11px]">
                                        {newVal || 'NULL'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">
                              Initial record ingested from source
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metadata Audit Panel */}
            <div className="p-4 rounded-xl border border-border bg-surface space-y-2.5">
              <span className="text-xs font-medium text-foreground block">
                Audit metadata
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Entity ID</span>
                  <span className="text-foreground text-[11px] break-all">{listing.entity_id}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Source board</span>
                  <span className="text-foreground text-[11px]">{listing.source_id}</span>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-0.5">
                    <span>Content hash (SHA-256)</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-secondary hover:text-foreground inline-flex items-center gap-1 text-[11px]"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-added" /> : <Copy className="w-3 h-3" />}
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-foreground text-[11px] break-all bg-surface-elevated p-1.5 rounded block border border-border">
                    {listing.content_hash}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">First seen</span>
                  <span className="text-foreground text-[11px]">{formatExactDate(listing.first_seen)}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Last seen</span>
                  <span className="text-foreground text-[11px]">{formatExactDate(listing.last_seen)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
