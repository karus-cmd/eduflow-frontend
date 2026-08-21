'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Root error boundary. Catches render/data errors in any route below and offers a retry
 * (`reset()` re-renders the segment) plus an escape hatch home. Never leaks the raw error text
 * to the user — that goes to the console for developers.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[EduFlow] route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We hit a snag loading this page. You can try again, or head back to your dashboard.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground/70">Ref: {error.digest}</p>}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
