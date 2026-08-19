import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ChevronDown, Clock, PlayCircle, FileText } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { CourseThumb } from '@/components/course-thumb';
import { Price } from '@/components/price';
import { Badge } from '@/components/ui/badge';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import { formatDuration } from '@/lib/format';
import type { CourseDetail } from '@/lib/api/types';

/** Counselor content view is read-only: the full syllabus, no player links, no lock gating. */
export default async function CounselorCourseDetailPage(props: PageProps<'/counselor/courses/[id]'>) {
  const { id } = await props.params;
  const me = await requireRole(['counselor', 'team_lead']);

  let course: CourseDetail;
  try {
    course = await serverApi<CourseDetail>(`/courses/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }

  return (
    <AppShell title="Course" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <Link href="/counselor/courses" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="order-2 min-w-0 lg:order-1">
          <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-4" /> {course.totalLessons} lessons
            </span>
            {course.totalDurationSec > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" /> {formatDuration(course.totalDurationSec)}
              </span>
            )}
            <Badge variant={course.status === 'published' ? 'secondary' : 'outline'} className="capitalize">
              {course.status}
            </Badge>
          </div>

          {course.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{course.description}</p>
          )}

          <h2 className="mt-6 mb-2 font-medium">Syllabus</h2>
          <div className="divide-y rounded-xl border">
            {course.sections.map((s, i) => (
              <details key={s.id} open={i === 0} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
                  <span className="flex items-center gap-2">
                    <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    <span className="font-medium">{s.title}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{s.lessons.length} lessons</span>
                </summary>
                <ul className="border-t bg-muted/20">
                  {s.lessons.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className="flex min-w-0 items-center gap-2.5">
                        {l.videoAssetId ? (
                          <PlayCircle className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <FileText className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{l.title}</span>
                        {l.isFreePreview && <Badge variant="secondary" className="shrink-0">Free preview</Badge>}
                      </span>
                      {l.durationSec > 0 && (
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDuration(l.durationSec)}</span>
                      )}
                    </li>
                  ))}
                  {s.lessons.length === 0 && (
                    <li className="px-4 py-2.5 text-sm text-muted-foreground">No lessons yet.</li>
                  )}
                </ul>
              </details>
            ))}
            {course.sections.length === 0 && (
              <p className="px-4 py-6 text-sm text-muted-foreground">No syllabus yet.</p>
            )}
          </div>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="overflow-hidden rounded-xl border lg:sticky lg:top-6">
            <div className="relative aspect-video w-full bg-muted">
              <CourseThumb title={course.title} thumbnailUrl={course.thumbnailUrl} />
            </div>
            <div className="space-y-2 p-4">
              <Price pricePaise={course.pricePaise} mrpPaise={course.mrpPaise} size="lg" />
              <p className="text-xs text-muted-foreground">
                Share this course with your leads. Enrolment happens via the student&rsquo;s checkout with your
                referral code.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
