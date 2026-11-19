import React from 'react';
import {
  Briefcase,
  Sparkles,
  RefreshCw,
  Trash2,
  GitCompare,
  Server,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { useSummary, useChanges, useListings, useRefresh } from '../hooks/useJobRadar';
import { WelcomeCard } from '../components/dashboard/WelcomeCard';
import { KPICard } from '../components/dashboard/KPICard';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { LatestChangesFeed } from '../components/dashboard/LatestChangesFeed';
import { ClosingSoonWidget } from '../components/dashboard/ClosingSoonWidget';
import { RadarGraphic } from '../components/common/RadarGraphic';
import { formatRelativeTime } from '../lib/utils';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError, refetch: refetchSummary } = useSummary();
  const { data: changesData } = useChanges();
  const { data: listingsData } = useListings();
  const refreshMutation = useRefresh();

  const handleRefresh = () => {
    toast.promise(refreshMutation.mutateAsync({ mode: 'live' }), {
      loading: 'Polling configured sources for fresh listings...',
      success: 'Crawl completed successfully!',
      error: 'Refresh failed or rate limit encountered.',
    });
  };

  if (isSummaryLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-surface/50 border border-border/50" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface/40 border border-border/40" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-surface/50 border border-border/50" />
      </div>
    );
  }

  if (isSummaryError && !summary) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Could not load dashboard data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Please check that the backend is running at http://localhost:8000 or enable mock data.
        </p>
        <button
          onClick={() => refetchSummary()}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors inline-flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const isStale = summary?.is_stale;

  return (
    <div className="space-y-6">
      {/* Prominent Amber Stale Data Banner (if is_stale) */}
      {isStale && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-surface to-amber-500/10 p-4 md:p-5 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm md:text-base text-amber-300">
                  STALE DATA DETECTED
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {summary?.stale_threshold_minutes}m threshold
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last attempted: <span className="text-foreground">{formatRelativeTime(summary?.last_attempted_at)}</span> • Last successful: <span className="text-foreground">{formatRelativeTime(summary?.last_successful_at)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh now
          </button>
        </div>
      )}

      {/* Hero Mission Control Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface-elevated/80 via-surface/90 to-surface/40 p-6 md:p-8 backdrop-blur-2xl shadow-glass">
        {/* Subtle background radar sweep graphic */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none hidden lg:block">
          <RadarGraphic size={200} />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Radar Telemetry • Active Monitoring
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Internship & Early-Career Radar
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Real-time change tracking across public ATS job boards and placement pages. Normalized diffing flags edits, new roles, and confirmed removals with zero false alarms.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono text-muted-foreground">
            <div>
              Last successful refresh:{' '}
              <span className="text-cyan-400 font-semibold">
                {formatRelativeTime(summary?.last_successful_at)}
              </span>
            </div>
            <div>•</div>
            <div>
              Monitoring{' '}
              <span className="text-foreground font-semibold">{summary?.sources_total || 3}</span>{' '}
              sources
            </div>
          </div>
        </div>
      </div>

      {/* First-Run Welcome Explainer (Dismissible) */}
      <WelcomeCard />

      {/* 6 Clickable KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <KPICard
          title="Active Listings"
          value={summary?.active_listings ?? 0}
          icon={Briefcase}
          color="cyan"
          to="/listings?status=active"
          tooltipText="Currently open and verifiable positions across all tracked companies."
        />
        <KPICard
          title="New Today"
          value={summary?.new_today ?? 0}
          icon={Sparkles}
          color="emerald"
          to="/listings?change_category=added"
          tooltipText="Brand new job postings discovered in the last 24 hours."
        />
        <KPICard
          title="Changed Today"
          value={summary?.edited_today ?? 0}
          icon={RefreshCw}
          color="amber"
          to="/listings?change_category=edited"
          tooltipText="Listings where title, location, or deadline changed."
        />
        <KPICard
          title="Removed"
          value={summary?.removed_confirmed ?? 0}
          icon={Trash2}
          color="rose"
          to="/listings?status=removed"
          tooltipText="Confirmed removals (missing from N consecutive successful crawl runs)."
        />
        <KPICard
          title="Pending Review"
          value={summary?.open_reviews ?? 0}
          icon={GitCompare}
          color="violet"
          to="/review?review_status=pending"
          tooltipText="Detected changes awaiting your verification or dismissal."
        />
        <KPICard
          title="Sources Healthy"
          value={summary?.sources_healthy ?? 0}
          secondaryValue={`/ ${summary?.sources_total ?? 0}`}
          icon={Server}
          color="slate"
          to="/sources"
          tooltipText="Sources currently returning 200 OK without rate-limits or blocks."
        />
      </div>

      {/* Activity Chart: 14-day stacked area chart */}
      <ActivityChart data={summary?.activity ?? []} />

      {/* Bottom Grid: Latest Changes Feed & Closing Soon Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestChangesFeed events={changesData?.items ?? []} />
        <ClosingSoonWidget listings={listingsData?.items ?? []} />
      </div>
    </div>
  );
};
