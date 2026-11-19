import React from 'react';
import {
  Briefcase,
  PlusCircle,
  RefreshCw,
  Trash2,
  GitCompare,
  Server,
  AlertTriangle,
} from 'lucide-react';
import { useSummary, useChanges, useListings, useRefresh } from '../hooks/useJobRadar';
import { WelcomeCard } from '../components/dashboard/WelcomeCard';
import { KPICard } from '../components/dashboard/KPICard';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { LatestChangesFeed } from '../components/dashboard/LatestChangesFeed';
import { ClosingSoonWidget } from '../components/dashboard/ClosingSoonWidget';
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
      success: 'Crawl completed successfully',
      error: 'Refresh failed or rate limit encountered',
    });
  };

  if (isSummaryLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-xl bg-surface border border-border" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surface border border-border" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-surface border border-border" />
      </div>
    );
  }

  if (isSummaryError && !summary) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border text-removed flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-base font-medium text-foreground mb-1">Could not load dashboard data</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Check that the backend is running at http://localhost:8000 or operating in mock mode.
        </p>
        <button
          onClick={() => refetchSummary()}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-foreground transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const isStale = summary?.is_stale;

  return (
    <div className="space-y-6">
      {/* Amber Stale Data Banner */}
      {isStale && (
        <div className="rounded-xl border border-edited/30 bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border text-edited flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-xs md:text-sm text-foreground">
                  Data is stale
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-secondary border border-border">
                  {summary?.stale_threshold_minutes}m threshold
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Last attempt: <span className="text-secondary">{formatRelativeTime(summary?.last_attempted_at)}</span> • Last success: <span className="text-secondary">{formatRelativeTime(summary?.last_successful_at)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-foreground transition-colors inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh now
          </button>
        </div>
      )}

      {/* Hero Overview Section */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-mono text-secondary mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-added" />
            Telemetry active
          </div>
          <h1 className="text-xl md:text-2xl font-medium text-foreground tracking-tight">
            Internship and early-career job radar
          </h1>
          <p className="text-xs text-muted-foreground mt-1 leading-normal">
            Automated change tracking across public ATS job boards. Normalized field hashing strips HTML noise and records versions when titles, locations, or deadlines mutate.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] font-mono text-muted-foreground">
            <div>
              Last successful refresh:{' '}
              <span className="text-foreground">
                {formatRelativeTime(summary?.last_successful_at)}
              </span>
            </div>
            <div>•</div>
            <div>
              Monitoring{' '}
              <span className="text-foreground">{summary?.sources_total || 3}</span> sources
            </div>
          </div>
        </div>
      </div>

      {/* First-Run Welcome Explainer (Dismissible) */}
      <WelcomeCard />

      {/* 6 Clickable KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="Active listings"
          value={summary?.active_listings ?? 0}
          icon={Briefcase}
          color="cyan"
          to="/listings?status=active"
          tooltipText="Currently open and verifiable positions across all tracked companies."
        />
        <KPICard
          title="New today"
          value={summary?.new_today ?? 0}
          icon={PlusCircle}
          color="emerald"
          to="/listings?change_category=added"
          tooltipText="New job postings discovered in the last 24 hours."
        />
        <KPICard
          title="Changed today"
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
          tooltipText="Confirmed removals missing from consecutive crawl runs."
        />
        <KPICard
          title="Pending reviews"
          value={summary?.open_reviews ?? 0}
          icon={GitCompare}
          color="violet"
          to="/review?review_status=pending"
          tooltipText="Detected changes awaiting verification or dismissal."
        />
        <KPICard
          title="Healthy sources"
          value={summary?.sources_healthy ?? 0}
          secondaryValue={`/ ${summary?.sources_total ?? 0} active`}
          icon={Server}
          color="slate"
          to="/sources"
          tooltipText="Sources returning 200 OK without rate-limits or blocks."
        />
      </div>

      {/* Activity Chart: 14-day velocity chart */}
      <ActivityChart data={summary?.activity ?? []} />

      {/* Bottom Grid: Latest Changes Feed & Closing Soon Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LatestChangesFeed events={changesData?.items ?? []} />
        <ClosingSoonWidget listings={listingsData?.items ?? []} />
      </div>
    </div>
  );
};
