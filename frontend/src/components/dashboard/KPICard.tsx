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
  icon: _Icon,
  to,
  tooltipText,
}) => {
  return (
    <Link
      to={to}
      className={cn(
        'group relative rounded-xl p-4 border border-border bg-surface hover:bg-surface-elevated transition-colors duration-150 flex flex-col justify-between min-h-[110px]'
      )}
    >
      {/* Top Header: Label & Tooltip / Link hint */}
      <div className="flex items-center justify-between gap-1 text-xs text-secondary">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">{title}</span>
          <Tooltip content={tooltipText} side="top">
            <span className="text-[10px] text-muted-foreground cursor-help">ⓘ</span>
          </Tooltip>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Main Stat Figure */}
      <div className="mt-2">
        <div className="text-2xl font-medium tracking-tight text-foreground font-mono tabular-nums">
          <AnimatedCounter value={value} />
        </div>
      </div>

      {/* Subtext Context */}
      <div className="mt-1 text-[11px] text-muted-foreground truncate">
        {secondaryValue || 'Current total'}
      </div>
    </Link>
  );
};
