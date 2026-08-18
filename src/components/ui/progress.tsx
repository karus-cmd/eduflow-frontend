import { cn } from '@/lib/utils';

/**
 * A slim progress bar. `value` is a 0–100 percent (already clamped by formatPct upstream).
 * Server-safe (no client hooks) so it renders inside Server Component cards.
 */
export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full rounded-full bg-primary transition-[width] duration-500', barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
