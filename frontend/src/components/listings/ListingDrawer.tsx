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
      toast.success('SHA-256 Content Hash copied to clipboard');
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
          toast.success(`Application updated to stage: "${selectedStage.replace('_', ' ')}"`);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-surface border-l border-border shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-6 border-b border-border bg-surface-elevated/40 sticky top-0 backdrop-blur-md z-10">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
                  {listing.company}
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5 leading-snug">
                  {listing.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Original Source Button */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={listing.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
              >
                <span>View Original Job Posting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {listing.status === 'active' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  Removed (Confirmed)
                </span>
              )}
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1">
            {/* Student Tracker Stage Selector */}
            <div className="p-4 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/20 via-surface-elevated/40 to-surface/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase font-mono tracking-wider">
                  Personal Application Tracker
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  {currentTracker ? 'TRACKED' : 'UNSAVED'}
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedStage === st.id
                        ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                        : 'bg-surface border border-border text-muted-foreground hover:text-foreground'
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
                  placeholder="Add notes: resume version used, referral contact, prep topics..."
                  className="w-full p-2.5 rounded-xl bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none font-sans"
                />
                <button
                  onClick={handleSaveTracker}
                  disabled={updateTrackerMutation.isPending}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-surface border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Tracker Changes
                </button>
              </div>
            </div>

            {/* Version History & Diff Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Version History & Diffs
                  </h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {detail?.versions?.length || 1} snapshots recorded
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-20 rounded-xl bg-surface-elevated/40" />
                  <div className="h-20 rounded-xl bg-surface-elevated/40" />
                </div>
              ) : (
                <div className="relative border-l border-border/80 ml-3.5 space-y-6 py-2">
                  {(detail?.versions || []).map((ver, idx, arr) => {
                    const previousVersion = arr[idx + 1];

                    return (
                      <div key={ver.version_no} className="relative pl-6">
                        {/* Timeline dot */}
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-surface shadow-sm" />

                        <div className="p-4 rounded-xl border border-border/80 bg-surface-elevated/40 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground font-mono">
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
                            Run ID:{' '}
                            <span className="text-foreground">{ver.run_id.substring(0, 12)}...</span>
                          </div>

                          {/* Field level diff comparison if previous version exists */}
                          {previousVersion ? (
                            <div className="pt-2 border-t border-border/60 space-y-1.5">
                              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider font-mono">
                                Field-Level Diff:
                              </span>
                              {Object.keys(ver.fields || {}).map((fKey) => {
                                const oldVal = previousVersion.fields?.[fKey];
                                const newVal = ver.fields?.[fKey];
                                if (oldVal === newVal) return null;

                                return (
                                  <div key={fKey} className="text-xs space-y-0.5">
                                    <span className="font-mono text-muted-foreground capitalize">
                                      {fKey}:
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="line-through text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono text-[11px]">
                                        {oldVal || 'NULL'}
                                      </span>
                                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold font-mono text-[11px]">
                                        {newVal || 'NULL'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Initial record ingested from source.
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
            <div className="p-4 rounded-xl border border-border/80 bg-surface-elevated/30 space-y-3">
              <span className="text-xs font-semibold text-foreground uppercase font-mono tracking-wider">
                Auditing Metadata
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground block text-[11px]">ENTITY ID</span>
                  <span className="text-foreground break-all">{listing.entity_id}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">SOURCE BOARD</span>
                  <span className="text-cyan-400">{listing.source_id}</span>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-0.5">
                    <span>CONTENT HASH (SHA-256)</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 text-[11px]"
                    >
                      {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-foreground text-[11px] break-all bg-surface p-1.5 rounded block border border-border/60">
                    {listing.content_hash}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">FIRST SEEN</span>
                  <span className="text-foreground">{formatExactDate(listing.first_seen)}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">LAST SEEN</span>
                  <span className="text-foreground">{formatExactDate(listing.last_seen)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
