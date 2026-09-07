'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Clock3, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CourseCard } from '@/components/course-card';
import type { Course } from '@/lib/api/types';

// Quick-filter shortcuts, not a real taxonomy (courses have no category field yet) — each pill
// just pre-fills the same title/description search below, so "filtering" here is always genuine,
// never a fake facet with nothing behind it.
const QUICK_FILTERS = [
  { label: 'All', term: '' },
  { label: 'Web Development', term: 'web' },
  { label: 'Data Science', term: 'data' },
  { label: 'Exam Prep', term: 'neet' },
  { label: 'DSA & Aptitude', term: 'dsa' },
];

const ROW_STYLE: React.CSSProperties = { display: 'flex', overflowX: 'auto', paddingBottom: 8 };
const ROW_ITEM_STYLE: React.CSSProperties = { flex: '0 0 300px' };
const MOVE_MS = 700;
const STAGGER_MS = 70;

/**
 * The catalog grid with an instant client-side title/description filter, plus a scroll-triggered
 * row→grid reveal: cards land in a horizontal scrolling row, and the moment you scroll down far
 * enough for the grid to enter view, they animate into the full vertical grid, once, no click
 * needed. `display: flex` -> `display: grid` isn't something CSS can smoothly interpolate on its
 * own (a layout-mode switch is instantaneous, not an animatable value) — so this is a small,
 * hand-written FLIP (First-Last-Invert-Play): measure each card's position before the switch,
 * apply the real layout change, measure again after, then animate away the difference with a
 * plain CSS transform. Only browser-native APIs (getBoundingClientRect, CSS transform,
 * requestAnimationFrame) — nothing whose behavior I can't fully account for.
 */
export function CatalogGrid({
  courses,
  enrolledCourseIds,
  progressByCourseId = {},
}: {
  courses: Course[];
  enrolledCourseIds: string[];
  /** courseId -> real progressPct from GET /me/enrollments. */
  progressByCourseId?: Record<string, number>;
}) {
  const [q, setQ] = useState('');
  const [rowMode, setRowMode] = useState(true); // lands horizontal
  const gridRef = useRef<HTMLDivElement>(null);
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

  // No Web Development course is built yet — rather than a fake purchasable card, an honest
  // "coming soon" teaser. Shown whenever the search is empty or could plausibly mean this (so the
  // "Web Development" quick-filter pill, term "web", surfaces it too, matching how every other
  // pill only ever narrows toward something real).
  const showComingSoon = 'web development'.includes(q.trim().toLowerCase());

  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    function reveal() {
      if (!root) return;
      const items = Array.from(root.children) as HTMLElement[];
      const before = items.map((el) => el.getBoundingClientRect());

      // The actual layout change — synchronous, so `before`/`after` straddle exactly one commit.
      flushSync(() => setRowMode(false));

      const after = items.map((el) => el.getBoundingClientRect());
      items.forEach((el, i) => {
        const dx = before[i].left - after[i].left;
        const dy = before[i].top - after[i].top;
        const sx = after[i].width ? before[i].width / after[i].width : 1;
        const sy = after[i].height ? before[i].height / after[i].height : 1;
        el.style.transition = 'none';
        el.style.transformOrigin = 'top left';
        el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      });

      // Force layout so the browser registers the "before" transform before animating away
      // from it — otherwise it may coalesce straight to the end state with nothing to see.
      void root.offsetHeight;

      items.forEach((el, i) => {
        requestAnimationFrame(() => {
          el.style.transition = `transform ${MOVE_MS}ms cubic-bezier(0.16, 1, 0.3, 1) ${i * STAGGER_MS}ms`;
          el.style.transform = '';
        });
      });
    }

    // Reveal once, the moment scrolling actually brings the grid into view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm flex-1 min-w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses…"
          className="h-9 pl-8"
          aria-label="Search courses"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((f) => {
          const active = q.trim().toLowerCase() === f.term;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setQ(f.term)}
              className={
                active
                  ? 'rounded-full bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground'
                  : 'rounded-full border border-border bg-card px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/40'
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        style={rowMode ? ROW_STYLE : undefined}
      >
        {filtered.length === 0 && !showComingSoon ? (
          <div className="col-span-full rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            {courses.length === 0 ? 'No courses are published yet.' : `No courses match “${q}”.`}
          </div>
        ) : (
          <>
            {filtered.map((c) => (
              <div key={c.id} style={rowMode ? ROW_ITEM_STYLE : undefined}>
                <CourseCard course={c} enrolled={enrolled.has(c.id)} progressPct={progressByCourseId[c.id]} />
              </div>
            ))}
            {showComingSoon && (
              <div key="coming-soon-web-dev" style={rowMode ? ROW_ITEM_STYLE : undefined}>
                <ComingSoonCard title="Web Development" blurb="Full-stack, from first commit to production deploy." />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** An honest placeholder for a track that's announced but not built yet — same tile footprint as
 *  CourseCard so it sits naturally in the grid, but visibly inert: no link, no price, dashed
 *  border. Never a real course row standing in for one that doesn't exist. */
function ComingSoonCard({ title, blurb }: { title: string; blurb: string }) {
  return (
    <Card className="h-full gap-0 border-dashed py-0 opacity-80">
      <div className="flex aspect-video w-full items-center justify-center bg-muted/60">
        <Clock3 className="size-8 text-muted-foreground/50" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="font-heading text-[17px] font-bold leading-snug tracking-tight text-muted-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{blurb}</p>
        <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Clock3 className="size-3.5" />
          Coming soon
        </span>
      </div>
    </Card>
  );
}
