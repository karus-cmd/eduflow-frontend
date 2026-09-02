import { Users } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import { formatDate } from '@/lib/format';
import { formatPct } from '@/lib/money';
import type { CounselorStudentRow } from '@/lib/api/types';

export const metadata = { title: 'My students · STEIN-X' };

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  completed: 'secondary',
  expired: 'outline',
  cancelled: 'destructive',
  suspended: 'destructive',
};

export default async function StudentsPage() {
  const me = await requireRole(['counselor', 'team_lead']);
  const students = await serverApi<CounselorStudentRow[]>(`/counselors/${me.id}/students`);

  const current = students.filter((s) => s.status === 'active');
  const past = students.filter((s) => s.status !== 'active');

  return (
    <AppShell title="Students" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">My students</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Total enrollments" value={students.length} hint="students you closed" />
        <StatCard label="Currently active" value={current.length} />
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current ({current.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <StudentsTable rows={current} emptyLabel="No active students yet. Close a lead to see them here." />
        </TabsContent>
        <TabsContent value="past">
          <StudentsTable rows={past} emptyLabel="No past enrollments yet." />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function StudentsTable({ rows, emptyLabel }: { rows: CounselorStudentRow[]; emptyLabel: string }) {
  return (
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
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
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
                  <TableCell className="text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 size-8" />
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
