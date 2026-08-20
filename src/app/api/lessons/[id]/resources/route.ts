import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Add a lesson-level resource (admin). */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/lessons/[id]/resources'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/lessons/${id}/resources`, { method: 'POST', body });
}
