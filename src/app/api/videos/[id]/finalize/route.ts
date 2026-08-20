import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Mark a video asset's HLS package uploaded → status=ready (admin). */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/videos/[id]/finalize'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/videos/${id}/finalize`, { method: 'POST', body });
}
