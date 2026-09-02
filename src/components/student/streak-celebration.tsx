'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './student.module.css';

const STORAGE_PREFIX = 'steinx:last-seen-streak:';
const AUTO_CLOSE_MS = 3400;

/**
 * A one-time-per-day celebration when the real streak (from /me/activity/summary) genuinely
 * increases — detected by comparing against the last streak this browser saw, in localStorage.
 * First-ever visit (no stored value yet) just records a baseline silently, never celebrates —
 * we can't tell "just increased" from "always been this" without a prior value to compare to.
 * Always mounted (visibility is opacity/pointer-events only) so the modal can transition out
 * smoothly instead of snapping away.
 */
export function StreakCelebration({ userId, streak }: { userId: string; streak: number }) {
  const [show, setShow] = useState(false);
  const [displayFrom, setDisplayFrom] = useState(streak);
  // Each holds one FULL, standalone class name (never combined with a base class at render
  // time) — see the CSS file's note on why compound selectors don't survive CSS Modules here.
  const [flameClass, setFlameClass] = useState(styles.celFlame);
  const [glowClass, setGlowClass] = useState(styles.celGlow);
  const [emberOn, setEmberOn] = useState(false);
  const [timerRun, setTimerRun] = useState(false);

  const numRef = useRef<HTMLSpanElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);
  const embersRef = useRef<HTMLDivElement>(null);
  const emberIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect a genuine increase once, on mount. `?celebrate=1` forces it regardless of history —
  // a manual-test escape hatch, since editing localStorage requires remembering to reload
  // afterward (easy to miss) whereas a URL is unambiguous. Safe to leave in: nobody stumbles
  // into it by accident, and it doesn't touch real data either way.
  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get('celebrate') === '1';
    if (forced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayFrom(Math.max(0, streak - 1));
      setShow(true);
      return;
    }
    const key = STORAGE_PREFIX + userId;
    try {
      const raw = localStorage.getItem(key);
      const lastSeen = raw !== null ? parseInt(raw, 10) : null;
      if (lastSeen !== null && !Number.isNaN(lastSeen) && streak > lastSeen) {
        // Reading localStorage (an external system) to decide whether to reveal the
        // celebration is exactly what this effect exists for — same accepted pattern
        // as this codebase's other mount-check effects (e.g. earnings-chart.tsx).
        setDisplayFrom(lastSeen);
        setShow(true);
      }
      localStorage.setItem(key, String(streak));
    } catch {
      /* localStorage unavailable (private mode, etc.) — never block the page for this */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function spawnEmber() {
    const container = embersRef.current;
    if (!container) return;
    const e = document.createElement('span');
    e.className = styles.celEmber; // animates from the moment it's appended — no trigger class needed
    const angle = -90 + (Math.random() * 120 - 60);
    const dist = 44 + Math.random() * 38;
    const rad = (angle * Math.PI) / 180;
    e.style.setProperty('--tx', `${Math.cos(rad) * dist}px`);
    e.style.setProperty('--ty', `${Math.sin(rad) * dist}px`);
    e.style.setProperty('--dur', `${750 + Math.random() * 400}ms`);
    container.appendChild(e);
    setTimeout(() => e.remove(), 1300);
  }

  function stopEmbers() {
    if (emberIntervalRef.current) clearInterval(emberIntervalRef.current);
    emberIntervalRef.current = null;
    if (embersRef.current) embersRef.current.innerHTML = '';
  }

  function playChime() {
    try {
      const AudioCtxCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxCtor();
      const notes = [
        { freq: 740, t: 0, dur: 0.14 },
        { freq: 988, t: 0.09, dur: 0.22 },
      ];
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = n.freq;
        const start = ctx.currentTime + n.t;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + n.dur + 0.02);
      });
      setTimeout(() => ctx.close(), 500);
    } catch {
      /* audio unavailable/blocked — the visual celebration still plays */
    }
  }

  function countUp(from: number, to: number, ms: number) {
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - (1 - t) ** 3;
      const val = Math.round(from + (to - from) * eased);
      if (numRef.current) numRef.current.textContent = String(val);
      if (unitRef.current) unitRef.current.textContent = val === 1 ? 'day' : 'days';
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function close() {
    setShow(false);
    setTimerRun(false);
    setFlameClass(styles.celFlame);
    setGlowClass(styles.celGlow);
    setEmberOn(false);
    stopEmbers();
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
  }

  // Drive the celebration sequence once `show` flips true.
  useEffect(() => {
    if (!show) return;
    playChime();
    // Kicking off the visual sequence in response to `show` flipping true — the same
    // "synchronize with an external system" (the DOM animation timeline) pattern this
    // rule's own docs describe as legitimate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlameClass(styles.celFlameGrow);
    setGlowClass(styles.celGlowBurst);
    setEmberOn(true);
    countUp(displayFrom, streak, 520);
    setTimerRun(true);

    const settle = setTimeout(() => {
      setFlameClass(styles.celFlameAlive);
      setGlowClass(styles.celGlowAmbient);
    }, 640);
    autoCloseRef.current = setTimeout(close, AUTO_CLOSE_MS);

    return () => clearTimeout(settle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Steady ember trickle while open.
  useEffect(() => {
    if (!emberOn) return;
    for (let i = 0; i < 6; i++) setTimeout(spawnEmber, i * 60);
    emberIntervalRef.current = setInterval(spawnEmber, 260);
    return () => {
      if (emberIntervalRef.current) clearInterval(emberIntervalRef.current);
      emberIntervalRef.current = null;
    };
  }, [emberOn]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && show) close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const onDots = Math.min(streak, 7);

  return (
    <div
      className={show ? styles.celOverlayShow : styles.celOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      aria-hidden={!show}
    >
      <div className={show ? styles.celModalShow : styles.celModal} role="dialog" aria-modal="true" aria-labelledby="streakCelTitle">
        <button type="button" className={styles.celClose} aria-label="Close" onClick={close}>✕</button>
        <div className={styles.celCheck} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12 5 5L20 6" />
          </svg>
        </div>
        <h2 className={styles.celTitle} id="streakCelTitle">Streak updated!</h2>

        <div className={styles.celFlameHolder} aria-hidden>
          <div className={glowClass} />
          <div className={styles.celGround} />
          <div className={styles.celBlobA} />
          <div className={styles.celBlobB} />
          <div className={styles.celBlobC} />
          <span className={flameClass}>
            <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
              <path className={styles.celFlameOuter} d="M12 2.5c3.4 4.2 5.5 6.6 5.5 10a5.5 5.5 0 0 1-11 0c0-1.7.6-2.9 1.6-4C9 10 10 8.6 12 2.5Z" fill="var(--coral)" />
              <path className={styles.celFlameInner} d="M12 9c1.7 2 2.7 3.2 2.7 5a2.7 2.7 0 0 1-5.4 0c0-1 .5-1.8 1.1-2.5.8.7 1.6-.5 1.6-2.5Z" fill="oklch(0.82 0.15 78)" />
            </svg>
          </span>
          <div className={styles.celEmbers} ref={embersRef} />
        </div>

        <div className={styles.celStreakRow}>
          <span className={styles.celNum} ref={numRef}>{displayFrom}</span>
          <span className={styles.celUnit} ref={unitRef}>{displayFrom === 1 ? 'day' : 'days'}</span>
        </div>
        <p className={styles.celSub}>Consistency compounds — see you tomorrow.</p>
        <div className={styles.dayDots} aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className={`${styles.dot} ${i >= 7 - onDots ? styles.dotOn : ''}`} />
          ))}
        </div>

        <div className={styles.celTimer}>
          <div className={timerRun ? styles.celTimerFillRun : styles.celTimerFill} />
        </div>
      </div>
    </div>
  );
}
