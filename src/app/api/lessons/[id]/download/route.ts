import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Signed URL to a lesson's downloadable MP4 (downloads are allowed by product decision, no DRM). */
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/lessons/[id]/download'>) {
  const { id } = await ctx.params;
  return forward(`/lessons/${id}/download`);
}
