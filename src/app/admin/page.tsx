import Link from 'next/link';
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
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">The whole institute at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Revenue" value={formatPaise(s.revenuePaise)} hint="paid orders" icon={<IconCoin />} accent="azure" />
        <StatCard label="Managers" value={s.counselors} icon={<IconUsers />} accent="ink" />
        <StatCard label="Students" value={s.students} icon={<IconCap />} accent="lime" />
        <StatCard label="Enrollments" value={s.enrollments} icon={<IconCheck />} accent="coral" />
        <StatCard label="Leads" value={s.leads} icon={<IconFunnel />} accent="azure" />
        <StatCard label="Convos today" value={s.conversationsToday} icon={<IconChat />} accent="coral" />
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
                    <TableCell>
                      <Link href={`/admin/managers/${m.id}`} className="flex items-center gap-2.5 font-medium hover:text-primary">
                        <span className="grid size-7 flex-none place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                          {m.fullName.trim().charAt(0).toUpperCase()}
                        </span>
                        {m.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.stats.students}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPaise(m.stats.earnedPaise)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-coral">{formatPaise(m.stats.pendingPaise)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatPaise(m.stats.paidPaise)}</TableCell>
                  </TableRow>
                ))}
                {managers.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
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

/* ---- icons ---- */
function IconCoin() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M9.5 9h4M9 12.5h6M11 15l2-5" /></svg>; }
function IconUsers() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3.5 20c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5M16 6a3 3 0 0 1 0 6M18 15.5c2 .4 3.5 1.6 3.5 4" /></svg>; }
function IconCap() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-4 9 4-9 4z" /><path d="M7 11v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4M21 9v5" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>; }
function IconFunnel() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16l-6 7v6l-4-2v-4z" /></svg>; }
function IconChat() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" /></svg>; }
