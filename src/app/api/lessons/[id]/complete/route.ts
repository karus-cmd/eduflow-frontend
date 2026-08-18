import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Explicitly mark a lesson complete → the enrollment's progress_pct rolls up (access is kept). */
export async function POST(_req: NextRequest, ctx: RouteContext<'/api/lessons/[id]/complete'>) {
  const { id } = await ctx.params;
  return forward(`/me/lessons/${id}/complete`, { method: 'POST' });
}
