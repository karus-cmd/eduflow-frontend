import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { buttonVariants } from '@/components/ui/button';
import { NextClassBanner } from '@/components/next-class-banner';
import { EnrolledCourseCard } from '@/components/enrolled-course-card';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { formatPct } from '@/lib/money';
import type { StudentDashboard } from '@/lib/api/types';

export const metadata = { title: 'My Learning · EduFlow' };

export default async function MyLearningPage() {
  const me = await requireRole(['student']);
  const dash = await serverApi<StudentDashboard>('/dashboard/student');

  const active = dash.enrollments.filter((e) => e.status === 'active');
  const inProgress = active.filter((e) => !e.completedAt);
  // the course to "pick up where you left off": furthest-along in-progress course
  const resume = [...inProgress].sort((a, b) => formatPct(b.progressPct) - formatPct(a.progressPct))[0];

  return (
    <AppShell title="My Learning" user={me} nav={STUDENT_NAV} homeHref="/student">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">
            Hey {me.fullName.split(' ')[0]}, ready to learn?
          </h1>
          {inProgress.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {inProgress.length} {inProgress.length === 1 ? 'course' : 'courses'} in progress
            </p>
          )}
        </div>
        <Link href="/student/browse" className={cn(buttonVariants({ variant: 'outline' }))}>
          Browse courses
        </Link>
      </div>

      {dash.nextClass && (
        <div className="mb-6">
          <NextClassBanner nextClass={dash.nextClass} />
        </div>
      )}

      {resume && (
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-[0_24px_60px_-30px_color-mix(in_oklch,var(--primary)_75%,transparent)] sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-12 size-40 rotate-12 rounded-3xl bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 right-24 size-28 -rotate-6 rounded-3xl bg-[color-mix(in_oklch,var(--coral)_40%,transparent)]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <span className="text-xs font-medium uppercase tracking-wide text-white/70">Pick up where you left off</span>
              <h2 className="mt-1.5 font-heading text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                {resume.course.title}
              </h2>
              <div className="mt-4 max-w-sm">
                <div className="mb-1.5 flex justify-between text-xs text-white/80">
                  <span>{formatPct(resume.progressPct)}% complete</span>
                  <span>Keep the streak going</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white" style={{ width: `${formatPct(resume.progressPct)}%` }} />
                </div>
              </div>
            </div>
            <Link
              href={`/student/learn/${resume.course.id}`}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-6 font-heading text-[15px] font-bold text-primary shadow-[0_4px_0_rgba(0,0,0,0.14),0_12px_24px_-8px_rgba(0,0,0,0.4)] transition-transform active:translate-y-[3px]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Continue learning
            </Link>
          </div>
        </div>
      )}

      {dash.enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center shadow-[0_1px_2px_rgba(31,28,43,0.04)]">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
            <GraduationCap className="size-6" />
          </span>
          <p className="font-heading text-lg font-bold">You&rsquo;re not enrolled in any courses yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Find a track and start learning today.</p>
          <Link href="/student/browse" className={cn(buttonVariants(), 'mt-4')}>
            Browse courses
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mb-3 font-heading text-lg font-bold tracking-tight">All your courses</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dash.enrollments.map((e) => (
              <EnrolledCourseCard key={e.id} enrollment={e} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
