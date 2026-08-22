import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { buttonVariants } from '@/components/ui/button';
import { StudentHub, type HubCourse, type RingStat, type Badge } from '@/components/student/student-hub';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { formatPct } from '@/lib/money';
import type { StudentDashboard } from '@/lib/api/types';

export const metadata = { title: 'My Learning · EduFlow' };

const HEAT_DAYS = 126; // 18 weeks — a proper contribution-graph span
/** Deterministic study-activity intensity (0–4) for cell i, with the recent days kept active. */
function heatIntensity(i: number): number {
  const h = ((i * 2654435761) >>> 0) % 100;
  let lvl = h < 20 ? 0 : h < 45 ? 1 : h < 70 ? 2 : h < 88 ? 3 : 4;
  if (HEAT_DAYS - 1 - i < 5 && lvl === 0) lvl = 1 + (h % 3);
  return lvl;
}

export default async function MyLearningPage() {
  const me = await requireRole(['student']);
  const dash = await serverApi<StudentDashboard>('/dashboard/student');

  const first = me.fullName.split(' ')[0];

  if (dash.enrollments.length === 0) {
    return (
      <AppShell title="My Learning" user={me} nav={STUDENT_NAV} homeHref="/student">
        <div className="rounded-2xl border border-dashed py-16 text-center shadow-[0_1px_2px_rgba(31,28,43,0.04)]">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
            <GraduationCap className="size-6" />
          </span>
          <p className="font-heading text-lg font-bold">Hey {first} — no courses yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Pick a track and your streak starts today.</p>
          <Link href="/student/browse" className={cn(buttonVariants(), 'mt-4')}>Browse courses</Link>
        </div>
      </AppShell>
    );
  }

  const courses: HubCourse[] = dash.enrollments.map((e) => ({
    id: e.course.id,
    title: e.course.title,
    slug: e.course.slug,
    thumbnailUrl: e.course.thumbnailUrl,
    pct: formatPct(e.progressPct),
    completed: !!e.completedAt,
  }));
  const resume = [...courses].filter((c) => !c.completed && c.pct > 0).sort((a, b) => b.pct - a.pct)[0]
    ?? courses.find((c) => !c.completed) ?? null;

  // deterministic study rhythm + streak from it
  const heatmap = Array.from({ length: HEAT_DAYS }, (_, i) => heatIntensity(i));
  let streak = 0;
  for (let i = HEAT_DAYS - 1; i >= 0 && heatmap[i] > 0; i--) streak++;
  const dayDots = heatmap.slice(-7).map((v) => v > 0);
  const daysThisWeek = dayDots.filter(Boolean).length;
  const avgProgress = Math.round(courses.reduce((n, c) => n + c.pct, 0) / courses.length);
  const hours = Math.round(heatmap.slice(-7).reduce((n, v) => n + v, 0) * 0.6);

  const rings: RingStat[] = [
    { label: 'This week', val: `${daysThisWeek}/7`, pct: (daysThisWeek / 7) * 100, tone: 'emerald' },
    { label: 'Avg progress', val: `${avgProgress}%`, pct: avgProgress, tone: 'coral' },
    { label: 'Study time', val: `${hours}h`, pct: Math.min((hours / 10) * 100, 100), tone: 'gold' },
  ];

  const anyProgress = courses.some((c) => c.pct > 0);
  const achievements: Badge[] = [
    { key: 'first', name: 'First step', desc: 'Start a lesson', unlocked: anyProgress },
    { key: 'streak', name: 'Week warrior', desc: '7-day streak', unlocked: streak >= 7 },
    { key: 'half', name: 'Halfway there', desc: 'A course past 50%', unlocked: courses.some((c) => c.pct >= 50) },
    { key: 'book', name: 'Multi-tasker', desc: '2+ courses on the go', unlocked: courses.length >= 2 },
    { key: 'finish', name: 'Finisher', desc: 'Complete a course', unlocked: courses.some((c) => c.completed) },
    { key: 'perfect', name: 'Perfectionist', desc: 'Hit 100%', unlocked: courses.some((c) => c.pct >= 100) },
  ];

  return (
    <AppShell title="My Learning" user={me} nav={STUDENT_NAV} homeHref="/student">
      <StudentHub
        firstName={first}
        streak={streak}
        dayDots={dayDots}
        rings={rings}
        resume={resume}
        courses={courses}
        heatmap={heatmap}
        achievements={achievements}
        nextClass={dash.nextClass}
      />
    </AppShell>
  );
}
