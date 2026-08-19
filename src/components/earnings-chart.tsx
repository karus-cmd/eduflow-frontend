'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPaise, formatPaiseCompact } from '@/lib/money';

export interface EarningsPoint {
  label: string; // e.g. "Aug"
  paise: number; // commission accrued that month
}

const SERIES = '#4f46e5'; // single brand hue — earnings over time (not a status colour)

/**
 * Commission-earned over time. One series → the card title names it (no legend). Recessive grid,
 * ₹-formatted axis, crosshair tooltip. Axes/grid inherit `currentColor` (muted) so it's theme-aware.
 */
export function EarningsChart({ data }: { data: EarningsPoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <Skeleton className="h-56 w-full" />;

  const empty = data.every((d) => d.paise === 0);
  if (data.length === 0 || empty) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        No commission earned in this period yet.
      </div>
    );
  }

  return (
    <div className="h-56 w-full text-muted-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES} stopOpacity={0.28} />
              <stop offset="100%" stopColor={SERIES} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.15} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            dy={6}
          />
          <YAxis
            width={48}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            tickFormatter={(v: number) => formatPaiseCompact(v)}
          />
          <Tooltip
            cursor={{ stroke: SERIES, strokeOpacity: 0.4, strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload && payload.length ? (
                <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-sm">
                  <div className="mb-0.5 font-medium text-foreground">{label}</div>
                  <div className="tabular-nums text-muted-foreground">
                    Earned {formatPaise(Number(payload[0].value))}
                  </div>
                </div>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="paise"
            stroke={SERIES}
            strokeWidth={2}
            fill="url(#earnFill)"
            dot={false}
            activeDot={{ r: 4, fill: SERIES, stroke: 'var(--background)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
