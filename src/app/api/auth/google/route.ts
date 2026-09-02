import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ACCESS_MAX_AGE, API_BASE, COOKIE_AT, COOKIE_RT, REFRESH_MAX_AGE } from '@/lib/config';

/**
 * Google sign-in proxy: forwards {idToken} to the backend, and on success stores the tokens in
 * httpOnly cookies (never exposed to JS) — same response shape and cookie logic as /api/auth/login.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const store = await cookies();
  const secure = process.env.NODE_ENV === 'production';
  const common = { httpOnly: true as const, sameSite: 'lax' as const, secure, path: '/' };
  store.set(COOKIE_AT, data.tokens.accessToken, { ...common, maxAge: ACCESS_MAX_AGE });
  store.set(COOKIE_RT, data.tokens.refreshToken, { ...common, maxAge: REFRESH_MAX_AGE });
  return NextResponse.json({ role: data.user.role, fullName: data.user.fullName });
}
