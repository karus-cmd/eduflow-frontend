'use client';

import { useRef } from 'react';
import styles from './plan-cards.module.css';
import { formatPaise } from '@/lib/money';
import { cn } from '@/lib/utils';

export interface PlanCardData {
  id: string;
  label: string;
  tagline: string;
  pricePaise: string;
  mrpPaise: string | null;
  points: string[];
  /** The dark/gold "recommended" treatment vs the light/neutral one — a fixed per-plan identity,
   *  not a function of which plan is currently selected (see design handoff). */
  premium?: boolean;
}

/** mrp → price discount, computed (never hardcoded) so it can't drift from the real prices. */
function savePercent(pricePaise: string, mrpPaise: string | null): number | null {
  const price = Number(pricePaise);
  const mrp = mrpPaise == null ? 0 : Number(mrpPaise);
  if (!(mrp > price)) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * "Choose your plan" — editorial plan-comparison cards (design handoff: Premium Plan Cards, 1a).
 * The premium/recommended plan always renders in its dark+gold treatment regardless of which
 * plan is currently selected; only the CTA fill/label and the footnote line track selection.
 *
 * A single-plan list (the upgrade-only case, where Standard isn't offered again) renders as
 * plain informational content instead of a control — there's nothing to choose between.
 */
export function PlanCards({
  courseTitle,
  plans,
  selected,
  onSelect,
}: {
  courseTitle: string;
  plans: PlanCardData[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const interactive = plans.length > 1;
  const selectedPlan = plans.find((p) => p.id === selected) ?? plans[0];

  function focusPlan(id: string) {
    gridRef.current?.querySelector<HTMLElement>(`[data-plan-id="${id}"]`)?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, idx: number) {
    if (!interactive) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = plans[(idx + 1) % plans.length];
      onSelect(next.id);
      focusPlan(next.id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = plans[(idx - 1 + plans.length) % plans.length];
      onSelect(prev.id);
      focusPlan(prev.id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(plans[idx].id);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{interactive ? 'Choose your plan' : 'Upgrade'}</h2>
        <span className={styles.meta}>{courseTitle.toUpperCase()}</span>
      </div>

      <div
        ref={gridRef}
        className={styles.grid}
        role={interactive ? 'radiogroup' : undefined}
        aria-label={interactive ? 'Choose your plan' : undefined}
      >
        {plans.map((plan, idx) => {
          const isSelected = interactive ? plan.id === selected : true;
          const pct = savePercent(plan.pricePaise, plan.mrpPaise);
          return (
            <div
              key={plan.id}
              data-plan-id={plan.id}
              className={cn(styles.card, plan.premium ? styles.cardDark : styles.cardLight)}
              role={interactive ? 'radio' : undefined}
              aria-checked={interactive ? isSelected : undefined}
              tabIndex={interactive ? (isSelected ? 0 : -1) : undefined}
              onClick={interactive ? () => onSelect(plan.id) : undefined}
              onKeyDown={interactive ? (e) => onKeyDown(e, idx) : undefined}
            >
              {plan.premium && <span className={styles.badge}>RECOMMENDED</span>}

              <div>
                <div className={styles.eyebrow}>PLAN {String(idx + 1).padStart(2, '0')}</div>
                <div className={styles.name}>{plan.label}</div>
                <div className={styles.tagline}>{plan.tagline}</div>
              </div>

              <div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{formatPaise(plan.pricePaise)}</span>
                  {pct != null && <span className={styles.mrp}>{formatPaise(plan.mrpPaise)}</span>}
                </div>
                {pct != null && <div className={styles.savePill}>SAVE {pct}%</div>}
              </div>

              <div className={styles.divider} />

              <ul className={styles.features}>
                {plan.points.map((point) => (
                  <li key={point} className={styles.feature}>
                    <span className={styles.marker} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.ctaWrap}>
                <div
                  className={cn(
                    styles.cta,
                    plan.premium
                      ? isSelected ? styles.ctaDarkSelected : styles.ctaDark
                      : isSelected ? styles.ctaLightSelected : styles.ctaLight,
                  )}
                >
                  {isSelected ? 'Selected' : 'Choose this plan'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {interactive && (
        <div className={styles.footnote}>
          <span className={styles.dot} />
          <span>
            Selected plan: <strong>{selectedPlan?.label}</strong> · billed once, no renewals.
          </span>
        </div>
      )}
    </div>
  );
}
