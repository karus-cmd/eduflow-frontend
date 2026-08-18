import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, Clock, Download, CalendarClock, PlayCircle, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseThumb } from '@/components/course-thumb';
import { Price } from '@/components/price';
import { SyllabusTree } from '@/components/syllabus-tree';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CourseDetail } from '@/lib/api/types';

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

  const downloadable =
    course.resources.filter((r) => r.isDownloadable).length +
    course.sections.reduce(
      (a, s) => a + s.lessons.reduce((b, l) => b + l.resources.filter((r) => r.isDownloadable).length, 0),
      0,
    );
  const previewCount = course.sections.reduce(
    (a, s) => a + s.lessons.filter((l) => l.isFreePreview).length,
    0,
  );
  const price = Number(course.pricePaise);

  return (
    <AppShell title="Course" user={me} nav={STUDENT_NAV} homeHref="/student">
      <Link
        href="/student/browse"
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Main column */}
        <div className="order-2 min-w-0 lg:order-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{course.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-4" />
              {course.totalLessons} {course.totalLessons === 1 ? 'lesson' : 'lessons'}
            </span>
            {course.totalDurationSec > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatDuration(course.totalDurationSec)} of content
              </span>
            )}
            {previewCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <PlayCircle className="size-4" />
                {previewCount} free {previewCount === 1 ? 'preview' : 'previews'}
              </span>
            )}
          </div>

          <div className="mt-6">
            <Tabs defaultValue="syllabus">
              <TabsList>
                <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="syllabus" className="pt-2">
                <SyllabusTree sections={course.sections} courseId={course.id} />
              </TabsContent>

              <TabsContent value="overview" className="space-y-6 pt-2">
                <div>
                  <h2 className="mb-2 font-medium">About this course</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {course.description?.trim() || 'No description provided for this course yet.'}
                  </p>
                </div>
                <div>
                  <h2 className="mb-3 font-medium">What&rsquo;s included</h2>
                  <ul className="grid gap-2 text-sm sm:grid-cols-2">
                    <Included icon={<BookOpen className="size-4" />} text={`${course.totalLessons} lessons`} />
                    {course.totalDurationSec > 0 && (
                      <Included
                        icon={<Clock className="size-4" />}
                        text={`${formatDuration(course.totalDurationSec)} of video`}
                      />
                    )}
                    {downloadable > 0 && (
                      <Included
                        icon={<Download className="size-4" />}
                        text={`${downloadable} downloadable ${downloadable === 1 ? 'resource' : 'resources'}`}
                      />
                    )}
                    <Included
                      icon={<CalendarClock className="size-4" />}
                      text={course.accessDays ? `${course.accessDays} days access` : '365 days access'}
                    />
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Purchase sidebar */}
        <aside className="order-1 lg:order-2">
          <Card className="gap-0 overflow-hidden py-0 lg:sticky lg:top-6">
            <div className="relative aspect-video w-full bg-muted">
              <CourseThumb title={course.title} thumbnailUrl={course.thumbnailUrl} />
            </div>
            <CardContent className="space-y-4 p-4">
              <Price pricePaise={course.pricePaise} mrpPaise={course.mrpPaise} size="lg" />

              {course.enrolled ? (
                <>
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    You&rsquo;re enrolled
                  </div>
                  <Link href={`/student/learn/${course.id}`} className={cn(buttonVariants(), 'w-full')}>
                    Go to course
                  </Link>
                </>
              ) : price > 0 ? (
                <Link
                  href={`/student/checkout/${course.id}`}
                  className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                >
                  Enroll now
                </Link>
              ) : (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Free enrolment isn&rsquo;t wired yet (checkout requires a positive amount). Contact your
                  counsellor to be enrolled.
                </p>
              )}

              {!course.enrolled && previewCount > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  {previewCount} {previewCount === 1 ? 'lesson is' : 'lessons are'} free to preview — open the
                  syllabus.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function Included({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {text}
    </li>
  );
}
