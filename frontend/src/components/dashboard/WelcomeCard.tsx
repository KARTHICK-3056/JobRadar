import React, { useState } from 'react';
import { Eye, GitCompare, CheckCircle2, X } from 'lucide-react';

export const WelcomeCard: React.FC = () => {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('jobradar_welcome_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('jobradar_welcome_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl border border-border bg-surface p-5 mb-6">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        aria-label="Dismiss guide"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="max-w-2xl mb-4">
        <span className="text-[11px] font-mono text-secondary block mb-1">
          Quick start
        </span>
        <h2 className="text-base font-medium tracking-tight text-foreground">
          How JobRadar tracks job listings
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-normal">
          JobRadar monitors company job boards directly, strips out formatting noise, and records field-level diffs when titles, locations, or deadlines change.
        </p>
      </div>

      {/* 3 Step Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Watch */}
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-border flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-md bg-surface border border-border text-secondary flex items-center justify-center mb-2">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-medium text-xs text-foreground mb-0.5">1. Watch</h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Polite crawling of public ATS endpoints (Greenhouse, Lever, career pages) respecting robots.txt.
            </p>
          </div>
          <span className="text-[10px] font-mono text-secondary mt-3 block">Step 1 • Ingest</span>
        </div>

        {/* Step 2: Detect */}
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-border flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-md bg-surface border border-border text-secondary flex items-center justify-center mb-2">
              <GitCompare className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-medium text-xs text-foreground mb-0.5">2. Detect</h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Normalizes HTML text to SHA-256 hashes. Formatting changes are suppressed; genuine edits trigger versions.
            </p>
          </div>
          <span className="text-[10px] font-mono text-secondary mt-3 block">Step 2 • Diff</span>
        </div>

        {/* Step 3: Review */}
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-border flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-md bg-surface border border-border text-secondary flex items-center justify-center mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-medium text-xs text-foreground mb-0.5">3. Review</h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Verify new openings and field changes in the queue, then manage your pipeline on the Kanban board.
            </p>
          </div>
          <span className="text-[10px] font-mono text-secondary mt-3 block">Step 3 • Verify</span>
        </div>
      </div>
    </div>
  );
};
