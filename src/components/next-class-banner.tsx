'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { countdownParts } from '@/lib/format';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface NextClass {
  id: string;
  courseId: string;
  title: string;
  scheduledAt: string;
  joinUrl: string | null;
}

/** Live "next live class" countdown. Ticks each second on the client; SSR renders the same fields. */
export function NextClassBanner({ nextClass }: { nextClass: NextClass }) {
  const [now, setNow] = useState<number>(() => new Date(nextClass.scheduledAt).getTime() - 0);
  // Start from the target so the first client render matches SSR, then switch to real time.
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const c = countdownParts(nextClass.scheduledAt, now);
  const soon = !c.past && c.days === 0 && c.hours === 0 && c.minutes <= 15;
  const label = c.past
    ? 'Live now'
    : [
        c.days ? `${c.days}d` : null,
        c.days || c.hours ? `${c.hours}h` : null,
        `${c.minutes}m`,
        c.days ? null : `${c.seconds}s`,
      ]
        .filter(Boolean)
        .join(' ');

  return (
    <Card className={cn('mb-6 border-primary/30', (soon || c.past) && 'border-primary bg-primary/5')}>
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarClock className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Next live class</p>
            <p className="font-medium">{nextClass.title}</p>
            <p className="text-sm text-muted-foreground">{formatDateTime(nextClass.scheduledAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="text-right">
            <div className="font-mono text-lg font-semibold tabular-nums">{label}</div>
            {!c.past && <div className="text-xs text-muted-foreground">until it starts</div>}
          </div>
          {nextClass.joinUrl && (soon || c.past) && (
            <Link
              href={nextClass.joinUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              <Video className="size-4" /> Join
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
