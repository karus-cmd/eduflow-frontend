import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { formatPaise } from '@/lib/money';
import type { CounselorDashboard } from '@/lib/api/types';

export default async function CounselorDashboardPage() {
  const me = await requireRole(['counselor', 'team_lead']);
  const dash = await serverApi<CounselorDashboard>('/dashboard/counselor');

  return (
    <AppShell title="Counselor" user={me}>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">My dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Awaiting payout" value={formatPaise(dash.balance.pendingPaise)} hint="pending commission" />
        <StatCard label="Paid out" value={formatPaise(dash.balance.paidPaise)} />
        <StatCard label="Earned (lifetime)" value={formatPaise(dash.balance.earnedPaise)} />
        <StatCard label="Students enrolled" value={dash.stats.studentsEnrolled} />
        <StatCard label="Open leads" value={dash.stats.openLeads} />
        <StatCard label="Conversations today" value={dash.stats.conversationsToday} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {dash.recentConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conversations logged yet.</p>
          ) : (
            <ul className="divide-y">
              {dash.recentConversations.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="capitalize">{c.disposition.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">{new Date(c.occurredAt).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
