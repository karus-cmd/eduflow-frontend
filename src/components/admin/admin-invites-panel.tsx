'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clientApi, ClientApiError } from '@/lib/client-api';
import type { AdminInvite } from '@/lib/api/types';

/** Admin-only allow-list, mirrors CollegesPanel's inline list + add-form + per-row delete style. */
export function AdminInvitesPanel({ invites }: { invites: AdminInvite[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Admin access</CardTitle>
          <CardDescription className="mt-0.5">
            Emails here become admin automatically the first time they sign in with Google — no
            password needed.
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          <Plus className="size-4" /> Add email
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && <AddInviteForm onClose={() => setAdding(false)} />}

        <div className="divide-y divide-border/70 rounded-lg border">
          {invites.map((inv) => (
            <InviteRow key={inv.id} invite={inv} />
          ))}
          {invites.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No admin invites yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InviteRow({ invite }: { invite: AdminInvite }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await fetch(`/api/admin-invites/${invite.id}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
      <span className="truncate font-medium">{invite.email}</span>
      <Button size="icon-sm" variant="ghost" onClick={remove} disabled={busy} aria-label={`Remove ${invite.email}`}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
      </Button>
    </div>
  );
}

function AddInviteForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await clientApi.post('/api/admin-invites', { email: email.trim() });
      setEmail('');
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not add the invite.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-lg border p-3">
      <div className="space-y-1">
        <Label htmlFor="inv-email" className="text-xs">Email</Label>
        <Input
          id="inv-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="w-64"
        />
      </div>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy || !email.trim()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
