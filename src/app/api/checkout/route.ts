import { NextResponse } from 'next/server';
import { backendCall } from '@/lib/bff';
import type { CheckoutPayload, Order } from '@/lib/api/types';

/**
 * One-shot checkout: create an order for a single course (with an optional manager referral code),
 * then open a Razorpay order for it. Returns the widget payload + course info. Money never provisions
 * here — the `payment.captured` webhook is the source of truth (invariant #3); this only starts checkout.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const courseId: string | undefined = body?.courseId;
  const courseTitle: string = body?.courseTitle ?? 'Course';
  const referralCode: string | undefined = body?.referralCode?.trim() || undefined;

  if (!courseId) {
    return NextResponse.json(
      { error: { code: 'validation', message: 'courseId is required' } },
      { status: 400 },
    );
  }

  // 1) Create the order (student self-serve). Referral code, if any, attributes the sale.
  const created = await backendCall<Order>('/orders', {
    method: 'POST',
    body: { items: [{ courseId }], ...(referralCode ? { referralCode } : {}) },
  });
  if (!created.ok) return NextResponse.json(created.data, { status: created.status });

  // 2) Open a Razorpay order against it.
  const checkout = await backendCall<CheckoutPayload>(`/orders/${created.data.id}/checkout`, {
    method: 'POST',
  });
  if (!checkout.ok) return NextResponse.json(checkout.data, { status: checkout.status });

  return NextResponse.json({ ...checkout.data, courseId, courseTitle });
}
