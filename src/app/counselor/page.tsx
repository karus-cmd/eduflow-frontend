import Link from 'next/link';
import { PageMark } from '@/components/stickers/page-mark';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { EarningsChart, type EarningsPoint } from '@/components/earnings-chart';
import { LeadsBarChart, type LeadsDayPoint } from '@/components/leads-bar-chart';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import { formatPaise } from '@/lib/money';
import { formatDateTime } from '@/lib/format';
import type { CounselorDashboard, Lead, LeadActivityItem, MyCommission, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Dashboard · STEIN-X' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Last 6 calendar months of commission ACCRUED (from the ledger), for the earnings trend. */
function monthlyEarnings(commission: MyCommission, count = 6): EarningsPoint[] {
  const now = new Date();
  const buckets: { key: string; label: string; paise: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], paise: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const e of commission.ledger) {
    if (e.type !== 'accrual') continue;
    const d = new Date(e.createdAt);
    const idx = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx != null) buckets[idx].paise += Number(e.amountPaise);
  }
  return buckets.map((b) => ({ label: b.label, paise: b.paise }));
}

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

/**
 * Buckets a single month's lead ACTIVITY by day-of-month, for the leads-captured bar chart.
 * Counts two things per day: leads added, and qualifying stage moves (Contacted→Interested/
 * Enrolled/Junk, Interested→Enrolled/Junk). The one excluded move is Interested→Contacted
 * (a backward step) — everything else that isn't a no-op move counts +1.
 */
function dailyLeads(leads: Lead[], activity: LeadActivityItem[], monthDate: Date): LeadsDayPoint[] {
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const buckets: LeadsDayPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, count: 0 }));
  for (const l of leads) {
    const day = new Date(l.createdAt).getDate();
    if (buckets[day - 1]) buckets[day - 1].count += 1;
  }
  for (const a of activity) {
    if (!a.before || !a.after || a.before === a.after) continue;
    if (a.before === 'interested' && a.after === 'contacted') continue; // the one excluded move
    const day = new Date(a.occurredAt).getDate();
    if (buckets[day - 1]) buckets[day - 1].count += 1;
  }
  return buckets;
}

export default async function CounselorDashboardPage(props: PageProps<'/counselor'>) {
  const me = await requireRole(['counselor', 'team_lead']);
  const sp = await props.searchParams;
  const monthDate = parseMonthParam(typeof sp.month === 'string' ? sp.month : undefined);
  const monthFrom = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthTo = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const prevMonth = monthParam(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1));
  const nextMonth = monthParam(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1));
  const monthLabel = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const [dash, commission, monthLeads, monthActivity] = await Promise.all([
    serverApi<CounselorDashboard>('/dashboard/counselor'),
    serverApi<MyCommission>('/me/commission'),
    serverApi<Paginated<Lead>>(
      // Backend caps `limit` at 100 — a month of leads for one counselor won't exceed that in
      // practice; if it somehow does, the day-bucketing below simply undercounts (acceptable).
      `/leads?from=${encodeURIComponent(monthFrom.toISOString())}&to=${encodeURIComponent(monthTo.toISOString())}&limit=100`,
    ),
    serverApi<LeadActivityItem[]>(
      `/leads/activity?from=${encodeURIComponent(monthFrom.toISOString())}&to=${encodeURIComponent(monthTo.toISOString())}`,
    ),
  ]);
  const series = monthlyEarnings(commission);
  const leadsPerDay = dailyLeads(monthLeads.data, monthActivity, monthDate);
  const spark = series.map((s) => s.paise);
  const lastM = spark[spark.length - 1] ?? 0;
  const prevM = spark[spark.length - 2] ?? 0;
  const trend =
    prevM > 0
      ? { dir: (lastM >= prevM ? 'up' : 'down') as 'up' | 'down', value: `${Math.round((Math.abs(lastM - prevM) / prevM) * 100)}%` }
      : undefined;

  const paid = Number(commission.balance.paidPaise);
  const pending = Number(commission.balance.pendingPaise);
  const total = paid + pending || 1;

  return (
    <AppShell title="Counselor" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <div className="relative mb-6 overflow-hidden">
        <PageMark name="funnel" variant="watermark" className="-top-4 right-0" size={150} />
        <h1 className="relative font-heading text-3xl font-extrabold tracking-tight">Good to see you, {me.fullName.split(' ')[0]}.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here is how your book is doing this month.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total earnings" value={formatPaise(commission.balance.earnedPaise)} icon={<IconCoin />} accent="azure" spark={spark} trend={trend} />
        <StatCard label="Awaiting payout" value={formatPaise(commission.balance.pendingPaise)} icon={<IconClock />} accent="coral" hint="pending" />
        <StatCard label="Paid out" value={formatPaise(commission.balance.paidPaise)} icon={<IconCheck />} accent="lime" hint="credited to you" />
        <StatCard label="Enrollments" value={dash.stats.studentsEnrolled} icon={<IconUsers />} accent="ink" hint="students you closed" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle>Commission earned</CardTitle>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <EarningsChart data={series} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-l-full bg-primary" style={{ width: `${(paid / total) * 100}%` }} />
                <div className="ml-0.5 h-full rounded-r-full bg-coral" style={{ width: `${(pending / total) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" /> Paid</span>
                <span className="font-medium tabular-nums">{formatPaise(commission.balance.paidPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-coral" /> Awaiting</span>
                <span className="font-medium tabular-nums">{formatPaise(commission.balance.pendingPaise)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Open leads" value={dash.stats.openLeads} icon={<IconFunnel />} accent="azure" />
            <StatCard label="Convos today" value={dash.stats.conversationsToday} icon={<IconChat />} accent="coral" />
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between gap-2 pb-1">
          <div>
            <CardTitle>Leads captured</CardTitle>
            <p className="text-xs text-muted-foreground">By day, {monthLabel}</p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/counselor?month=${prevMonth}`}
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <span className="w-28 text-center text-sm font-medium tabular-nums">{monthLabel}</span>
            <Link
              href={`/counselor?month=${nextMonth}`}
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

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {dash.recentActivity.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No activity logged yet.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {dash.recentActivity.slice(0, 6).map((item) => {
                const icon =
                  item.type === 'lead_created' ? <IconPlus /> : item.type === 'lead_moved' ? <IconArrowRight /> : <IconChat />;
                const inner = (
                  <>
                    <span className="grid size-7 place-items-center rounded-lg bg-primary/12 text-primary [&_svg]:size-3.5">{icon}</span>
                    {item.label}
                  </>
                );
                return (
                  <li key={item.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                    {item.leadId ? (
                      <Link href={`/counselor/leads/${item.leadId}`} className="flex items-center gap-2.5 font-medium hover:text-primary">
                        {inner}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2.5 font-medium">{inner}</span>
                    )}
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDateTime(item.occurredAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

/* ---- icons ---- */
function IconCoin() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M9.5 9h4M9 12.5h6M11 15l2-5" /></svg>; }
function IconClock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M12 8v4.5l3 2" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>; }
function IconUsers() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3.5 20c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5M16 6a3 3 0 0 1 0 6M18 15.5c2 .4 3.5 1.6 3.5 4" /></svg>; }
function IconFunnel() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16l-6 7v6l-4-2v-4z" /></svg>; }
function IconChat() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" /></svg>; }
function IconPlus() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>; }
function IconArrowRight() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }
