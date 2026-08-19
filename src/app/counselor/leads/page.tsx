import { AppShell } from '@/components/app-shell';
import { LeadsPipeline } from '@/components/leads-pipeline';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import type { Lead, Paginated, QueueToday } from '@/lib/api/types';

export const metadata = { title: 'Leads · EduFlow' };

export default async function LeadsPage() {
  const me = await requireRole(['counselor', 'team_lead']);
  const [leads, queue] = await Promise.all([
    serverApi<Paginated<Lead>>('/leads?limit=100'),
    serverApi<QueueToday>('/leads/queue/today'),
  ]);

  return (
    <AppShell title="Leads" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">{leads.meta.total} assigned to you</p>
      </div>
      <LeadsPipeline leads={leads.data} queue={queue} />
    </AppShell>
  );
}
