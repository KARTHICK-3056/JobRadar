import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { Tooltip } from '../common/Tooltip';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  secondaryValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'slate';
  to: string;
  tooltipText: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  secondaryValue,
  icon: Icon,
  color,
  to,
  tooltipText,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'from-emerald-500/10 to-transparent',
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-transparent',
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      text: 'text-amber-400',
    },
    rose: {
      bg: 'from-rose-500/10 to-transparent',
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      text: 'text-rose-400',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-transparent',
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      text: 'text-cyan-400',
    },
    violet: {
      bg: 'from-violet-500/10 to-transparent',
      border: 'hover:border-violet-500/40',
      iconBg: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
      text: 'text-violet-400',
    },
    slate: {
      bg: 'from-slate-500/10 to-transparent',
      border: 'hover:border-slate-500/40',
      iconBg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      text: 'text-slate-400',
    },
  }[color];

  return (
    <Link
      to={to}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 border border-border bg-gradient-to-b',
        colorStyles.bg,
        'bg-surface/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
        colorStyles.border
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span>{title}</span>
          <Tooltip content={tooltipText} showIcon side="top" />
        </div>
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-110',
            colorStyles.iconBg
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-3xl font-extrabold tracking-tight font-sans text-foreground">
          <AnimatedCounter value={value} />
          {secondaryValue && (
            <span className="text-sm font-normal text-muted-foreground ml-1.5 font-mono">
              {secondaryValue}
            </span>
          )}
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
      </div>
    </Link>
  );
};
