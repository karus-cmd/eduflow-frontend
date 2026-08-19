import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseThumb } from '@/components/course-thumb';
import { Price } from '@/components/price';
import { formatDuration } from '@/lib/format';
import type { Course } from '@/lib/api/types';

/** A catalog tile linking to the course detail page. `enrolled` shows an "Enrolled" badge. */
export function CourseCard({
  course,
  enrolled,
  basePath = '/student/courses',
}: {
  course: Course;
  enrolled?: boolean;
  basePath?: string;
}) {
  return (
    <Link href={`${basePath}/${course.id}`} className="group block focus:outline-none">
      <Card className="h-full gap-0 py-0 transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <CourseThumb title={course.title} thumbnailUrl={course.thumbnailUrl} />
          {enrolled && (
            <Badge className="absolute left-2 top-2" variant="default">
              Enrolled
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 font-medium leading-snug">{course.title}</h3>
          {course.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          )}
          <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {course.totalLessons} {course.totalLessons === 1 ? 'lesson' : 'lessons'}
            </span>
            {course.totalDurationSec > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatDuration(course.totalDurationSec)}
              </span>
            )}
          </div>
          <Price pricePaise={course.pricePaise} mrpPaise={course.mrpPaise} />
        </div>
      </Card>
    </Link>
  );
}
