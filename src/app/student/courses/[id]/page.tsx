import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SiteFooter } from '@/components/site-footer';
import { CourseDetailView, type CourseOutcome } from '@/components/course-detail/course-detail-view';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import type { Course, CourseDetail, Paginated, SectionNode } from '@/lib/api/types';

export default async function CourseDetailPage(props: PageProps<'/student/courses/[id]'>) {
  const { id } = await props.params;
  const me = await requireRole(['student']);

  let course: CourseDetail;
  try {
    course = await serverApi<CourseDetail>(`/courses/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }

  const coursesPage = await serverApi<Paginated<Course>>('/courses?limit=100');

  const previewCount = course.sections.reduce(
    (a, s) => a + s.lessons.filter((l) => l.isFreePreview).length,
    0,
  );

  // Mechanical, not curated — the first lesson's description from each of the course's first 8
  // sections, never invented copy.
  const outcomes: CourseOutcome[] = course.sections.slice(0, 8).map((s) => ({
    title: s.title,
    detail: s.lessons[0]?.description ?? '',
  }));

  const projectSection: SectionNode | null = course.sections.find((s) => /project/i.test(s.title)) ?? null;

  const crossSell: Course | null = coursesPage.data.find((c) => c.id !== course.id) ?? null;

  return (
    <>
      <AppShell title="Course" user={me} nav={STUDENT_NAV} homeHref="/student">
        <CourseDetailView
          course={course}
          previewCount={previewCount}
          outcomes={outcomes}
          projectSection={projectSection}
          crossSell={crossSell}
        />
      </AppShell>
      <SiteFooter />
    </>
  );
}
