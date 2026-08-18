import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ACCESS_MAX_AGE, API_BASE, COOKIE_AT, COOKIE_RT, REFRESH_MAX_AGE } from './config';

interface CallInit {
  method?: string;
  body?: unknown;
}

function callBackend(path: string, at: string | undefined, init?: CallInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(at ? { Authorization: `Bearer ${at}` } : {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
}

/**
 * Refresh the access token from the refresh cookie and persist the rotated pair on the outgoing
 * response. Mirrors proxy.ts, but for `/api/*` calls where a page-level redirect isn't possible —
 * so a long-lived player session survives the 15-min access-token expiry without a navigation.
 */
async function refreshAccessToken(store: Awaited<ReturnType<typeof cookies>>): Promise<string | null> {
  const rt = store.get(COOKIE_RT)?.value;
  if (!rt) return null;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const tokens = (await res.json().catch(() => null)) as { accessToken: string; refreshToken: string } | null;
  if (!tokens?.accessToken) return null;
  const secure = process.env.NODE_ENV === 'production';
  const common = { httpOnly: true as const, sameSite: 'lax' as const, secure, path: '/' };
  store.set(COOKIE_AT, tokens.accessToken, { ...common, maxAge: ACCESS_MAX_AGE });
  store.set(COOKIE_RT, tokens.refreshToken, { ...common, maxAge: REFRESH_MAX_AGE });
  return tokens.accessToken;
}

/**
 * Low-level backend call from a Route Handler using the caller's httpOnly bearer token. Returns
 * the parsed body + status so handlers can orchestrate multiple calls (e.g. create-order →
 * checkout) before responding. On a 401 it refreshes the token once and retries. Never throws on
 * non-2xx — inspect `ok`/`status`.
 */
export async function backendCall<T = unknown>(
  path: string,
  init?: CallInit,
): Promise<{ ok: boolean; status: number; data: T }> {
  const store = await cookies();
  const at = store.get(COOKIE_AT)?.value;
  let res = await callBackend(path, at, init);

  if (res.status === 401) {
    const fresh = await refreshAccessToken(store);
    if (fresh) res = await callBackend(path, fresh, init);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : {};
  return { ok: res.ok, status: res.status, data: data as T };
}

/**
 * Backend-for-frontend forwarder. The browser can't call the backend directly (the access token
 * is an httpOnly, server-only cookie), so client components hit our `/api/*` handlers which call
 * THIS to proxy the request. The backend's status + JSON body (incl. §11 error envelopes) pass
 * through verbatim so the client can surface real error messages.
 */
export async function forward(path: string, init?: CallInit): Promise<NextResponse> {
  try {
    const { data, status } = await backendCall(path, init);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json(
      { error: { code: 'upstream_unreachable', message: 'The backend is unreachable.' } },
      { status: 502 },
    );
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { error: { code: 'bad_upstream', message: text.slice(0, 500) } };
  }
}
