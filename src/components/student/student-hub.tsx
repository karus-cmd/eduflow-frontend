'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CourseThumb } from '@/components/course-thumb';
import { formatDateTime } from '@/lib/format';
import { StreakCelebration } from './streak-celebration';
import { TrackSpine } from './track-spine';
import { PageMark } from '@/components/stickers/page-mark';
import { ScrollMorph } from '@/components/stickers/scroll-morph';
import { SPROUT_TO_TREE } from '@/components/stickers/morph-shapes';
import { MicroSwap } from '@/components/stickers/micro-field';
import styles from './student.module.css';

export interface HubCourse { id: string; title: string; slug: string; thumbnailUrl: string | null; pct: number; completed: boolean; totalLessons: number; }
export interface HubStat { label: string; val: string; }
export interface Badge { key: string; name: string; desc: string; unlocked: boolean; }
export interface HubProps {
  userId: string;
  firstName: string;
  streak: number;
  stats: HubStat[];
  resume: HubCourse | null;
  courses: HubCourse[];
  heatmap: number[];
  achievements: Badge[];
  nextClass: { id: string; courseId: string; title: string; scheduledAt: string; joinUrl: string | null } | null;
}


/** Draws an in-view flag on first intersection (fires once). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '0px 0px -60px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // Returned as a tuple, not { ref, seen }: react-hooks/refs treats any `.ref` read during
  // render as accessing a ref value, so the object form tripped the rule at every call site.
  return [ref, seen] as const;
}

export function StudentHub(props: HubProps) {
  const { userId, firstName, streak, stats, resume, courses, heatmap, achievements, nextClass } = props;
  const [greeting, setGreeting] = useState('Welcome back');
  // Average completion across the student's courses — what the sprout/tree mark is drawn from.
  const avgPct = courses.length
    ? Math.round(courses.reduce((n, c) => n + c.pct, 0) / courses.length)
    : 0;
  const [heatRef, heatSeen] = useInView<HTMLDivElement>();
  const [badgesRef, badgesSeen] = useInView<HTMLDivElement>();

  // Time of day can only be read on the client, so the server renders the neutral
  // "Welcome back" and this replaces it on mount. Runs once; it has no other input.
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  return (
    <div className={styles.page}>
      <StreakCelebration userId={userId} streak={streak} />
      <div className={styles.wash} aria-hidden />
      <div className={styles.inner}>
        {/* Hero — the track itself, one tick per real lesson. Replaces the greeting, the streak
            box and three donut rings; see track-spine.tsx for why. */}
        {resume && resume.totalLessons > 0 ? (
          <TrackSpine
            courseId={resume.id}
            title={resume.title}
            eyebrow={courses.length > 1 ? `Continuing · 1 of ${courses.length} tracks` : 'Continuing'}
            totalLessons={resume.totalLessons}
            pct={resume.pct}
            streak={streak}
          />
        ) : (
          <div className={styles.hero}>
            <div className={styles.greet}>
              <div className={styles.eyebrow}>{greeting},</div>
              <h1 className={styles.hi}>
                <span className={styles.hiName}>{firstName}</span> — let&rsquo;s keep it rolling.
              </h1>
            </div>
          </div>
        )}

        {/* A plain readout strip where three donuts used to be. At zero it reads as zero,
            instead of as three empty circles pretending to be a chart. */}
        <div className={styles.statStrip}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCell}>
              <div className={styles.statVal}>{s.val}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* The "Jump back in" band that used to sit here is gone: it repeated the hero's
            course and its Continue button verbatim. The spine is the jump-back-in. */}

        {/* Next class */}
        {nextClass && (
          <div className={styles.resume} style={{ background: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 14px 34px -24px rgba(31,28,43,0.4)', border: '1px solid var(--border)' }}>
            <span className={styles.resumePlay} style={{ background: 'color-mix(in oklch, var(--coral) 16%, transparent)', color: 'var(--coral)' }} aria-hidden><IconLive /></span>
            <div className={styles.resumeBody}>
              <div className={styles.resumeKicker} style={{ color: 'var(--muted-foreground)' }}>Live class · {formatDateTime(nextClass.scheduledAt)}</div>
              <div className={styles.resumeTitle}>{nextClass.title}</div>
            </div>
            {nextClass.joinUrl && (
              <a href={nextClass.joinUrl} target="_blank" rel="noopener" className={styles.resumeBtn} style={{ background: 'var(--coral)', color: '#fff' }}>Join</a>
            )}
          </div>
        )}

        {/* Courses with progress rings */}
        <div className={styles.sec}>
          <span className={styles.secTitle}>
            <PageMark name="bookmark" size={15} className="mr-2" />
            Your courses
          </span>
          {/* Sand becomes a column chart. Hours put in are invisible; the record of them is not. */}
          <MicroSwap
            from="hourglass"
            to="barsMini"
            on={avgPct > 0}
            size={18}
            tone={avgPct > 0 ? 'signal' : 'ink'}
            className="mr-auto shrink-0 self-center opacity-60"
          />
          <Link href="/student/browse" className={styles.secNote}>Browse more →</Link>
        </div>
        <div className={styles.courseGrid}>
          {courses.map((c) => (
            <Link key={c.id} href={`/student/learn/${c.id}`} className={styles.course}>
              <div className={styles.courseThumb}>
                <div className={styles.courseImg}><CourseThumb title={c.title} thumbnailUrl={c.thumbnailUrl} /></div>
                <span className={styles.courseRing}>
                  <svg viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="25" className={styles.courseRingBg} />
                    <circle cx="26" cy="26" r="21" className={styles.courseRingTrack} />
                    <CourseRingProg pct={c.pct} />
                    <text x="26" y="26" dominantBaseline="central" textAnchor="middle" className={styles.courseRingPct}>{c.completed ? '✓' : `${c.pct}`}</text>
                  </svg>
                </span>
              </div>
              <div className={styles.courseBody}>
                <div className={styles.courseName}>{c.title}</div>
                <div className={styles.courseMeta}>
                  {c.completed ? <span className={styles.doneTag}><IconCheck /> Completed</span> : `${c.pct}% complete`}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Study activity heatmap */}
        <div className={styles.sec}>
          <span className={styles.secTitle}>
            <PageMark name="gauge" size={15} tone="mint" className="mr-2" />
            Your study rhythm
          </span>
          <span className={styles.secNote}>recent activity</span>
          {/* Driven by the student's REAL average progress, not by scroll — this page is shorter
              than the viewport, so nothing here ever scrolls. Tying it to data also says what
              scroll never could: the sprout IS how far through the track they are, and it
              finishes becoming a tree when the course does. */}
          <ScrollMorph
            mark={SPROUT_TO_TREE}
            size={34}
            tone="mint"
            opacity={0.65}
            progress={avgPct / 100}
            label={`${avgPct}% of your tracks complete`}
          />
        </div>
        <div className={styles.heat}>
          <div ref={heatRef} className={styles.heatGrid} {...(heatSeen ? { 'data-in': '' } : {})}>
            {heatmap.map((lvl, i) => {
              // Grid fills top-to-bottom then column-to-column (grid-auto-flow: column, 7 rows),
              // so a cell's (row, col) is i % 7 / i / 7 — delaying by their sum makes the glow
              // travel through the actual cells as a diagonal wave, not a separate overlay
              // sweeping over them.
              const row = i % 7;
              const col = Math.floor(i / 7);
              return (
                <span
                  key={i}
                  className={`${styles.heatCell} ${styles[`h${lvl}`]}`}
                  style={{ animationDelay: `${(row + col) * 14}ms` }}
                  /* `lvl` is an intensity bucket, not a session count — the backend records
                     daily activity minutes, and nothing counts discrete sessions. */
                  title={lvl === 0 ? 'no activity' : `${['', 'light', 'steady', 'strong', 'heavy'][lvl]} activity`}
                />
              );
            })}
          </div>
          <div className={styles.heatFoot}>
            <div className={styles.heatLegend}>
              Less
              {[0, 1, 2, 3, 4].map((l) => <span key={l} className={`${styles.legendCell} ${styles[`h${l}`]}`} />)}
              More
            </div>
            <div className={styles.heatSummary}>
              {/* "best streak" implied a longest-ever record; the backend only tracks the
                  current run, so that is what this says. */}
              <b>{heatmap.filter((v) => v > 0).length}</b> active days · current streak <b>{streak}</b>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.sec}>
          <span className={styles.secTitle}>
            <PageMark name="target" size={15} tone="warning" className="mr-2" />
            Achievements
          </span>
          {/* One body circling alone resolves into a named figure the moment a badge lands. */}
          <MicroSwap
            from="orbit"
            to="constellation"
            on={achievements.some((a) => a.unlocked)}
            size={18}
            tone={achievements.some((a) => a.unlocked) ? 'mint' : 'ink'}
            className="mr-auto shrink-0 self-center opacity-60"
          />
          <span className={styles.secNote}>{achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked</span>
        </div>
        <div ref={badgesRef} className={styles.badges} {...(badgesSeen ? { 'data-in': '' } : {})}>
          {achievements.map((a, i) => (
            <div key={a.key} className={`${styles.badge} ${a.unlocked ? styles.badgeOn : styles.badgeLocked}`} style={{ animationDelay: `${i * 70}ms` }}>
              <span className={styles.badgeIcon}>{BADGE_ICON[a.key] ?? <IconStar />}</span>
              <div className={styles.badgeName}>{a.name}</div>
              <div className={styles.badgeDesc}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseRingProg({ pct }: { pct: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 150); return () => clearTimeout(t); }, []);
  const r = 21;
  const c = 2 * Math.PI * r;
  return <circle cx="26" cy="26" r={r} className={styles.courseRingProg} strokeDasharray={c} strokeDashoffset={drawn ? c * (1 - Math.min(pct, 100) / 100) : c} />;
}

/* ---- icons ---- */
function IconCheck() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6" /></svg>; }
function IconLive() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.5" /><path d="M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11" /></svg>; }
function IconStar() { return <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3 2.6 5.6 6 .6-4.5 4 1.3 6L12 16.9 6.6 19.2l1.3-6-4.5-4 6-.6z" /></svg>; }
const BADGE_ICON: Record<string, ReactNode> = {
  first: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4h11l-1.5 3.5L16 11H5" /></svg>,
  streak: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-1.5.7-2.6 1.5-3.5C9 10 10 8.5 12 3Z" /></svg>,
  half: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" /></svg>,
  finish: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0zM9 18h6M10 21h4M6 4H4v2a3 3 0 0 0 3 3M18 4h2v2a3 3 0 0 1-3 3" /></svg>,
  book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M16 6h3v14h-3" /></svg>,
  perfect: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3 2.6 5.6 6 .6-4.5 4 1.3 6L12 16.9 6.6 19.2l1.3-6-4.5-4 6-.6z" /></svg>,
};
