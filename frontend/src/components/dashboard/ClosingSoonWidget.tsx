import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink, ArrowRight, AlertCircle } from 'lucide-react';
import type { Listing } from '../../types';
import { getDaysRemaining } from '../../lib/utils';

interface ClosingSoonWidgetProps {
  listings: Listing[];
}

export const ClosingSoonWidget: React.FC<ClosingSoonWidgetProps> = ({ listings }) => {
  const withDeadlines = listings
    .filter((l) => l.status === 'active' && l.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-surface-elevated border border-border text-secondary flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-foreground">Closing soon</h3>
              <p className="text-xs text-muted-foreground">Upcoming application deadlines</p>
            </div>
          </div>
          <Link
            to="/listings?sort=closing_soon"
            className="text-xs text-secondary hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {withDeadlines.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No imminent deadlines in the next 14 days
            </div>
          ) : (
            withDeadlines.map((job) => {
              const { label, isUrgent } = getDaysRemaining(job.deadline);
              return (
                <div
                  key={job.entity_id}
                  className="p-2.5 rounded-lg bg-surface-elevated border border-border flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-foreground truncate">
                        {job.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className="text-secondary">{job.company}</span>
                      <span>•</span>
                      <span>{job.location || 'Remote'}</span>
                    </div>
                  </div>

                  {/* Countdown Badge & Link */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                        isUrgent
                          ? 'bg-removed/10 text-removed border border-removed/20 font-medium'
                          : 'bg-surface text-secondary border border-border'
                      }`}
                    >
                      {isUrgent && <AlertCircle className="w-3 h-3" />}
                      {label}
                    </span>

                    <a
                      href={job.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
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
