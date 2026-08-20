import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Update a lesson (admin). */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/lessons/[id]'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/lessons/${id}`, { method: 'PATCH', body });
}

/** Soft-delete a lesson (admin, audited). */
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/lessons/[id]'>) {
  const { id } = await ctx.params;
  return forward(`/lessons/${id}`, { method: 'DELETE' });
}
