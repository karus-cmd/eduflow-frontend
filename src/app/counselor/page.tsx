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

  return (
    <AppShell title="Counselor" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total earnings" value={formatPaise(commission.balance.earnedPaise)} hint="lifetime commission" />
        <StatCard label="Awaiting payout" value={formatPaise(commission.balance.pendingPaise)} hint="pending" />
        <StatCard label="Paid out" value={formatPaise(commission.balance.paidPaise)} hint="credited to you" />
        <StatCard label="Enrollments" value={dash.stats.studentsEnrolled} hint="students you closed" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Commission earned</CardTitle>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <EarningsChart data={series} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Open leads" value={dash.stats.openLeads} />
            <StatCard label="Convos today" value={dash.stats.conversationsToday} />
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {dash.recentConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations logged yet.</p>
              ) : (
                <ul className="divide-y">
                  {dash.recentConversations.slice(0, 6).map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <Link href={`/counselor/leads/${c.leadId}`} className="capitalize hover:text-primary hover:underline">
                        {c.disposition.replace(/_/g, ' ')}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(c.occurredAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
