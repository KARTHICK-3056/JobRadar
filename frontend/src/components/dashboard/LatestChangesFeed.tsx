import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            New
          </span>
        );
      case 'edited':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <RefreshCw className="w-3 h-3" />
            Changed
          </span>
        );
      case 'removed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Trash2 className="w-3 h-3" />
            Removed
          </span>
        );
      case 'parser_failure':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-500/15 text-violet-400 border border-violet-500/30">
            <AlertTriangle className="w-3 h-3" />
            Parser failure
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
            {category}
          </span>
        );
    }
  };

  const renderDiffSummary = (event: ChangeEvent) => {
    if (event.change_category === 'added') {
      return <span className="text-muted-foreground">Newly listed position detected on job board</span>;
    }
    if (event.change_category === 'removed') {
      return <span className="text-muted-foreground">Listing confirmed removed after consecutive missing crawl runs</span>;
    }
    if (event.change_category === 'parser_failure') {
      return <span className="text-violet-400">{event.after_value || 'Zero items extracted from page'}</span>;
    }
    if (event.field) {
      return (
        <span className="font-mono text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <span className="text-foreground capitalize">{event.field}:</span>
          <span className="line-through text-rose-400/90 bg-rose-500/10 px-1.5 py-0.5 rounded">
            {event.before_value || 'None'}
          </span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold">
            {event.after_value || 'None'}
          </span>
        </span>
      );
    }
    return <span className="text-muted-foreground">Field mutation detected</span>;
  };

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base text-foreground">Latest Detected Changes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time mutation stream</p>
          </div>
          <Link
            to="/review"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Review all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No recent changes detected.</p>
          ) : (
            events.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated border border-border/60 transition-all flex items-start gap-3"
              >
                {/* Company Avatar Initial */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {ev.company ? ev.company.charAt(0).toUpperCase() : 'J'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {ev.listing_title}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                      {formatRelativeTime(ev.detected_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    {getCategoryBadge(ev.change_category)}
                    <span className="text-xs text-muted-foreground truncate">{ev.company}</span>
                  </div>

                  <div className="text-xs">{renderDiffSummary(ev)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
