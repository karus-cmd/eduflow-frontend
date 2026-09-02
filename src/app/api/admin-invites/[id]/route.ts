import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Revoke an admin invite (admin only, audited). */
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin-invites/[id]'>) {
  const { id } = await ctx.params;
  return forward(`/admin-invites/${id}`, { method: 'DELETE' });
}
