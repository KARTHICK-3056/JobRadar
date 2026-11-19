import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GitCompare,
  Kanban,
  Server,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  pendingReviewsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  pendingReviewsCount = 0,
}) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Listings', path: '/listings', icon: Briefcase },
    {
      name: 'Review Queue',
      path: '/review',
      icon: GitCompare,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
    },
    { name: 'Tracker', path: '/tracker', icon: Kanban },
    { name: 'Sources & Runs', path: '/sources', icon: Server },
    { name: 'Evidence', path: '/evidence', icon: FileCheck2 },
  ];

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col border-r border-border bg-background transition-all duration-200 z-30 select-none',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-border justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-elevated border border-border text-foreground shrink-0">
            <Radio className="w-4 h-4 text-accent" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm tracking-tight text-foreground">
                JobRadar
              </span>
              <span className="text-[11px] font-mono text-muted-foreground truncate">
                Change radar
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 relative',
                isActive
                  ? 'bg-surface-elevated text-foreground font-medium border border-border'
                  : 'text-secondary hover:text-foreground hover:bg-surface-elevated/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}

                {/* Badge (e.g. pending review count) */}
                {item.badge !== undefined && !collapsed && (
                  <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded font-mono bg-surface border border-border text-secondary">
                    {item.badge}
                  </span>
                )}
                {item.badge !== undefined && collapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Status */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-lg bg-surface border border-border text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-secondary font-mono">Status</span>
            <span className="text-added flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-added" />
              Active
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            Autonomous change detection running
          </p>
        </div>
      )}
    </aside>
  );
};
