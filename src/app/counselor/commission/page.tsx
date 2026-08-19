import { Info } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import { formatPaise } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { labelize } from '@/lib/crm';
import type { MyCommission, PayoutItem } from '@/lib/api/types';

export const metadata = { title: 'Commission · EduFlow' };

const LEDGER_BADGE: Record<string, 'default' | 'secondary' | 'destructive'> = {
  accrual: 'default',
  payout: 'secondary',
  clawback: 'destructive',
};

export default async function CommissionPage() {
  const me = await requireRole(['counselor', 'team_lead']);
  const [commission, payouts] = await Promise.all([
    serverApi<MyCommission>('/me/commission'),
    serverApi<PayoutItem[]>(`/counselors/${me.id}/payouts`).catch(() => [] as PayoutItem[]),
  ]);
  const b = commission.balance;

  return (
    <AppShell title="Commission" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">Commission &amp; payouts</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Earned" value={formatPaise(b.earnedPaise)} hint="lifetime" />
        <StatCard label="Awaiting payout" value={formatPaise(b.pendingPaise)} hint="pending" />
        <StatCard label="Paid out" value={formatPaise(b.paidPaise)} hint="credited" />
        <StatCard label="Reversed" value={formatPaise(b.reversedPaise)} hint="refund clawbacks" />
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
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commission.ledger.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Badge variant={LEDGER_BADGE[e.type] ?? 'outline'} className="capitalize">
                        {labelize(e.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[12rem] truncate text-muted-foreground">{e.note ?? '—'}</TableCell>
                    <TableCell
                      className={
                        'text-right font-medium tabular-nums ' +
                        (Number(e.amountPaise) < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500')
                      }
                    >
                      {formatPaise(e.amountPaise)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{formatDate(e.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {commission.ledger.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No commission entries yet.
                    </TableCell>
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
                    <TableCell className="max-w-[10rem] truncate text-muted-foreground">{p.reference ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatPaise(p.amountPaise)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {p.paidAt ? formatDate(p.paidAt) : labelize(p.status)}
                    </TableCell>
                  </TableRow>
                ))}
                {payouts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No payouts recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Payouts are recorded by your admin — commission accrues automatically on each enrolment and moves
          to <strong>Paid</strong> when the admin records a payment to you. You can&rsquo;t trigger payouts here.
        </span>
      </div>
    </AppShell>
  );
}
