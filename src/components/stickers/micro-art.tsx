import type { ReactElement } from 'react';

/**
 * MICRO ART — miniature instruments, 8–48px on screen.
 *
 * Separate from sticker-art.tsx on purpose. Those are single-idea glyphs meant to sit beside a
 * heading at 15–22px. These are little COMPOSITIONS: gear teeth, dial graduations, sextant arcs,
 * spiral turns. They carry more internal detail than a glyph would, which is what lets them stay
 * interesting at 20px and read as artwork rather than iconography — what makes the sign-in scene
 * feel alive is density and detail, not size.
 *
 * Three sets of ten, one per student surface, so no two pages share a vocabulary, plus a shared
 * NANO tier drawn to survive at 7–12px where the instruments would turn to mush.
 *
 *   ORRERY     — My Learning. Time, mechanism, accumulation.
 *   FIELDGUIDE — Browse. Specimens, labelling, choosing.
 *   WORKBENCH  — Profile. Keys, dials, identity, control.
 *   NANO       — everywhere. Registration marks, the punctuation between instruments.
 *
 * Thinner stroke than the glyph set (1.25 vs 1.6): at this size a heavy stroke closes up the
 * interior detail and the whole thing turns into a blob. The nano tier goes thinner still.
 */

const S = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Nano marks are seen at a third the size, so they get a proportionally heavier stroke — at 8px a
// 1.25 hairline disappears into the background entirely.
const N = { ...S, strokeWidth: 1.9 };

/**
 * Math.sin/Math.cos are not bit-identical across engines — Node and V8-in-Chrome disagreed in
 * the last digit, which React saw as a hydration mismatch on every generated coordinate
 * (server "6.1387840678322725" vs client 6.138784067832274). Snapping to 3 decimals makes both
 * sides emit the same string, and on a 32-unit viewBox it is still far finer than a pixel.
 */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Polar → cartesian, degrees, y down (SVG convention). */
function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r3(cx + r * Math.cos(a)), r3(cy + r * Math.sin(a))];
}

/** Teeth around a hub — generated so the spacing is exact rather than eyeballed. */
function teeth(cx: number, cy: number, r: number, n: number, len: number) {
  return Array.from({ length: n }, (_, i) => {
    const [x1, y1] = pt(cx, cy, r, (i / n) * 360);
    const [x2, y2] = pt(cx, cy, r + len, (i / n) * 360);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
}

/** Dial ticks around a full circle, every `every`-th one longer and brighter. */
function ticks(cx: number, cy: number, r: number, n: number, len: number, every = 3) {
  return Array.from({ length: n }, (_, i) => {
    const deg = (i / n) * 360 - 90;
    const long = i % every === 0;
    const [x1, y1] = pt(cx, cy, r, deg);
    const [x2, y2] = pt(cx, cy, r - (long ? len * 1.8 : len), deg);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity={long ? 0.9 : 0.5} />;
  });
}

/** Graduations along a partial arc — the sextant scale, the gauge face. */
function arcTicks(cx: number, cy: number, r: number, d0: number, d1: number, n: number, len: number) {
  return Array.from({ length: n }, (_, i) => {
    const deg = d0 + ((d1 - d0) * i) / (n - 1);
    const long = i % 3 === 0;
    const [x1, y1] = pt(cx, cy, r, deg);
    const [x2, y2] = pt(cx, cy, r - (long ? len * 1.7 : len), deg);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity={long ? 0.85 : 0.45} />;
  });
}

/** A ratchet outline: radial rise, then a straight fall back — a wheel that only turns one way. */
function sawPath(cx: number, cy: number, r: number, n: number, len: number) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360;
    const b = ((i + 1) / n) * 360;
    const [ix, iy] = pt(cx, cy, r, a);
    const [ox, oy] = pt(cx, cy, r + len, b);
    d += `${i === 0 ? 'M' : 'L'}${ix} ${iy}L${ox} ${oy}`;
  }
  return `${d}Z`;
}

/** Archimedean spiral, sampled — time that accumulates rather than repeats. */
function spiralPath(cx: number, cy: number, r0: number, r1: number, turns: number, steps: number) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = pt(cx, cy, r0 + (r1 - r0) * t, -90 + turns * 360 * t);
    d += `${i === 0 ? 'M' : 'L'}${x} ${y}`;
  }
  return d;
}

export type MicroName =
  // ORRERY
  | 'gearPair' | 'hourglass' | 'constellation' | 'barsMini' | 'orbit' | 'sprig'
  | 'sextant' | 'pendulum' | 'ratchet' | 'spiral'
  // FIELDGUIDE
  | 'magnifier' | 'tagPin' | 'cardStack' | 'mapPin' | 'compassRose' | 'calipers'
  | 'pressedLeaf' | 'swatchFan' | 'crosshair' | 'scaleBalance'
  // WORKBENCH
  | 'keyTiny' | 'lockDial' | 'fingerprint' | 'toggleSw' | 'badgeStar' | 'shieldCheck'
  | 'dialGauge' | 'slider' | 'plugJack' | 'sealRibbon'
  // NANO
  | 'nanoRing' | 'nanoCross' | 'nanoChevron' | 'nanoBar' | 'nanoNode' | 'nanoArc';

export const MICRO_ART: Record<MicroName, ReactElement> = {
  // ══════════ ORRERY · My Learning — time, mechanism, accumulation ══════════
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

  /** Measuring your angle to something far away — the whole point of the track. */
  sextant: (
    <g {...S}>
      <path d="M16 6 7 22M16 6 25 22" />
      <path d="M7 22A18.4 18.4 0 0 0 25 22" />
      {arcTicks(16, 6, 18.4, 119, 61, 10, 1.5)}
      <path d="M16 6 11.4 21.3" opacity="0.75" />
      <circle cx="16" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <path d="M9.5 10.5h4.2" opacity="0.6" />
      <circle cx="8.8" cy="10.5" r="1.5" opacity="0.8" />
    </g>
  ),

  /** Kept time, swinging. The dashed arc is the path already travelled. */
  pendulum: (
    <g {...S}>
      <path d="M11.5 4.5h9" />
      <circle cx="16" cy="6" r="1.5" />
      <path d="M16 7.4 20.2 22.2" />
      <circle cx="20.6" cy="23.4" r="2.8" />
      <path d="M11.3 23.4A18 18 0 0 0 25 21.6" opacity="0.45" strokeDasharray="2 2.4" />
    </g>
  ),

  /** A wheel that can only turn forwards — lessons done never come undone. */
  ratchet: (
    <g {...S}>
      <path d={sawPath(14, 18, 7.2, 10, 2.4)} />
      <circle cx="14" cy="18" r="2.4" />
      <circle cx="14" cy="18" r="0.9" fill="currentColor" stroke="none" />
      <path d="M26 6 20.5 12.4" opacity="0.85" />
      <circle cx="26.4" cy="5.4" r="1.4" />
    </g>
  ),

  /** Time that accumulates instead of going round: every turn is further out than the last. */
  spiral: (
    <g {...S}>
      <path d={spiralPath(16, 16, 1.6, 12.6, 2.25, 72)} />
      <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
      {(() => {
        const [x, y] = pt(16, 16, 12.6, -90 + 2.25 * 360);
        return <circle cx={x} cy={y} r="1.7" fill="currentColor" stroke="none" />;
      })()}
    </g>
  ),

  // ══════════ FIELD GUIDE · Browse — specimens, labelling, choosing ══════════
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

  /** A herbarium sheet: the specimen, and the thread running out to its label. */
  pressedLeaf: (
    <g {...S}>
      <path d="M15 27C9 21 8.4 12.6 15 5.2c6.6 7.4 6 15.8 0 21.8Z" />
      <path d="M15 26.4V6.4" opacity="0.8" />
      <path d="M15 12 10.9 9M15 12l4.1-3M15 17.4 10.4 14.6M15 17.4l4.6-2.8" opacity="0.45" />
      <path d="M19.6 24.2h7.6" opacity="0.5" strokeDasharray="1.8 2" />
      <circle cx="19" cy="24.2" r="1" fill="currentColor" stroke="none" opacity="0.7" />
    </g>
  ),

  /** Samples on a rivet — the physical act of comparing before you pick. */
  swatchFan: (
    <g {...S}>
      <rect x="10.5" y="7" width="6.4" height="17" rx="1.6" transform="rotate(-26 13.7 24)" opacity="0.55" />
      <rect x="10.5" y="6" width="6.4" height="18" rx="1.6" transform="rotate(-8 13.7 24)" opacity="0.8" />
      <rect x="10.5" y="6" width="6.4" height="18" rx="1.6" transform="rotate(12 13.7 24)" />
      <circle cx="13.7" cy="24.4" r="1.6" />
    </g>
  ),

  /** Choosing, mid-act: the reticle is on it but not yet clicked. */
  crosshair: (
    <g {...S}>
      <circle cx="16" cy="16" r="10.5" />
      <circle cx="16" cy="16" r="4.4" opacity="0.4" />
      {ticks(16, 16, 10.5, 12, 1.4, 3)}
      <path d="M16 2.5v5.6M16 23.9v5.6M2.5 16h5.6M23.9 16h5.6" />
      <circle cx="16" cy="16" r="1.1" fill="currentColor" stroke="none" />
    </g>
  ),

  /** Two tracks on the scales. Deliberately NOT level — a choice already leaning. */
  scaleBalance: (
    <g {...S}>
      <path d="M16 27.5V10" />
      <path d="M11 27.5h10" />
      <path d="M13.6 10 16 6.4 18.4 10Z" />
      <path d="M5.4 12.6 26.6 9.4" />
      <path d="M5.9 12.6 5 17M26.1 9.4 27 13.8" opacity="0.6" />
      <path d="M1.8 17A3.2 3.2 0 0 0 8.2 17Z" opacity="0.85" />
      <path d="M23.8 13.8A3.2 3.2 0 0 0 30.2 13.8Z" opacity="0.85" />
    </g>
  ),

  // ══════════ WORKBENCH · Profile — keys, dials, identity, control ══════════
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

  /** A reading being taken. The needle sits off-centre because nothing is ever exactly nominal. */
  dialGauge: (
    <g {...S}>
      <circle cx="16" cy="17" r="11.5" opacity="0.55" />
      <circle cx="16" cy="17" r="9" />
      {arcTicks(16, 17, 9, 200, 340, 11, 1.5)}
      <path d="M16 17 21.6 10.6" strokeWidth="1.6" />
      <circle cx="16" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12.5 22.5h7" opacity="0.4" />
    </g>
  ),

  /** A setting held at a value you chose, with the range you could have chosen. */
  slider: (
    <g {...S}>
      <path d="M4 19h24" opacity="0.5" />
      <path d="M4 19h14" />
      <path d="M6 12v2.6M11 12v3.8M16 12v2.6M21 12v3.8M26 12v2.6" opacity="0.5" />
      <rect x="15.6" y="14.6" width="4.8" height="8.8" rx="1.8" />
      <path d="M18 17.4v3.2" opacity="0.6" />
    </g>
  ),

  /** Connected, and you can see the contacts. */
  plugJack: (
    <g {...S}>
      <rect x="12" y="11" width="12" height="10" rx="2.4" />
      <path d="M24 14.5h4M24 17.5h4" opacity="0.6" />
      <path d="M12 13.5H8.5M12 18.5H8.5" />
      <path d="M8.5 13.5A5 5 0 0 0 4 18.5v6" opacity="0.5" strokeDasharray="2.4 2" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="20" cy="16" r="1.2" fill="currentColor" stroke="none" opacity="0.8" />
    </g>
  ),

  /** Signed and sealed — the account, vouched for. */
  sealRibbon: (
    <g {...S}>
      <circle cx="16" cy="12.5" r="7" />
      {teeth(16, 12.5, 7, 14, 1.5)}
      <circle cx="16" cy="12.5" r="3.6" opacity="0.55" />
      <path d="M14.4 12.5h3.2M16 10.9v3.2" opacity="0.7" />
      <path d="M11.6 18.4 9 29l7-3.4 7 3.4-2.6-10.6" opacity="0.6" />
    </g>
  ),

  // ══════════ NANO · everywhere — the punctuation between instruments ══════════
  nanoRing: (
    <g {...N}>
      <circle cx="16" cy="16" r="9" />
      <circle cx="16" cy="16" r="2.6" fill="currentColor" stroke="none" />
    </g>
  ),

  nanoCross: (
    <g {...N}>
      <path d="M16 3v8M16 21v8M3 16h8M21 16h8" />
      <rect x="12.5" y="12.5" width="7" height="7" opacity="0.55" />
    </g>
  ),

  nanoChevron: (
    <g {...N}>
      <path d="M9 7l8 9-8 9" />
      <path d="M19 7l6 9-6 9" opacity="0.5" />
    </g>
  ),

  nanoBar: (
    <g {...N}>
      <path d="M7 26V14M16 26V6M25 26v-17" />
    </g>
  ),

  nanoNode: (
    <g {...N}>
      <circle cx="16" cy="16" r="3.4" fill="currentColor" stroke="none" />
      <path d="M16 2v6M16 24v6M2 16h6M24 16h6" opacity="0.5" />
    </g>
  ),

  nanoArc: (
    <g {...N}>
      {/* Quadratic rather than an elliptical arc: with A the apex depends on which centre the
          renderer picks for the given sweep/large-arc pair, and at 9px a dome that sits 3px lower
          than intended reads as a dot floating unattached. Q puts the apex at exactly (16,16). */}
      <path d="M4 24Q16 8 28 24" />
      <circle cx="16" cy="10" r="2.4" fill="currentColor" stroke="none" opacity="0.75" />
    </g>
  ),
};

/** The three page vocabularies, so a scene cannot accidentally borrow from another page. */
export const ORRERY_SET: MicroName[] = [
  'gearPair', 'hourglass', 'constellation', 'barsMini', 'orbit', 'sprig',
  'sextant', 'pendulum', 'ratchet', 'spiral',
];
export const FIELDGUIDE_SET: MicroName[] = [
  'magnifier', 'tagPin', 'cardStack', 'mapPin', 'compassRose', 'calipers',
  'pressedLeaf', 'swatchFan', 'crosshair', 'scaleBalance',
];
export const WORKBENCH_SET: MicroName[] = [
  'keyTiny', 'lockDial', 'fingerprint', 'toggleSw', 'badgeStar', 'shieldCheck',
  'dialGauge', 'slider', 'plugJack', 'sealRibbon',
];
export const NANO_SET: MicroName[] = ['nanoRing', 'nanoCross', 'nanoChevron', 'nanoBar', 'nanoNode', 'nanoArc'];
