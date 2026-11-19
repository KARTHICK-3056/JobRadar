import React, { useState } from 'react';
import {
  Server,
  Play,
  FileCode2,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useSources, useRuns, useRefresh } from '../hooks/useJobRadar';
import { formatRelativeTime, formatExactDate } from '../lib/utils';
import type { Source, Run } from '../types';
import { toast } from 'sonner';

export const Sources: React.FC = () => {
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [refreshingSourceId, setRefreshingSourceId] = useState<string | null>(null);

  const { data: sources = [], isLoading: isSourcesLoading } = useSources();
  const { data: runsData, isLoading: isRunsLoading } = useRuns(
    selectedSourceFilter || undefined
  );
  const refreshMutation = useRefresh();

  const runs: Run[] = runsData?.items ?? [];

  const handleTriggerRefresh = (sourceId: string, mode: 'live' | 'fixture') => {
    setRefreshingSourceId(sourceId);
    toast.promise(
      refreshMutation.mutateAsync({ source_id: sourceId, mode }),
      {
        loading: `Running ${mode} crawl for ${sourceId}...`,
        success: (run) => {
          setRefreshingSourceId(null);
          return `Crawl finished (${run.status}): ${run.new_count ?? run.new ?? 0} new, ${run.updated_count ?? run.updated ?? 0} updated`;
        },
        error: (err) => {
          setRefreshingSourceId(null);
          return `Crawl failed: ${err.message || 'Check connection or robots.txt'}`;
        },
      }
    );
  };

  const getSourceStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-added/10 text-added border border-added/20">
            <span className="w-1.5 h-1.5 rounded-full bg-added" />
            Healthy
          </span>
        );
      case 'stale':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-edited/10 text-edited border border-edited/20">
            <span className="w-1.5 h-1.5 rounded-full bg-edited" />
            Stale
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-removed/10 text-removed border border-removed/20">
            <ShieldAlert className="w-3 h-3" />
            Blocked (403)
          </span>
        );
      case 'rate_limited':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface-elevated text-secondary border border-border">
            <Clock className="w-3 h-3" />
            Rate limited (429)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-surface-elevated text-secondary border border-border">
            {status}
          </span>
        );
    }
  };

  const getRunStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-added/10 text-added border border-added/20">
            Success
          </span>
        );
      case 'blocked':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-removed/10 text-removed border border-removed/20">
            Blocked (403)
          </span>
        );
      case 'rate_limited':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-secondary border border-border">
            Rate limited (429)
          </span>
        );
      case 'parser_failure':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-edited/10 text-edited border border-edited/20">
            Parser warning
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-secondary border border-border">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border text-secondary flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-medium text-foreground tracking-tight">
            Sources and crawl runs
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          ATS endpoint status, compliance rules, robots.txt status, and audit execution logs
        </p>
      </div>

      {/* 1. Source Target Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
            <span>Configured job sources</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-secondary">
              {sources.length} sources
            </span>
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Automated periodic crawls via APScheduler
          </span>
        </div>

        {isSourcesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-surface border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sources.map((src: Source) => {
              const isWorking = refreshingSourceId === src.id && refreshMutation.isPending;

              return (
                <div
                  key={src.id}
                  className="rounded-xl p-4 border border-border bg-surface flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Name, Status Badge & Type */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium text-xs md:text-sm text-foreground">
                          {src.name}
                        </h3>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {src.type} adapter • {src.refresh_interval_minutes}m interval
                        </span>
                      </div>
                      {getSourceStatusBadge(src.status)}
                    </div>

                    {/* URL Link */}
                    <div className="mb-3">
                      <a
                        href={src.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-secondary hover:text-foreground inline-flex items-center gap-1 font-mono break-all"
                      >
                        <span className="truncate max-w-[220px]">{src.base_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    {/* Crawl Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-surface-elevated border border-border text-center mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          Parsed
                        </span>
                        <span className="text-xs font-mono font-medium text-foreground">
                          {src.parsed_count}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          Duplicate
                        </span>
                        <span className="text-xs font-mono font-medium text-foreground">
                          {src.duplicate_count}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          Failed
                        </span>
                        <span
                          className={`text-xs font-mono font-medium ${
                            src.failed_count > 0 ? 'text-removed' : 'text-foreground'
                          }`}
                        >
                          {src.failed_count}
                        </span>
                      </div>
                    </div>

                    {/* Details: Attempts, Status */}
                    <div className="space-y-1 text-[11px] font-mono text-muted-foreground mb-3">
                      <div className="flex justify-between">
                        <span>Last attempt:</span>
                        <span className="text-secondary">{formatRelativeTime(src.last_attempted_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last success:</span>
                        <span className="text-secondary">{formatRelativeTime(src.last_successful_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HTTP code:</span>
                        <span className={src.last_http_status === 200 ? 'text-added' : 'text-removed'}>
                          {src.last_http_status || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Warnings Banner if any */}
                    {src.warnings && src.warnings.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-surface-elevated border border-border text-[11px] text-muted-foreground space-y-1 mb-3">
                        <span className="font-mono text-secondary block font-medium">Recorded warnings</span>
                        {src.warnings.map((w, idx) => (
                          <p key={idx} className="leading-tight">• {w}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Live Crawl & Fixture Simulation */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleTriggerRefresh(src.id, 'live')}
                      disabled={isWorking}
                      className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-foreground transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Play className={`w-3 h-3 text-secondary ${isWorking ? 'animate-spin' : ''}`} />
                      Live crawl
                    </button>

                    <button
                      onClick={() => handleTriggerRefresh(src.id, 'fixture')}
                      disabled={isWorking}
                      className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-secondary hover:text-foreground transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <FileCode2 className="w-3 h-3 text-secondary" />
                      Fixture
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Crawl Execution Audit Logs Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Crawl execution audit logs
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Immutable run telemetry recording parsed, added, updated, and error payloads
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Filter source:</span>
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="p-1.5 rounded-md bg-surface border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-accent font-mono"
            >
              <option value="">All sources</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Runs Audit Table */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Started</th>
                  <th className="py-2.5 px-3 text-right">Parsed</th>
                  <th className="py-2.5 px-3 text-right">New</th>
                  <th className="py-2.5 px-3 text-right">Updated</th>
                  <th className="py-2.5 px-3 text-right">Removed</th>
                  <th className="py-2.5 px-3 text-right">Duplicate</th>
                  <th className="py-2.5 px-3 text-center">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isRunsLoading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-muted-foreground">
                      Loading run audit records...
                    </td>
                  </tr>
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-muted-foreground">
                      No run audit records found
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => {
                    const isExpanded = expandedRunId === run.run_id;
                    const errorCount = run.errors?.length || (run.status === 'blocked' ? 1 : 0);

                    return (
                      <React.Fragment key={run.run_id}>
                        <tr
                          onClick={() => setExpandedRunId(isExpanded ? null : run.run_id)}
                          className="hover:bg-surface-elevated cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-secondary flex items-center gap-1.5">
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className="text-foreground">{run.run_id.substring(0, 10)}...</span>
                          </td>
                          <td className="py-2.5 px-3 text-secondary">{run.source_id}</td>
                          <td className="py-2.5 px-3">{getRunStatusBadge(run.status)}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {formatRelativeTime(run.started_at)}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-foreground">{run.parsed_count}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-added">
                            {run.new_count ?? run.new ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-edited">
                            {run.updated_count ?? run.updated ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-removed">
                            {run.removed_count ?? run.removed ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-secondary">
                            {run.duplicate_count ?? run.duplicates ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {errorCount > 0 ? (
                              <span className="text-removed font-medium">{errorCount}</span>
                            ) : (
                              <span className="text-added font-medium">0</span>
                            )}
                          </td>
                        </tr>

                        {/* Expandable detail row */}
                        {isExpanded && (
                          <tr className="bg-surface-elevated">
                            <td colSpan={10} className="p-3 text-xs font-mono space-y-2 border-b border-border">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-muted-foreground block text-[11px]">Full Run ID</span>
                                  <span className="text-foreground text-[11px] break-all">{run.run_id}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[11px]">Source URL</span>
                                  <span className="text-secondary text-[11px] break-all">{run.source_url || '—'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[11px]">Started</span>
                                  <span className="text-foreground text-[11px]">{formatExactDate(run.started_at)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[11px]">Finished</span>
                                  <span className="text-foreground text-[11px]">{formatExactDate(run.finished_at)}</span>
                                </div>
                              </div>

                              {/* Error traces */}
                              {run.errors && run.errors.length > 0 && (
                                <div className="mt-2 p-2.5 rounded bg-surface border border-border space-y-1">
                                  <span className="text-removed block font-medium">Logged error trace</span>
                                  {run.errors.map((err, errIdx) => (
                                    <div key={errIdx} className="text-[11px] text-muted-foreground">
                                      <span className="text-removed">[{err.type}]:</span> {err.message}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
