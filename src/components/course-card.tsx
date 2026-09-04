'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseThumb } from '@/components/course-thumb';
import { Price } from '@/components/price';
import { formatDuration } from '@/lib/format';
import type { Course } from '@/lib/api/types';

const MAX_TILT_DEG = 9;

/** A catalog tile linking to the course detail page. Tilts toward the cursor with a light glare
 *  that tracks it — a trading-card feel — via direct style writes on refs (no React re-renders
 *  per mousemove, so it stays smooth). `enrolled` shows an "Enrolled" badge; when `progressPct` is
 *  also given (a real value from GET /me/enrollments), it replaces the price row with a progress
 *  bar — you already own it, so what matters now is how far in you are. */
export function CourseCard({
  course,
  enrolled,
  progressPct,
  basePath = '/student/courses',
}: {
  course: Course;
  enrolled?: boolean;
  progressPct?: number;
  basePath?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * MAX_TILT_DEG;
    const rotateX = (0.5 - py) * MAX_TILT_DEG;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    const glare = glareRef.current;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.5), transparent 55%)`;
      glare.style.opacity = '1';
    }
  }

  function onMouseLeave() {
    const el = wrapRef.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    const glare = glareRef.current;
    if (glare) glare.style.opacity = '0';
  }

  return (
    <Link href={`${basePath}/${course.id}`} className="group block focus:outline-none" style={{ perspective: '900px' }}>
      <div
        ref={wrapRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="transition-transform duration-150 ease-out will-change-transform"
      >
        <Card className="relative h-full gap-0 py-0 transition-shadow duration-200 group-hover:shadow-[0_28px_56px_-26px_rgba(31,28,43,0.5)] group-focus-visible:ring-2 group-focus-visible:ring-ring">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <CourseThumb title={course.title} thumbnailUrl={course.thumbnailUrl} />
            {enrolled && (
              <Badge className="absolute left-2 top-2" variant="default">
                Enrolled
              </Badge>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2.5 p-4">
            <h3 className="line-clamp-2 font-heading text-[17px] font-bold leading-snug tracking-tight">{course.title}</h3>
            {course.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
            )}
            <div className="mt-auto flex items-center gap-3.5 text-xs text-muted-foreground">
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
            {enrolled && progressPct !== undefined ? (
              <div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }} />
                </div>
                <span className="mt-1 block text-xs text-muted-foreground">{Math.round(progressPct)}% complete</span>
              </div>
            ) : (
              <Price pricePaise={course.pricePaise} mrpPaise={course.mrpPaise} />
            )}
          </div>
          {/* Cursor-tracked glare — a sibling last child so Card's own overflow-hidden clips it to the rounded corners. */}
          <div ref={glareRef} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 [mix-blend-mode:overlay]" />
        </Card>
      </div>
    </Link>
  );
}
