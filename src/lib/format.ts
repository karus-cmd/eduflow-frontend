/** Non-money formatting helpers (money lives in money.ts). All duration inputs are seconds. */

/** Seconds → a compact human duration, e.g. 5400 → "1h 30m", 90 → "2m", 0 → "—". */
export function formatDuration(totalSec: number | null | undefined): string {
  const s = Math.max(0, Math.floor(Number(totalSec ?? 0)));
  if (!s) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return `${s}s`;
}

/** Seconds → mm:ss / h:mm:ss for the media clock. */
export function formatClock(totalSec: number | null | undefined): string {
  const s = Math.max(0, Math.floor(Number(totalSec ?? 0)));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** An ISO date → a readable India-locale date, e.g. "19 Aug 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** An ISO date → date + time, e.g. "19 Aug 2026, 6:30 pm". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * A countdown breakdown from now until `iso`. `past` is true once the target has passed.
 * Used by the next-class countdown; the client re-renders it on a timer.
 */
export function countdownParts(iso: string | null | undefined, now: number = Date.now()) {
  const target = iso ? new Date(iso).getTime() : NaN;
  const diff = Number.isNaN(target) ? 0 : target - now;
  const past = diff <= 0;
  const s = Math.max(0, Math.floor(diff / 1000));
  return {
    past,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/** Compact "starts in …" label from a countdown, e.g. "in 2d 3h", "in 12m", "starting now". */
export function countdownLabel(iso: string | null | undefined, now: number = Date.now()): string {
  const c = countdownParts(iso, now);
  if (c.past) return 'starting now';
  if (c.days) return `in ${c.days}d ${c.hours}h`;
  if (c.hours) return `in ${c.hours}h ${c.minutes}m`;
  if (c.minutes) return `in ${c.minutes}m`;
  return `in ${c.seconds}s`;
}
