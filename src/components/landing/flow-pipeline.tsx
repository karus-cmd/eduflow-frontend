'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './landing.module.css';

const NODES: { title: string; desc: string; icon: ReactNode }[] = [
  { title: 'Lead', desc: 'A referral or walk-in lands in the counselor’s pipeline.', icon: <IconUser /> },
  { title: 'Conversation', desc: 'Every call logged; the stage advances itself.', icon: <IconChat /> },
  { title: 'Enrollment', desc: 'Checkout captures payment — access is provisioned.', icon: <IconCheck /> },
  { title: 'Learning', desc: 'Streaming lessons, resumable progress, live classes.', icon: <IconPlay /> },
  { title: 'Commission', desc: 'The ledger accrues, reconciles, and pays out.', icon: <IconCoin /> },
];

// dot centers over 5 equal columns (10%,30%,50%,70%,90%) in a 0..1000 viewBox
const DOTS = [100, 300, 500, 700, 900];

export function FlowPipeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      return;
    }

    let raf = 0;
    const compute = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the rail enters from the bottom, 1 once it has travelled ~65% up the viewport
      const start = vh * 0.85;
      const end = vh * 0.25;
      const p = (start - r.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={sectionRef} className={styles.pipeline}>
      {/* the drawing rail — hidden on stacked layouts where a horizontal line makes no sense */}
      <svg
        className={styles.pipeSvg}
        viewBox="0 0 1000 60"
        preserveAspectRatio="none"
        style={{ height: 60, top: -34 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5b8cff" />
            <stop offset="50%" stopColor="#a66bff" />
            <stop offset="100%" stopColor="#ff8a4c" />
          </linearGradient>
        </defs>
        <path className={styles.pipeTrack} d="M100,30 L900,30" pathLength={1} />
        <path
          className={styles.pipePath}
          d="M100,30 L900,30"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
        />
        {DOTS.map((cx, i) => {
          const lit = progress >= (cx - 100) / 800 - 0.001;
          return (
            <circle
              key={cx}
              cx={cx}
              cy={30}
              r={lit ? 7 : 5}
              fill={lit ? '#0c0c14' : '#0c0c14'}
              stroke={lit ? '#a66bff' : 'rgba(255,255,255,0.16)'}
              strokeWidth={lit ? 3 : 2}
              style={{ transition: 'r 240ms cubic-bezier(0.23,1,0.32,1), stroke 240ms ease' }}
            />
          );
        })}
      </svg>

      <div className={styles.nodes}>
        {NODES.map((n, i) => {
          const lit = progress >= (DOTS[i] - 100) / 800 - 0.05;
          return (
            <div
              key={n.title}
              className={styles.node}
              style={{
                opacity: lit ? 1 : 0.55,
                transform: lit ? 'none' : 'translateY(10px)',
                transition: 'opacity 500ms cubic-bezier(0.23,1,0.32,1), transform 500ms cubic-bezier(0.23,1,0.32,1), border-color 260ms ease, background 260ms ease',
              }}
            >
              <div className={styles.nodeIdx}>0{i + 1}</div>
              <div className={styles.nodeDot}>{n.icon}</div>
              <div className={styles.nodeTitle}>{n.title}</div>
              <div className={styles.nodeDesc}>{n.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- inline icons (stroke, currentColor) ---- */
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" /><path d="M9.5 9.5h4M9 12.5h6M11 15l2-5" />
    </svg>
  );
}
