import React from 'react';
import { ExternalLink, RefreshCw, PlusCircle } from 'lucide-react';
import type { Listing } from '../../types';
import { formatRelativeTime, getDaysRemaining } from '../../lib/utils';

interface ListingTableProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export const ListingTable: React.FC<ListingTableProps> = ({ listings, onSelectListing }) => {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-elevated font-mono text-muted-foreground text-[11px]">
              <th className="py-2.5 px-3">Role & Company</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Deadline</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3 text-right">Last seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
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
                  className="hover:bg-surface-elevated transition-colors cursor-pointer group"
                >
                  {/* Role & Company */}
                  <td className="py-2.5 px-3 min-w-[200px]">
                    <div className="font-medium text-foreground">
                      {job.title}
                    </div>
                    <div className="text-muted-foreground text-[11px]">{job.company}</div>
                  </td>

                  {/* Location */}
                  <td className="py-2.5 px-3 text-secondary">{job.location || '—'}</td>

                  {/* Type */}
                  <td className="py-2.5 px-3">
                    {job.job_type ? (
                      <span className="capitalize px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-[11px] font-mono text-secondary">
                        {job.job_type.replace('_', ' ')}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="py-2.5 px-3 font-mono">
                    {job.deadline ? (
                      <span className={isUrgent ? 'text-removed font-medium' : 'text-secondary'}>
                        {deadlineLabel}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Status & Change */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.status === 'active' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-added/10 text-added border border-added/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-removed/10 text-removed border border-removed/20">
                          Removed
                        </span>
                      )}

                      {job.last_change_category === 'edited' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-edited/10 text-edited border border-edited/20">
                          <RefreshCw className="w-2.5 h-2.5" />
                          Edited
                        </span>
                      )}
                      {job.last_change_category === 'added' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-added/10 text-added border border-added/20">
                          <PlusCircle className="w-2.5 h-2.5" />
                          New
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-secondary">
                    <a
                      href={job.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{sourceDomain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  {/* Last Seen */}
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground text-[11px]">
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
