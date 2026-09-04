'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clientApi, ClientApiError } from '@/lib/client-api';

/**
 * Removes a manager/admin — admin-only server-side (`user.deactivate`, not in COUNSELOR_PERMISSIONS),
 * and every page this renders on is already gated to `requireRole(['admin', 'finance'])`. Soft
 * (status → inactive): their historical leads/commission/enrollments stay intact for audit, they
 * just can't log in once their current session expires. A second click confirms — no dialog, to
 * match this app's own no-blocking-modals convention.
 */
export function DeactivateUserButton({ userId, name, status }: { userId: string; name: string; status: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (status !== 'active') return null;

  async function run() {
    setBusy(true);
    setError('');
    try {
      await clientApi.post(`/api/users/${userId}/deactivate`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not remove them.');
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Remove {name}?</span>
        <Button type="button" size="sm" variant="destructive" onClick={run} disabled={busy}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : 'Confirm'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
          Cancel
        </Button>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </span>
    );
  }

  return (
    <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirming(true)}>
      <UserX className="size-3.5" /> Remove
    </Button>
  );
}
