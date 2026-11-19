import React from 'react';
import {
  Search,
  Sun,
  Moon,
  RefreshCw,
  Database,
  Menu,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Tooltip } from '../common/Tooltip';
import { formatRelativeTime } from '../../lib/utils';

interface TopBarProps {
  isStale?: boolean;
  lastSuccessfulAt?: string | null;
  isMockMode?: boolean;
  onOpenCommandPalette: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onMobileMenuToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isStale = false,
  lastSuccessfulAt,
  isMockMode = false,
  onOpenCommandPalette,
  onRefresh,
  isRefreshing = false,
  onMobileMenuToggle,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 px-4 md:px-6 border-b border-border bg-surface/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
      {/* Left: Mobile menu toggle & Search Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-elevated/60 hover:bg-surface-elevated border border-border text-sm text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="Quick search and command palette"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Search listings, companies, sources...</span>
            <span className="sm:hidden">Search...</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-muted border border-border text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Freshness, Mock Badge, Refresh, Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Mock Data Badge */}
        {isMockMode && (
          <Tooltip
            content="Backend API is currently offline or VITE_USE_MOCK=true. Displaying realistic simulated data with all states."
            side="bottom"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Demo Data</span>
            </div>
          </Tooltip>
        )}

        {/* System Freshness Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated/40 border border-border text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isStale ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isStale ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>

          <Tooltip
            content={
              isStale
                ? 'Data is stale: last successful crawl exceeds threshold. Click refresh to update.'
                : `System healthy. Updated ${formatRelativeTime(lastSuccessfulAt)}.`
            }
            side="bottom"
          >
            <span className="font-mono text-muted-foreground text-[11px] hidden sm:inline">
              {isStale ? (
                <span className="text-amber-400 font-semibold">STALE DATA</span>
              ) : (
                <span>SYNCED {formatRelativeTime(lastSuccessfulAt).toUpperCase()}</span>
              )}
            </span>
          </Tooltip>
        </div>

        {/* Quick Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-muted-foreground hover:text-cyan-400 hover:bg-surface-elevated border border-border/50 transition-all disabled:opacity-50"
            title="Refresh job data"
            aria-label="Refresh job data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-border/50 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle visual theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-violet-400" />
          )}
        </button>
      </div>
    </header>
  );
};
