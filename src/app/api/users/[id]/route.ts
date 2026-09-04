import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Update a user — profile/status, or promote an existing account to counselor/admin (admin
 *  only, audited). The only path for "this person already signed in with Google, now make them
 *  a manager", since POST /users only creates brand-new accounts. */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/users/${id}`, { method: 'PATCH', body });
}
