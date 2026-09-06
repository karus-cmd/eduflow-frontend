'use client';

import { useEffect, useRef } from 'react';
import { STICKER_ART, type StickerName } from './sticker-art';

/**
 * A background layer of marks for content pages.
 *
 * Not the same effect as the login scene. There, the marks are the whole point and drift on their
 * own timers. Here they sit BEHIND real content someone is reading, so they never move by
 * themselves — they shift a few pixels with the scroll and otherwise hold still. Ambient depth,
 * not animation.
 *
 * Each page passes its own set, so the backdrop is about that page's subject: a lattice and a
 * stack behind DSA, a neuron and a loss curve behind machine learning, a compass behind the
 * catalogue. `intensity` lets a reading surface sit quieter than a browsing one.
 */

export type AmbientMark = {
  name: StickerName;
  /** % of the container. */
  top: string;
  left?: string;
  right?: string;
  size: number;
  tone?: 'signal' | 'mint' | 'ink' | 'warning';
  /** px of travel across the full scroll range. Keep small. */
  drift?: number;
};

const TONE: Record<string, string> = {
  signal: 'var(--signal)',
  mint: 'var(--mint)',
  warning: 'var(--warning)',
  ink: 'var(--ink-faint)',
};

export function AmbientField({
  marks,
  intensity = 0.16,
}: {
  marks: AmbientMark[];
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = Array.from(root.children) as HTMLElement[];
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        items.forEach((el) => {
          const d = Number(el.dataset.drift ?? 8);
          // Scaled by scroll position, not by element position: these are page furniture, so
          // they should slide with the page rather than react to their own box.
          el.style.transform = `translate3d(0, ${((y * d) / 600).toFixed(2)}px, 0)`;
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [marks]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {marks.map((m, i) => (
        <span
          key={`${m.name}-${i}`}
          data-drift={m.drift ?? 8}
          style={{
            position: 'absolute',
            top: m.top,
            left: m.left,
            right: m.right,
            width: m.size,
            height: m.size,
            color: TONE[m.tone ?? 'signal'],
            opacity: intensity,
            willChange: 'transform',
          }}
        >
          <svg viewBox="0 0 32 32" width="100%" height="100%" role="presentation" focusable="false">
            {STICKER_ART[m.name]}
          </svg>
        </span>
      ))}
    </div>
  );
}
