import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_MAX_AGE, API_BASE, COOKIE_AT, COOKIE_RT, REFRESH_MAX_AGE } from '@/lib/config';

/**
 * Route protection + silent access-token refresh. For a protected route:
 *  - access cookie present  → allow;
 *  - access missing, refresh present → refresh against the backend, set new cookies, and redirect
 *    to the SAME url so the page render sees the fresh access cookie;
 *  - neither → redirect to /login.
 */
export async function proxy(req: NextRequest) {
  const at = req.cookies.get(COOKIE_AT)?.value;
  const rt = req.cookies.get(COOKIE_RT)?.value;
  if (at) return NextResponse.next();

  const loginUrl = new URL('/login', req.url);
  if (!rt) return NextResponse.redirect(loginUrl);

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.redirect(loginUrl);
    const tokens = (await res.json()) as { accessToken: string; refreshToken: string };
    const out = NextResponse.redirect(new URL(req.nextUrl.pathname + req.nextUrl.search, req.url));
    const secure = process.env.NODE_ENV === 'production';
    const common = { httpOnly: true as const, sameSite: 'lax' as const, secure, path: '/' };
    out.cookies.set(COOKIE_AT, tokens.accessToken, { ...common, maxAge: ACCESS_MAX_AGE });
    out.cookies.set(COOKIE_RT, tokens.refreshToken, { ...common, maxAge: REFRESH_MAX_AGE });
    return out;
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = { matcher: ['/admin/:path*', '/counselor/:path*', '/student/:path*'] };
