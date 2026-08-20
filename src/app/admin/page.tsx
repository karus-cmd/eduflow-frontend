import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { formatPaise } from '@/lib/money';
import { ADMIN_NAV } from '@/lib/nav';
import type { AdminDashboard, CounselorListItem, Paginated } from '@/lib/api/types';

export default async function AdminDashboardPage() {
  const me = await requireRole(['admin', 'finance']);
  const [dash, managers] = await Promise.all([
    serverApi<AdminDashboard>('/dashboard/admin'),
    serverApi<Paginated<CounselorListItem>>('/counselors?limit=50'),
  ]);
  const s = dash.stats;

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Revenue" value={formatPaise(s.revenuePaise)} hint="paid orders" />
        <StatCard label="Managers" value={s.counselors} />
        <StatCard label="Students" value={s.students} />
        <StatCard label="Enrollments" value={s.enrollments} />
        <StatCard label="Leads" value={s.leads} />
        <StatCard label="Convos today" value={s.conversationsToday} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Managers ({managers.meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.data.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.stats.students}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPaise(m.stats.earnedPaise)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatPaise(m.stats.pendingPaise)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatPaise(m.stats.paidPaise)}</TableCell>
                  </TableRow>
                ))}
                {managers.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No managers yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
