import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Soft-delete a resource (admin, audited). */
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/resources/[id]'>) {
  const { id } = await ctx.params;
  return forward(`/resources/${id}`, { method: 'DELETE' });
}
