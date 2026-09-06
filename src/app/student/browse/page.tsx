import { AppShell } from '@/components/app-shell';
import { COMPASS_TO_TARGET } from '@/components/stickers/morph-shapes';
import { ScrollMorph } from '@/components/stickers/scroll-morph';
import { AmbientField } from '@/components/stickers/ambient-field';
import { PageMark } from '@/components/stickers/page-mark';
import { CatalogGrid } from '@/components/catalog-grid';
import { SiteFooter } from '@/components/site-footer';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import type { Course, Enrollment, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Browse courses · STEIN-X' };

export default async function BrowsePage() {
  const me = await requireRole(['student']);
  const [courses, enrollments] = await Promise.all([
    serverApi<Paginated<Course>>('/courses?limit=100'),
    serverApi<Enrollment[]>('/me/enrollments'),
  ]);
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const progressByCourseId = Object.fromEntries(enrollments.map((e) => [e.courseId, Number(e.progressPct)]));

  return (
    <>
      <AppShell title="Browse" user={me} nav={STUDENT_NAV} homeHref="/student">
        <AmbientField
          intensity={0.14}
          marks={[
            { name: 'keycap', top: '2%', right: '4%', size: 42, tone: 'ink', drift: 10 },
            { name: 'tree', top: '30%', left: '-1%', size: 40, tone: 'ink', drift: 16 },
            { name: 'loss', top: '58%', right: '2%', size: 38, tone: 'mint', drift: -12 },
            { name: 'bookmark', top: '82%', left: '6%', size: 32, tone: 'ink', drift: 20 },
          ]}
        />
        <div className="mb-6">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
            <PageMark name="compass" size={22} />
            Browse courses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {courses.meta.total} {courses.meta.total === 1 ? 'course' : 'courses'} available · pick up something new
          </p>
        </div>
        <CatalogGrid courses={courses.data} enrolledCourseIds={enrolledCourseIds} progressByCourseId={progressByCourseId} />
      </AppShell>
      <SiteFooter />
    </>
  );
}
