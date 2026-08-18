'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { clientApi } from '@/lib/client-api';
import { cn } from '@/lib/utils';

const INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60s before we surface the "still working" fallback

interface StatusResult {
  status: string;
  courseId: string | null;
  paid: boolean;
}

type Phase = 'polling' | 'paid' | 'timeout';

/**
 * Polls the order status until the `payment.captured` webhook has provisioned access, then routes
 * into the course. Provisioning is server-side (the webhook is the source of truth), so this waits
 * on the backend rather than trusting the browser's payment-success callback.
 */
export function ProvisioningPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('polling');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const attempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(async () => {
    try {
      const r = await clientApi.get<StatusResult>(`/api/orders/${orderId}/status`);
      if (r.paid) {
        setCourseId(r.courseId);
        setPhase('paid');
        setTimeout(() => {
          router.push(r.courseId ? `/student/learn/${r.courseId}` : '/student');
          router.refresh();
        }, 1200);
        return true;
      }
    } catch {
      // transient — keep polling
    }
    return false;
  }, [orderId, router]);

  useEffect(() => {
    let cancelled = false;
    attempts.current = 0;
    async function loop() {
      if (cancelled) return;
      attempts.current += 1;
      const done = await check();
      if (done || cancelled) return;
      if (attempts.current >= MAX_ATTEMPTS) {
        setPhase('timeout');
        return;
      }
      timer.current = setTimeout(loop, INTERVAL_MS);
    }
    loop();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
    // Re-runs when `restartKey` changes (the "Check again" button).
  }, [check, restartKey]);

  function retry() {
    setPhase('polling');
    setRestartKey((k) => k + 1);
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 px-6 py-12 text-center">
        {phase === 'paid' ? (
          <>
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Payment received</h1>
              <p className="mt-1 text-sm text-muted-foreground">Access granted — taking you to the course…</p>
            </div>
            {courseId && (
              <Link href={`/student/learn/${courseId}`} className={cn(buttonVariants(), 'mt-1')}>
                Go to course now
              </Link>
            )}
          </>
        ) : phase === 'timeout' ? (
          <>
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/15">
              <Clock className="size-8 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="max-w-md">
              <h1 className="text-xl font-semibold">Still provisioning…</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your payment went through, but access hasn&rsquo;t been granted yet. Provisioning happens
                when Razorpay&rsquo;s <strong>payment.captured</strong> webhook reaches the backend — that
                requires the deployed Railway backend with the webhook registered. Against a local backend
                the webhook won&rsquo;t fire, so this is expected in dev.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={retry} variant="outline">
                <RefreshCw className="size-4" /> Check again
              </Button>
              <Link href="/student" className={cn(buttonVariants({ variant: 'ghost' }))}>
                Go to My Learning
              </Link>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="size-10 animate-spin text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Payment received — provisioning access</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirming your enrolment with the backend. This usually takes a few seconds.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
