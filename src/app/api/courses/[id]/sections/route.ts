import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Add a section to a course (admin). */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/courses/[id]/sections'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/courses/${id}/sections`, { method: 'POST', body });
}
