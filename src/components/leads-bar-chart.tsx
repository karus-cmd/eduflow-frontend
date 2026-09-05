'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export interface LeadsDayPoint {
  day: number; // day-of-month, 1..31
  count: number; // leads created that day
}

const SERIES = '#1D4ED8'; // same brand hue as EarningsChart — one series, no legend needed

/**
 * Leads captured per day, for one calendar month. Mirrors `EarningsChart`'s shape (mount-check,
 * themed via `currentColor`, crosshair tooltip) but as a bar series keyed by day-of-month.
 */
export function LeadsBarChart({ data, monthLabel }: { data: LeadsDayPoint[]; monthLabel: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <Skeleton className="h-56 w-full" />;

  const empty = data.every((d) => d.count === 0);
  if (data.length === 0 || empty) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        No leads captured in {monthLabel} yet.
      </div>
    );
  }

  return (
    <div className="h-56 w-full text-muted-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.15} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            interval="preserveStartEnd"
            tickFormatter={(d: number) => `Day ${d}`}
            dy={6}
          />
          <YAxis
            width={32}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: SERIES, fillOpacity: 0.12 }}
            content={({ active, payload, label }) =>
              active && payload && payload.length ? (
                <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-sm">
                  <div className="tabular-nums text-foreground">
                    Day {label}: {payload[0].value} {Number(payload[0].value) === 1 ? 'lead' : 'leads'}
                  </div>
                </div>
              ) : null
            }
          />
          <Bar dataKey="count" fill={SERIES} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
