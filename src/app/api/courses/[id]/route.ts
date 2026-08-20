import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Update course settings (admin). */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/courses/[id]'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/courses/${id}`, { method: 'PATCH', body });
}

/** Soft-delete a course (admin, audited). */
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/courses/[id]'>) {
  const { id } = await ctx.params;
  return forward(`/courses/${id}`, { method: 'DELETE' });
}
