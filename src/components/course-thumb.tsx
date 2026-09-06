import { cn } from '@/lib/utils';

/**
 * A course thumbnail, with generated art when there is no image.
 *
 * The old fallback was a graduation cap and a big letter on a flat gradient — the same tile for
 * every course, and the single palest thing in the product, repeated across the catalogue, the
 * course page, the player and checkout.
 *
 * This draws the SUBJECT instead. A DSA course gets a node lattice with edges; a machine-learning
 * course gets a scatter field with a line fitted through it; anything else gets a neutral
 * measure. So a card looks like the thing it is teaching rather than like a placeholder.
 *
 * Everything is derived from a hash of the course title, so a given course always renders the
 * same art — no Math.random, which would differ between the server and client render and blow up
 * hydration. Pure SVG in `currentColor`/tokens, so it costs nothing and follows the theme.
 */

/** FNV-1a — small, stable, and identical on server and client. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic 0..1 sequence from the seed — the same course always lays out the same way. */
function rng(seed: number) {
  let x = seed || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 0xffffffff;
  };
}

type Kind = 'graph' | 'scatter' | 'measure';

function kindFor(title: string): Kind {
  const t = title.toLowerCase();
  if (/(dsa|algorithm|data structure|pattern|coding|interview)/.test(t)) return 'graph';
  if (/(machine learning|\bml\b|gradient|neural|deep learning|data science|ai\b)/.test(t)) return 'scatter';
  return 'measure';
}

function Art({ title }: { title: string }) {
  const seed = hash(title);
  const r = rng(seed);
  const kind = kindFor(title);

  if (kind === 'graph') {
    // A small connected lattice — nodes on three tiers, each linked to the tier below.
    const tiers = [2, 3, 3];
    const nodes: { x: number; y: number }[] = [];
    tiers.forEach((n, ti) => {
      for (let i = 0; i < n; i++) {
        nodes.push({
          x: (160 / (n + 1)) * (i + 1) + (r() - 0.5) * 12,
          y: 24 + ti * 22 + (r() - 0.5) * 6,
        });
      }
    });
    const edges: [number, number][] = [];
    let from = 0;
    tiers.slice(0, -1).forEach((n, ti) => {
      const nextStart = from + n;
      for (let i = 0; i < n; i++) {
        edges.push([from + i, nextStart + (i % tiers[ti + 1])]);
        if (r() > 0.45) edges.push([from + i, nextStart + ((i + 1) % tiers[ti + 1])]);
      }
      from = nextStart;
    });
    return (
      <g>
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="currentColor" strokeWidth="0.9" opacity="0.32" />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i === 0 ? 4 : 3} fill="currentColor" opacity={i === 0 ? 0.75 : 0.42} />
        ))}
      </g>
    );
  }

  if (kind === 'scatter') {
    // Points with a line fitted through them — the picture of a model learning.
    const pts = Array.from({ length: 16 }, (_, i) => {
      const x = 14 + (i / 15) * 132;
      const trend = 68 - (i / 15) * 42;
      return { x, y: trend + (r() - 0.5) * 17 };
    });
    return (
      <g>
        <path d="M14 68 L146 26" stroke="currentColor" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={Math.max(10, Math.min(80, p.y))} r="2.4" fill="currentColor" opacity="0.4" />
        ))}
      </g>
    );
  }

  // Neutral: a stepped measure, like a ruled gauge.
  const bars = Array.from({ length: 18 }, (_, i) => ({
    x: 12 + i * 7.6,
    h: 10 + r() * 34,
  }));
  return (
    <g>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={72 - b.h} width="3.2" height={b.h} rx="1.6" fill="currentColor" opacity={i % 3 === 0 ? 0.4 : 0.22} />
      ))}
    </g>
  );
}

export function CourseThumb({
  title,
  thumbnailUrl,
  className,
}: {
  title: string;
  thumbnailUrl: string | null;
  className?: string;
}) {
  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbs; no next/image domain config needed
      <img
        src={thumbnailUrl}
        alt={title}
        className={cn('h-full w-full object-cover', className)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br from-primary/12 via-transparent to-muted', className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-primary">
        <defs>
          <pattern id="ct-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.13" />
          </pattern>
        </defs>
        <rect width="160" height="90" fill="url(#ct-grid)" />
        <Art title={title} />
      </svg>
    </div>
  );
}
