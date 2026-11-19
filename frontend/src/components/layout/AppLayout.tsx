import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav, MobileBottomBar } from './MobileNav';
import { CommandPalette } from '../CommandPalette';
import { useSummary, useRefresh } from '../../hooks/useJobRadar';
import { toast } from 'sonner';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: summary, isError, isLoading } = useSummary();
  const refreshMutation = useRefresh();

  const handleRefresh = () => {
    toast.promise(
      refreshMutation.mutateAsync({ mode: 'live' }),
      {
        loading: 'Contacting sources and checking changes...',
        success: (data) => `Crawl finished! ${data.new_count || 0} added, ${data.updated_count || 0} updated.`,
        error: 'Crawl refresh failed or rate limit encountered.',
      }
    );
  };

  // Detect whether mock data is in use
  const isMockMode = (import.meta as any).env.VITE_USE_MOCK === 'true' || isError || (!isLoading && !summary);

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-foreground/15">
      {/* Desktop Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        pendingReviewsCount={summary?.open_reviews ?? 0}
      />

      {/* Mobile Drawer */}
      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pendingReviewsCount={summary?.open_reviews ?? 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar
          isStale={summary?.is_stale}
          lastSuccessfulAt={summary?.last_successful_at}
          isMockMode={isMockMode}
          onOpenCommandPalette={() => setCmdOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={refreshMutation.isPending}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomBar pendingReviewsCount={summary?.open_reviews ?? 0} />
      </div>

      {/* Global Cmd+K Search Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onRefresh={handleRefresh}
      />
    </div>
  );
};
