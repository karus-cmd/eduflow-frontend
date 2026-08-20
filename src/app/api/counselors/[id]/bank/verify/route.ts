import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Mark a manager's bank verified (admin; required before AUTO payout mode). */
export async function POST(_req: NextRequest, ctx: RouteContext<'/api/counselors/[id]/bank/verify'>) {
  const { id } = await ctx.params;
  return forward(`/counselors/${id}/bank/verify`, { method: 'POST' });
}
