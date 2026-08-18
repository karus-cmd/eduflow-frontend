import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CoursePlayer } from '@/components/course-player';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import { formatPct } from '@/lib/money';
import type { CourseDetail, Enrollment, LessonNode } from '@/lib/api/types';

export const metadata = { title: 'Course player · EduFlow' };

export default async function LearnPage(props: PageProps<'/student/learn/[courseId]'>) {
  const { courseId } = await props.params;
  const search = await props.searchParams;
  const me = await requireRole(['student']);

  let course: CourseDetail;
  try {
    course = await serverApi<CourseDetail>(`/courses/${courseId}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }

  const enrollments = await serverApi<Enrollment[]>('/me/enrollments').catch(() => [] as Enrollment[]);
  const enrollment = enrollments.find((e) => e.courseId === courseId);
  const progressPct = enrollment ? formatPct(enrollment.progressPct) : 0;

  // Resolve the lesson to open: a valid, unlocked ?lesson= wins; else the first unlocked lesson.
  const allLessons: LessonNode[] = course.sections.flatMap((s) => s.lessons);
  const requested = typeof search.lesson === 'string' ? search.lesson : undefined;
  const requestedLesson = requested ? allLessons.find((l) => l.id === requested && !l.locked) : undefined;
  const firstUnlocked = allLessons.find((l) => !l.locked);
  const initialLessonId = (requestedLesson ?? firstUnlocked ?? allLessons[0])?.id ?? null;

  return (
    <AppShell title="Learning" user={me} nav={STUDENT_NAV} homeHref="/student">
      <CoursePlayer
        courseId={course.id}
        courseTitle={course.title}
        sections={course.sections}
        courseResources={course.resources}
        enrolled={course.enrolled}
        initialLessonId={initialLessonId}
        initialProgressPct={progressPct}
        totalLessons={course.totalLessons}
      />
    </AppShell>
  );
}
