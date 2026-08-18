/** Server-side config. API_BASE_URL is never exposed to the browser (no NEXT_PUBLIC_). */
export const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';

/** httpOnly auth cookies. */
export const COOKIE_AT = 'ef_at'; // access token (15 min)
export const COOKIE_RT = 'ef_rt'; // refresh token (30 days)

export const ACCESS_MAX_AGE = 15 * 60; // seconds — matches the backend access TTL
export const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

export type Role = 'admin' | 'counselor' | 'student' | 'finance' | 'team_lead';

/** Where each role lands after login / from the root. */
export function roleHome(role: string): string {
  if (role === 'admin' || role === 'finance') return '/admin';
  if (role === 'counselor' || role === 'team_lead') return '/counselor';
  return '/student';
}
