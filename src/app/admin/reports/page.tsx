import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportControls } from '@/components/admin/report-controls';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import { formatPaise } from '@/lib/money';
import type { CounselorDailyStat, CounselorListItem, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Reports · EduFlow' };

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface Row {
  counselorId: string;
  conversations: number;
  connected: number;
  enrollments: number;
  revenue: number;
  commission: number;
}

export default async function AdminReportsPage(props: PageProps<'/admin/reports'>) {
  const me = await requireRole(['admin', 'finance']);
  const sp = await props.searchParams;
  const to = typeof sp.to === 'string' ? sp.to : ymd(new Date());
  const from = typeof sp.from === 'string' ? sp.from : ymd(new Date(Date.now() - 30 * 86400000));

  const [stats, managers] = await Promise.all([
    serverApi<CounselorDailyStat[]>(`/reports/counselors?from=${from}&to=${to}`).catch(() => [] as CounselorDailyStat[]),
    serverApi<Paginated<CounselorListItem>>('/counselors?limit=100').catch(() => ({ data: [], meta: { page: 1, limit: 0, total: 0 } })),
  ]);
  const nameOf = new Map(managers.data.map((m) => [m.id, m.fullName]));

  // Aggregate the daily rollup rows per counselor.
  const byCounselor = new Map<string, Row>();
  for (const s of stats) {
    const r = byCounselor.get(s.counselorId) ?? { counselorId: s.counselorId, conversations: 0, connected: 0, enrollments: 0, revenue: 0, commission: 0 };
    r.conversations += s.conversationsCount;
    r.connected += s.connectedCount;
    r.enrollments += s.enrollmentsCount;
    r.revenue += Number(s.revenuePaise);
    r.commission += Number(s.commissionPaise);
    byCounselor.set(s.counselorId, r);
  }
  const rows = [...byCounselor.values()].sort((a, b) => b.revenue - a.revenue);
  const totals = rows.reduce(
    (t, r) => ({
      conversations: t.conversations + r.conversations,
      connected: t.connected + r.connected,
      enrollments: t.enrollments + r.enrollments,
      revenue: t.revenue + r.revenue,
      commission: t.commission + r.commission,
    }),
    { conversations: 0, connected: 0, enrollments: 0, revenue: 0, commission: 0 },
  );

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">From the counselor daily-stats rollup</p>
        </div>
        <ReportControls from={from} to={to} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatPaise(totals.revenue)} hint="in range" />
        <StatCard label="Commission" value={formatPaise(totals.commission)} />
        <StatCard label="Enrollments" value={totals.enrollments} />
        <StatCard label="Conversations" value={totals.conversations} hint={`${totals.connected} connected`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By manager</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Conversations</TableHead>
                <TableHead className="text-right">Connected</TableHead>
                <TableHead className="text-right">Enrollments</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.counselorId}>
                  <TableCell className="font-medium">{nameOf.get(r.counselorId) ?? r.counselorId.slice(0, 8)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.conversations}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.connected}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.enrollments}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPaise(r.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPaise(r.commission)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No rollup data in this range. (Stats accrue as conversations/enrollments happen; the nightly
                    job rebuilds them.)
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.conversations}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.connected}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.enrollments}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPaise(totals.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPaise(totals.commission)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
