import { AppShell } from '@/components/app-shell';
import { ManagersList } from '@/components/admin/managers-list';
import { AdminInvitesPanel } from '@/components/admin/admin-invites-panel';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import type { AdminInvite, College, CounselorListItem, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Managers · STEIN-X' };

export default async function AdminManagersPage(props: PageProps<'/admin/managers'>) {
  const me = await requireRole(['admin', 'finance']);
  const sp = await props.searchParams;
  const collegeId = typeof sp.collegeId === 'string' ? sp.collegeId : undefined;

  const [managers, colleges, invites] = await Promise.all([
    serverApi<Paginated<CounselorListItem>>(
      `/counselors?limit=100${collegeId ? `&collegeId=${encodeURIComponent(collegeId)}` : ''}`,
    ),
    serverApi<College[]>('/colleges').catch(() => [] as College[]),
    // settings.manage is admin-only (not finance) — skip the call entirely for finance, it'd 403.
    me.role === 'admin'
      ? serverApi<AdminInvite[]>('/admin-invites').catch(() => [] as AdminInvite[])
      : Promise.resolve([] as AdminInvite[]),
  ]);

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Managers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{managers.meta.total} managers</p>
      </div>
      <ManagersList managers={managers.data} colleges={colleges} collegeId={collegeId ?? null} />
      {me.role === 'admin' && (
        <div className="mt-5">
          <AdminInvitesPanel invites={invites} />
        </div>
      )}
    </AppShell>
  );
}
