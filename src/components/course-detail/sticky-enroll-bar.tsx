'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import styles from './sticky-enroll-bar.module.css';
import { formatPaise } from '@/lib/money';
import type { CourseTier } from '@/lib/api/types';

export interface StickyEnrollCourse {
  id: string;
  title: string;
  pricePaise: string;
  mrpPaise: string | null;
  /** Non-null only when this course offers a second, higher-priced "Complete" plan. */
  premiumPricePaise: string | null;
  premiumMrpPaise: string | null;
  enrolled: boolean;
  enrolledTier: CourseTier | null;
}

/**
 * Always-visible purchase CTA (design handoff's sticky enroll bar). Mirrors CheckoutClient's
 * exact tier-pricing computation (`checkout-client.tsx`) so the price shown here never drifts
 * from what checkout actually charges. Bounded to AppShell's content width — no full-bleed/
 * negative-margin tricks (see course-detail-view.tsx for why).
 */
export function StickyEnrollBar({ course }: { course: StickyEnrollCourse }) {
  const hasPremium = course.premiumPricePaise != null;
  const [tier, setTier] = useState<CourseTier>('standard');

  const activePricePaise = tier === 'complete' ? course.premiumPricePaise! : course.pricePaise;
  const activeMrpPaise = tier === 'complete' ? course.premiumMrpPaise : course.mrpPaise;
  const priceNum = Number(activePricePaise);
  const hasDiscount = activeMrpPaise != null && Number(activeMrpPaise) > priceNum;

  const enrollHref = hasPremium
    ? `/student/checkout/${course.id}?tier=${tier}`
    : `/student/checkout/${course.id}`;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.titleWrap}>
          <span className={styles.eyebrow}>{course.title}</span>
        </div>

        {!course.enrolled && hasPremium && (
          <div className={styles.toggle} role="radiogroup" aria-label="Choose a plan">
            <button
              type="button"
              role="radio"
              aria-checked={tier === 'standard'}
              className={tier === 'standard' ? styles.toggleBtnActive : styles.toggleBtn}
              onClick={() => setTier('standard')}
            >
              Standard
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={tier === 'complete'}
              className={tier === 'complete' ? styles.toggleBtnActive : styles.toggleBtn}
              onClick={() => setTier('complete')}
            >
              Complete
            </button>
          </div>
        )}

        <div className={styles.priceWrap}>
          {course.enrolled ? (
            <>
              <span className={styles.enrolledPill}>
                <CheckCircle2 className="size-4" />
                Enrolled{course.enrolledTier === 'complete' ? ' — Complete' : ''}
              </span>
              {course.enrolledTier === 'standard' && hasPremium && (
                <Link href={`/student/checkout/${course.id}`} className={styles.ctaOutline}>
                  Upgrade to Complete
                </Link>
              )}
              <Link href={`/student/learn/${course.id}`} className={styles.cta}>
                Go to course
              </Link>
            </>
          ) : priceNum > 0 ? (
            <>
              <span className={styles.priceGroup}>
                <span className={styles.price}>{formatPaise(activePricePaise)}</span>
                {hasDiscount && <span className={styles.mrp}>{formatPaise(activeMrpPaise)}</span>}
              </span>
              <Link href={enrollHref} className={styles.cta}>
                Enroll now
              </Link>
            </>
          ) : (
            <span className={styles.freeNotice}>
              Free enrolment isn&rsquo;t wired yet — contact your counsellor to be enrolled.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
