/**
 * Shapes for the scroll morphs.
 *
 * A path morph is only sane when the two `d` strings share an identical command skeleton — same
 * commands, same order, same count — so the numbers can be interpolated pairwise. Hand-writing two
 * icons that happen to match is brittle, so nothing here is hand-written: every shape comes out of
 * `blob()`, which always emits exactly `M + 4×C + Z`. Structure therefore matches BY CONSTRUCTION,
 * and a morph pair cannot drift out of sync when someone edits one half of it.
 *
 * The trick that makes one generator enough: the control-point tension `k` is what separates a
 * circle (k≈0.5523r, the classic circle-from-cubics constant) from a diamond (k=0, controls collapse
 * onto the anchors and the curves flatten into straight lines). Everything between is a squircle.
 * So a needle can become a bullseye without either being a special case.
 */

export type Anchor = {
  x: number;
  y: number;
  /** control point leading INTO this anchor */
  ix: number;
  iy: number;
  /** control point leading OUT of this anchor */
  ox: number;
  oy: number;
};

/** Four anchors → one closed path of four cubic segments. Always the same skeleton. */
export function blob(a: Anchor[]): string {
  const [p0, p1, p2, p3] = a;
  const n = (v: number) => Math.round(v * 100) / 100;
  return (
    `M ${n(p0.x)} ${n(p0.y)} ` +
    `C ${n(p0.ox)} ${n(p0.oy)} ${n(p1.ix)} ${n(p1.iy)} ${n(p1.x)} ${n(p1.y)} ` +
    `C ${n(p1.ox)} ${n(p1.oy)} ${n(p2.ix)} ${n(p2.iy)} ${n(p2.x)} ${n(p2.y)} ` +
    `C ${n(p2.ox)} ${n(p2.oy)} ${n(p3.ix)} ${n(p3.iy)} ${n(p3.x)} ${n(p3.y)} ` +
    `C ${n(p3.ox)} ${n(p3.oy)} ${n(p0.ix)} ${n(p0.iy)} ${n(p0.x)} ${n(p0.y)} Z`
  );
}

/**
 * A radial shape on N/E/S/W anchors. `k` is the tension as a fraction of the radius:
 * 0.5523 draws a true circle, 0 collapses to a diamond, ~0.85 bulges into a squircle.
 */
export function radial(cx: number, cy: number, rx: number, ry: number, k = 0.5523): Anchor[] {
  const hx = rx * k;
  const hy = ry * k;
  return [
    { x: cx, y: cy - ry, ox: cx + hx, oy: cy - ry, ix: cx - hx, iy: cy - ry },
    { x: cx + rx, y: cy, ox: cx + rx, oy: cy + hy, ix: cx + rx, iy: cy - hy },
    { x: cx, y: cy + ry, ox: cx - hx, oy: cy + ry, ix: cx + hx, iy: cy + ry },
    { x: cx - rx, y: cy, ox: cx - rx, oy: cy - hy, ix: cx - rx, iy: cy + hy },
  ];
}

/** A crest: flat-ish shoulders, sides falling to a point. Same four anchors, different tensions. */
export function crest(cx: number, cy: number, rx: number, ry: number): Anchor[] {
  return [
    { x: cx, y: cy - ry, ox: cx + rx * 0.85, oy: cy - ry, ix: cx - rx * 0.85, iy: cy - ry },
    { x: cx + rx, y: cy - ry * 0.25, ox: cx + rx, oy: cy + ry * 0.35, ix: cx + rx, iy: cy - ry * 0.75 },
    { x: cx, y: cy + ry, ox: cx - rx * 0.45, oy: cy + ry * 0.72, ix: cx + rx * 0.45, iy: cy + ry * 0.72 },
    { x: cx - rx, y: cy - ry * 0.25, ox: cx - rx, oy: cy - ry * 0.75, ix: cx - rx, iy: cy + ry * 0.35 },
  ];
}

export type MorphPair = { from: string; to: string };
export type MorphMark = { outer: MorphPair; inner: MorphPair };

/**
 * MY LEARNING — a sprout becomes a tree.
 * The page is about accumulation, so scrolling it grows what you have been building. The stem
 * thickens into a trunk and the single leaf opens into a canopy.
 */
export const SPROUT_TO_TREE: MorphMark = {
  outer: {
    from: blob(radial(16, 23, 1.1, 5.5, 0.35)),   // thin stem
    to: blob(radial(16, 24, 1.9, 7.5, 0.3)),      // thicker trunk
  },
  inner: {
    from: blob(radial(12.4, 15.2, 4.2, 2.9, 0.85)), // one leaf, off to the side
    to: blob(radial(16, 11.5, 8.4, 6.6, 0.62)),     // a full canopy, centred
  },
};

/**
 * BROWSE — a compass becomes a target.
 * The page is searching, then choosing. The ring holds steady while the needle, a sharp diamond,
 * rounds itself into a bullseye: orienting resolves into locking on.
 */
export const COMPASS_TO_TARGET: MorphMark = {
  outer: {
    // The ring tightens as the needle resolves — the whole mark zeroes in rather than the
    // centre changing under a static frame.
    from: blob(radial(16, 16, 11.6, 11.6)),
    to: blob(radial(16, 16, 9.9, 9.9)),
  },
  inner: {
    from: blob(radial(16, 16, 3.1, 7.6, 0)),      // needle: k=0 → straight edges
    to: blob(radial(16, 16, 5.4, 5.4)),           // bullseye: a true circle
  },
};

/**
 * PROFILE — a keycap becomes a shield.
 * A settings page is identity turning into protection. The squircle keeps its shoulders and draws
 * its base down to a point; it closes rather than travels.
 */
export const KEYCAP_TO_SHIELD: MorphMark = {
  outer: {
    from: blob(radial(16, 16, 11, 9, 0.86)),
    to: blob(crest(16, 16, 10.4, 11.6)),
  },
  inner: {
    from: blob(radial(16, 16, 6.4, 5, 0.86)),
    to: blob(crest(16, 15.4, 5.6, 6.4)),
  },
};
