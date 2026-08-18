import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Resolve a resource attachment's download URL (enrollment/preview-gated by the backend). */
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/resources/[id]/download'>) {
  const { id } = await ctx.params;
  return forward(`/resources/${id}/download`);
}
