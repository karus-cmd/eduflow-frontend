import { AppShell } from '@/components/app-shell';
import { CourseCard } from '@/components/course-card';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import type { Course, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Courses · EduFlow' };

export default async function CounselorCoursesPage() {
  const me = await requireRole(['counselor', 'team_lead']);
  const courses = await serverApi<Paginated<Course>>('/courses?limit=100');

  return (
    <AppShell title="Courses" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">View-only — the catalogue you&rsquo;re selling</p>
      </div>
      {courses.data.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">No courses yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.data.map((c) => (
            <CourseCard key={c.id} course={c} basePath="/counselor/courses" />
          ))}
        </div>
      )}
    </AppShell>
  );
}
