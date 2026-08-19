import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Mark an owned follow-up complete. */
export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/follow-ups/[id]/complete'>) {
  const { id } = await ctx.params;
  return forward(`/follow-ups/${id}/complete`, { method: 'PATCH' });
}
