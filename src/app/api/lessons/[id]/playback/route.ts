import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Mint a signed, domain-locked HLS playback URL for a lesson (enrollment-gated by the backend). */
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/lessons/[id]/playback'>) {
  const { id } = await ctx.params;
  return forward(`/lessons/${id}/playback`);
}
