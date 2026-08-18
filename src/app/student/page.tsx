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
import type { StudentDashboard } from '@/lib/api/types';

export const metadata = { title: 'My Learning · EduFlow' };

export default async function MyLearningPage() {
  const me = await requireRole(['student']);
  const dash = await serverApi<StudentDashboard>('/dashboard/student');

  const active = dash.enrollments.filter((e) => e.status === 'active');
  const inProgress = active.filter((e) => !e.completedAt);

  return (
    <AppShell title="My Learning" user={me} nav={STUDENT_NAV} homeHref="/student">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Learning</h1>
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

      {dash.nextClass && <NextClassBanner nextClass={dash.nextClass} />}

      {dash.enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <GraduationCap className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">You&rsquo;re not enrolled in any courses yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Find a course and start learning today.</p>
          <Link href="/student/browse" className={cn(buttonVariants(), 'mt-4')}>
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dash.enrollments.map((e) => (
            <EnrolledCourseCard key={e.id} enrollment={e} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
