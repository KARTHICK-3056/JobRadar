import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className,
  side = 'top',
  showIcon = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className="relative inline-flex items-center cursor-help group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={typeof content === 'string' ? content : undefined}
    >
      {children}
      {showIcon && (
        <HelpCircle className="w-3.5 h-3.5 ml-1 text-muted-foreground hover:text-cyan-400 transition-colors" />
      )}
      {isVisible && (
        <span
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-normal text-slate-100 bg-slate-900/95 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md pointer-events-none whitespace-normal min-w-[140px] max-w-xs text-left animate-in fade-in zoom-in-95 duration-150',
            sideClasses[side],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};
