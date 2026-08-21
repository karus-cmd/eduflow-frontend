import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { EarningsChart, type EarningsPoint } from '@/components/earnings-chart';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import { formatPaise } from '@/lib/money';
import { formatDateTime } from '@/lib/format';
import type { CounselorDashboard, MyCommission } from '@/lib/api/types';

export const metadata = { title: 'Dashboard · EduFlow' };

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

export default async function CounselorDashboardPage() {
  const me = await requireRole(['counselor', 'team_lead']);
  const [dash, commission] = await Promise.all([
    serverApi<CounselorDashboard>('/dashboard/counselor'),
    serverApi<MyCommission>('/me/commission'),
  ]);
  const series = monthlyEarnings(commission);
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
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Good to see you, {me.fullName.split(' ')[0]}.</h1>
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
        <CardHeader className="pb-2">
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {dash.recentConversations.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No conversations logged yet.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {dash.recentConversations.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <Link href={`/counselor/leads/${c.leadId}`} className="flex items-center gap-2.5 font-medium capitalize hover:text-primary">
                    <span className="grid size-7 place-items-center rounded-lg bg-primary/12 text-primary [&_svg]:size-3.5"><IconChat /></span>
                    {c.disposition.replace(/_/g, ' ')}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDateTime(c.occurredAt)}</span>
                </li>
              ))}
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
