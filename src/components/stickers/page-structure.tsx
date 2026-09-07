/**
 * PAGE STRUCTURE — the frame the instruments hang on.
 *
 * The miniature marks were the right idea and still read as confetti, because sixteen objects of
 * one size at one opacity scattered down two gutters is a scatter, not a composition. What the
 * sign-in scene has and this did not is STRUCTURE: things that are clearly part of one apparatus.
 *
 * So this draws the apparatus. Very large, very faint geometry — orbital rings, board rules,
 * instrument rails — sized in the hundreds of pixels and held at a tenth of the marks' presence.
 * You are not meant to look at it. You are meant to feel that the small things are ON something.
 *
 * It deliberately does NOT move. The frame holds still and the instruments drift within it; a
 * backdrop where everything moves reads as a screensaver. It is also the cheap way round: a
 * 1100px rotating layer costs ~23MB of GPU texture at this display's 2.19x ratio, and there are
 * three of them.
 *
 * Pure CSS and inline SVG, no client JS — the frame is there in the server HTML.
 */

type Props = { opacity?: number };

const HAIR = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke' as const,
};

function Layer({ children, opacity = 0.11 }: { children: React.ReactNode; opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ minHeight: '100vh', color: 'var(--ink-faint)', opacity }}
    >
      {children}
    </div>
  );
}

/**
 * MY LEARNING — an orrery frame.
 *
 * Two ring systems whose centres sit off the page, so the arcs that cross the content read as
 * pieces of something much bigger than the screen. Nodes sit where a ring passes a gutter, which
 * is where the drifting instruments are, so the two layers look like one mechanism.
 */
export function OrreryStructure({ opacity = 0.15 }: Props) {
  return (
    <Layer opacity={opacity}>
      {/* Upper-right ring system — centre off-canvas past the corner. */}
      <svg
        viewBox="0 0 600 600"
        width="1180"
        height="1180"
        style={{ position: 'absolute', top: '-46%', right: '-30%' }}
        role="presentation"
        focusable="false"
      >
        <g {...HAIR}>
          <circle cx="300" cy="300" r="286" opacity="0.5" />
          <circle cx="300" cy="300" r="232" strokeDasharray="3 9" />
          <circle cx="300" cy="300" r="164" opacity="0.7" />
          <circle cx="300" cy="300" r="96" strokeDasharray="2 7" opacity="0.6" />
          {/* Bodies on their rings. */}
          <circle cx="300" cy="14" r="4.5" fill="currentColor" stroke="none" />
          <circle cx="86" cy="404" r="3.5" fill="currentColor" stroke="none" opacity="0.8" />
          <circle cx="452" cy="180" r="2.8" fill="currentColor" stroke="none" opacity="0.7" />
          {/* One radius drawn in, so the centre is implied rather than guessed. */}
          <path d="M300 300 86 404" opacity="0.35" />
        </g>
      </svg>

      {/* Lower-left ring system, larger and quieter — the second body in the system. */}
      <svg
        viewBox="0 0 600 600"
        width="1420"
        height="1420"
        style={{ position: 'absolute', bottom: '-58%', left: '-36%' }}
        role="presentation"
        focusable="false"
      >
        <g {...HAIR}>
          <circle cx="300" cy="300" r="290" opacity="0.45" />
          <circle cx="300" cy="300" r="208" strokeDasharray="3 10" opacity="0.7" />
          <circle cx="300" cy="300" r="128" opacity="0.5" />
          <circle cx="512" cy="212" r="4" fill="currentColor" stroke="none" opacity="0.8" />
          <circle cx="300" cy="92" r="3" fill="currentColor" stroke="none" opacity="0.6" />
        </g>
      </svg>

      {/* The ecliptic: one long line tying the two systems together across the whole page. */}
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0 }}
        role="presentation"
        focusable="false"
      >
        <path d="M-2 78 102 14" {...HAIR} strokeDasharray="1 3" opacity="0.55" />
      </svg>
    </Layer>
  );
}

/**
 * BROWSE — a specimen board.
 *
 * Ruled columns down both gutters at a herbarium sheet's rhythm, corner registration brackets, and
 * pin threads running in from the edge. The catalogue grid sits on the board; the tags and lenses
 * drifting in the margins look pinned to it rather than floating past it.
 */
export function BoardStructure({ opacity = 0.17 }: Props) {
  const rules = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: 190,
    backgroundImage:
      'repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px 26px)',
    opacity: 0.4,
  };

  return (
    <Layer opacity={opacity}>
      <div style={{ ...rules, left: 0 }} />
      <div style={{ ...rules, right: 0 }} />

      {/* A single ruled datum across the whole sheet, and the baseline under it. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '31%',
          height: 1,
          background: 'currentColor',
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '31%',
          height: 12,
          backgroundImage:
            'repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px 22px)',
          opacity: 0.22,
        }}
      />

      {/* Registration brackets — the corners a real specimen sheet is squared against. */}
      {(
        [
          { pos: { top: 26, left: 26 }, d: 'M0 34V0h34' },
          { pos: { top: 26, right: 26 }, d: 'M34 34V0H0' },
          { pos: { bottom: 26, left: 26 }, d: 'M0 0v34h34' },
          { pos: { bottom: 26, right: 26 }, d: 'M34 0v34H0' },
        ] as const
      ).map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 34 34"
          width="34"
          height="34"
          style={{ position: 'absolute', ...c.pos }}
          role="presentation"
          focusable="false"
        >
          <path d={c.d} {...HAIR} opacity="0.8" />
        </svg>
      ))}

      {/* Pin threads: each runs from an edge to a point, where it is pinned. */}
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0 }}
        role="presentation"
        focusable="false"
      >
        <g {...HAIR} strokeDasharray="1.5 2.5" opacity="0.5">
          <path d="M0 12 13 19" />
          <path d="M100 24 88 33" />
          <path d="M0 58 11 52" />
          <path d="M100 71 87 64" />
          <path d="M0 88 14 81" />
        </g>
      </svg>
    </Layer>
  );
}

/**
 * PROFILE — an instrument rack.
 *
 * Two graduated rails down the margins with the instruments mounted along them, and a datum line
 * across the middle. The most orderly of the three, because this page is about control and a
 * jumbled backdrop would say the opposite. Rails are CSS gradients rather than SVG so the
 * graduations stay perfectly even at any page height.
 */
export function RackStructure({ opacity = 0.14 }: Props) {
  const rail = (side: 'left' | 'right') =>
    ({
      position: 'absolute' as const,
      top: '4%',
      bottom: '4%',
      [side]: 58,
      width: 9,
      // The rail itself, plus a graduation every 22px with a longer one every fifth.
      backgroundImage: [
        `linear-gradient(to bottom, transparent, currentColor 6%, currentColor 94%, transparent)`,
        `repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 22px)`,
        `repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 110px)`,
      ].join(','),
      backgroundSize: '1px 100%, 5px 100%, 9px 100%',
      backgroundPosition: side === 'left' ? '0 0, 0 0, 0 0' : '8px 0, 4px 0, 0 0',
      backgroundRepeat: 'no-repeat, repeat-y, repeat-y',
      opacity: 0.85,
    }) as React.CSSProperties;

  return (
    <Layer opacity={opacity}>
      <div style={rail('left')} />
      <div style={rail('right')} />

      {/* Datum line and its label ticks — the reference every reading is taken against. */}
      <div
        style={{
          position: 'absolute',
          left: 58,
          right: 58,
          top: '46%',
          height: 1,
          background: 'currentColor',
          opacity: 0.32,
        }}
      />

      {/* Mounting points where the rails carry something. */}
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0 }}
        role="presentation"
        focusable="false"
      >
        <g {...HAIR} opacity="0.55">
          <path d="M4.2 11h6M95.8 19h-6M4.2 39h5M95.8 46h-7M4.2 67h7M95.8 74h-5M4.2 88h6" />
        </g>
      </svg>
    </Layer>
  );
}
