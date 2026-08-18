import { AppShell } from '@/components/app-shell';
import { CatalogGrid } from '@/components/catalog-grid';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import type { Course, Enrollment, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Browse courses · EduFlow' };

export default async function BrowsePage() {
  const me = await requireRole(['student']);
  const [courses, enrollments] = await Promise.all([
    serverApi<Paginated<Course>>('/courses?limit=100'),
    serverApi<Enrollment[]>('/me/enrollments'),
  ]);
  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  return (
    <AppShell title="Browse" user={me} nav={STUDENT_NAV} homeHref="/student">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Browse courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {courses.meta.total} {courses.meta.total === 1 ? 'course' : 'courses'} available
        </p>
      </div>
      <CatalogGrid courses={courses.data} enrolledCourseIds={enrolledCourseIds} />
    </AppShell>
  );
}
