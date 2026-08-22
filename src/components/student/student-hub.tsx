'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CourseThumb } from '@/components/course-thumb';
import { formatDateTime } from '@/lib/format';
import styles from './student.module.css';

export interface HubCourse { id: string; title: string; slug: string; thumbnailUrl: string | null; pct: number; completed: boolean; }
export interface RingStat { label: string; val: string; pct: number; tone: 'emerald' | 'coral' | 'gold'; }
export interface Badge { key: string; name: string; desc: string; unlocked: boolean; }
export interface HubProps {
  firstName: string;
  streak: number;
  dayDots: boolean[];
  rings: RingStat[];
  resume: HubCourse | null;
  courses: HubCourse[];
  heatmap: number[];
  achievements: Badge[];
  nextClass: { id: string; courseId: string; title: string; scheduledAt: string; joinUrl: string | null } | null;
}

const TONE: Record<RingStat['tone'], string> = { emerald: 'var(--primary)', coral: 'var(--coral)', gold: 'oklch(0.72 0.14 82)' };

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
  return { ref, seen };
}

function Ring({ pct, size, stroke, sw }: { pct: number; size: number; stroke: string; sw: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 120); return () => clearTimeout(t); }, []);
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = drawn ? c * (1 - Math.min(pct, 100) / 100) : c;
  return (
    <circle cx={size / 2} cy={size / 2} r={r} className={styles.ringProg} stroke={stroke} strokeWidth={sw}
      strokeDasharray={c} strokeDashoffset={off} fill="none" strokeLinecap="round" />
  );
}

export function StudentHub(props: HubProps) {
  const { firstName, streak, dayDots, rings, resume, courses, heatmap, achievements, nextClass } = props;
  const [greeting, setGreeting] = useState('Welcome back');
  const [resumeFill, setResumeFill] = useState(0);
  const heat = useInView<HTMLDivElement>();
  const badges = useInView<HTMLDivElement>();

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    const t = setTimeout(() => setResumeFill(resume ? resume.pct : 0), 200);
    return () => clearTimeout(t);
  }, [resume]);

  return (
    <div className={styles.page}>
      <div className={styles.wash} aria-hidden />
      <div className={styles.inner}>
        {/* Hero: greeting + streak */}
        <div className={styles.hero}>
          <div className={styles.greet}>
            <div className={styles.eyebrow}>{greeting},</div>
            <h1 className={styles.hi}>
              <span className={styles.hiName}>{firstName}</span> — let&rsquo;s keep it rolling.
            </h1>
          </div>
          <div className={styles.streak}>
            <span className={styles.flame} aria-hidden>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5c3.4 4.2 5.5 6.6 5.5 10a5.5 5.5 0 0 1-11 0c0-1.7.6-2.9 1.6-4C9 10 10 8.6 12 2.5Z" fill="var(--coral)" />
                <path d="M12 9c1.7 2 2.7 3.2 2.7 5a2.7 2.7 0 0 1-5.4 0c0-1 .5-1.8 1.1-2.5.8.7 1.6-.5 1.6-2.5Z" fill="oklch(0.82 0.15 78)" />
              </svg>
            </span>
            <div>
              <div className={styles.streakNum}>{streak} days</div>
              <div className={styles.streakLbl}>study streak</div>
            </div>
            <div className={styles.dayDots} aria-hidden>
              {dayDots.map((on, i) => (
                <span key={i} className={`${styles.dot} ${on ? styles.dotOn : ''}`} style={{ animationDelay: `${200 + i * 55}ms` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Momentum rings */}
        <div className={styles.rings}>
          {rings.map((r) => (
            <div key={r.label} className={styles.ringTile}>
              <svg className={styles.ringSvg} viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28.5" className={styles.ringTrack} />
                <Ring pct={r.pct} size={64} stroke={TONE[r.tone]} sw={7} />
                <text x="32" y="32" dominantBaseline="central" textAnchor="middle" className={styles.ringCenter}>{Math.round(r.pct)}%</text>
              </svg>
              <div>
                <div className={styles.ringVal}>{r.val}</div>
                <div className={styles.ringLbl}>{r.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Jump back in */}
        {resume && (
          <div className={styles.resume}>
            <span className={styles.resumePlay} aria-hidden><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
            <div className={styles.resumeBody}>
              <div className={styles.resumeKicker}>Jump back in</div>
              <div className={styles.resumeTitle}>{resume.title}</div>
              <div className={styles.resumeBar}><span className={styles.resumeFill} style={{ width: `${resumeFill}%` }} /></div>
            </div>
            <Link href={`/student/learn/${resume.id}`} className={styles.resumeBtn}>
              Continue <IconArrow />
            </Link>
          </div>
        )}

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
          <span className={styles.secTitle}>Your courses</span>
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
          <span className={styles.secTitle}>Your study rhythm</span>
          <span className={styles.secNote}>last 5 weeks</span>
        </div>
        <div className={styles.heat}>
          <div ref={heat.ref} className={styles.heatGrid} {...(heat.seen ? { 'data-in': '' } : {})}>
            {heatmap.map((lvl, i) => (
              <span key={i} className={`${styles.heatCell} ${styles[`h${lvl}`]}`} style={{ animationDelay: `${i * 9}ms` }} title={`${lvl === 0 ? 'no' : lvl} ${lvl === 1 ? 'session' : 'sessions'}`} />
            ))}
          </div>
          <div className={styles.heatLegend}>
            Less
            {[0, 1, 2, 3, 4].map((l) => <span key={l} className={`${styles.legendCell} ${styles[`h${l}`]}`} />)}
            More
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.sec}>
          <span className={styles.secTitle}>Achievements</span>
          <span className={styles.secNote}>{achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked</span>
        </div>
        <div ref={badges.ref} className={styles.badges} {...(badges.seen ? { 'data-in': '' } : {})}>
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
function IconArrow() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }
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
