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
      <div className="p-3 rounded-xl border border-border bg-surface/95 shadow-xl backdrop-blur-xl text-xs space-y-1.5 min-w-[130px]">
        <p className="font-mono font-semibold text-foreground border-b border-border pb-1 mb-1">
          {label}
        </p>
        <div className="flex items-center justify-between text-emerald-400">
          <span>New listings:</span>
          <span className="font-mono font-bold">{payload[0]?.value ?? 0}</span>
        </div>
        <div className="flex items-center justify-between text-amber-400">
          <span>Changed:</span>
          <span className="font-mono font-bold">{payload[1]?.value ?? 0}</span>
        </div>
        <div className="flex items-center justify-between text-rose-400">
          <span>Removed:</span>
          <span className="font-mono font-bold">{payload[2]?.value ?? 0}</span>
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
    <div className="rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-base text-foreground">14-Day Change Velocity</h3>
            <InfoTooltip
              content="Daily volume of verified additions, field-level mutations, and confirmed removals across all configured job boards."
              showIcon
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time tracking of job market activity
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span>New listings</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span>Changed</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm" />
            <span>Removed</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEdited" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRemoved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="formattedDate"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="added"
              stackId="1"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorAdded)"
            />
            <Area
              type="monotone"
              dataKey="edited"
              stackId="1"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#colorEdited)"
            />
            <Area
              type="monotone"
              dataKey="removed"
              stackId="1"
              stroke="#F43F5E"
              strokeWidth={2}
              fill="url(#colorRemoved)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
