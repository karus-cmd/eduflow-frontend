import type { ReactNode } from 'react';

type Accent = 'azure' | 'coral' | 'lime' | 'ink';

const TINT: Record<Accent, string> = {
  azure: 'text-primary bg-primary/12',
  coral: 'text-coral bg-coral/12',
  lime: 'text-[oklch(0.5_0.14_128)] bg-lime/25',
  ink: 'text-foreground bg-foreground/8',
};
const STROKE: Record<Accent, string> = {
  azure: 'var(--azure)',
  coral: 'var(--coral)',
  lime: 'oklch(0.5 0.14 128)',
  ink: 'var(--foreground)',
};

/**
 * Dashboard KPI. Dimensional card with an accent icon tile, a large tabular figure, and an
 * optional trend pill and inline sparkline. Backwards compatible: label/value/hint alone still work.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'azure',
  trend,
  spark,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: Accent;
  trend?: { dir: 'up' | 'down'; value: string };
  spark?: number[];
}) {
  return (
    <div className="group/stat relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-[0_1px_2px_rgba(31,28,43,0.04),0_14px_34px_-24px_rgba(31,28,43,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon ? (
          <span className={`grid size-8 place-items-center rounded-xl ${TINT[accent]} [&_svg]:size-4`}>{icon}</span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="font-heading text-[1.7rem] leading-none font-semibold tracking-tight tabular-nums">{value}</div>
        {spark && spark.length > 1 ? <Sparkline data={spark} stroke={STROKE[accent]} /> : null}
      </div>
      {(hint || trend) && (
        <div className="flex items-center gap-2">
          {trend ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                trend.dir === 'up' ? 'bg-lime/25 text-[oklch(0.45_0.14_150)]' : 'bg-destructive/12 text-destructive'
              }`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {trend.dir === 'up' ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
              </svg>
              {trend.value}
            </span>
          ) : null}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  const w = 64;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 3 - ((d - min) / span) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(',');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-none overflow-visible" aria-hidden>
      <polyline points={pts.join(' ')} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={stroke} />
    </svg>
  );
}
