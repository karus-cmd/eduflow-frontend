import { AppShell } from '@/components/app-shell';
import { ManagersList } from '@/components/admin/managers-list';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import type { CounselorListItem, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Managers · EduFlow' };

export default async function AdminManagersPage() {
  const me = await requireRole(['admin', 'finance']);
  const managers = await serverApi<Paginated<CounselorListItem>>('/counselors?limit=100');

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Managers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{managers.meta.total} managers</p>
      </div>
      <ManagersList managers={managers.data} />
    </AppShell>
  );
}
