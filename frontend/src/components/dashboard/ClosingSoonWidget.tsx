import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink, ArrowRight, AlertCircle } from 'lucide-react';
import type { Listing } from '../../types';
import { getDaysRemaining } from '../../lib/utils';

interface ClosingSoonWidgetProps {
  listings: Listing[];
}

export const ClosingSoonWidget: React.FC<ClosingSoonWidgetProps> = ({ listings }) => {
  // Filter for active listings with deadlines, sort by nearest deadline
  const withDeadlines = listings
    .filter((l) => l.status === 'active' && l.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Closing Soon</h3>
              <p className="text-xs text-muted-foreground">Urgent application deadlines</p>
            </div>
          </div>
          <Link
            to="/listings?sort=closing_soon"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {withDeadlines.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No imminent deadlines detected in the next 14 days.
            </div>
          ) : (
            withDeadlines.map((job) => {
              const { label, isUrgent } = getDaysRemaining(job.deadline);
              return (
                <div
                  key={job.entity_id}
                  className="p-3 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated border border-border/60 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate group-hover:text-cyan-400 transition-colors">
                        {job.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{job.company}</span>
                      <span>•</span>
                      <span>{job.location || 'Remote'}</span>
                    </div>
                  </div>

                  {/* Countdown Badge & Link */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                        isUrgent
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {isUrgent && <AlertCircle className="w-3 h-3" />}
                      {label}
                    </span>

                    <a
                      href={job.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg text-muted-foreground hover:text-cyan-400 transition-colors"
                      title="Open original job posting"
                      aria-label={`Open original job posting for ${job.title}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
