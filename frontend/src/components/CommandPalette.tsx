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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden z-10">
        <Command label="Command Menu" className="w-full">
          <div className="flex items-center px-3.5 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <Command.Input
              placeholder="Search pages or actions..."
              className="w-full py-3 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-sans"
              autoFocus
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-1.5 space-y-1 text-xs">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No matching commands found
            </Command.Empty>

            <Command.Group heading="Pages" className="text-[11px] font-mono text-secondary px-2 py-1">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/'))}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-secondary" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/listings'))}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-secondary" />
                <span>Listings directory</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/review'))}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                <GitCompare className="w-3.5 h-3.5 text-secondary" />
                <span>Review queue</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/tracker'))}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                <Kanban className="w-3.5 h-3.5 text-secondary" />
                <span>Application tracker</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/sources'))}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                <Server className="w-3.5 h-3.5 text-secondary" />
                <span>Sources & crawl runs</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/evidence'))}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-secondary" />
                <span>Empirical evidence</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions" className="text-[11px] font-mono text-secondary px-2 py-1 pt-2">
              {onRefresh && (
                <Command.Item
                  onSelect={() => runCommand(onRefresh)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-secondary" />
                  <span>Run refresh crawl</span>
                </Command.Item>
              )}
              <Command.Item
                onSelect={() => runCommand(toggleTheme)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-secondary" /> : <Moon className="w-3.5 h-3.5 text-secondary" />}
                <span>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
