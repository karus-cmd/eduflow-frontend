import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import { formatDateTime } from '@/lib/format';
import type { UserPublic } from '@/lib/api/types';

export default async function AdminUserDetailPage(props: PageProps<'/admin/users/[id]'>) {
  const { id } = await props.params;
  const me = await requireRole(['admin', 'finance']);

  let user: UserPublic;
  try {
    user = await serverApi<UserPublic>(`/users/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <Link href="/admin/managers" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back
      </Link>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {user.fullName}
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
            {user.status !== 'active' && <Badge variant="destructive" className="capitalize">{user.status}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4" /> {user.email ?? '—'}
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4" /> {user.phone ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground">
            Joined {formatDateTime(user.createdAt)} · Last login {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'never'}
          </p>
          <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            Per-course enrolment progress for a student isn&rsquo;t exposed to admins by the current API
            (only the student&rsquo;s own <code>GET /me/enrollments</code>). Reported as a contract gap.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
