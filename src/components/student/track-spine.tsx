'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * THE SPINE — the "My Learning" hero.
 *
 * What it replaces: a greeting, a streak box and three donut rings. That is the
 * dashboard template everyone ships, and on a fresh account the donuts render as
 * three empty circles that say nothing.
 *
 * What this does instead: it draws the course itself. One tick per REAL lesson
 * (totalLessons from the catalogue), filled up to where the student actually is
 * (progressPct, which the backend derives from lesson completion). So a student
 * on PATTERNS sees 82 marks and exactly how much of it is behind them — the page
 * is about their track, not about widgets.
 *
 * Ticks are flex children rather than SVG rects on purpose: they have to fit any
 * lesson count at any container width, and a viewBox would either distort them
 * (preserveAspectRatio="none") or letterbox. The marker and its pulse are SVG,
 * where the drawing actually needs to be precise.
 *
 * Motion is unique to this surface: the ticks rise along the line in sequence,
 * left to right, so the track appears to be laid down rather than faded in. The
 * position marker drops in only once that finishes, and the count rolls up to
 * meet it. Nothing here loops; it plays once, on arrival.
 */

/** Above this, ticks would be sub-pixel — group them so each mark stays legible. */
const MAX_TICKS = 96;

export function TrackSpine({
  courseId,
  title,
  eyebrow,
  totalLessons,
  pct,
  streak,
}: {
  courseId: string;
  title: string;
  eyebrow: string;
  totalLessons: number;
  pct: number;
  streak: number;
}) {
  const done = Math.round((Math.min(Math.max(pct, 0), 100) / 100) * totalLessons);
  const ticks = Math.min(totalLessons, MAX_TICKS);
  const doneTicks = totalLessons > 0 ? Math.round((done / totalLessons) * ticks) : 0;

  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setCount(done);
      return;
    }
    // The number rolls up while the track is being laid, so the two land together.
    const start = performance.now();
    const dur = 620;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setCount(Math.round(done * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // requestAnimationFrame does not run in a background tab, so a student who opens this in a
    // new tab and switches to it later would find the count frozen part-way. This lands it.
    const settle = setTimeout(() => setCount(done), dur + 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [done]);

  // Where the marker sits: the boundary between behind-you and ahead-of-you.
  const markerPct = ticks > 0 ? (doneTicks / ticks) * 100 : 0;

  return (
    <section ref={ref} className="spine" aria-label={`${title}: ${done} of ${totalLessons} lessons complete`}>
      <div className="spine-head">
        <span className="spine-eyebrow">{eyebrow}</span>
        {streak > 0 && (
          <span className="spine-streak">
            <svg width="13" height="13" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 4c4 5.4 6.6 8 6.6 12a6.6 6.6 0 0 1-13.2 0c0-2 .9-3.5 2-4.7C13 13.4 14.4 11.4 16 4Z" />
            </svg>
            {streak}-day streak
          </span>
        )}
      </div>

      <h1 className="spine-title">{title}</h1>

      <div className="spine-track">
        <div className="spine-ticks" aria-hidden="true">
          {Array.from({ length: ticks }, (_, i) => (
            <span
              key={i}
              className={i < doneTicks ? 'spine-tick is-done' : 'spine-tick'}
              style={{ animationDelay: `${i * 5}ms` }}
            />
          ))}
        </div>
        {doneTicks > 0 && doneTicks < ticks && (
          <svg
            className="spine-marker"
            style={{ left: `${markerPct}%`, animationDelay: `${ticks * 5 + 90}ms` }}
            width="13"
            height="9"
            viewBox="0 0 13 9"
            aria-hidden="true"
          >
            <path d="M6.5 9 0.5 0h12z" fill="currentColor" />
          </svg>
        )}
      </div>

      <div className="spine-foot">
        <div className="spine-count">
          <span className="spine-count-n">{count}</span>
          <span className="spine-count-of">/{totalLessons}</span>
          <span className="spine-count-l">lessons done</span>
        </div>
        <Link href={`/student/learn/${courseId}`} className="spine-cta">
          {done > 0 ? 'Continue' : 'Start the first lesson'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
