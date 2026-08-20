import { AppShell } from '@/components/app-shell';
import { PayableList } from '@/components/admin/payable-list';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import type { PayableResponse } from '@/lib/api/types';

export const metadata = { title: 'Payouts · EduFlow' };

export default async function AdminPayoutsPage() {
  const me = await requireRole(['admin', 'finance']);
  const payable = await serverApi<PayableResponse>('/payouts/payable');

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Payout console</h1>
        <p className="mt-1 text-sm text-muted-foreground">Who to pay next</p>
      </div>
      <PayableList payable={payable} />
    </AppShell>
  );
}
