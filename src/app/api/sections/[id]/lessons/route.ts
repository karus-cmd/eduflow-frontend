import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Add a lesson to a section (admin). */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/sections/[id]/lessons'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/sections/${id}/lessons`, { method: 'POST', body });
}
