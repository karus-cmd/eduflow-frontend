/**
 * Money is "paise-as-string" per the API contract (integer paise, never a float). Format to ₹
 * through THIS helper only. Paise ≤ ~1e12 fits exactly in a JS number, so Number() is safe here.
 */
export function formatPaise(paise: string | number | null | undefined): string {
  const n = paise == null ? 0 : typeof paise === 'string' ? Number(paise) : paise;
  if (Number.isNaN(n)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n / 100);
}

/** Paise → a compact ₹ label for chart axes, e.g. 599900 → "₹6k", 1250000 → "₹12.5k". */
export function formatPaiseCompact(paise: string | number | null | undefined): string {
  const rupees = (paise == null ? 0 : typeof paise === 'string' ? Number(paise) : paise) / 100;
  if (Number.isNaN(rupees)) return '₹0';
  if (Math.abs(rupees) >= 10000000) return `₹${(rupees / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (Math.abs(rupees) >= 100000) return `₹${(rupees / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (Math.abs(rupees) >= 1000) return `₹${(rupees / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `₹${Math.round(rupees)}`;
}

/** A progress percentage (Decimal serialized as a string) → a clamped whole-number percent. */
export function formatPct(pct: string | number | null | undefined): number {
  const n = pct == null ? 0 : typeof pct === 'string' ? Number(pct) : pct;
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
