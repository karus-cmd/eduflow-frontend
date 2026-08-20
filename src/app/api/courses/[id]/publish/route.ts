import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Publish a course (admin, audited). */
export async function POST(_req: NextRequest, ctx: RouteContext<'/api/courses/[id]/publish'>) {
  const { id } = await ctx.params;
  return forward(`/courses/${id}/publish`, { method: 'POST' });
}
