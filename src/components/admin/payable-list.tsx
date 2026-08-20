'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeIndianRupee, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecordPayoutForm } from '@/components/admin/record-payout-form';
import { formatPaise } from '@/lib/money';
import type { PayableResponse } from '@/lib/api/types';

export function PayableList({ payable }: { payable: PayableResponse }) {
  const [open, setOpen] = useState<string | null>(null);

  if (payable.counselors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
        No one to pay right now — every manager is below the {formatPaise(payable.thresholdPaise)} threshold.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Managers with pending commission ≥ <span className="font-medium text-foreground">{formatPaise(payable.thresholdPaise)}</span> (highest first).
      </p>
      {payable.counselors.map((c) => (
        <Card key={c.counselorId}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/admin/managers/${c.counselorId}`} className="font-medium hover:text-primary">
                  {c.counselor.fullName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {c.counselor.email ?? c.counselor.phone ?? ''} · earned {formatPaise(c.totalEarnedPaise)} · paid {formatPaise(c.totalPaidPaise)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-semibold tabular-nums">{formatPaise(c.pendingPaise)}</div>
                  <div className="text-xs text-muted-foreground">awaiting payout</div>
                </div>
                <Button variant={open === c.counselorId ? 'secondary' : 'default'} onClick={() => setOpen(open === c.counselorId ? null : c.counselorId)}>
                  {open === c.counselorId ? <ChevronDown className="size-4" /> : <BadgeIndianRupee className="size-4" />}
                  Record payout
                </Button>
              </div>
            </div>
            {open === c.counselorId && (
              <div className="mt-4 border-t pt-4">
                <RecordPayoutForm counselorId={c.counselorId} pendingPaise={c.pendingPaise} onDone={() => setOpen(null)} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
