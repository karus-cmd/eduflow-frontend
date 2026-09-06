'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { STICKER_ART, type StickerName } from './sticker-art';

/**
 * A floating sticker: transparent line art that drifts a few pixels as the page
 * scrolls, so the layer feels alive without ever competing with the content.
 *
 * Amplitude is deliberately tiny (default 10px over a whole viewport of travel).
 * The point is that a reader senses depth, not that they watch something move —
 * anything larger reads as parallax-for-its-own-sake and cheapens the page.
 *
 * All stickers share ONE scroll listener and ONE rAF frame. A page can therefore
 * carry a dozen of them for roughly the cost of carrying one, which is what makes
 * "many little things" affordable.
 */

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let frame = 0;
let listening = false;

function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    subscribers.forEach((fn) => fn());
  });
}

function subscribe(fn: Subscriber) {
  subscribers.add(fn);
  if (!listening) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    listening = true;
  }
  fn();
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && listening) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      listening = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

const TONE: Record<string, string> = {
  signal: 'var(--signal)',
  mint: 'var(--mint)',
  warning: 'var(--warning)',
  ink: 'var(--ink-faint)',
};

export type StickerProps = {
  name: StickerName;
  /** Rendered size in px. */
  size?: number;
  /** Vertical drift amplitude in px across one viewport of scroll. Keep it small. */
  drift?: number;
  /** Degrees of rotation applied across the same travel. */
  spin?: number;
  tone?: keyof typeof TONE;
  /** Opacity of the mark. Ambient stickers should sit well under the text. */
  opacity?: number;
  className?: string;
  style?: CSSProperties;
};

export function Sticker({
  name,
  size = 34,
  drift = 10,
  spin = 0,
  tone = 'signal',
  opacity = 0.5,
  className,
  style,
}: StickerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    return subscribe(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 when the sticker sits a viewport below the fold, +1 when a viewport
      // above it. 0 as it crosses the middle of the screen.
      const progress = 1 - (2 * (rect.top + rect.height / 2)) / vh;
      const clamped = Math.max(-1, Math.min(1, progress));
      el.style.transform = `translate3d(0, ${(clamped * drift).toFixed(2)}px, 0) rotate(${(clamped * spin).toFixed(2)}deg)`;
    });
  }, [drift, spin]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`sticker${className ? ` ${className}` : ''}`}
      style={{
        position: 'absolute',
        display: 'block',
        color: TONE[tone] ?? TONE.signal,
        opacity,
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" role="presentation" focusable="false">
        {STICKER_ART[name]}
      </svg>
    </span>
  );
}
