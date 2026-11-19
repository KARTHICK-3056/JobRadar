import React from 'react';
import { cn } from '../../lib/utils';

interface RadarGraphicProps {
  className?: string;
  size?: number;
}

export const RadarGraphic: React.FC<RadarGraphicProps> = ({ className, size = 120 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn('relative flex items-center justify-center rounded-full pointer-events-none select-none', className)}
    >
      {/* Outer concentric rings */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
      <div className="absolute inset-4 rounded-full border border-cyan-500/15" />
      <div className="absolute inset-8 rounded-full border border-cyan-500/10 border-dashed" />
      <div className="absolute inset-12 rounded-full border border-cyan-500/10" />

      {/* Crosshairs */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/15" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/15" />

      {/* Rotating radar beam */}
      <div
        className="absolute inset-0 rounded-full animate-radar-sweep"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(34, 211, 238, 0) 0deg, rgba(34, 211, 238, 0.22) 55deg, transparent 60deg)',
        }}
      />

      {/* Center blip */}
      <div className="relative w-3 h-3 rounded-full bg-cyan-400 shadow-glass-glow">
        <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75" />
      </div>

      {/* Simulated target blips */}
      <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-300" />
    </div>
  );
};
