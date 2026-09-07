'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { CheckCircle2, Loader2, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CourseThumb } from '@/components/course-thumb';
import { Price } from '@/components/price';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatPaise } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { CheckoutResult, CourseTier } from '@/lib/api/types';

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

interface CheckoutCourse {
  id: string;
  title: string;
  pricePaise: string;
  mrpPaise: string | null;
  /** Non-null only when this course offers a second, higher-priced "Complete" plan. */
  premiumPricePaise: string | null;
  premiumMrpPaise: string | null;
  thumbnailUrl: string | null;
  /** Real counts/topic names from the course's own section tree — never hardcoded here. */
  totalLessons: number;
  standardLessons: number;
  standardTopicRange: string;
  completeTopics: string;
}
interface CheckoutUser {
  fullName: string;
  email: string | null;
  phone: string | null;
}

export function CheckoutClient({
  course,
  user,
  upgradeOnly = false,
}: {
  course: CheckoutCourse;
  user: CheckoutUser;
  /** True when the student already holds a Standard enrollment and is here only to upgrade —
   *  Standard isn't offered again (they'd be re-paying for what they already have). */
  upgradeOnly?: boolean;
}) {
  const router = useRouter();
  const scriptReady = useRef(false);
  const hasPremium = course.premiumPricePaise != null;
  const [tier, setTier] = useState<CourseTier>(upgradeOnly ? 'complete' : 'standard');
  const [referral, setReferral] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const activePricePaise = tier === 'complete' ? course.premiumPricePaise! : course.pricePaise;
  const activeMrpPaise = tier === 'complete' ? course.premiumMrpPaise : course.mrpPaise;

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
        ...(hasPremium ? { tier } : {}),
      });

      const rzp = new window.Razorpay({
        key: checkout.keyId,
        amount: Number(checkout.amountPaise),
        currency: checkout.currency,
        name: 'STEIN-X',
        description: checkout.courseTitle,
        order_id: checkout.gatewayOrderId,
        prefill: {
          name: user.fullName,
          email: user.email ?? undefined,
          contact: user.phone ?? undefined,
        },
        notes: { orderId: checkout.orderId },
        theme: { color: '#1D4ED8' },
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
        <div className="order-2 space-y-4 lg:order-1">
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-medium">Order summary</h2>
              <div className="flex gap-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <CourseThumb title={course.title} thumbnailUrl={course.thumbnailUrl} />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">{course.title}</p>
                  <Price pricePaise={activePricePaise} mrpPaise={activeMrpPaise} size="sm" className="mt-1" />
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

          {hasPremium && (
            <div>
              <h2 className="mb-2.5 font-medium">{upgradeOnly ? 'Upgrade' : 'Choose your plan'}</h2>
              <div className={cn('grid gap-3', !upgradeOnly && 'sm:grid-cols-2')}>
                {!upgradeOnly && (
                  <PlanOption
                    active={tier === 'standard'}
                    onSelect={() => setTier('standard')}
                    title="Standard"
                    blurb="The core curriculum."
                    pricePaise={course.pricePaise}
                    mrpPaise={course.mrpPaise}
                    points={[
                      `${course.standardLessons} lessons${course.standardTopicRange ? ` — ${course.standardTopicRange}` : ''}`,
                      'Resume-building session',
                      '3 AI mock interview sessions',
                      '1 person-to-person mock interview',
                      '6 months of access',
                      'Progress tracking + streaks',
                      'Certificate of completion',
                    ]}
                  />
                )}
                <PlanOption
                  active={tier === 'complete'}
                  onSelect={() => setTier('complete')}
                  title="Complete"
                  blurb={upgradeOnly ? 'Unlocks every remaining advanced module.' : 'Standard, plus every advanced module.'}
                  pricePaise={course.premiumPricePaise!}
                  mrpPaise={course.premiumMrpPaise}
                  points={[
                    `All ${course.totalLessons} lessons${course.completeTopics ? ` — adds ${course.completeTopics}` : ''}`,
                    'Resume-building session',
                    '5 AI mock interview sessions',
                    '3 person-to-person mock interviews',
                    'Full lifetime access',
                    'Progress tracking + streaks',
                    'Certificate of completion',
                    'LinkedIn/portfolio review',
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pay box */}
        <aside className="order-1 lg:order-2">
          <Card className="lg:sticky lg:top-6">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-semibold tabular-nums">{formatPaise(activePricePaise)}</span>
              </div>

              <Button onClick={pay} disabled={busy} size="lg" className="w-full">
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Opening checkout…
                  </>
                ) : (
                  `Pay ${formatPaise(activePricePaise)}`
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

function PlanOption({
  active,
  onSelect,
  title,
  blurb,
  pricePaise,
  mrpPaise,
  points,
}: {
  active: boolean;
  onSelect: () => void;
  title: string;
  blurb: string;
  pricePaise: string;
  mrpPaise: string | null;
  points: string[];
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
        active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="font-medium">{title}</span>
        {active && <CheckCircle2 className="size-4 text-primary" />}
      </div>
      <p className="text-xs text-muted-foreground">{blurb}</p>
      <Price pricePaise={pricePaise} mrpPaise={mrpPaise} size="sm" />
      <ul className="mt-1 space-y-1.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
