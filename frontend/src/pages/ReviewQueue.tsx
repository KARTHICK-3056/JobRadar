import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  PlusCircle,
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
    { id: 'all', label: 'All events' },
    { id: 'added', label: 'New', icon: PlusCircle },
    { id: 'edited', label: 'Edited', icon: RefreshCw },
    { id: 'removed', label: 'Removed', icon: Trash2 },
    { id: 'parser_failure', label: 'Parser warnings', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border text-secondary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Change review queue
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review and verify detected field-level mutations, new listings, and confirmed removals
          </p>
        </div>

        {/* Status Review Filter Tabs */}
        <div className="flex items-center p-0.5 rounded-lg bg-surface border border-border text-xs">
          <button
            onClick={() => setReviewStatusFilter('pending')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              reviewStatusFilter === 'pending'
                ? 'bg-surface-elevated text-foreground border border-border'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            Pending review
          </button>
          <button
            onClick={() => setReviewStatusFilter('verified')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              reviewStatusFilter === 'verified'
                ? 'bg-surface-elevated text-foreground border border-border'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            Verified history
          </button>
          <button
            onClick={() => setReviewStatusFilter('dismissed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              reviewStatusFilter === 'dismissed'
                ? 'bg-surface-elevated text-foreground border border-border'
                : 'text-secondary hover:text-foreground'
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-surface-elevated text-foreground font-medium border border-border'
                    : 'text-secondary hover:text-foreground hover:bg-surface-elevated/50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-secondary" />}
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-muted-foreground">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-secondary">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('verify')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-elevated text-added border border-border hover:bg-surface transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Verify selected
            </button>
            <button
              onClick={() => handleBulkAction('dismiss')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-elevated text-secondary border border-border hover:bg-surface transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss selected
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-between px-3.5 py-2 rounded-lg bg-surface border border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Keyboard className="w-3.5 h-3.5 text-secondary" />
          <span>Keyboard shortcuts:</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-secondary">J</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-secondary">K</kbd> navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-secondary">V</kbd> verify
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-secondary">D</kbd> dismiss
          </span>
        </div>
      </div>

      {/* Review Queue Items */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surface border border-border" />
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-xl border border-border bg-surface">
          <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border text-secondary flex items-center justify-center mx-auto mb-3">
            <Check className="w-5 h-5 text-added" />
          </div>
          <h2 className="text-sm font-medium text-foreground mb-1">
            No changes pending review
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            All detected updates have been reviewed. When a company changes a deadline, title, or location, it will surface here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Select all checkbox row */}
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.length === events.length && events.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-border text-foreground focus:ring-accent"
              />
              <span>Select all {events.length} items</span>
            </label>
            <span className="font-mono text-[11px]">
              {events.length} events
            </span>
          </div>

          {events.map((event, idx) => {
            const isFocused = idx === focusedIndex;
            const isSelected = selectedIds.includes(event.id);

            return (
              <div
                key={event.id}
                onClick={() => setFocusedIndex(idx)}
                className={`relative rounded-xl p-4 border transition-colors duration-150 ${
                  isFocused
                    ? 'border-secondary/60 bg-surface-elevated'
                    : 'border-border bg-surface hover:bg-surface-elevated/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Checkbox, Details, Badge */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(event.id)}
                      className="mt-1 rounded border-border text-foreground focus:ring-accent"
                    />

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-xs md:text-sm text-foreground">
                          {event.listing_title}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-secondary font-mono">
                          {event.company}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground ml-auto lg:ml-0">
                          {formatRelativeTime(event.detected_at)}
                        </span>
                      </div>

                      {/* Diff Comparison Presentation */}
                      <div className="pt-1">
                        {event.change_category === 'added' ? (
                          <div className="p-2.5 rounded-lg bg-surface border border-border text-xs text-secondary flex items-center gap-2">
                            <PlusCircle className="w-3.5 h-3.5 text-added shrink-0" />
                            <span>New job listing detected and ingested into database</span>
                          </div>
                        ) : event.change_category === 'removed' ? (
                          <div className="p-2.5 rounded-lg bg-surface border border-border text-xs text-secondary flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5 text-removed shrink-0" />
                            <span>Listing confirmed removed after consecutive missing crawl runs</span>
                          </div>
                        ) : event.change_category === 'parser_failure' ? (
                          <div className="p-2.5 rounded-lg bg-surface border border-border text-xs text-secondary flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-edited shrink-0" />
                            <span>
                              <strong>Parser Warning:</strong> {event.after_value || 'Zero items extracted from page'}
                            </span>
                          </div>
                        ) : (
                          /* Side-by-side field diff */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
                              <span className="text-[10px] font-mono text-secondary block">
                                Previous {event.field || 'value'}
                              </span>
                              <span className="line-through text-removed font-mono text-xs break-all">
                                {event.before_value || '— (None)'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
                              <span className="text-[10px] font-mono text-secondary block flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                Updated {event.field || 'value'}
                              </span>
                              <span className="text-added font-mono text-xs break-all">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-added transition-colors disabled:opacity-50"
                        title="Verify this change (shortcut: V)"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>

                      <button
                        onClick={() => handleReview(event.id, 'dismiss')}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-secondary hover:text-foreground transition-colors disabled:opacity-50"
                        title="Dismiss as false alert (shortcut: D)"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  )}

                  {reviewStatusFilter !== 'pending' && (
                    <div className="shrink-0 self-end lg:self-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono capitalize border border-border bg-surface text-secondary">
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
