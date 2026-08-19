import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Per-lesson completion + last position for an enrolled course (restores player state on load). */
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/me/courses/[id]/progress'>) {
  const { id } = await ctx.params;
  return forward(`/me/courses/${id}/progress`);
}
