import { AppShell } from '@/components/app-shell';
import { OrreryField } from '@/components/stickers/micro-scenes';
import { StudentHub, type HubCourse, type Badge } from '@/components/student/student-hub';
import { LearningEmptyOrbit, type OrbitCourse } from '@/components/student/learning-empty-orbit';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import { formatPct } from '@/lib/money';
import type { ActivitySummary, Course, Paginated, StudentDashboard } from '@/lib/api/types';

/** First letter of each of the first two "significant" words — "Data Structures & Algorithms"
 *  → "DS", "Node.js Backend Essentials" → "NB". Same idea as the course card's single-letter
 *  initial, just two letters for a wider chip badge. */
function twoLetterInitials(title: string): string {
  const words = title
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ''))
    .filter((w) => w.length > 0 && !['and', 'the', 'of', 'a', 'an'].includes(w.toLowerCase()));
  const letters = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase());
  return letters.join('') || title.trim().charAt(0).toUpperCase() || '?';
}

export const metadata = { title: 'My Learning · STEIN-X' };

/** Bucket real accumulated seconds for a day into the 0–4 heatmap intensity `StudentHub` expects. */
function heatLevel(activeSeconds: number): number {
  if (activeSeconds <= 0) return 0;
  if (activeSeconds < 900) return 1; // < 15 min
  if (activeSeconds < 2700) return 2; // < 45 min
  if (activeSeconds < 5400) return 3; // < 90 min
  return 4;
}

export default async function MyLearningPage() {
  const me = await requireRole(['student']);
  const [dash, activity, catalogue] = await Promise.all([
    serverApi<StudentDashboard>('/dashboard/student'),
    serverApi<ActivitySummary>('/me/activity/summary'),
    // The dashboard payload carries no lesson counts, and the hero draws one tick per REAL
    // lesson — so join the catalogue rather than inventing a length.
    serverApi<Paginated<Course>>('/courses?limit=100'),
  ]);

  const first = me.fullName.split(' ')[0];

  if (dash.enrollments.length === 0) {
    // Top 3 published courses stand in for "recommendations" — there's no personalization
    // engine yet, so this is real catalogue data, not fabricated placeholder content.
    const recs = await serverApi<Paginated<Course>>('/courses?limit=3');
    const orbitCourses: OrbitCourse[] = recs.data.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      initials: twoLetterInitials(c.title),
      meta: `${c.totalLessons} ${c.totalLessons === 1 ? 'lesson' : 'lessons'}`,
    }));
    return (
      <AppShell title="My Learning" user={me} nav={STUDENT_NAV} homeHref="/student">
        <OrreryField />
        <LearningEmptyOrbit firstName={first} courses={orbitCourses} />
      </AppShell>
    );
  }

  const lessonsById = new Map(catalogue.data.map((c) => [c.id, c.totalLessons]));

  const courses: HubCourse[] = dash.enrollments.map((e) => ({
    id: e.course.id,
    title: e.course.title,
    slug: e.course.slug,
    thumbnailUrl: e.course.thumbnailUrl,
    pct: formatPct(e.progressPct),
    completed: !!e.completedAt,
    totalLessons: lessonsById.get(e.course.id) ?? 0,
  }));
  const resume = [...courses].filter((c) => !c.completed && c.pct > 0).sort((a, b) => b.pct - a.pct)[0]
    ?? courses.find((c) => !c.completed) ?? null;

  // real study rhythm + streak, from the activity heartbeat
  const heatmap = activity.heatmap.map((d) => heatLevel(d.activeSeconds));
  const streak = activity.streak;
  const daysThisWeek = activity.thisWeekDaysActive;
  const avgProgress = Math.round(courses.reduce((n, c) => n + c.pct, 0) / courses.length);
  const hours = Math.round((activity.studyTimeThisWeekSec / 3600) * 10) / 10;

  // The three donut rings are gone: the spine shows progress far better, and on a fresh
  // account three empty circles said nothing. These survive as a plain readout strip.
  const stats = [
    { label: 'This week', val: `${daysThisWeek}/7 days` },
    { label: 'Avg progress', val: `${avgProgress}%` },
    { label: 'Study time', val: `${hours}h` },
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
      <OrreryField />
      <StudentHub
        userId={me.id}
        firstName={first}
        streak={streak}
        stats={stats}
        resume={resume}
        courses={courses}
        heatmap={heatmap}
        achievements={achievements}
        nextClass={dash.nextClass}
      />
    </AppShell>
  );
}
