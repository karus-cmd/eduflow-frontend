import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { backendCall } from '@/lib/bff';
import type { Order } from '@/lib/api/types';

/** Lightweight order-status probe for the provisioning poller. Ownership is enforced by the backend. */
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/orders/[id]/status'>) {
  const { id } = await ctx.params;
  const { ok, status, data } = await backendCall<Order>(`/orders/${id}`);
  if (!ok) return NextResponse.json(data, { status });
  return NextResponse.json({
    status: data.status,
    courseId: data.items?.[0]?.courseId ?? null,
    paid: data.status === 'paid',
  });
}
