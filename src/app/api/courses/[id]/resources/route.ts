import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Add a course-level resource (admin). */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/courses/[id]/resources'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/courses/${id}/resources`, { method: 'POST', body });
}
