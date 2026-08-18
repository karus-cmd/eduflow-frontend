import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE, COOKIE_AT, COOKIE_RT } from '@/lib/config';

/** Revoke the refresh session on the backend (best-effort) and clear the auth cookies. */
export async function POST() {
  const store = await cookies();
  const rt = store.get(COOKIE_RT)?.value;
  if (rt) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
      cache: 'no-store',
    }).catch(() => undefined);
  }
  store.delete(COOKIE_AT);
  store.delete(COOKIE_RT);
  return NextResponse.json({ ok: true });
}
