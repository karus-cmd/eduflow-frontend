import { Info, Users } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import { formatDate } from '@/lib/format';
import type { Course, CounselorDashboard, Lead, Paginated } from '@/lib/api/types';

export const metadata = { title: 'My students · EduFlow' };

export default async function StudentsPage() {
  const me = await requireRole(['counselor', 'team_lead']);
  const [dash, leads, courses] = await Promise.all([
    serverApi<CounselorDashboard>('/dashboard/counselor'),
    serverApi<Paginated<Lead>>('/leads?limit=100'),
    serverApi<Paginated<Course>>('/courses?limit=100'),
  ]);

  const courseTitle = new Map(courses.data.map((c) => [c.id, c.title]));
  // A counselor's converted leads = the students they enrolled (convertedStudentId is set on capture).
  const converted = leads.data
    .filter((l) => l.convertedStudentId || l.stage === 'enrolled')
    .sort((a, b) => new Date(b.convertedAt ?? b.updatedAt).getTime() - new Date(a.convertedAt ?? a.updatedAt).getTime());

  return (
    <AppShell title="Students" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">My students</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Enrollments" value={dash.stats.studentsEnrolled} hint="students you closed" />
        <StatCard label="Converted leads" value={converted.length} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Interested course</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {converted.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.fullName}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{l.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.interestedCourseId ? (courseTitle.get(l.interestedCourseId) ?? '—') : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(l.convertedAt ?? l.updatedAt)}</TableCell>
                </TableRow>
              ))}
              {converted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 size-8" />
                    No converted students yet. Close a lead to see them here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          This lists the leads you converted. Per-course <strong>progress</strong> for your students needs a
          counselor-scoped endpoint (e.g. <code>GET /me/students</code>) — the current API only exposes a
          student&rsquo;s own enrollment progress. Reported as a contract gap.
        </span>
      </div>
    </AppShell>
  );
}
