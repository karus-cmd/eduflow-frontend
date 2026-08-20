import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Schedule a live class on a course (admin). */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/courses/[id]/live-classes'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/courses/${id}/live-classes`, { method: 'POST', body });
}
