import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Report watched/last-position seconds (throttled ~15s by the player). Backend marks ≥90% complete. */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/lessons/[id]/progress'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/me/lessons/${id}/progress`, { method: 'POST', body });
}
