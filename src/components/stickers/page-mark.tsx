import { STICKER_ART, type StickerName } from './sticker-art';

/**
 * A single line-art mark placed on a page.
 *
 * Deliberately NOT a template. The point of this component is that each surface
 * uses it in a different ROLE, so the site doesn't read as one stamped layout:
 *
 *   variant="inline"    a small mark set beside a heading — for pages whose title
 *                       benefits from a glyph (Browse, Checkout).
 *   variant="watermark" large, faint, behind the content in a corner — for pages
 *                       that are mostly one dense block and would look cluttered
 *                       with an icon in the title (Profile, Admin).
 *   variant="badge"     a filled tile, used where the mark is carrying meaning
 *                       rather than decoration (an empty state, a trust panel).
 *
 * Static by design: these sit on operated surfaces (tables, forms, dashboards),
 * where drifting decoration would be noise. The ambient drifting layer belongs
 * to the marketing and auth pages only — see components/stickers/sticker.tsx.
 */

const TONE: Record<string, string> = {
  signal: 'var(--signal)',
  mint: 'var(--mint)',
  warning: 'var(--warning)',
  ink: 'var(--ink-faint)',
};

export function PageMark({
  name,
  variant = 'inline',
  tone = 'signal',
  size,
  className,
}: {
  name: StickerName;
  variant?: 'inline' | 'watermark' | 'badge';
  tone?: keyof typeof TONE;
  size?: number;
  className?: string;
}) {
  const color = TONE[tone] ?? TONE.signal;

  if (variant === 'watermark') {
    // Behind the content, low enough that it reads as paper texture rather than
    // an element. `aria-hidden` + pointer-events:none so it never intercepts.
    const px = size ?? 132;
    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute select-none${className ? ` ${className}` : ''}`}
        style={{ color, opacity: 0.055, width: px, height: px }}
      >
        <svg viewBox="0 0 32 32" width="100%" height="100%" role="presentation" focusable="false">
          {STICKER_ART[name]}
        </svg>
      </span>
    );
  }

  if (variant === 'badge') {
    const px = size ?? 22;
    return (
      <span
        aria-hidden="true"
        className={`grid place-items-center rounded-xl border${className ? ` ${className}` : ''}`}
        style={{
          color,
          width: px * 2,
          height: px * 2,
          background: `color-mix(in oklch, ${color} 12%, transparent)`,
          borderColor: `color-mix(in oklch, ${color} 26%, transparent)`,
        }}
      >
        <svg viewBox="0 0 32 32" width={px} height={px} role="presentation" focusable="false">
          {STICKER_ART[name]}
        </svg>
      </span>
    );
  }

  const px = size ?? 20;
  return (
    <span
      aria-hidden="true"
      className={`inline-block align-middle${className ? ` ${className}` : ''}`}
      style={{ color, opacity: 0.85 }}
    >
      <svg viewBox="0 0 32 32" width={px} height={px} role="presentation" focusable="false">
        {STICKER_ART[name]}
      </svg>
    </span>
  );
}
