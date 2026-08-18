import { cookies } from 'next/headers';
import { API_BASE, COOKIE_AT } from './config';

/** A non-2xx response from the backend. `status` mirrors the HTTP status; `body` is the raw text. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API ${status}`);
  }
}

/**
 * Server-only fetch to the backend. Reads the httpOnly access-token cookie and sends it as a Bearer
 * token, so tokens never reach the browser. Use from Server Components and route handlers. Token
 * refresh (on expiry) is handled in middleware, so callers here can assume a valid token is present.
 */
export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const store = await cookies();
  const at = store.get(COOKIE_AT)?.value;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(at ? { Authorization: `Bearer ${at}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new ApiError(res.status, await res.text().catch(() => ''));
  return (await res.json()) as T;
}
