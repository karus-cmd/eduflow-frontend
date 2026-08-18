import { cn } from '@/lib/utils';
import { formatPaise } from '@/lib/money';

/**
 * Price display. Shows ₹price, an MRP strikethrough + "X% off" when the MRP is higher, and
 * "Free" when the price is zero. Money in = paise-as-string (formatted via formatPaise only).
 */
export function Price({
  pricePaise,
  mrpPaise,
  size = 'md',
  className,
}: {
  pricePaise: string | null | undefined;
  mrpPaise?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const price = Number(pricePaise ?? 0);
  const mrp = mrpPaise == null ? 0 : Number(mrpPaise);
  const hasDiscount = mrp > price && price >= 0;
  const off = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const priceClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-semibold tabular-nums', priceClass)}>
        {price === 0 ? 'Free' : formatPaise(pricePaise)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through tabular-nums">{formatPaise(mrpPaise)}</span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">{off}% off</span>
        </>
      )}
    </div>
  );
}
