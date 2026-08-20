'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Landmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { cn } from '@/lib/utils';
import type { CounselorPayoutInfo } from '@/lib/api/types';

export function ManagerPayoutSettings({ counselorId, payout }: { counselorId: string; payout: CounselorPayoutInfo }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [acting, setActing] = useState('');

  const verified = !!payout.bankVerifiedAt;
  const hasBank = !!payout.bankAccountLast4;

  async function setMode(mode: 'manual' | 'auto') {
    setActing('mode');
    setError('');
    try {
      await clientApi.patch(`/api/counselors/${counselorId}/payout-mode`, { mode });
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not change the mode.');
    } finally {
      setActing('');
    }
  }

  async function verify() {
    setActing('verify');
    setError('');
    try {
      await clientApi.post(`/api/counselors/${counselorId}/bank/verify`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not verify.');
    } finally {
      setActing('');
    }
  }

  return (
    <div className="space-y-5">
      {/* Payout mode */}
      <div>
        <p className="mb-2 text-sm font-medium">Payout mode</p>
        <div className="inline-flex rounded-lg border p-0.5">
          {(['manual', 'auto'] as const).map((m) => (
            <button
              key={m}
              onClick={() => payout.mode !== m && setMode(m)}
              disabled={acting === 'mode'}
              className={cn(
                'rounded-md px-3 py-1 text-sm capitalize transition-colors',
                payout.mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {payout.mode === 'auto'
            ? 'Eligible commission is sent to the bank via RazorpayX (past the hold window; global switch permitting).'
            : 'You record payments manually (PhonePe/Paytm/cash). Auto requires a verified bank account.'}
        </p>
      </div>

      {/* Bank */}
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Landmark className="size-4" /> Bank account
          {hasBank && (verified ? <Badge>Verified</Badge> : <Badge variant="outline">Unverified</Badge>)}
        </p>
        {hasBank ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
            <div>
              <p className="font-medium">{payout.bankAccountName ?? '—'}</p>
              <p className="text-xs text-muted-foreground">
                A/C ••••{payout.bankAccountLast4} · {payout.bankIfsc}
              </p>
            </div>
            {!verified && (
              <Button size="sm" variant="outline" onClick={verify} disabled={acting === 'verify'}>
                {acting === 'verify' ? <Loader2 className="size-4 animate-spin" /> : <BadgeCheck className="size-4" />}
                Verify
              </Button>
            )}
          </div>
        ) : (
          <SetBankForm counselorId={counselorId} />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function SetBankForm({ counselorId }: { counselorId: string }) {
  const router = useRouter();
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/counselors/${counselorId}/bank`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName: accountName.trim(), accountNumber: accountNumber.trim(), ifsc: ifsc.trim().toUpperCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? 'Could not save the bank account.');
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor="b-name" className="text-xs">Account holder name</Label>
        <Input id="b-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} required maxLength={120} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="b-acc" className="text-xs">Account number</Label>
        <Input id="b-acc" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} placeholder="9–18 digits" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="b-ifsc" className="text-xs">IFSC</Label>
        <Input id="b-ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="HDFC0001234" className="uppercase" required />
      </div>
      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Landmark className="size-4" />}
          Save bank account
        </Button>
      </div>
    </form>
  );
}
