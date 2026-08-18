/**
 * Money is "paise-as-string" per the API contract (integer paise, never a float). Format to ₹
 * through THIS helper only. Paise ≤ ~1e12 fits exactly in a JS number, so Number() is safe here.
 */
export function formatPaise(paise: string | number | null | undefined): string {
  const n = paise == null ? 0 : typeof paise === 'string' ? Number(paise) : paise;
  if (Number.isNaN(n)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n / 100);
}

/** A progress percentage (Decimal serialized as a string) → a clamped whole-number percent. */
export function formatPct(pct: string | number | null | undefined): number {
  const n = pct == null ? 0 : typeof pct === 'string' ? Number(pct) : pct;
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
