'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 to `value` once the element scrolls into view. Uses rAF with an ease-out curve
 * (fast start, gentle settle) so the number feels like it's arriving, not ticking. Honors
 * prefers-reduced-motion by showing the final value immediately.
 */
export function CountUp({
  value,
  duration = 1400,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const tick = (now: number) => {
          if (!start) start = now;
          const p = Math.min((now - start) / duration, 1);
          setDisplay(value * easeOut(p));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
