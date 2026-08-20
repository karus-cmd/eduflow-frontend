import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Rename / reorder a section (admin). */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/sections/[id]'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/sections/${id}`, { method: 'PATCH', body });
}

/** Soft-delete a section + its lessons (admin, audited). */
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/sections/[id]'>) {
  const { id } = await ctx.params;
  return forward(`/sections/${id}`, { method: 'DELETE' });
}
