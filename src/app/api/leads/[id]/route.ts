import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Update an owned lead (stage, source, interested course, score, lost reason). */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/leads/[id]'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/leads/${id}`, { method: 'PATCH', body });
}
