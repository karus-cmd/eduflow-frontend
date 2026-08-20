import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** Set/update a manager's bank account (admin; creates the RazorpayX contact + fund account). */
export async function PUT(req: NextRequest, ctx: RouteContext<'/api/counselors/[id]/bank'>) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return forward(`/counselors/${id}/bank`, { method: 'PUT', body });
}
