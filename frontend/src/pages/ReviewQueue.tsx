import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Sparkles,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Keyboard,
  CheckCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useChanges, useReviewChange } from '../hooks/useJobRadar';
import { formatRelativeTime } from '../lib/utils';
import { RadarGraphic } from '../components/common/RadarGraphic';
import type { ChangeEvent } from '../types';
import { toast } from 'sonner';

export const ReviewQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'added' | 'edited' | 'removed' | 'parser_failure'>('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'pending' | 'verified' | 'dismissed'>('pending');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const { data, isLoading } = useChanges({
    category: activeTab === 'all' ? undefined : activeTab,
    review_status: reviewStatusFilter,
  });
  const reviewMutation = useReviewChange();

  const events: ChangeEvent[] = data?.items ?? [];

  // Keyboard navigation shortcuts: J/K to move, V to verify, D to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, Math.max(0, events.length - 1)));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        const current = events[focusedIndex];
        if (current) handleReview(current.id, 'verify');
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const current = events[focusedIndex];
        if (current) handleReview(current.id, 'dismiss');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, events]);

  const handleReview = (id: number, action: 'verify' | 'dismiss') => {
    const targetEvent = events.find((e) => e.id === id);

    reviewMutation.mutate(
      { id, action },
      {
        onSuccess: () => {
          if (action === 'verify') {
            toast.success(`Verified change for ${targetEvent?.company || 'listing'}`);
          } else {
            toast('Change dismissed as false alert', {
              action: {
                label: 'Undo',
                onClick: () => {
                  reviewMutation.mutate({ id, action: 'verify' });
                },
              },
            });
          }
        },
      }
    );
  };

  const handleBulkAction = (action: 'verify' | 'dismiss') => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;

    Promise.all(selectedIds.map((id) => reviewMutation.mutateAsync({ id, action }))).then(() => {
      toast.success(
        action === 'verify' ? `Bulk verified ${count} items` : `Bulk dismissed ${count} items`
      );
      setSelectedIds([]);
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === events.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(events.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Tab definitions with count badges
  const tabs = [
    { id: 'all', label: 'All Events' },
    { id: 'added', label: 'New', icon: Sparkles, color: 'text-emerald-400' },
    { id: 'edited', label: 'Changed', icon: RefreshCw, color: 'text-amber-400' },
    { id: 'removed', label: 'Removed', icon: Trash2, color: 'text-rose-400' },
    { id: 'parser_failure', label: 'Parser Failures', icon: AlertTriangle, color: 'text-violet-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Change Review Queue
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Review and verify detected field-level mutations, new listings, and confirmed removals
          </p>
        </div>

        {/* Status Review Filter Tabs (Pending vs History) */}
        <div className="flex items-center p-1 rounded-xl bg-surface border border-border text-xs">
          <button
            onClick={() => setReviewStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              reviewStatusFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setReviewStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              reviewStatusFilter === 'verified'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Verified History
          </button>
          <button
            onClick={() => setReviewStatusFilter('dismissed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              reviewStatusFilter === 'dismissed'
                ? 'bg-surface-elevated text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dismissed
          </button>
        </div>
      </div>

      {/* Category Tabs & Bulk Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = (events || []).filter(
              (e) => tab.id === 'all' || e.change_category === tab.id
            ).length;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setFocusedIndex(0);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-surface-elevated text-foreground border border-cyan-500/40 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated/40'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${tab.color}`} />}
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-surface border border-border">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <span className="text-xs font-mono text-cyan-400">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('verify')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Verify Selected
            </button>
            <button
              onClick={() => handleBulkAction('dismiss')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss Selected
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-between px-4 py-2 rounded-xl bg-surface-elevated/30 border border-border/80 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-foreground">Pro Tips:</span>
          <span>Use keyboard shortcuts for fast reviewing</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">J</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">K</kbd> navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">V</kbd> verify
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">D</kbd> dismiss
          </span>
        </div>
      </div>

      {/* Review Queue Items */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-surface/50 border border-border/50" />
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl border border-border bg-surface/40 backdrop-blur-xl">
          <div className="flex justify-center mb-4">
            <RadarGraphic size={120} />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            All caught up! No changes pending review
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            JobRadar has processed all recent board updates. When a company changes a deadline or title, it will surface here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all checkbox row */}
          <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.length === events.length && events.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-border text-cyan-500 focus:ring-cyan-500/40"
              />
              <span>Select all {events.length} items</span>
            </label>
            <span className="font-mono text-[11px]">
              Showing {events.length} events
            </span>
          </div>

          {events.map((event, idx) => {
            const isFocused = idx === focusedIndex;
            const isSelected = selectedIds.includes(event.id);

            return (
              <div
                key={event.id}
                onClick={() => setFocusedIndex(idx)}
                className={`relative rounded-2xl p-5 border transition-all duration-200 backdrop-blur-xl ${
                  isFocused
                    ? 'border-cyan-500/60 bg-surface-elevated/70 shadow-glass-glow'
                    : 'border-border bg-surface/70 hover:bg-surface-elevated/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Checkbox, Details, Badge */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(event.id)}
                      className="mt-1 rounded border-border text-cyan-500 focus:ring-cyan-500/40"
                    />

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {event.listing_title}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-semibold text-cyan-400">
                          {event.company}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground ml-auto lg:ml-0">
                          {formatRelativeTime(event.detected_at)}
                        </span>
                      </div>

                      {/* Diff Comparison Presentation */}
                      <div className="pt-2">
                        {event.change_category === 'added' ? (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span>New job listing detected and ingested into database.</span>
                          </div>
                        ) : event.change_category === 'removed' ? (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                            <Trash2 className="w-4 h-4 shrink-0" />
                            <span>Listing confirmed removed after consecutive missing crawl runs.</span>
                          </div>
                        ) : event.change_category === 'parser_failure' ? (
                          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>
                              <strong>Parser Failure:</strong> {event.after_value || 'Zero items extracted from page.'}
                            </span>
                          </div>
                        ) : (
                          /* Side-by-side field diff */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                              <span className="text-[11px] font-mono text-rose-400 font-semibold block uppercase">
                                Previous {event.field || 'value'}
                              </span>
                              <span className="line-through text-rose-300 font-mono text-xs break-all">
                                {event.before_value || '— (None)'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                              <span className="text-[11px] font-mono text-emerald-400 font-semibold block uppercase flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                Updated {event.field || 'value'}
                              </span>
                              <span className="text-emerald-200 font-bold font-mono text-xs break-all">
                                {event.after_value || '— (None)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  {reviewStatusFilter === 'pending' && (
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      <button
                        onClick={() => handleReview(event.id, 'verify')}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm disabled:opacity-50"
                        title="Verify this change (shortcut: V)"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>

                      <button
                        onClick={() => handleReview(event.id, 'dismiss')}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-surface-elevated hover:bg-rose-500/20 hover:text-rose-300 border border-border text-muted-foreground transition-colors disabled:opacity-50"
                        title="Dismiss as false alert (shortcut: D)"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  )}

                  {reviewStatusFilter !== 'pending' && (
                    <div className="shrink-0 self-end lg:self-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${
                          event.review_status === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {event.review_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
