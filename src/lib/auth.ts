import { redirect } from 'next/navigation';
import type { MeResponse } from './api/types';
import { roleHome } from './config';
import { ApiError, serverApi } from './server-api';

/** The current user (from /auth/me). Redirects to /login if unauthenticated. */
export async function getMe(): Promise<MeResponse> {
  try {
    return await serverApi<MeResponse>('/auth/me');
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }
}

/** Require one of `allowed` roles; otherwise send the user to their own home. */
export async function requireRole(allowed: string[]): Promise<MeResponse> {
  const me = await getMe();
  if (!allowed.includes(me.role)) redirect(roleHome(me.role));
  return me;
}
