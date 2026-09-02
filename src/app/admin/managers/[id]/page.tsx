import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ManagerPayoutSettings } from '@/components/admin/manager-payout-settings';
import { RecordPayoutForm } from '@/components/admin/record-payout-form';
import { ManagerLeadsBoard } from '@/components/admin/manager-leads-board';
import { LeadsBarChart, type LeadsDayPoint } from '@/components/leads-bar-chart';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import { formatPaise } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { labelize } from '@/lib/crm';
import type { CounselorDetail, Lead, LeadActivityItem, MyCommission, Paginated, PayoutItem } from '@/lib/api/types';

const LEDGER_BADGE: Record<string, 'default' | 'secondary' | 'destructive'> = {
  accrual: 'default',
  payout: 'secondary',
  clawback: 'destructive',
};

/** Parses a `?month=YYYY-MM` search param into the 1st of that month; falls back to the current month. */
function parseMonthParam(month: string | undefined): Date {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    if (m >= 1 && m <= 12) return new Date(y, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** The 1st-of-month date → its `?month=YYYY-MM` param value. */
function monthParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Same day-of-month bucketing + qualifying-move rule as the manager's own dashboard chart
 *  (§ counselor/page.tsx's dailyLeads) — kept in sync deliberately, not shared, since each
 *  page's surrounding fetch shape differs slightly. */
function dailyLeads(leads: Lead[], activity: LeadActivityItem[], monthDate: Date): LeadsDayPoint[] {
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const buckets: LeadsDayPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, count: 0 }));
  for (const l of leads) {
    const day = new Date(l.createdAt).getDate();
    if (buckets[day - 1]) buckets[day - 1].count += 1;
  }
  for (const a of activity) {
    if (!a.before || !a.after || a.before === a.after) continue;
    if (a.before === 'interested' && a.after === 'contacted') continue;
    const day = new Date(a.occurredAt).getDate();
    if (buckets[day - 1]) buckets[day - 1].count += 1;
  }
  return buckets;
}

export default async function ManagerDetailPage(props: PageProps<'/admin/managers/[id]'>) {
  const { id } = await props.params;
  const me = await requireRole(['admin', 'finance']);
  const sp = await props.searchParams;
  const monthDate = parseMonthParam(typeof sp.month === 'string' ? sp.month : undefined);
  const monthFrom = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthTo = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const prevMonth = monthParam(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1));
  const nextMonth = monthParam(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1));
  const monthLabel = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  let manager: CounselorDetail;
  try {
    manager = await serverApi<CounselorDetail>(`/counselors/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
  const [commission, payouts, leads, monthLeads, monthActivity] = await Promise.all([
    serverApi<MyCommission>(`/counselors/${id}/commission`).catch(() => null),
    serverApi<PayoutItem[]>(`/counselors/${id}/payouts`).catch(() => [] as PayoutItem[]),
    // All-time — for the board (current state, not scoped to any one month).
    serverApi<Paginated<Lead>>(`/leads?assignedTo=${id}&limit=100`).catch(() => null),
    // Month-scoped — for the chart. Without this, a lead created in a DIFFERENT month bleeds
    // into whichever month is currently viewed by day-of-month coincidence (a real bug: e.g.
    // an Aug-29 lead would wrongly count toward Sept's day 29 when viewing September).
    serverApi<Paginated<Lead>>(
      `/leads?assignedTo=${id}&from=${encodeURIComponent(monthFrom.toISOString())}&to=${encodeURIComponent(monthTo.toISOString())}&limit=100`,
    ).catch(() => null),
    serverApi<LeadActivityItem[]>(
      `/leads/activity?counselorId=${id}&from=${encodeURIComponent(monthFrom.toISOString())}&to=${encodeURIComponent(monthTo.toISOString())}`,
    ).catch(() => [] as LeadActivityItem[]),
  ]);
  const b = manager.balance;
  const leadsPerDay = dailyLeads(monthLeads?.data ?? [], monthActivity, monthDate);

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <Link href="/admin/managers" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to managers
      </Link>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{manager.fullName}</h1>
        <Badge variant={manager.status === 'active' ? 'secondary' : 'destructive'} className="capitalize">
          {manager.status}
        </Badge>
        {manager.profile.referralCode && (
          <Badge className="gap-1">
            <Ticket className="size-3" /> {manager.profile.referralCode}
          </Badge>
        )}
        {manager.college && (
          <Badge variant="outline" className="gap-1">
            <Building2 className="size-3" /> {manager.college.name}
          </Badge>
        )}
        <span className="text-sm text-muted-foreground">{manager.email}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Earned" value={formatPaise(b.earnedPaise)} hint="lifetime" />
        <StatCard label="Awaiting payout" value={formatPaise(b.pendingPaise)} hint="pending" />
        <StatCard label="Paid out" value={formatPaise(b.paidPaise)} />
        <StatCard label="Students" value={manager.stats.students} hint={`${manager.stats.conversations} conversations`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payout settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ManagerPayoutSettings counselorId={manager.id} payout={manager.payout} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record a payout</CardTitle>
          </CardHeader>
          <CardContent>
            <RecordPayoutForm counselorId={manager.id} pendingPaise={b.pendingPaise} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commission ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(commission?.ledger ?? []).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Badge variant={LEDGER_BADGE[e.type] ?? 'outline'} className="capitalize">
                        {labelize(e.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className={'text-right font-medium tabular-nums ' + (Number(e.amountPaise) < 0 ? 'text-destructive' : '')}>
                      {formatPaise(e.amountPaise)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{formatDate(e.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {(commission?.ledger.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No entries.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="capitalize">{p.method ? labelize(p.method) : '—'}</TableCell>
                    <TableCell className="max-w-[9rem] truncate text-muted-foreground">{p.reference ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatPaise(p.amountPaise)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : labelize(p.status)}</TableCell>
                  </TableRow>
                ))}
                {payouts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No payouts yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Activity, month-wise — read-only mirror of this manager's own dashboard chart */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between gap-2 pb-1">
          <div>
            <CardTitle>Leads captured</CardTitle>
            <p className="text-xs text-muted-foreground">By day, {monthLabel}</p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/managers/${id}?month=${prevMonth}`}
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <span className="w-28 text-center text-sm font-medium tabular-nums">{monthLabel}</span>
            <Link
              href={`/admin/managers/${id}?month=${nextMonth}`}
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <LeadsBarChart data={leadsPerDay} monthLabel={monthLabel} />
        </CardContent>
      </Card>

      {/* Drill-down: this manager's leads, read-only — same 4 columns as their own board */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Leads ({leads?.meta.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ManagerLeadsBoard leads={leads?.data ?? []} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
