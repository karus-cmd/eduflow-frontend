'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import styles from './pricing-plans.module.css';
import { Sticker } from '@/components/stickers/sticker';

/**
 * Plan comparison for the two launch tracks.
 *
 * The ladder is a strict superset: each tier says "everything in the one below,
 * plus…" rather than repeating a feature matrix, so the reader compares three
 * short lists instead of parsing a grid. The middle plan is the only one styled
 * up, because it is the one that should win.
 *
 * IMPORTANT — honesty constraints this component is built around:
 *  - Self-Paced and Mentored map to the backend's REAL `standard` and `complete`
 *    course tiers, so the content difference between them (the advanced modules)
 *    is actually enforced server-side, not just claimed here.
 *  - Placement is by application. It is deliberately NOT a checkout button: its
 *    perks are human-delivered and the backend has no entitlement model to
 *    provision or meter them, so it routes to the counselor team as a lead
 *    instead of pretending to auto-provision.
 *  - No countdown, no fabricated seat count, no invented discount. The only
 *    struck-through figure is the course's real `mrpPaise`.
 */

type TrackKey = 'patterns' | 'gradient';

type Track = {
  key: TrackKey;
  code: string;
  name: string;
  /** Real seeded values. Swap for the public catalog endpoint once it exists. */
  standard: { price: number; mrp: number; lessons: number };
  complete: { price: number; mrp: number; lessons: number };
  advanced: string;
};

const TRACKS: Track[] = [
  {
    key: 'patterns',
    code: 'PATTERNS',
    name: 'DSA for software-engineer roles',
    standard: { price: 4999, mrp: 6999, lessons: 60 },
    complete: { price: 7999, mrp: 9999, lessons: 82 },
    advanced: 'Trees, Tries, Graphs and Backtracking',
  },
  {
    key: 'gradient',
    code: 'GRADIENT',
    name: 'Machine learning for engineers',
    standard: { price: 5999, mrp: 7999, lessons: 48 },
    complete: { price: 8999, mrp: 11999, lessons: 83 },
    advanced: 'Deep learning, NLP, MLOps and capstones',
  },
];

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

function Tick({ signal = false }: { signal?: boolean }) {
  return (
    <svg
      className={`${styles.tick}${signal ? ` ${styles.tickSignal}` : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      className={styles.ctaArrow}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function PricingPlans() {
  const [active, setActive] = useState<TrackKey>('patterns');
  const track = TRACKS.find((t) => t.key === active) ?? TRACKS[0];
  const labelId = useId();

  return (
    <div className={styles.wrap}>
      <Sticker name="ticket" size={30} drift={12} spin={-4} tone="signal" opacity={0.24} style={{ top: -14, right: 18 }} />
      <Sticker name="spark" size={22} drift={-8} tone="mint" opacity={0.28} style={{ top: 96, left: -6 }} />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={styles.switch} role="tablist" aria-label="Choose a track">
          {TRACKS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`${labelId}-${t.key}`}
              aria-selected={t.key === active}
              className={styles.switchBtn}
              {...(t.key === active ? { 'data-on': '' } : {})}
              onClick={() => setActive(t.key)}
            >
              {t.code}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid} role="tabpanel" aria-labelledby={`${labelId}-${active}`}>
        {/* ---- 1. Self-Paced → real `standard` tier ---- */}
        <div className={styles.plan}>
          <div className={styles.name}>Self-Paced</div>
          <p className={styles.pitch}>The core curriculum, start to finish, on your own clock.</p>
          <div className={styles.priceRow}>
            <span className={styles.price}>{inr(track.standard.price)}</span>
            <span className={styles.mrp}>{inr(track.standard.mrp)}</span>
          </div>
          <div className={styles.per}>One payment · 365 days of access</div>
          <ul className={styles.feats}>
            <li className={styles.feat}>
              <Tick />
              <span>
                <span className={styles.featStrong}>{track.standard.lessons} lessons</span> across the core track
              </span>
            </li>
            <li className={styles.feat}>
              <Tick />
              <span>A structured path, so you always know what&rsquo;s next</span>
            </li>
            <li className={styles.feat}>
              <Tick />
              <span>Worked examples and patterns in every lesson</span>
            </li>
            <li className={styles.feat}>
              <Tick />
              <span>Progress tracking and streaks</span>
            </li>
          </ul>
          <Link href="/login" className={styles.cta}>
            Start self-paced <Arrow />
          </Link>
        </div>

        {/* ---- 2. Mentored → real `complete` tier + human services ---- */}
        <div className={`${styles.plan} ${styles.featured}`}>
          <span className={styles.badge}>Most chosen</span>
          <div className={styles.name}>Mentored</div>
          <p className={styles.pitch}>
            The full track plus a human in your corner — the part you can&rsquo;t self-study.
          </p>
          <div className={styles.priceRow}>
            <span className={styles.price}>{inr(track.complete.price)}</span>
            <span className={styles.mrp}>{inr(track.complete.mrp)}</span>
          </div>
          <div className={styles.per}>One payment · 365 days of access</div>
          <ul className={styles.feats}>
            <li className={`${styles.feat} ${styles.inherit}`}>
              <Tick signal />
              <span>Everything in Self-Paced</span>
            </li>
            <li className={styles.feat}>
              <Tick signal />
              <span>
                <span className={styles.featStrong}>All {track.complete.lessons} lessons</span> — unlocks {track.advanced}
              </span>
            </li>
            <li className={styles.feat}>
              <Tick signal />
              <span>
                <span className={styles.featStrong}>1 month of mentor support</span> for when you&rsquo;re genuinely stuck
              </span>
            </li>
            <li className={styles.feat}>
              <Tick signal />
              <span>
                <span className={styles.featStrong}>2 timed mock interviews</span> with written feedback
              </span>
            </li>
            <li className={styles.feat}>
              <Tick signal />
              <span>Resume and LinkedIn profile review</span>
            </li>
          </ul>
          <Link href="/login" className={`${styles.cta} ${styles.ctaPrimary}`}>
            Get mentored <Arrow />
          </Link>
        </div>

        {/* ---- 3. Placement → lead into the counselor CRM, never a fake checkout ---- */}
        <div className={styles.plan}>
          <div className={styles.name}>Placement</div>
          <p className={styles.pitch}>
            For people who want the offer, not just the syllabus. Limited by mentor capacity.
          </p>
          <div className={styles.priceRow}>
            <span className={styles.applyPrice}>By application</span>
          </div>
          <div className={styles.per}>We only take who we can actually place</div>
          <ul className={styles.feats}>
            <li className={`${styles.feat} ${styles.inherit}`}>
              <Tick />
              <span>Everything in Mentored</span>
            </li>
            <li className={styles.feat}>
              <Tick />
              <span>
                <span className={styles.featStrong}>3 months of mentor support</span>
              </span>
            </li>
            <li className={styles.feat}>
              <Tick />
              <span>Mock rounds with working engineers, until you&rsquo;re ready</span>
            </li>
            <li className={styles.feat}>
              <Tick />
              <span>Job-application support on LinkedIn</span>
            </li>
            <li className={styles.feat}>
              <Tick />
              <span>Portfolio and project review</span>
            </li>
          </ul>
          <Link href="/login?intent=placement" className={styles.cta}>
            Apply for a seat <Arrow />
          </Link>
        </div>
      </div>

      <p className={styles.note}>
        One payment, everything included — no per-module upsell. You can move from Self-Paced to
        Mentored at any time.
      </p>
    </div>
  );
}
