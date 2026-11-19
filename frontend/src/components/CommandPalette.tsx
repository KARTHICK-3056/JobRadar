import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GitCompare,
  Kanban,
  Server,
  FileCheck2,
  RefreshCw,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    command();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur-xl overflow-hidden z-10">
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center px-4 border-b border-border">
            <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <Command.Input
              placeholder="Type a command or search..."
              className="w-full py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-sans"
              autoFocus
            />
            <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1 text-sm">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No matching commands or pages found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider font-mono">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/'))}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-cyan-400 cursor-pointer transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/listings'))}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-cyan-400 cursor-pointer transition-colors"
              >
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Job & Internship Listings</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/review'))}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-amber-400 cursor-pointer transition-colors"
              >
                <GitCompare className="w-4 h-4 text-amber-400" />
                <span>Review Queue (Detected Changes)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/tracker'))}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-cyan-400 cursor-pointer transition-colors"
              >
                <Kanban className="w-4 h-4 text-cyan-400" />
                <span>Application Kanban Tracker</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/sources'))}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-cyan-400 cursor-pointer transition-colors"
              >
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Sources & Crawl Runs</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/evidence'))}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-violet-400 cursor-pointer transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-violet-400" />
                <span>Evidence & Metric Test Cases</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider font-mono pt-2">
              {onRefresh && (
                <Command.Item
                  onSelect={() => runCommand(onRefresh)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span>Trigger Immediate Crawl Refresh</span>
                </Command.Item>
              )}
              <Command.Item
                onSelect={() => runCommand(toggleTheme)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground hover:bg-surface-elevated hover:text-amber-400 cursor-pointer transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-violet-400" />
                    <span>Switch to Dark Theme</span>
                  </>
                )}
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
