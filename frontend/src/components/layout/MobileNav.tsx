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
    <div className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-surface border-r border-border p-6 shadow-2xl flex flex-col justify-between z-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400">
                <Radio className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-bold text-lg text-foreground">JobRadar</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          <p className="font-mono text-cyan-400">JOBRADAR ACTIVE</p>
          <p className="text-[11px] mt-0.5">Versioned change tracking system</p>
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
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 border-t border-border bg-surface/90 backdrop-blur-xl z-20 flex items-center justify-around px-2">
      {primaryTabs.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors relative',
              isActive ? 'text-cyan-400' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <item.icon className="w-5 h-5 mb-0.5" />
          <span>{item.name}</span>
          {item.badge !== undefined && (
            <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </NavLink>
      ))}
    </nav>
  );
};
