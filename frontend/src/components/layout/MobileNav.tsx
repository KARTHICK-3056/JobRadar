import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GitCompare,
  Kanban,
  Server,
  FileCheck2,
  X,
  Radio,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  pendingReviewsCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  open,
  onClose,
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-surface border-r border-border p-5 flex flex-col justify-between z-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-elevated border border-border text-foreground">
                <Radio className="w-4 h-4 text-accent" />
              </div>
              <span className="font-medium text-sm text-foreground">JobRadar</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-surface-elevated text-foreground font-medium border border-border'
                      : 'text-secondary hover:text-foreground hover:bg-surface-elevated/50'
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded font-mono bg-surface border border-border text-secondary">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          <p className="font-mono text-secondary">JobRadar active</p>
          <p className="text-[11px] mt-0.5 text-muted-foreground">Versioned change tracking</p>
        </div>
      </div>
    </div>
  );
};

export const MobileBottomBar: React.FC<{ pendingReviewsCount?: number }> = ({
  pendingReviewsCount = 0,
}) => {
  const primaryTabs = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Listings', path: '/listings', icon: Briefcase },
    {
      name: 'Review',
      path: '/review',
      icon: GitCompare,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
    },
    { name: 'Tracker', path: '/tracker', icon: Kanban },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 border-t border-border bg-background z-20 flex items-center justify-around px-2">
      {primaryTabs.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] transition-colors relative',
              isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <item.icon className="w-4 h-4 mb-0.5" />
          <span>{item.name}</span>
          {item.badge !== undefined && (
            <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </NavLink>
      ))}
    </nav>
  );
};
