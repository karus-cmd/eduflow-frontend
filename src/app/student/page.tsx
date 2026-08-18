import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/app-shell';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { formatPct } from '@/lib/money';
import type { StudentDashboard } from '@/lib/api/types';

export default async function StudentDashboardPage() {
  const me = await requireRole(['student']);
  const dash = await serverApi<StudentDashboard>('/dashboard/student');

  return (
    <AppShell title="Student" user={me}>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">My courses</h1>

      {dash.nextClass && (
        <Card className="mb-6 border-primary/30">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Next live class</p>
              <p className="font-medium">{dash.nextClass.title}</p>
            </div>
            <p className="text-sm text-muted-foreground">{new Date(dash.nextClass.scheduledAt).toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      )}

      {dash.enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You’re not enrolled in any courses yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dash.enrollments.map((e) => {
            const pct = formatPct(e.progressPct);
            return (
              <Card key={e.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2 text-base">
                    <span>{e.course.title}</span>
                    <Badge variant={e.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                      {e.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  {e.accessEndsAt && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Access until {new Date(e.accessEndsAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
