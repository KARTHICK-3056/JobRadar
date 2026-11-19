import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ActivityPoint } from '../../types';
import { Tooltip as InfoTooltip } from '../common/Tooltip';

interface ActivityChartProps {
  data: ActivityPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 rounded-lg border border-border bg-surface shadow-md text-xs space-y-1 min-w-[120px]">
        <p className="font-mono text-secondary border-b border-border pb-1 mb-1">
          {label}
        </p>
        <div className="flex items-center justify-between text-added">
          <span className="text-secondary">Added</span>
          <span className="font-mono tabular-nums">{payload[0]?.value ?? 0}</span>
        </div>
        <div className="flex items-center justify-between text-edited">
          <span className="text-secondary">Edited</span>
          <span className="font-mono tabular-nums">{payload[1]?.value ?? 0}</span>
        </div>
        <div className="flex items-center justify-between text-removed">
          <span className="text-secondary">Removed</span>
          <span className="font-mono tabular-nums">{payload[2]?.value ?? 0}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const formattedData = (data || []).map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-sm text-foreground">14-day change volume</h3>
            <InfoTooltip
              content="Daily count of verified additions, field-level mutations, and confirmed removals across configured sources."
              showIcon
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Activity history across all monitored sources
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="w-2 h-2 rounded-full bg-added" />
            <span>New</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="w-2 h-2 rounded-full bg-edited" />
            <span>Changed</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="w-2 h-2 rounded-full bg-removed" />
            <span>Removed</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4cc38a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4cc38a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEdited" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e5a43b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e5a43b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRemoved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e5484d" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e5484d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="formattedDate"
              stroke="rgb(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              dy={6}
            />
            <YAxis
              stroke="rgb(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              dx={-6}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="added"
              stroke="#4cc38a"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorAdded)"
            />
            <Area
              type="monotone"
              dataKey="edited"
              stroke="#e5a43b"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorEdited)"
            />
            <Area
              type="monotone"
              dataKey="removed"
              stroke="#e5484d"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorRemoved)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
