import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Rename a college / change its city (admin, audited). */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/colleges/[id]'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/colleges/${id}`, { method: 'PATCH', body });
}
