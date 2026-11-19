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
    <header className="h-14 px-4 md:px-6 border-b border-border bg-background sticky top-0 z-20 flex items-center justify-between gap-4">
      {/* Left: Mobile menu toggle & Search Trigger */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-1.5 rounded-md text-secondary hover:text-foreground hover:bg-surface-elevated"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface border border-border text-sm text-muted-foreground hover:border-secondary/40 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent"
          aria-label="Quick search and command palette"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-secondary text-xs">Search listings, companies, sources...</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Freshness, Mock Badge, Refresh, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mock Data Badge */}
        {isMockMode && (
          <Tooltip
            content="API offline or demo mode enabled. Operating with simulated fixtures."
            side="bottom"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-surface border border-border text-secondary">
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo</span>
            </div>
          </Tooltip>
        )}

        {/* System Freshness Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface border border-border text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isStale ? 'bg-edited' : 'bg-added'
            }`}
          />
          <Tooltip
            content={
              isStale
                ? 'Data is stale: last successful crawl exceeds threshold. Click refresh to run crawler.'
                : `Last successful update: ${formatRelativeTime(lastSuccessfulAt)}.`
            }
            side="bottom"
          >
            <span className="font-mono text-secondary text-[11px] hidden sm:inline">
              {isStale ? (
                <span className="text-edited">Stale</span>
              ) : (
                <span>Synced {formatRelativeTime(lastSuccessfulAt)}</span>
              )}
            </span>
          </Tooltip>
        </div>

        {/* Quick Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-md text-secondary hover:text-foreground hover:bg-surface-elevated border border-border transition-colors disabled:opacity-50"
            title="Refresh job data"
            aria-label="Refresh job data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          </button>
        )}

        {/* Visual Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-secondary hover:text-foreground hover:bg-surface-elevated border border-border transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle visual theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
