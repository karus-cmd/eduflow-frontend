import { AppShell } from '@/components/app-shell';
import { ContentLibrary } from '@/components/content-library';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import type { Course, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Content · EduFlow' };

export default async function AdminContentPage() {
  const me = await requireRole(['admin', 'finance']);
  // Admins see all courses incl. drafts (the backend only forces published-only for students).
  const courses = await serverApi<Paginated<Course>>('/courses?limit=100');

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Content library</h1>
        <p className="mt-1 text-sm text-muted-foreground">{courses.meta.total} courses</p>
      </div>
      <ContentLibrary courses={courses.data} />
    </AppShell>
  );
}
