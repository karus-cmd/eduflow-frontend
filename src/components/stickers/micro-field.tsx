import { MICRO_ART, type MicroName } from './micro-art';

/**
 * The miniature-instrument backdrop.
 *
 * Deliberately NOT a client component. The three student surfaces have no scroll range, so the
 * drift is pure CSS on its own timers (see the MICRO FIELD block in globals.css) — which means the
 * layer is fully alive from the server-rendered HTML, before and regardless of hydration. No
 * listener, no rAF, no effect.
 *
 * Phases are spread deterministically from the index rather than randomly: identical output on
 * server and client, and no two marks in step. The negative start offsets matter — without them
 * every mark begins its cycle at page load and the whole field pulses in unison on first paint,
 * which is the single most AI-looking thing a backdrop can do.
 */

export type MicroMotion = 'orbit' | 'bob' | 'tick';
export type MicroTone = 'signal' | 'mint' | 'ink' | 'warning';

export type MicroMark = {
  name: MicroName;
  /** % or px, relative to the field. */
  top: string;
  left?: string;
  right?: string;
  /** On-screen px. 12–20 nano, 20–28 micro, 28–40 small. */
  size: number;
  tone?: MicroTone;
  /** Multiplies the field intensity — pushes one mark forward or lets it sink back. */
  depth?: number;
  /** px of travel. Overrides the size-derived default. */
  amp?: number;
  /** deg of roll. Only orbit and tick use it. */
  rot?: number;
};

const TONE: Record<MicroTone, string> = {
  signal: 'var(--signal)',
  mint: 'var(--mint)',
  warning: 'var(--warning)',
  ink: 'var(--ink-faint)',
};

// Per-character base period and spread. Orrery is the slowest — a mechanism, not a flutter.
const TIMING: Record<MicroMotion, { base: number; spread: number }> = {
  orbit: { base: 26, spread: 9 },
  bob: { base: 11, spread: 5 },
  tick: { base: 15, spread: 7 },
};

export function MicroField({
  marks,
  motion,
  intensity = 0.5,
  className,
}: {
  marks: MicroMark[];
  motion: MicroMotion;
  intensity?: number;
  className?: string;
}) {
  const { base, spread } = TIMING[motion];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ''}`}
      // inset-0 alone sizes the field to the shell wrapper, which stops at the end of the
      // content — so on a short page the empty ground BELOW the last card, the very area that
      // looked bare, fell outside the layer entirely. min-height only wins when the page is
      // shorter than the viewport; on a long catalogue the measured height still governs.
      style={{ minHeight: '100vh' }}
    >
      {marks.map((m, i) => {
        // Coprime strides against the spread so the sequence does not repeat across a field of
        // this size; every mark ends up with its own period AND its own point in that period.
        const dur = base + ((i * 7) % spread) + ((i % 3) * 0.6);
        const delay = -(((i * 5) % base) + (i % 4) * 0.9);
        return (
          <span
            key={`${m.name}-${i}`}
            className={`mf-item mf-${motion}`}
            style={
              {
                top: m.top,
                left: m.left,
                right: m.right,
                width: m.size,
                height: m.size,
                color: TONE[m.tone ?? 'signal'],
                opacity: intensity * (m.depth ?? 1),
                '--mf-dur': `${dur}s`,
                '--mf-delay': `${delay}s`,
                '--mf-amp': `${m.amp ?? Math.max(3, Math.round(m.size * 0.16))}px`,
                '--mf-rot': `${m.rot ?? 2}deg`,
              } as React.CSSProperties
            }
          >
            <svg viewBox="0 0 32 32" width="100%" height="100%" role="presentation" focusable="false">
              {MICRO_ART[m.name]}
            </svg>
          </span>
        );
      })}
    </div>
  );
}

/**
 * One mark turning into another.
 *
 * `on` is real page state, never a timer — the hourglass becomes a sprig because the student has
 * actually made progress, the magnifier becomes a tag because a search is actually running. A
 * decorative loop that swaps on its own would be motion for its own sake, and would say nothing.
 */
export function MicroSwap({
  from,
  to,
  on,
  size = 26,
  tone = 'signal',
  className,
  style,
}: {
  from: MicroName;
  to: MicroName;
  on: boolean;
  size?: number;
  tone?: MicroTone;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`mf-swap ${className ?? ''}`}
      style={{ width: size, height: size, color: TONE[tone], ...style }}
    >
      <svg
        viewBox="0 0 32 32"
        width="100%"
        height="100%"
        role="presentation"
        focusable="false"
        style={{ opacity: on ? 0 : 1, transform: on ? 'rotate(-32deg) scale(0.72)' : 'none' }}
      >
        {MICRO_ART[from]}
      </svg>
      <svg
        viewBox="0 0 32 32"
        width="100%"
        height="100%"
        role="presentation"
        focusable="false"
        style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'rotate(32deg) scale(0.72)' }}
      >
        {MICRO_ART[to]}
      </svg>
    </span>
  );
}
