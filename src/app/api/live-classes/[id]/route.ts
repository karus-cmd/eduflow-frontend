import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Update / cancel a live class (admin). */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/live-classes/[id]'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/live-classes/${id}`, { method: 'PATCH', body });
}
