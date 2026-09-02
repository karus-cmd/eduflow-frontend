'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPaise } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { College, CounselorListItem } from '@/lib/api/types';

const CARD_SHADOW = 'shadow-[0_1px_2px_rgba(31,28,43,0.04),0_14px_34px_-24px_rgba(31,28,43,0.4)]';

/**
 * Colleges strip + managers table, filtered IN PLACE on the dashboard (no navigation).
 * "All managers" clears the filter. Client-side filter over the already-fetched list —
 * fast, no extra round trip, matches the page's existing `?limit=50` manager fetch.
 */
export function DashboardManagers({ managers, colleges }: { managers: CounselorListItem[]; colleges: College[] }) {
  const [selected, setSelected] = useState<string | null>(null); // null = All

  const filtered = useMemo(
    () => (selected ? managers.filter((m) => m.college?.id === selected) : managers),
    [managers, selected],
  );
  const activeCollege = selected ? (colleges.find((c) => c.id === selected) ?? null) : null;

  return (
    <>
      {colleges.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Colleges</h2>
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-pressed={selected === null}
                className={cn(
                  'flex min-w-[8rem] items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
                  CARD_SHADOW,
                  selected === null ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 bg-card text-foreground',
                )}
              >
                All managers
              </button>
              {colleges.map((c) => {
                const active = selected === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    aria-pressed={active}
                    className={cn(
                      'group flex min-w-[10rem] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5',
                      CARD_SHADOW,
                      active ? 'border-primary bg-primary/5' : 'border-border/70 bg-card',
                    )}
                  >
                    <span className={cn('grid size-8 flex-none place-items-center rounded-xl', active ? 'bg-primary text-primary-foreground' : 'bg-primary/12 text-primary')}>
                      <Building2 className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className={cn('truncate text-sm font-medium', active && 'text-primary')}>{c.name}</span>
                        {c.isDefault && <span className="text-[0.65rem] font-medium text-muted-foreground">default</span>}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {c.managerCount} {c.managerCount === 1 ? 'manager' : 'managers'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Managers ({filtered.length})
            {activeCollege && <span className="ml-2 text-sm font-normal text-muted-foreground">— {activeCollege.name}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link href={`/admin/managers/${m.id}`} className="flex items-center gap-2.5 font-medium hover:text-primary">
                        <span className="grid size-7 flex-none place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                          {m.fullName.trim().charAt(0).toUpperCase()}
                        </span>
                        {m.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell className="text-muted-foreground">{m.college?.name ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{m.employeeCode ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Link href={`/admin/students?managerId=${m.id}`} className="hover:text-primary hover:underline">
                        {m.stats.students}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPaise(m.stats.earnedPaise)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-coral">{formatPaise(m.stats.pendingPaise)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatPaise(m.stats.paidPaise)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                      {activeCollege ? `No managers in ${activeCollege.name} yet.` : 'No managers yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
