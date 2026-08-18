import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE, COOKIE_AT } from './config';

interface CallInit {
  method?: string;
  body?: unknown;
}

/**
 * Low-level backend call from a Route Handler using the caller's httpOnly bearer token. Returns
 * the parsed body + status so handlers can orchestrate multiple calls (e.g. create-order →
 * checkout) before responding. Never throws on non-2xx — inspect `ok`/`status`.
 */
export async function backendCall<T = unknown>(
  path: string,
  init?: CallInit,
): Promise<{ ok: boolean; status: number; data: T }> {
  const store = await cookies();
  const at = store.get(COOKIE_AT)?.value;
  const res = await fetch(`${API_BASE}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(at ? { Authorization: `Bearer ${at}` } : {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  const data = text ? safeJson(text) : {};
  return { ok: res.ok, status: res.status, data: data as T };
}

/**
 * Backend-for-frontend forwarder. The browser can't call the backend directly (the access token
 * is an httpOnly, server-only cookie), so client components hit our `/api/*` handlers which call
 * THIS to proxy the request. The backend's status + JSON body (incl. §11 error envelopes) pass
 * through verbatim so the client can surface real error messages. Token refresh is in proxy.ts.
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
