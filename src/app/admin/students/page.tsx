import Link from 'next/link';
import { Building2, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { ADMIN_NAV } from '@/lib/nav';
import { formatPaise, formatPct } from '@/lib/money';
import { formatDate } from '@/lib/format';
import type { College, CounselorDetail, CounselorListItem, CounselorStudentRow, Paginated } from '@/lib/api/types';

export const metadata = { title: 'Students · STEIN-X' };

const CARD_SHADOW = 'shadow-[0_1px_2px_rgba(31,28,43,0.04),0_14px_34px_-24px_rgba(31,28,43,0.4)]';

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  completed: 'secondary',
  expired: 'outline',
  cancelled: 'destructive',
  suspended: 'destructive',
};

/**
 * College → Managers → Students drill-down (admin), all via `?collegeId=`/`?managerId=`
 * search params — same convention as /admin/managers. `managerId` alone (no collegeId)
 * works standalone, so the dashboard's "Students" shortcut can jump straight to level 3.
 */
export default async function AdminStudentsPage(props: PageProps<'/admin/students'>) {
  const me = await requireRole(['admin', 'finance']);
  const sp = await props.searchParams;
  const collegeId = typeof sp.collegeId === 'string' ? sp.collegeId : undefined;
  const managerId = typeof sp.managerId === 'string' ? sp.managerId : undefined;

  if (managerId) {
    const [manager, students] = await Promise.all([
      serverApi<CounselorDetail>(`/counselors/${managerId}`),
      serverApi<CounselorStudentRow[]>(`/counselors/${managerId}/students`),
    ]);

    return (
      <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
        <BackLink href={manager.college ? `/admin/students?collegeId=${manager.college.id}` : '/admin/students'} />
        <Breadcrumb college={manager.college} managerName={manager.fullName} />
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">{manager.fullName}&rsquo;s students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {students.length} {students.length === 1 ? 'enrollment' : 'enrollments'}
          </p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.student.fullName}</div>
                        <div className="text-xs text-muted-foreground">{s.student.email}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.course.title}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[s.status] ?? 'outline'} className="capitalize">
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatPct(s.progressPct)}%</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPaise(s.pricePaidPaise)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        No students under this manager yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (collegeId) {
    const [colleges, managers] = await Promise.all([
      serverApi<College[]>('/colleges').catch(() => [] as College[]),
      serverApi<Paginated<CounselorListItem>>(`/counselors?collegeId=${encodeURIComponent(collegeId)}&limit=100`),
    ]);
    const college = colleges.find((c) => c.id === collegeId) ?? null;

    return (
      <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
        <BackLink href="/admin/students" />
        <Breadcrumb college={college} />
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">{college?.name ?? 'Managers'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick a manager to see their students.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {managers.data.map((m) => (
            <Link
              key={m.id}
              href={`/admin/students?managerId=${m.id}`}
              className={`group flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3.5 ${CARD_SHADOW} transition-transform duration-200 hover:-translate-y-0.5`}
            >
              <span className="grid size-9 flex-none place-items-center rounded-full bg-primary/12 text-sm font-bold text-primary">
                {m.fullName.trim().charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium group-hover:text-primary">{m.fullName}</span>
                <span className="block text-xs text-muted-foreground">
                  {m.stats.students} {m.stats.students === 1 ? 'student' : 'students'}
                </span>
              </span>
              <ChevronRight className="size-4 flex-none text-muted-foreground" />
            </Link>
          ))}
          {managers.data.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted-foreground">No managers in this college yet.</p>
          )}
        </div>
      </AppShell>
    );
  }

  // Level 1: colleges
  const colleges = await serverApi<College[]>('/colleges').catch(() => [] as College[]);

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick a college, then a manager, to see their students.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colleges.map((c) => (
          <Link
            key={c.id}
            href={`/admin/students?collegeId=${c.id}`}
            className={`group flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3.5 ${CARD_SHADOW} transition-transform duration-200 hover:-translate-y-0.5`}
          >
            <span className="grid size-9 flex-none place-items-center rounded-xl bg-primary/12 text-primary">
              <Building2 className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium group-hover:text-primary">{c.name}</span>
                {c.isDefault && <span className="text-[0.65rem] font-medium text-muted-foreground">default</span>}
              </span>
              <span className="block text-xs text-muted-foreground">
                {c.managerCount} {c.managerCount === 1 ? 'manager' : 'managers'}
              </span>
            </span>
            <ChevronRight className="size-4 flex-none text-muted-foreground" />
          </Link>
        ))}
        {colleges.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">No colleges yet.</p>
        )}
      </div>
    </AppShell>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="size-3.5" />
      Back
    </Link>
  );
}

function Breadcrumb({ college, managerName }: { college: { id: string; name: string } | null; managerName?: string }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      <GraduationCap className="size-3.5" />
      <Link href="/admin/students" className="hover:text-foreground">
        Students
      </Link>
      {college && (
        <>
          <span>/</span>
          <Link href={`/admin/students?collegeId=${college.id}`} className="hover:text-foreground">
            {college.name}
          </Link>
        </>
      )}
      {managerName && (
        <>
          <span>/</span>
          <span className="text-foreground">{managerName}</span>
        </>
      )}
    </nav>
  );
}
