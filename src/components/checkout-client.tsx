'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Loader2, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CourseThumb } from '@/components/course-thumb';
import { Price } from '@/components/price';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatPaise } from '@/lib/money';
import type { CheckoutResult } from '@/lib/api/types';

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

interface CheckoutCourse {
  id: string;
  title: string;
  pricePaise: string;
  mrpPaise: string | null;
  thumbnailUrl: string | null;
}
interface CheckoutUser {
  fullName: string;
  email: string | null;
  phone: string | null;
}

export function CheckoutClient({ course, user }: { course: CheckoutCourse; user: CheckoutUser }) {
  const router = useRouter();
  const scriptReady = useRef(false);
  const [referral, setReferral] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function pay() {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (!scriptReady.current || typeof window.Razorpay !== 'function') {
        throw new Error('Payment library is still loading — please try again in a moment.');
      }
      const checkout = await clientApi.post<CheckoutResult>('/api/checkout', {
        courseId: course.id,
        courseTitle: course.title,
        referralCode: referral.trim() || undefined,
      });

      const rzp = new window.Razorpay({
        key: checkout.keyId,
        amount: Number(checkout.amountPaise),
        currency: checkout.currency,
        name: 'EduFlow',
        description: checkout.courseTitle,
        order_id: checkout.gatewayOrderId,
        prefill: {
          name: user.fullName,
          email: user.email ?? undefined,
          contact: user.phone ?? undefined,
        },
        notes: { orderId: checkout.orderId },
        theme: { color: '#0a7f56' },
        handler: () => {
          // Payment succeeded on the client; the webhook provisions access server-side.
          router.push(`/student/orders/${checkout.orderId}/provisioning`);
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setInfo('Checkout closed. Your order is saved — you can pay again any time.');
          },
        },
      });
      rzp.on('payment.failed', (resp: unknown) => {
        const desc =
          (resp as { error?: { description?: string } })?.error?.description ?? 'Payment failed.';
        setBusy(false);
        setError(desc);
      });
      rzp.open();
      // Leave `busy` true — the Razorpay modal is now open over the page.
    } catch (e) {
      setBusy(false);
      setError(e instanceof ClientApiError ? e.message : (e as Error).message);
    }
  }

  return (
    <>
      <Script
        src={RAZORPAY_SRC}
        strategy="afterInteractive"
        onLoad={() => {
          scriptReady.current = true;
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Summary */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-medium">Order summary</h2>
              <div className="flex gap-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <CourseThumb title={course.title} thumbnailUrl={course.thumbnailUrl} />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">{course.title}</p>
                  <Price pricePaise={course.pricePaise} mrpPaise={course.mrpPaise} size="sm" className="mt-1" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="referral" className="flex items-center gap-1.5">
                  <Tag className="size-3.5" /> Referral code <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="referral"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value.toUpperCase())}
                  placeholder="e.g. MGR- AB12"
                  autoCapitalize="characters"
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Have a counsellor&rsquo;s code? Enter it so your enrolment is credited to them.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pay box */}
        <aside className="order-1 lg:order-2">
          <Card className="lg:sticky lg:top-6">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-semibold tabular-nums">{formatPaise(course.pricePaise)}</span>
              </div>

              <Button onClick={pay} disabled={busy} size="lg" className="w-full">
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Opening checkout…
                  </>
                ) : (
                  `Pay ${formatPaise(course.pricePaise)}`
                )}
              </Button>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {info && <p className="text-sm text-muted-foreground">{info}</p>}

              <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <span>
                  Secure payment via Razorpay. This build uses <strong>TEST mode</strong> — use a Razorpay
                  test card (e.g. 4111 1111 1111 1111, any future expiry/CVV). No real money moves.
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
