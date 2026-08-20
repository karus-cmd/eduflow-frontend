import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Reorder a section's lessons (admin) — body { orderedIds: string[] }. */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/sections/[id]/reorder'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/sections/${id}/reorder`, { method: 'POST', body });
}
