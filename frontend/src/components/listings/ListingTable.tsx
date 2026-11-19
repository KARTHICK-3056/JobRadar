import React from 'react';
import { ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import type { Listing } from '../../types';
import { formatRelativeTime, getDaysRemaining } from '../../lib/utils';

interface ListingTableProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export const ListingTable: React.FC<ListingTableProps> = ({ listings, onSelectListing }) => {
  return (
    <div className="rounded-2xl border border-border bg-surface/70 backdrop-blur-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/50 font-mono text-muted-foreground uppercase text-[11px]">
              <th className="py-3 px-4">Role & Company</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4 text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {listings.map((job) => {
              const { label: deadlineLabel, isUrgent } = getDaysRemaining(job.deadline);
              let sourceDomain = 'source';
              try {
                sourceDomain = new URL(job.canonical_url).hostname.replace('www.', '');
              } catch {
                sourceDomain = job.source_id;
              }

              return (
                <tr
                  key={job.entity_id}
                  onClick={() => onSelectListing(job)}
                  className="hover:bg-surface-elevated/70 transition-colors cursor-pointer group"
                >
                  {/* Role & Company */}
                  <td className="py-3 px-4 min-w-[220px]">
                    <div className="font-semibold text-foreground group-hover:text-cyan-400 transition-colors">
                      {job.title}
                    </div>
                    <div className="text-muted-foreground text-[11px]">{job.company}</div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-muted-foreground">{job.location || '—'}</td>

                  {/* Type */}
                  <td className="py-3 px-4">
                    {job.job_type ? (
                      <span className="capitalize px-2 py-0.5 rounded bg-surface-elevated border border-border text-[11px]">
                        {job.job_type.replace('_', ' ')}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4 font-mono">
                    {job.deadline ? (
                      <span className={isUrgent ? 'text-rose-400 font-semibold' : 'text-foreground'}>
                        {deadlineLabel}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Status & Change */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.status === 'active' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Removed
                        </span>
                      )}

                      {job.last_change_category === 'edited' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <RefreshCw className="w-2.5 h-2.5" />
                          Changed
                        </span>
                      )}
                      {job.last_change_category === 'added' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Sparkles className="w-2.5 h-2.5" />
                          New
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="py-3 px-4 font-mono">
                    <a
                      href={job.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-cyan-400/80 hover:text-cyan-300 hover:underline"
                    >
                      <span>{sourceDomain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  {/* Last Seen */}
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(job.last_seen)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
