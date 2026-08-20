import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Record a manual payout to a manager (admin; pending → paid on the ledger, idempotent). */
export async function POST(req: NextRequest, ctx: RouteContext<'/api/counselors/[id]/payouts'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/counselors/${id}/payouts`, { method: 'POST', body });
}
