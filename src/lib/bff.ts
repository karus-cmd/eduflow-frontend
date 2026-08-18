import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE, COOKIE_AT } from './config';

/**
 * Backend-for-frontend forwarder for Route Handlers. The browser can't call the backend
 * directly (the access token is an httpOnly cookie, server-only), so client components hit
 * our `/api/*` handlers which call THIS to proxy the request with the caller's bearer token.
 * The backend's status + JSON body (including §11 error envelopes) are passed through verbatim,
 * so the client can surface real error messages. Token refresh is handled by proxy.ts.
 */
export async function forward(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<NextResponse> {
  const store = await cookies();
  const at = store.get(COOKIE_AT)?.value;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: init?.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(at ? { Authorization: `Bearer ${at}` } : {}),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'upstream_unreachable', message: 'The backend is unreachable.' } },
      { status: 502 },
    );
  }

  const text = await res.text();
  const data = text ? safeJson(text) : {};
  return NextResponse.json(data, { status: res.status });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { error: { code: 'bad_upstream', message: text.slice(0, 500) } };
  }
}
