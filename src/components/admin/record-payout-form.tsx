'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeIndianRupee, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatPaise } from '@/lib/money';

const METHODS = ['phonepe', 'paytm', 'upi', 'bank_transfer', 'cash'] as const;

/** Record a MANUAL payout to a manager → moves pending → paid on the ledger (idempotent). */
export function RecordPayoutForm({
  counselorId,
  pendingPaise,
  onDone,
}: {
  counselorId: string;
  pendingPaise: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const pendingRupees = Number(pendingPaise) / 100;
  const [amount, setAmount] = useState(pendingRupees > 0 ? String(pendingRupees) : '');
  const [method, setMethod] = useState('phonepe');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const paise = Math.round((Number(amount) || 0) * 100);
    if (paise <= 0) return setError('Enter a positive amount.');
    setBusy(true);
    setError('');
    try {
      await clientApi.post(`/api/counselors/${counselorId}/payouts`, {
        amountPaise: String(paise),
        method,
        reference: reference.trim() || undefined,
        idempotencyKey: crypto.randomUUID(), // per-submit key → a double-click is a no-op
      });
      setDone(true);
      setReference('');
      router.refresh();
      onDone?.();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not record the payout.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Awaiting payout: <span className="font-medium text-foreground">{formatPaise(pendingPaise)}</span>. Record a
        payment you already made (PhonePe/Paytm/UPI/bank/cash).
      </p>
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <div className="space-y-1">
          <Label htmlFor={`amt-${counselorId}`} className="text-xs">Amount (₹)</Label>
          <Input id={`amt-${counselorId}`} type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Method</Label>
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`ref-${counselorId}`} className="text-xs">Reference (txn id / UTR, optional)</Label>
        <Input id={`ref-${counselorId}`} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. T2408211230…" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {done && <p className="text-sm text-emerald-600 dark:text-emerald-500">Payout recorded — moved to Paid.</p>}
      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <BadgeIndianRupee className="size-4" />}
        Record payout
      </Button>
    </form>
  );
}
