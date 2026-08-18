import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { buttonVariants } from '@/components/ui/button';
import { CourseThumb } from '@/components/course-thumb';
import { formatPct } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface EnrolledCourse {
  id: string; // enrollment id
  course: { id: string; title: string; thumbnailUrl: string | null };
  status: string;
  progressPct: string;
  accessEndsAt: string | null;
  completedAt: string | null;
}

/** A "My Learning" tile: thumbnail, progress, access window, and a resume/start/review CTA. */
export function EnrolledCourseCard({ enrollment }: { enrollment: EnrolledCourse }) {
  const pct = formatPct(enrollment.progressPct);
  const completed = !!enrollment.completedAt;
  const cancelled = enrollment.status === 'cancelled' || enrollment.status === 'expired';
  const cta = completed ? 'Review' : pct > 0 ? 'Continue' : 'Start';

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
      <Link
        href={`/student/learn/${enrollment.course.id}`}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
        <CourseThumb title={enrollment.course.title} thumbnailUrl={enrollment.course.thumbnailUrl} />
        {completed && (
          <Badge className="absolute left-2 top-2 gap-1" variant="default">
            <CheckCircle2 className="size-3" /> Completed
          </Badge>
        )}
        {cancelled && (
          <Badge className="absolute left-2 top-2 capitalize" variant="destructive">
            {enrollment.status}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-medium leading-snug">{enrollment.course.title}</h3>

        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pct}% complete</span>
            {enrollment.accessEndsAt && <span>Access to {formatDate(enrollment.accessEndsAt)}</span>}
          </div>
          <Progress value={pct} />
        </div>

        <Link
          href={`/student/learn/${enrollment.course.id}`}
          className={cn(buttonVariants({ variant: cancelled ? 'outline' : 'default' }), 'w-full')}
        >
          {cta} learning
        </Link>
      </div>
    </Card>
  );
}
