'use client';

import { useEffect, useRef } from 'react';
import styles from './landing.module.css';

type Layer = { el: HTMLElement; depth: number };

/**
 * The hero's interactive stage: a glowing aurora orb, two orbit rings, and three floating
 * journey chips (Lead → Enroll → Learn), all parallaxing toward the pointer.
 *
 * Craft notes (Emil / Apple): tying visuals directly to the mouse feels artificial — it lacks
 * motion — so each layer eases toward its target with a per-axis, critically-damped spring
 * (exponential smoothing = no overshoot, stable at any frame rate). We write `transform`
 * directly on each element (GPU compositor, and no CSS-variable-on-parent child recalc), and
 * disable the whole thing under prefers-reduced-motion.
 */
export function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const layers: Layer[] = [];
    if (orbRef.current) layers.push({ el: orbRef.current, depth: 10 });
    if (ring1Ref.current) layers.push({ el: ring1Ref.current, depth: 20 });
    if (ring2Ref.current) layers.push({ el: ring2Ref.current, depth: 30 });
    chipRefs.current.forEach((c, i) => {
      if (c) layers.push({ el: c, depth: i % 2 === 0 ? -26 : -18 }); // chips drift opposite = depth
    });

    // target (-1..1) and eased presentation value per axis, per layer
    let tx = 0;
    let ty = 0;
    const cur = layers.map(() => ({ x: 0, y: 0 }));
    let raf = 0;
    let last = 0;

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * 0.9)));
      ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * 0.9)));
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      const k = 6; // response — higher = snappier settle, no overshoot
      const smooth = 1 - Math.exp(-k * dt);
      layers.forEach((layer, i) => {
        const state = cur[i];
        state.x += (tx * layer.depth - state.x) * smooth;
        state.y += (ty * layer.depth - state.y) * smooth;
        layer.el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`;
      });
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

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden>
      <div className={styles.orbWrap}>
        <div ref={ring2Ref} className={`${styles.orbRing} ${styles.orbRing2}`} />
        <div ref={ring1Ref} className={styles.orbRing} />
        <div ref={orbRef} className={styles.orb} />
      </div>

      <div
        ref={(el) => { chipRefs.current[0] = el; }}
        className={styles.orbChip}
        style={{ top: '8%', left: '-4%' }}
      >
        <Dot color="var(--a-blue)" /> New lead
      </div>
      <div
        ref={(el) => { chipRefs.current[1] = el; }}
        className={styles.orbChip}
        style={{ bottom: '20%', right: '-8%' }}
      >
        <Dot color="var(--a-violet)" /> Enrolled
      </div>
      <div
        ref={(el) => { chipRefs.current[2] = el; }}
        className={styles.orbChip}
        style={{ bottom: '2%', left: '10%' }}
      >
        <Dot color="var(--a-coral)" /> ₹ Commission
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 10px ${color}`,
        display: 'inline-block',
        flex: 'none',
      }}
    />
  );
}
