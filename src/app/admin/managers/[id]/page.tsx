import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ManagerPayoutSettings } from '@/components/admin/manager-payout-settings';
import { RecordPayoutForm } from '@/components/admin/record-payout-form';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import { formatPaise } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { labelize, stageBadge } from '@/lib/crm';
import type { CounselorDetail, Lead, MyCommission, Paginated, PayoutItem } from '@/lib/api/types';

const LEDGER_BADGE: Record<string, 'default' | 'secondary' | 'destructive'> = {
  accrual: 'default',
  payout: 'secondary',
  clawback: 'destructive',
};

export default async function ManagerDetailPage(props: PageProps<'/admin/managers/[id]'>) {
  const { id } = await props.params;
  const me = await requireRole(['admin', 'finance']);

  let manager: CounselorDetail;
  try {
    manager = await serverApi<CounselorDetail>(`/counselors/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
  const [commission, payouts, leads] = await Promise.all([
    serverApi<MyCommission>(`/counselors/${id}/commission`).catch(() => null),
    serverApi<PayoutItem[]>(`/counselors/${id}/payouts`).catch(() => [] as PayoutItem[]),
    serverApi<Paginated<Lead>>(`/leads?assignedTo=${id}&limit=100`).catch(() => null),
  ]);
  const b = manager.balance;

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

      {/* Drill-down: this manager's leads + converted students */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Leads &amp; students ({leads?.meta.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Student</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(leads?.data ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.fullName}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{l.phone}</TableCell>
                  <TableCell>
                    <Badge variant={stageBadge(l.stage)} className="capitalize">{labelize(l.stage)}</Badge>
                  </TableCell>
                  <TableCell>
                    {l.convertedStudentId ? (
                      <Link href={`/admin/users/${l.convertedStudentId}`} className="text-primary hover:underline">
                        View student →
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(leads?.data.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No leads assigned.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
