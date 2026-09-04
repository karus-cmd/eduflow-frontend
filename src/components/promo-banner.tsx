'use client';

import { useState } from 'react';
import { Flame, X } from 'lucide-react';

/**
 * A dismissible "today's offer" strip above the header — sample promo copy, not wired to a real
 * pricing campaign (no such backend concept exists yet). Dismissal is per-visit only (no
 * localStorage) — reappears on the next load, matching how a real seasonal banner would behave.
 */
export function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[var(--azure-deep)] to-primary text-primary-foreground">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2 text-center text-[13.5px] font-semibold">
        <Flame className="size-[15px] shrink-0" fill="currentColor" stroke="none" />
        <span>
          Today only &mdash; courses from <span className="tabular-nums line-through opacity-70">₹5,999</span>{' '}
          <span className="tabular-nums">₹4,999</span>. Ends tonight.
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-6 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-primary-foreground/75 hover:bg-white/10 hover:text-primary-foreground"
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
