import { AppShell } from '@/components/app-shell';
import { AdminsList } from '@/components/admin/admins-list';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import type { College, Paginated, UserPublic } from '@/lib/api/types';

export const metadata = { title: 'Admins · STEIN-X' };

export default async function AdminAdminsPage() {
  // Admin-only (not finance) — this manages who has full admin access, same restriction as
  // Admin Invites on the Managers page.
  const me = await requireRole(['admin']);

  const [admins, colleges] = await Promise.all([
    serverApi<Paginated<UserPublic>>('/users?role=admin&limit=100'),
    serverApi<College[]>('/colleges').catch(() => [] as College[]),
  ]);

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>
        <p className="mt-1 text-sm text-muted-foreground">{admins.meta.total} admins</p>
      </div>
      <AdminsList admins={admins.data} colleges={colleges} currentUserId={me.id} />
    </AppShell>
  );
}
