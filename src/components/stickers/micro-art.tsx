import type { ReactElement } from 'react';

/**
 * MICRO ART — miniature instruments, 12–36px on screen.
 *
 * Separate from sticker-art.tsx on purpose. Those are single-idea glyphs meant to sit beside a
 * heading at 15–22px. These are little COMPOSITIONS: gear teeth, dial ticks, sand grains,
 * constellation lines. They carry more internal detail than a glyph would, which is what lets them
 * stay interesting at 20px and read as artwork rather than iconography — what makes the sign-in
 * scene feel alive is density and detail, not size.
 *
 * Three sets, one per student surface, so no two pages share a vocabulary:
 *   ORRERY     — My Learning. Time, mechanism, accumulation.
 *   FIELDGUIDE — Browse. Specimens, labelling, choosing.
 *   WORKBENCH  — Profile. Keys, dials, identity, control.
 *
 * Thinner stroke than the glyph set (1.25 vs 1.6): at this size a heavy stroke closes up the
 * interior detail and the whole thing turns into a blob.
 */

const S = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * Math.sin/Math.cos are not bit-identical across engines — Node and V8-in-Chrome disagreed in
 * the last digit, which React saw as a hydration mismatch on every generated coordinate
 * (server "6.1387840678322725" vs client 6.138784067832274). Snapping to 3 decimals makes both
 * sides emit the same string, and on a 32-unit viewBox it is still far finer than a pixel.
 */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Teeth around a hub — generated so the spacing is exact rather than eyeballed. */
function teeth(cx: number, cy: number, r: number, n: number, len: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return (
      <line key={i} x1={r3(cx + c * r)} y1={r3(cy + s * r)} x2={r3(cx + c * (r + len))} y2={r3(cy + s * (r + len))} />
    );
  });
}

/** Dial ticks, every `every`-th one longer and brighter. */
function ticks(cx: number, cy: number, r: number, n: number, len: number, every = 3) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const l = i % every === 0 ? len * 1.8 : len;
    return (
      <line
        key={i}
        x1={r3(cx + c * r)}
        y1={r3(cy + s * r)}
        x2={r3(cx + c * (r - l))}
        y2={r3(cy + s * (r - l))}
        opacity={i % every === 0 ? 0.9 : 0.5}
      />
    );
  });
}

export type MicroName =
  | 'gearPair'
  | 'hourglass'
  | 'constellation'
  | 'barsMini'
  | 'orbit'
  | 'sprig'
  | 'magnifier'
  | 'tagPin'
  | 'cardStack'
  | 'mapPin'
  | 'compassRose'
  | 'calipers'
  | 'keyTiny'
  | 'lockDial'
  | 'fingerprint'
  | 'toggleSw'
  | 'badgeStar'
  | 'shieldCheck';

export const MICRO_ART: Record<MicroName, ReactElement> = {
  // ---------- ORRERY · My Learning ----------
  gearPair: (
    <g {...S}>
      <circle cx="12" cy="13" r="5.4" />
      <circle cx="12" cy="13" r="1.8" />
      {teeth(12, 13, 5.4, 8, 2)}
      <circle cx="23" cy="21" r="3.4" />
      <circle cx="23" cy="21" r="1.1" />
      {teeth(23, 21, 3.4, 6, 1.6)}
    </g>
  ),

  hourglass: (
    <g {...S}>
      <path d="M8 4h16M8 28h16" />
      <path d="M10 4c0 6 6 8 6 12s-6 6-6 12" />
      <path d="M22 4c0 6-6 8-6 12s6 6 6 12" />
      <circle cx="16" cy="21" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="24" r="0.7" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="17.3" cy="25" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
      <path d="M11.6 26.5h8.8" opacity="0.55" />
    </g>
  ),

  constellation: (
    <g {...S}>
      <path d="M5 21 12 12l7 4 8-9" opacity="0.42" />
      <path d="M12 12 14 24" opacity="0.42" />
      <circle cx="5" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="16" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="27" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="24" r="1.1" fill="currentColor" stroke="none" />
      <path d="M24 20v3M22.5 21.5h3" opacity="0.8" />
    </g>
  ),

  barsMini: (
    <g {...S}>
      <path d="M4 27h24" opacity="0.45" />
      <path d="M7 27v-6M12 27v-11M17 27v-8M22 27v-15M27 27v-10" />
      <path d="M7 19 12 14l5 3 5-6 5 4" opacity="0.55" strokeDasharray="2.5 2" />
    </g>
  ),

  orbit: (
    <g {...S}>
      <ellipse cx="16" cy="16" rx="12.5" ry="6.5" transform="rotate(-22 16 16)" opacity="0.5" />
      <circle cx="16" cy="16" r="3.6" />
      <path d="M13.4 13.6a3.6 3.6 0 0 0 5.2 4.8" opacity="0.6" />
      <circle cx="26" cy="11" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="21" r="1.1" fill="currentColor" stroke="none" opacity="0.7" />
    </g>
  ),

  sprig: (
    <g {...S}>
      <path d="M16 28V9" />
      <path d="M16 15c-3.4 0-5.6-2-5.6-5.2 3.4 0 5.6 2 5.6 5.2Z" />
      <path d="M16 20c3 0 5-1.8 5-4.6-3 0-5 1.8-5 4.6Z" opacity="0.7" />
      <path d="M16 9.6c-1.6-1.4-1.6-3.6 0-5.2 1.6 1.6 1.6 3.8 0 5.2Z" />
    </g>
  ),

  // ---------- FIELD GUIDE · Browse ----------
  magnifier: (
    <g {...S}>
      <circle cx="13.5" cy="13.5" r="8" />
      <circle cx="13.5" cy="13.5" r="5" opacity="0.35" />
      <path d="M13.5 8.5v10M8.5 13.5h10" opacity="0.5" />
      <path d="M19.4 19.4 27 27" strokeWidth="1.8" />
    </g>
  ),

  tagPin: (
    <g {...S}>
      <path d="M4 14.5 14.5 4H26a2 2 0 0 1 2 2v11.5L17.5 28a2 2 0 0 1-2.8 0L4 17.3a2 2 0 0 1 0-2.8Z" />
      <circle cx="22.5" cy="9.5" r="2.1" />
      <path d="M10 16l6 6" opacity="0.45" strokeDasharray="2 2" />
    </g>
  ),

  cardStack: (
    <g {...S}>
      <rect x="7" y="10" width="19" height="14" rx="2.2" />
      <path d="M9 8h15.5" opacity="0.65" />
      <path d="M11 5.5h11.5" opacity="0.4" />
      <path d="M11 15h9M11 19h6" opacity="0.55" />
    </g>
  ),

  mapPin: (
    <g {...S}>
      <path d="M16 28c0-7 6-9.2 6-15a6 6 0 1 0-12 0c0 5.8 6 8 6 15Z" />
      <circle cx="16" cy="12.6" r="2.4" />
      <ellipse cx="16" cy="27.5" rx="5.5" ry="1.6" opacity="0.35" strokeDasharray="2 2" />
    </g>
  ),

  compassRose: (
    <g {...S}>
      <circle cx="16" cy="16" r="10.5" opacity="0.5" />
      <path d="M16 3.5 18.4 13.6 28.5 16 18.4 18.4 16 28.5 13.6 18.4 3.5 16 13.6 13.6Z" />
      <path d="M23.2 8.8 17.6 14.4M8.8 23.2l5.6-5.6" opacity="0.4" />
    </g>
  ),

  calipers: (
    <g {...S}>
      <path d="M6 5v22M26 5v22" />
      <path d="M6 16h20" opacity="0.6" />
      <path d="M9.5 13.4 6 16l3.5 2.6M22.5 13.4 26 16l-3.5 2.6" />
      <path d="M11 5h10" opacity="0.4" strokeDasharray="2 2" />
    </g>
  ),

  // ---------- WORKBENCH · Profile ----------
  keyTiny: (
    <g {...S}>
      <circle cx="9.5" cy="16" r="5.5" />
      <circle cx="9.5" cy="16" r="2" />
      <path d="M15 16h13" />
      <path d="M22 16v4M25.5 16v3" />
    </g>
  ),

  lockDial: (
    <g {...S}>
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="6.4" opacity="0.5" />
      {ticks(16, 16, 11, 16, 1.7)}
      <path d="M16 16 20.5 11.5" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </g>
  ),

  fingerprint: (
    <g {...S}>
      <path d="M9 19.5a7 7 0 0 1 14 0" />
      <path d="M11.6 21a4.4 4.4 0 0 1 8.8 0" opacity="0.8" />
      <path d="M14.2 22.4a1.8 1.8 0 0 1 3.6 0" opacity="0.6" />
      <path d="M6.4 17.6a9.6 9.6 0 0 1 19.2 0" opacity="0.45" />
      <path d="M13 26.5h6" opacity="0.5" />
    </g>
  ),

  toggleSw: (
    <g {...S}>
      <rect x="4" y="11" width="24" height="10" rx="5" />
      <circle cx="21" cy="16" r="3.2" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M8.5 16h4" opacity="0.5" />
    </g>
  ),

  badgeStar: (
    <g {...S}>
      <circle cx="16" cy="13.5" r="8.5" />
      {teeth(16, 13.5, 8.5, 12, 1.4)}
      <path d="M16 8.6l1.7 3.5 3.8.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.6z" />
      <path d="M11.5 21.5 10 29l6-2.6 6 2.6-1.5-7.5" opacity="0.55" />
    </g>
  ),

  shieldCheck: (
    <g {...S}>
      <path d="M16 3.5 27 7.5v8c0 6.5-4.5 11.5-11 13.5-6.5-2-11-7-11-13.5v-8Z" />
      <path d="m11 15.5 3.6 3.6L21.5 12" strokeWidth="1.6" />
    </g>
  ),
};
