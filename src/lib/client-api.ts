'use client';

/**
 * Browser-side fetch to our own `/api/*` BFF route handlers (never the backend directly).
 * Throws {@link ClientApiError} carrying the backend's §11 error message on any non-2xx, so
 * callers can show a real message. Same-origin, so the httpOnly session cookie rides along.
 */
export class ClientApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message =
      data?.error?.message ?? data?.message ?? `Request failed (${res.status})`;
    throw new ClientApiError(res.status, message, data?.error?.details);
  }
  return data as T;
}

export const clientApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
};
