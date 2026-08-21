'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import styles from './landing.module.css';
import { cn } from '@/lib/utils';

/**
 * Scroll reveal — sets `data-visible` when the element enters the viewport, then disconnects.
 * Fires ONCE (re-animating on every scroll-by is an interface fighting its reader). The actual
 * motion (clip-path / opacity / translate) lives in CSS so it runs off the main thread.
 */
export function Reveal({
  children,
  className,
  clip = false,
  as: Tag = 'div',
  margin = '-100px',
}: {
  children: ReactNode;
  className?: string;
  clip?: boolean;
  as?: ElementType;
  margin?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: `0px 0px ${margin} 0px`, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <Tag
      ref={ref}
      className={cn(styles.reveal, clip && styles.revealClip, className)}
      {...(visible ? { 'data-visible': '' } : {})}
    >
      {children}
    </Tag>
  );
}
