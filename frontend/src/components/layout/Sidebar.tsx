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
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    { name: 'Tracker', path: '/tracker', icon: Kanban },
    { name: 'Sources & Runs', path: '/sources', icon: Server },
    { name: 'Evidence', path: '/evidence', icon: FileCheck2 },
  ];

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col border-r border-border bg-surface/80 backdrop-blur-xl transition-all duration-300 z-30 select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-border justify-between">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 shadow-glass-glow flex-shrink-0">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
                JobRadar
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Mission Control v1.0
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/25 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-cyan-400' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}

                {/* Badge (e.g. pending review count) */}
                {item.badge !== undefined && !collapsed && (
                  <span
                    className={cn(
                      'ml-auto text-xs px-2 py-0.5 rounded-full font-mono border',
                      item.badgeColor || 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {item.badge !== undefined && collapsed && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-background" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Mission Status */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-surface-elevated/70 to-surface/40 border border-border text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between font-mono text-[11px] text-foreground">
            <span>RADAR STATUS</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Change detection active. Automatic versioning enabled.
          </p>
        </div>
      )}
    </aside>
  );
};
