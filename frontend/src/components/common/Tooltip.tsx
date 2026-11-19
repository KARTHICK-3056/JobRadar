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
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
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
        <HelpCircle className="w-3.5 h-3.5 ml-1 text-muted-foreground hover:text-foreground transition-colors" />
      )}
      {isVisible && (
        <span
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-[11px] font-normal text-foreground bg-surface border border-border rounded-md shadow-md pointer-events-none whitespace-normal min-w-[130px] max-w-xs text-left animate-in fade-in duration-100',
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
