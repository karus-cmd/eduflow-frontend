'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export function LandingPage() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.page}>
      <nav className={styles.nav} {...(stuck ? { 'data-stuck': '' } : {})}>
        <div className={styles.navInner}>
          <span className={styles.wordmark}>
            <span className={styles.mark}><IconSpark /></span> EduFlow
          </span>
          <div className={styles.navLinks}>
            <a className={styles.navLink} href="#tracks">Tracks</a>
            <a className={styles.navLink} href="#how">How it works</a>
            <a className={styles.navLink} href="#learn">Learn anywhere</a>
          </div>
          <Link href="/login" className={`${styles.btn} ${styles.btnSm}`}>Sign in</Link>
        </div>
      </nav>

      <main>
        {/* ---- Hero ---- */}
        <section className={styles.shell}>
          <div className={styles.hero}>
            <div>
              <span className={styles.pill}>
                <span className={styles.pillDot}><IconBolt /></span>
                For every exam and interview
              </span>
              <h1 className={styles.headline}>
                Learn it. Drill it.
                <br />
                <span className={styles.hlCoral}>Ace it.</span>
              </h1>
              <p className={styles.lede}>
                EduFlow turns courses, live classes, and thousands of practice questions into one habit that
                gets you exam and interview ready. Pick a track and start today.
              </p>
              <div className={styles.heroActions}>
                <Link href="/login" className={styles.btn}>
                  Start learning free <IconArrow />
                </Link>
                <a href="#tracks" className={`${styles.btn} ${styles.btnGhost}`}>
                  Explore tracks
                </a>
              </div>
              <div className={styles.heroNote}>
                <span className={styles.avatars}>
                  <span className={styles.avatar} />
                  <span className={styles.avatar} />
                  <span className={styles.avatar} />
                  <span className={styles.avatar} />
                </span>
                Join learners prepping here every day.
              </div>
            </div>

            <Deck />
          </div>
        </section>

        {/* ---- Tracks ---- */}
        <section id="tracks" className={`${styles.shell} ${styles.section}`}>
          <Reveal className={styles.sectionHead}>
            <h2 className={styles.h2}>
              Pick a track. <span className={styles.hl}>Go deep.</span>
            </h2>
            <p className={styles.sub}>
              Structured paths for the exams and interviews that matter, each a full course with lessons,
              practice sets, and timed mocks.
            </p>
          </Reveal>
          <div className={styles.tracks}>
            {TRACKS.map((t) => (
              <TiltCard key={t.name} className={styles.track} tint={t.tint}>
                <span className={styles.trackIcon} style={{ background: t.tint }}>{t.icon}</span>
                <span className={styles.trackName}>{t.name}</span>
                <span className={styles.trackDesc}>{t.desc}</span>
                <span className={styles.trackFoot}>
                  <span className={styles.lessons}>{t.lessons}</span>
                  <span className={styles.trackGo} style={{ color: t.tint }}>Start <IconArrow /></span>
                </span>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ---- The loop ---- */}
        <section id="how" className={`${styles.shell} ${styles.section}`} style={{ paddingTop: 0 }}>
          <Reveal className={styles.sectionHead}>
            <h2 className={styles.h2}>The loop that makes it stick.</h2>
            <p className={styles.sub}>
              Every track runs the same four beats. Repeat it and the hard things start to feel easy.
            </p>
          </Reveal>
          <Reveal className={styles.loop}>
            {LOOP.map((s, i) => (
              <div key={s.name} className={styles.step}>
                <span className={styles.stepNo}>0{i + 1}</span>
                <div className={styles.stepName}>{s.name}</div>
                <div className={styles.stepText}>{s.text}</div>
              </div>
            ))}
          </Reveal>
        </section>

        {/* ---- Learn anywhere (screen showcase) ---- */}
        <section id="learn" className={`${styles.shell} ${styles.section}`} style={{ paddingTop: 0 }}>
          <div className={styles.showcase}>
            <Reveal>
              <h2 className={styles.h2}>
                Class in your <span className={styles.hl}>pocket.</span>
              </h2>
              <div className={styles.featList}>
                {FEATURES.map((f) => (
                  <div key={f.title} className={styles.feat}>
                    <span className={styles.featIcon}>{f.icon}</span>
                    <div>
                      <div className={styles.featT}>{f.title}</div>
                      <div className={styles.featD}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <ScreenMock />
          </div>
        </section>

        {/* ---- Close ---- */}
        <section className={styles.shell}>
          <div className={styles.close}>
            <h2 className={styles.closeTitle}>Ready to get sharp?</h2>
            <p className={styles.closeSub}>
              Your first track is free. Start a lesson tonight and drill the rest tomorrow.
            </p>
            <div className={styles.closeActions}>
              <Link href="/login" className={`${styles.btn} ${styles.btnOnAzure}`}>
                Start learning free <IconArrow />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.wordmark} style={{ fontSize: 17 }}>
          <span className={styles.mark} style={{ width: 22, height: 22 }}><IconSpark /></span> EduFlow
        </span>
        <span>Courses · Live classes · Practice · Mock interviews</span>
      </footer>
    </div>
  );
}

/* ---------------- The 3D deck (hero artifact + signature motion) ------------ */

// fan geometry: each card offset + rotated, dealt with a stagger
const CARDS = [
  { tag: 'System Design', tagClass: 'cardTagInk', q: 'Design a URL shortener.', meta: '9 min · case study', x: -128, y: 8, z: -80, r: -14, d: 60 },
  { tag: 'Aptitude', tagClass: 'cardTagCoral', q: 'Big-O of binary search?', meta: 'timed drill', x: -66, y: -6, z: -40, r: -7, d: 130 },
  { tag: 'Physics', tagClass: 'cardTagAzure', q: "Newton's third law, in one line.", meta: 'NEET · JEE', x: 62, y: -4, z: -40, r: 7, d: 200 },
];

function Deck() {
  const deckRef = useRef<HTMLDivElement>(null);
  const chipARef = useRef<HTMLDivElement>(null);
  const chipBRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  // pointer-tilt the whole deck with a critically-damped spring (Emil: never raw 1:1)
  useEffect(() => {
    const stage = deckRef.current?.parentElement;
    const deck = deckRef.current;
    if (!stage || !deck) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, last = 0;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      const k = 1 - Math.exp(-7 * dt);
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      deck.style.transform = `rotateY(${(cx * 12).toFixed(2)}deg) rotateX(${(-cy * 12).toFixed(2)}deg)`;
      if (chipARef.current) chipARef.current.style.transform = `translate3d(${(cx * 22).toFixed(1)}px, ${(cy * 16).toFixed(1)}px, 0)`;
      if (chipBRef.current) chipBRef.current.style.transform = `translate3d(${(cx * -18).toFixed(1)}px, ${(cy * -14).toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(frame);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // flip the top card Q -> A on a gentle loop
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setFlipped((f) => !f), 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.deckStage}>
      <div ref={chipARef} className={`${styles.chip} ${styles.chipStreak}`} style={{ top: '6%', left: '2%' }}>
        <IconFlame /> 7-day streak
      </div>
      <div ref={chipBRef} className={`${styles.chip} ${styles.chipRank}`} style={{ bottom: '8%', right: '0%' }}>
        <IconTrend /> Top 5% this week
      </div>

      <div ref={deckRef} className={styles.deck}>
        {CARDS.map((c) => (
          <div
            key={c.tag}
            className={styles.slotWrap}
            style={{ ['--x' as string]: `${c.x}px`, ['--y' as string]: `${c.y}px`, ['--z' as string]: `${c.z}px`, ['--r' as string]: `${c.r}deg`, ['--delay' as string]: `${c.d}ms` } as CSSProperties}
          >
            <div className={styles.slot}>
              <div className={styles.deckCard}>
                <span className={`${styles.cardTag} ${styles[c.tagClass]}`}>{c.tag}</span>
                <span className={styles.cardQ}>{c.q}</span>
                <span className={styles.cardMeta}>
                  <span>{c.meta}</span>
                  <b>Drill</b>
                </span>
              </div>
            </div>
          </div>
        ))}
        {/* top card: flips between question and answer */}
        <div
          className={styles.slotWrap}
          style={{ ['--x' as string]: '116px', ['--y' as string]: '6px', ['--z' as string]: '40px', ['--r' as string]: '13deg', ['--delay' as string]: '270ms' } as CSSProperties}
        >
          <div className={styles.slot}>
            <div className={`${styles.flipper} ${flipped ? styles.flipped : ''}`}>
              <div className={styles.deckCard}>
                <span className={`${styles.cardTag} ${styles.cardTagAzure}`}>DSA</span>
                <span className={styles.cardQ}>Reverse a linked list in O(1) space.</span>
                <span className={styles.cardMeta}><span>tap to flip</span><b>Answer</b></span>
              </div>
              <div className={`${styles.deckCard} ${styles.faceBack}`}>
                <span className={styles.cardTag}>DSA · answer</span>
                <span className={styles.cardQ}>Walk the list once: keep prev, curr, next, and relink each node backward.</span>
                <span className={styles.cardMeta}><span>O(1) space · O(n) time</span><b>Got it</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tilt card (tracks) ---------------- */

function TiltCard({ className, tint, children }: { className?: string; tint: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateY(${(px * 12).toFixed(2)}deg) rotateX(${(-py * 12).toFixed(2)}deg)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = '';
  }
  return (
    <div
      ref={ref}
      className={className}
      style={{ ['--_tint' as string]: tint } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* ---------------- Screen mock (3D) ---------------- */

function ScreenMock() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transform = `rotateY(${(-12 + px * 5).toFixed(2)}deg) rotateX(${(6 - py * 4).toFixed(2)}deg)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return (
    <div ref={ref} className={styles.screen}>
      <div className={styles.screenInner}>
        <div className={styles.screenBar}><span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} /></div>
        <div className={styles.player}>
          <span className={styles.playBtn}><IconPlay /></span>
          <span className={styles.playerBar}><span /></span>
        </div>
        <div className={styles.showList}>
          {LESSONS.map((l, i) => (
            <div key={l} className={styles.showRow}>
              <span className={`${styles.check} ${i > 1 ? styles.checkOff : ''}`}>{i <= 1 ? <IconCheck /> : null}</span>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reveal ---------------- */

function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '0px 0px -80px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${styles.reveal} ${className ?? ''}`} {...(seen ? { 'data-in': '' } : {})}>
      {children}
    </div>
  );
}

/* ---------------- content ---------------- */

const TRACKS = [
  { name: 'Coding Interviews', tint: '#0a7f56', lessons: '480 lessons', desc: 'Data structures, patterns, and timed mock rounds until they feel automatic.', icon: <IconCode /> },
  { name: 'System Design', tint: '#ff5a36', lessons: '12 case studies', desc: 'Scale, trade-offs, and the diagrams interviewers actually want to see.', icon: <IconGraph /> },
  { name: 'Aptitude & Reasoning', tint: '#1f1c2b', lessons: '900 questions', desc: 'Quant, logical reasoning, and speed drills for placement tests.', icon: <IconPuzzle /> },
  { name: 'NEET / JEE', tint: '#0ca3ad', lessons: 'Physics · Chem · Bio', desc: 'Concept-first lessons and full-length mocks mapped to the syllabus.', icon: <IconAtom /> },
  { name: 'Core CS', tint: '#d99a00', lessons: 'OS · DBMS · Networks', desc: 'The fundamentals every technical round circles back to.', icon: <IconChip /> },
  { name: 'Communication & HR', tint: '#ff5a36', lessons: '40 scenarios', desc: 'Behavioural answers and mock HR rounds that stop feeling scripted.', icon: <IconChat /> },
];

const LOOP = [
  { name: 'Learn', text: 'A short lesson lays the concept down clean, with worked examples.' },
  { name: 'Practice', text: 'Drill graded questions until the pattern is second nature.' },
  { name: 'Mock', text: 'Sit a timed round under real pressure and see where you stand.' },
  { name: 'Master', text: 'Spaced review brings the shaky topics back before you forget.' },
];

const FEATURES = [
  { title: 'Stream every lesson', desc: 'Adaptive HD video that resumes exactly where you left off, on any device.', icon: <IconPlay /> },
  { title: 'Live classes', desc: 'Join scheduled sessions, ask questions, and catch the replay after.', icon: <IconBroadcast /> },
  { title: 'Track your mastery', desc: 'Streaks, progress, and the weak spots to hit next, all in one view.', icon: <IconTrend /> },
];

const LESSONS = ['Arrays & two pointers', 'Hashing patterns', 'Binary search on answer', 'Sliding window'];

/* ---------------- icons (single stroke) ---------------- */
function IconArrow() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }
function IconSpark() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v6M12 15v6M3 12h6M15 12h6" /></svg>; }
function IconBolt() { return <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>; }
function IconFlame() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-1.5.7-2.6 1.5-3.5C9 10 10 8.5 12 3Z" /></svg>; }
function IconTrend() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15l5-5 4 4 7-8M15 3h6v6" /></svg>; }
function IconPlay() { return <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6" /></svg>; }
function IconBroadcast() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.5" /><path d="M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11M4 4a12 12 0 0 0 0 16M20 4a12 12 0 0 1 0 16" /></svg>; }
function IconCode() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" /></svg>; }
function IconGraph() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="18" r="2.4" /><circle cx="12" cy="7" r="2.4" /><circle cx="19" cy="16" r="2.4" /><path d="m7.7 16.2 2.6-6.8M13.9 8.5 17 14" /></svg>; }
function IconPuzzle() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4a2 2 0 1 1 4 0v2h2a2 2 0 0 1 2 2v2a2 2 0 1 1 0 4v2a2 2 0 0 1-2 2h-2a2 2 0 1 0-4 0H8a2 2 0 0 1-2-2v-2a2 2 0 1 1 0-4V8a2 2 0 0 1 2-2h2z" /></svg>; }
function IconAtom() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.6" /><ellipse cx="12" cy="12" rx="10" ry="4.5" /><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" /></svg>; }
function IconChip() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" /></svg>; }
function IconChat() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" /></svg>; }
