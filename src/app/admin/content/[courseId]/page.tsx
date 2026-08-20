import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CourseEditor } from '@/components/admin/course-editor';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import type { AdminCourseDetail, LiveClass } from '@/lib/api/types';

export default async function AdminCourseEditorPage(props: PageProps<'/admin/content/[courseId]'>) {
  const { courseId } = await props.params;
  const me = await requireRole(['admin', 'finance']);

  let course: AdminCourseDetail;
  try {
    course = await serverApi<AdminCourseDetail>(`/courses/${courseId}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
  const liveClasses = await serverApi<LiveClass[]>(`/courses/${courseId}/live-classes`).catch(() => [] as LiveClass[]);

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <Link href="/admin/content" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to content
      </Link>
      <CourseEditor course={course} liveClasses={liveClasses} />
    </AppShell>
  );
}
