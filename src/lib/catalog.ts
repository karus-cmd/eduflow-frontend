import { API_BASE } from './config';

/**
 * Live marketing figures for the landing page, read from the backend's PUBLIC catalogue.
 *
 * Deliberately NOT `serverApi`: that reads auth cookies and hardcodes `cache: 'no-store'`, and the
 * landing has to work for signed-out visitors and be cacheable. This module never reads cookies,
 * never throws, and never returns partial data.
 *
 * It fetches the two known slugs rather than listing /public/courses, because the list also
 * carries leftover demo courses — iterating it would advertise "NEET Biology" on the landing and
 * inflate the hero counts. The slug allowlist is the point, not an optimisation.
 */

export type TrackKey = 'patterns' | 'gradient';

export const TRACK_SLUGS: Record<TrackKey, string> = {
  patterns: 'dsa-for-software-engineer',
  gradient: 'machine-learning-for-engineers',
};

export type TrackFigures = {
  key: TrackKey;
  slug: string;
  /** Whole rupees, already divided from paise. */
  standard: { price: number; mrp: number | null };
  /** null when the course sells a single tier. */
  complete: { price: number; mrp: number | null } | null;
  /** Lessons reachable on the standard tier only — what Self-Paced actually buys. */
  standardLessons: number;
  totalLessons: number;
  sections: number;
  accessDays: number | null;
};

export type LandingCatalog = {
  tracks: TrackFigures[];
  totals: { lessons: number; sections: number; accessDays: number; trackCount: number };
  /** false means these are the frozen fallback numbers, not a live read. */
  live: boolean;
};

/** Shape of GET /public/courses/:slug — mirrors public-course.response.dto.ts. Money is a STRING. */
type PublicSection = { title: string; tier: string; sortOrder: number; lessonCount: number };
type PublicCourseDetail = {
  slug: string;
  pricePaise: string;
  mrpPaise: string | null;
  premiumPricePaise: string | null;
  premiumMrpPaise: string | null;
  hasCompleteTier: boolean;
  accessDays: number | null;
  totalLessons: number;
  sections: PublicSection[];
};

/** paise string → whole rupees, guarded so a contract change renders the fallback, never "₹NaN". */
function rupees(paise: string | null | undefined): number | null {
  if (paise == null) return null;
  const n = Number(paise);
  return Number.isFinite(n) ? Math.round(n / 100) : null;
}

/**
 * Last-known-good figures, verified against the seeded courses on 2026-09-06.
 * This is a snapshot for when the backend is unreachable — NOT a source of truth. If an admin
 * edits a price and the backend is down, the page shows this instead of crashing.
 */
const FALLBACK_CATALOG: LandingCatalog = Object.freeze({
  tracks: [
    {
      key: 'patterns',
      slug: TRACK_SLUGS.patterns,
      standard: { price: 4999, mrp: 6999 },
      complete: { price: 7999, mrp: 9999 },
      standardLessons: 60,
      totalLessons: 82,
      sections: 18,
      accessDays: 365,
    },
    {
      key: 'gradient',
      slug: TRACK_SLUGS.gradient,
      standard: { price: 5999, mrp: 7999 },
      complete: { price: 8999, mrp: 11999 },
      standardLessons: 48,
      totalLessons: 83,
      sections: 18,
      accessDays: 365,
    },
  ],
  totals: { lessons: 165, sections: 36, accessDays: 365, trackCount: 2 },
  live: false,
}) as LandingCatalog;

async function fetchTrack(key: TrackKey): Promise<TrackFigures | null> {
  const res = await fetch(`${API_BASE}/public/courses/${TRACK_SLUGS[key]}`, {
    headers: { 'Content-Type': 'application/json' },
    // Shared across visitors, so an admin's price edit propagates within 5 minutes without a
    // redeploy — and without hitting the backend on every anonymous page view.
    next: { revalidate: 300, tags: ['public-catalog'] },
    // undici's default header timeout is minutes; a hung backend must not hold the marketing TTFB.
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) return null;

  const c = (await res.json()) as PublicCourseDetail;
  const standardPrice = rupees(c.pricePaise);
  if (standardPrice == null) return null;

  const completePrice = c.hasCompleteTier ? rupees(c.premiumPricePaise) : null;
  const sections = Array.isArray(c.sections) ? c.sections : [];

  return {
    key,
    slug: c.slug,
    standard: { price: standardPrice, mrp: rupees(c.mrpPaise) },
    complete: completePrice == null ? null : { price: completePrice, mrp: rupees(c.premiumMrpPaise) },
    standardLessons: sections
      .filter((s) => s.tier === 'standard')
      .reduce((n, s) => n + (s.lessonCount ?? 0), 0),
    totalLessons: c.totalLessons ?? 0,
    sections: sections.length,
    accessDays: c.accessDays,
  };
}

/**
 * Never throws, never returns half a catalogue. A hero reading "83 lessons across 2 tracks"
 * because one call 404'd is worse than showing the frozen figure, so a partial result is treated
 * as a total failure.
 */
export async function getLandingCatalog(): Promise<LandingCatalog> {
  try {
    const settled = await Promise.allSettled([fetchTrack('patterns'), fetchTrack('gradient')]);
    const tracks = settled.map((s) => (s.status === 'fulfilled' ? s.value : null));

    if (tracks.some((t) => t == null)) {
      console.warn('[catalog] public catalogue unavailable — rendering fallback figures');
      return FALLBACK_CATALOG;
    }

    const live = tracks as TrackFigures[];
    return {
      tracks: live,
      totals: {
        lessons: live.reduce((n, t) => n + t.totalLessons, 0),
        sections: live.reduce((n, t) => n + t.sections, 0),
        accessDays: live[0]?.accessDays ?? 365,
        trackCount: live.length,
      },
      live: true,
    };
  } catch {
    console.warn('[catalog] public catalogue threw — rendering fallback figures');
    return FALLBACK_CATALOG;
  }
}
