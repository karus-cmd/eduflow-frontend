import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Toggle a manager's payout mode (admin) — {mode: manual|auto}; auto needs a verified bank. */
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/counselors/[id]/payout-mode'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/counselors/${id}/payout-mode`, { method: 'PATCH', body });
}
