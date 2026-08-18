'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CourseCard } from '@/components/course-card';
import type { Course } from '@/lib/api/types';

/** The catalog grid with an instant client-side title/description filter. */
export function CatalogGrid({
  courses,
  enrolledCourseIds,
}: {
  courses: Course[];
  enrolledCourseIds: string[];
}) {
  const [q, setQ] = useState('');
  const enrolled = useMemo(() => new Set(enrolledCourseIds), [enrolledCourseIds]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(needle) ||
        (c.description ?? '').toLowerCase().includes(needle),
    );
  }, [courses, q]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses…"
          className="h-9 pl-8"
          aria-label="Search courses"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          {courses.length === 0 ? 'No courses are published yet.' : `No courses match “${q}”.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} enrolled={enrolled.has(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
