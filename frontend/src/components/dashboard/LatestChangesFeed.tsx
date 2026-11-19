import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, RefreshCw, Trash2, PlusCircle } from 'lucide-react';
import type { ChangeEvent } from '../../types';
import { formatRelativeTime } from '../../lib/utils';

interface LatestChangesFeedProps {
  events: ChangeEvent[];
}

export const LatestChangesFeed: React.FC<LatestChangesFeedProps> = ({ events }) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-added/10 text-added border border-added/20">
            <PlusCircle className="w-3 h-3" />
            New
          </span>
        );
      case 'edited':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-edited/10 text-edited border border-edited/20">
            <RefreshCw className="w-3 h-3" />
            Edited
          </span>
        );
      case 'removed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-removed/10 text-removed border border-removed/20">
            <Trash2 className="w-3 h-3" />
            Removed
          </span>
        );
      case 'parser_failure':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-secondary border border-border">
            <AlertTriangle className="w-3 h-3" />
            Parser warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-secondary border border-border">
            {category}
          </span>
        );
    }
  };

  const renderDiffSummary = (event: ChangeEvent) => {
    if (event.change_category === 'added') {
      return <span className="text-muted-foreground text-[11px]">New position ingested</span>;
    }
    if (event.change_category === 'removed') {
      return <span className="text-muted-foreground text-[11px]">Removed after consecutive missing crawl runs</span>;
    }
    if (event.change_category === 'parser_failure') {
      return <span className="text-secondary text-[11px]">{event.after_value || 'Zero items parsed'}</span>;
    }
    if (event.field) {
      return (
        <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <span className="text-secondary">{event.field}:</span>
          <span className="line-through text-removed">
            {event.before_value || 'None'}
          </span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-added font-medium">
            {event.after_value || 'None'}
          </span>
        </span>
      );
    }
    return <span className="text-muted-foreground text-[11px]">Field modified</span>;
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-sm text-foreground">Recent changes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Stream of detected mutations</p>
          </div>
          <Link
            to="/review"
            className="text-xs text-secondary hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Review all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No recent changes detected</p>
          ) : (
            events.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-lg bg-surface-elevated border border-border flex items-start gap-3"
              >
                {/* Company Avatar Initial */}
                <div className="w-7 h-7 rounded-md bg-surface border border-border text-secondary font-mono text-xs flex items-center justify-center shrink-0">
                  {ev.company ? ev.company.charAt(0).toUpperCase() : 'J'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-xs text-foreground truncate">
                      {ev.listing_title}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                      {formatRelativeTime(ev.detected_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    {getCategoryBadge(ev.change_category)}
                    <span className="text-[11px] text-secondary truncate">{ev.company}</span>
                  </div>

                  <div>{renderDiffSummary(ev)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
