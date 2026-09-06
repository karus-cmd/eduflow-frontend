import type { ReactElement } from 'react';

/**
 * SIGNAL sticker art.
 *
 * Every mark here is drawn from the vocabulary of the thing it sits next to — a
 * binary tree beside the DSA track, a loss curve beside ML — so the ambient layer
 * carries meaning instead of decoration. Deliberately line-art, single weight,
 * `currentColor` only: that keeps each one ~1KB, transparent, and able to take
 * its colour from whatever token the surface sets, in either theme.
 *
 * Parts are separated (and given `data-part`) so a sticker can animate one
 * element rather than the whole glyph — a node pulsing, a needle sweeping.
 */

const S = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export type StickerName =
  | 'tree'
  | 'pointer'
  | 'stack'
  | 'complexity'
  | 'brackets'
  | 'neuron'
  | 'tensor'
  | 'loss'
  | 'scatter'
  | 'layers'
  | 'stopwatch'
  | 'spark'
  | 'ticket'
  | 'flame';

export const STICKER_ART: Record<StickerName, ReactElement> = {
  // ---- PATTERNS / DSA vocabulary ----

  // A binary tree: root and two children. The root carries data-part so it can
  // pulse as "the node being visited".
  tree: (
    <g {...S}>
      <path d="M16 11.5 8.5 18M16 11.5 23.5 18" />
      <circle cx="16" cy="9" r="3" data-part="node" />
      <circle cx="7" cy="20" r="3" />
      <circle cx="25" cy="20" r="3" />
    </g>
  ),

  // Two list cells and the pointer between them — the "next" arrow is separable
  // so it can nudge on scroll.
  pointer: (
    <g {...S}>
      <rect x="3" y="11" width="9" height="10" rx="2" />
      <rect x="20" y="11" width="9" height="10" rx="2" />
      <path d="M13 16h5" data-part="link" />
      <path d="m16.5 13.8 2.6 2.2-2.6 2.2" data-part="link" />
    </g>
  ),

  // A call stack, top frame highlighted.
  stack: (
    <g {...S}>
      <rect x="6" y="19" width="20" height="6" rx="1.6" />
      <rect x="6" y="12" width="20" height="6" rx="1.6" />
      <rect x="6" y="5" width="20" height="6" rx="1.6" data-part="node" />
    </g>
  ),

  // A complexity curve rising off a pair of axes — the shape every DSA student
  // learns to recognise before they learn to name it.
  complexity: (
    <g {...S}>
      <path d="M5 26V6M5 26h21" opacity="0.45" />
      <path d="M6 24C12 24 16 20 18.5 14.5 20.4 10.3 22.5 7.5 26 6" data-part="curve" />
    </g>
  ),

  brackets: (
    <g {...S}>
      <path d="M12 6c-3 0-4 1-4 3.5S9 14 6 14c3 0 2 2.5 2 4.5S9 26 12 26" />
      <path d="M20 6c3 0 4 1 4 3.5S23 14 26 14c-3 0-2 2.5-2 4.5S23 26 20 26" />
    </g>
  ),

  // ---- GRADIENT / ML vocabulary ----

  // A unit with three inputs and one output — the smallest true picture of a net.
  neuron: (
    <g {...S}>
      <path d="M5 9h6M5 16h6M5 23h6" opacity="0.55" />
      <path d="M11 9c3 1.5 3 5 5 7M11 16h5M11 23c3-1.5 3-5 5-7" />
      <circle cx="19" cy="16" r="4" data-part="node" />
      <path d="M23 16h4" />
    </g>
  ),

  // A matrix with one activated cell.
  tensor: (
    <g {...S}>
      <rect x="5" y="5" width="22" height="22" rx="2.5" />
      <path d="M12.3 5v22M19.6 5v22M5 12.3h22M5 19.6h22" opacity="0.5" />
      <rect x="12.9" y="12.9" width="6.1" height="6.1" fill="currentColor" stroke="none" data-part="node" />
    </g>
  ),

  // Loss descending toward a floor — training, in one line.
  loss: (
    <g {...S}>
      <path d="M5 5v21h22" opacity="0.45" />
      <path d="M7 8c3.4 8.5 5.6 12 8 13.4 2.3 1.3 5.6 1.8 10 1.6" data-part="curve" />
      <circle cx="25" cy="23" r="1.7" fill="currentColor" stroke="none" data-part="node" />
    </g>
  ),

  // Points and the line fitted through them.
  scatter: (
    <g {...S}>
      <path d="M5 5v21h22" opacity="0.45" />
      <path d="M7.5 22.5 25 9" data-part="curve" />
      <circle cx="10" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="23" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    </g>
  ),

  layers: (
    <g {...S}>
      <path d="M16 4 27 9.5 16 15 5 9.5z" data-part="node" />
      <path d="M5 16.2 16 21.7l11-5.5" />
      <path d="M5 22.5 16 28l11-5.5" opacity="0.6" />
    </g>
  ),

  // ---- shared vocabulary ----

  // The needle is its own part so it can sweep a few degrees on scroll.
  stopwatch: (
    <g {...S}>
      <path d="M13 3h6" />
      <path d="M16 3v3" />
      <circle cx="16" cy="18" r="10" />
      <path d="M16 18v-5" data-part="needle" />
      <path d="M24.5 10.5 26.5 8.5" opacity="0.6" />
    </g>
  ),

  // The wordmark glyph.
  spark: (
    <g {...S} strokeWidth={2}>
      <path d="M16 5v8M16 19v8M5 16h8M19 16h8" data-part="node" />
    </g>
  ),

  ticket: (
    <g {...S}>
      <path d="M5 11.5V9a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v2.5a3 3 0 0 0 0 9V23a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2.5a3 3 0 0 0 0-9Z" />
      <path d="M13 12v8" strokeDasharray="2 3" opacity="0.7" data-part="perf" />
    </g>
  ),

  flame: (
    <g {...S}>
      <path d="M16 4c4 5.4 6.6 8 6.6 12a6.6 6.6 0 0 1-13.2 0c0-2 .9-3.5 2-4.7C13 13.4 14.4 11.4 16 4Z" />
      <path d="M16 26a3.2 3.2 0 0 1-3.2-3.2c0-1.6 1.2-2.6 3.2-5.3 2 2.7 3.2 3.7 3.2 5.3A3.2 3.2 0 0 1 16 26Z" data-part="node" opacity="0.75" />
    </g>
  ),
};
