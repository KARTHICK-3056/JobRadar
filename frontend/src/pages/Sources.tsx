import React, { useState } from 'react';
import {
  Server,
  Play,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { useSources, useRuns, useRefresh } from '../hooks/useJobRadar';
import { formatRelativeTime, formatExactDate } from '../lib/utils';
import { Tooltip } from '../components/common/Tooltip';
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
        loading: `Running ${mode.toUpperCase()} crawl for ${sourceId}...`,
        success: (run) => {
          setRefreshingSourceId(null);
          return `${mode.toUpperCase()} crawl complete! Status: ${run.status} (New: ${run.new_count ?? run.new ?? 0}, Updated: ${run.updated_count ?? run.updated ?? 0})`;
        },
        error: (err) => {
          setRefreshingSourceId(null);
          return `Crawl failed: ${err.message || 'Check terminal / robots.txt restrictions'}`;
        },
      }
    );
  };

  const getSourceStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Healthy
          </span>
        );
      case 'stale':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Stale
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3" />
            Blocked (403)
          </span>
        );
      case 'rate_limited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30">
            <Clock className="w-3 h-3" />
            Rate Limited (429)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  const getRunStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            SUCCESS
          </span>
        );
      case 'blocked':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            BLOCKED (403)
          </span>
        );
      case 'rate_limited':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30">
            RATE LIMITED (429)
          </span>
        );
      case 'parser_failure':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            PARSER FAILURE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Sources & Crawl Runs
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor origin ATS board health, compliance enforcement, robots.txt status, and execution audit history
        </p>
      </div>

      {/* 1. Source Target Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Configured Job Sources</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-cyan-400 border border-border">
              {sources.length} targets
            </span>
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Automatic periodic crawls scheduled via APScheduler
          </span>
        </div>

        {isSourcesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-surface/50 border border-border/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sources.map((src: Source) => {
              const isWorking = refreshingSourceId === src.id && refreshMutation.isPending;

              return (
                <div
                  key={src.id}
                  className="rounded-2xl p-5 border border-border bg-surface/70 hover:bg-surface-elevated/70 backdrop-blur-xl transition-all duration-200 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    {/* Header: Name, Status Badge & Type */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-sm md:text-base text-foreground">
                          {src.name}
                        </h3>
                        <span className="text-[11px] font-mono text-muted-foreground uppercase">
                          {src.type} adapter • {src.refresh_interval_minutes}m interval
                        </span>
                      </div>
                      {getSourceStatusBadge(src.status)}
                    </div>

                    {/* URL Link */}
                    <div className="mb-4">
                      <a
                        href={src.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400/80 hover:text-cyan-300 hover:underline inline-flex items-center gap-1 font-mono break-all"
                      >
                        <span className="truncate max-w-[240px]">{src.base_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    {/* Crawl Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-elevated/40 border border-border/60 text-center mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          PARSED
                        </span>
                        <span className="text-xs font-bold text-foreground font-mono">
                          {src.parsed_count}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          DUPLICATE
                        </span>
                        <span className="text-xs font-bold text-foreground font-mono">
                          {src.duplicate_count}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          FAILED
                        </span>
                        <span
                          className={`text-xs font-bold font-mono ${
                            src.failed_count > 0 ? 'text-rose-400' : 'text-foreground'
                          }`}
                        >
                          {src.failed_count}
                        </span>
                      </div>
                    </div>

                    {/* Timestamps & HTTP status */}
                    <div className="space-y-1.5 text-xs text-muted-foreground mb-4 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>Last Attempt:</span>
                        <span className="text-foreground">
                          {formatRelativeTime(src.last_attempted_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last Successful:</span>
                        <span className="text-emerald-400">
                          {formatRelativeTime(src.last_successful_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>HTTP Code:</span>
                        <span
                          className={`font-semibold ${
                            src.last_http_status === 200
                              ? 'text-emerald-400'
                              : src.last_http_status === 403
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {src.last_http_status || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Warnings (if any) */}
                    {src.warnings && src.warnings.length > 0 && (
                      <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Warnings Recorded:</span>
                        </div>
                        {src.warnings.map((w, idx) => (
                          <p key={idx} className="text-[11px] leading-tight text-amber-200/90">
                            • {w}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Run Live vs Simulate Fixture */}
                  <div className="pt-3 border-t border-border flex items-center gap-2">
                    <button
                      onClick={() => handleTriggerRefresh(src.id, 'live')}
                      disabled={isWorking}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      title="Execute live HTTP request adhering to robots.txt and rate limits"
                    >
                      <Play className={`w-3.5 h-3.5 ${isWorking ? 'animate-spin' : ''}`} />
                      <span>Live Crawl</span>
                    </button>

                    <button
                      onClick={() => handleTriggerRefresh(src.id, 'fixture')}
                      disabled={isWorking}
                      className="py-2 px-3 rounded-xl text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      title="Replay offline raw fixture payload"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fixture</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Audit Runs Table Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Crawl Execution Audit Logs</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Immutable run telemetry recording parsed, added, updated, and error payloads
            </p>
          </div>

          {/* Filter Runs by Source */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Filter Source:</span>
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <option value="">All Sources</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isRunsLoading ? (
          <div className="h-64 rounded-2xl bg-surface/50 border border-border/50 animate-pulse" />
        ) : (
          <div className="rounded-2xl border border-border bg-surface/70 backdrop-blur-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50 font-mono text-muted-foreground uppercase text-[11px]">
                    <th className="py-3 px-4">Run ID</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Started</th>
                    <th className="py-3 px-4">Parsed</th>
                    <th className="py-3 px-4">New</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4">Removed</th>
                    <th className="py-3 px-4">Duplicate</th>
                    <th className="py-3 px-4 text-right">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {runs.map((r: Run) => {
                    const isExpanded = expandedRunId === r.run_id;
                    const failedCount = r.failed_count ?? r.failed ?? 0;
                    const hasErrors = (r.errors && r.errors.length > 0) || failedCount > 0;

                    return (
                      <React.Fragment key={r.run_id}>
                        <tr
                          onClick={() => setExpandedRunId(isExpanded ? null : r.run_id)}
                          className="hover:bg-surface-elevated/70 transition-colors cursor-pointer group"
                        >
                          {/* Run ID */}
                          <td className="py-3 px-4 font-mono text-cyan-400 group-hover:underline">
                            <div className="flex items-center gap-1.5">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                              <span>{r.run_id.substring(0, 10)}...</span>
                            </div>
                          </td>

                          {/* Source */}
                          <td className="py-3 px-4 font-medium text-foreground">
                            {r.source_id}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">{getRunStatusBadge(r.status)}</td>

                          {/* Started */}
                          <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                            <Tooltip content={formatExactDate(r.started_at)} side="top">
                              <span>{formatRelativeTime(r.started_at)}</span>
                            </Tooltip>
                          </td>

                          {/* Counts */}
                          <td className="py-3 px-4 font-mono font-bold text-foreground">
                            {r.parsed_count ?? r.parsed ?? 0}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                            {r.new_count ?? r.new ?? 0}
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-400 font-semibold">
                            {r.updated_count ?? r.updated ?? 0}
                          </td>
                          <td className="py-3 px-4 font-mono text-rose-400 font-semibold">
                            {r.removed_count ?? r.removed ?? 0}
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground">
                            {r.duplicate_count ?? r.duplicates ?? 0}
                          </td>

                          {/* Errors column */}
                          <td className="py-3 px-4 text-right">
                            {hasErrors ? (
                              <span className="inline-flex items-center gap-1 text-rose-400 font-bold font-mono">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {r.errors?.length || failedCount}
                              </span>
                            ) : (
                              <span className="text-emerald-400 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                0
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Expandable Diagnostic Row */}
                        {isExpanded && (
                          <tr className="bg-surface-elevated/50">
                            <td colSpan={10} className="p-4 border-t border-border/80">
                              <div className="space-y-3 font-mono text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-cyan-400">
                                    RUN AUDIT DETAILS ({r.run_id})
                                  </span>
                                  <span className="text-muted-foreground">
                                    Target URL: {r.source_url || '—'}
                                  </span>
                                </div>

                                {r.error_message && (
                                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                                    <strong>Failure Reason:</strong> {r.error_message}
                                  </div>
                                )}

                                {r.errors && r.errors.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-rose-400 font-bold uppercase text-[11px]">
                                      Error Stack Traces:
                                    </span>
                                    {r.errors.map((err, i) => (
                                      <div
                                        key={i}
                                        className="p-2.5 rounded-lg bg-surface border border-rose-500/30 text-rose-300 space-y-1"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold uppercase text-[10px]">
                                            Type: {err.type}
                                          </span>
                                          {err.url && (
                                            <span className="text-[10px] text-muted-foreground">
                                              {err.url}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs">{err.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {(!r.errors || r.errors.length === 0) && !r.error_message && (
                                  <p className="text-muted-foreground text-xs">
                                    Crawl finished without fatal schema or HTTP network errors.
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
