import React, { useState } from 'react';
import { Eye, GitCompare, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-surface/90 to-violet-950/30 p-5 md:p-6 shadow-glass backdrop-blur-xl mb-6">
      {/* Background glow & accents */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        aria-label="Dismiss guide"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          First-Time Student Quickstart
        </span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
        Welcome to JobRadar
      </h2>
      <p className="text-sm text-muted-foreground max-w-2xl mb-5">
        A versioned change-tracking radar built for student internships. We monitor real job boards, strip out formatting noise, and alert you the second a deadline, title, or location changes.
      </p>

      {/* 3 Step Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Step 1: Watch */}
        <div className="p-4 rounded-xl bg-surface/60 border border-border/80 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">1. Watch</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              JobRadar checks Greenhouse, Lever, and university boards politely, respecting robots.txt and privacy rules.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 mt-3 block">01 / AUTONOMOUS SCAN</span>
        </div>

        {/* Step 2: Detect */}
        <div className="p-4 rounded-xl bg-surface/60 border border-border/80 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
              <GitCompare className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">2. Detect</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Using deterministic SHA-256 content hashes, we flag edits in titles, locations, and deadlines with zero false alerts.
            </p>
          </div>
          <span className="text-[11px] font-mono text-amber-400 mt-3 block">02 / SMART DIFFING</span>
        </div>

        {/* Step 3: Review */}
        <div className="p-4 rounded-xl bg-surface/60 border border-border/80 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">3. Review & Track</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify detected mutations, track stages in Kanban, and apply before urgent deadlines close.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 mt-3 block">03 / APPLICATION READY</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          to="/listings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 transition-opacity shadow-sm"
        >
          <span>Explore Active Listings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Dismiss this banner
        </button>
      </div>
    </div>
  );
};
