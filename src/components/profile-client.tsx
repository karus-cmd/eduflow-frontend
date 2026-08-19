'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { clientApi, ClientApiError } from '@/lib/client-api';

interface ProfileUser {
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  lastLoginAt: string | null;
}

export function ProfileClient({ user }: { user: ProfileUser }) {
  return (
    <Tabs defaultValue="profile" className="max-w-2xl">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab user={user} />
      </TabsContent>
      <TabsContent value="security">
        <SecurityTab email={user.email} />
      </TabsContent>
    </Tabs>
  );
}

function ProfileTab({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty = fullName.trim() !== user.fullName && fullName.trim().length > 0;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await clientApi.patch('/api/me', { fullName: fullName.trim() });
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not save your changes.');
      setBusy(false);
      return;
    }
    setBusy(false);
    setSaved(true);
    router.refresh(); // re-fetch the server-rendered name in the header
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {user.fullName.trim().charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <Badge variant="secondary" className="mt-0.5 capitalize">
              {user.role}
            </Badge>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">
              <User className="size-4 text-muted-foreground" /> Full name
            </Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField icon={<Mail className="size-4" />} label="Email" value={user.email ?? '—'} />
            <ReadOnlyField icon={<Phone className="size-4" />} label="Phone" value={user.phone ?? '—'} />
          </div>
          <p className="text-xs text-muted-foreground">
            Email and phone are managed by your counsellor. You can update your display name here.
          </p>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!dirty || busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
            {saved && !dirty && <span className="text-sm text-emerald-600 dark:text-emerald-500">Saved.</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ReadOnlyField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Label>
      <div className="flex h-9 items-center rounded-lg border bg-muted/40 px-3 text-sm">{value}</div>
    </div>
  );
}

function SecurityTab({ email }: { email: string | null }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [resetBusy, setResetBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (next.length < 8) return setError('Your new password must be at least 8 characters.');
    if (next !== confirm) return setError('The new passwords don’t match.');
    setBusy(true);
    try {
      await clientApi.post('/api/account/change-password', { currentPassword: current, newPassword: next });
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not change your password.');
    } finally {
      setBusy(false);
    }
  }

  async function sendReset() {
    if (!email) return;
    setResetBusy(true);
    try {
      await clientApi.post('/api/account/forgot-password', { email });
      setResetSent(true);
    } catch {
      /* generic — no enumeration */
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {done ? (
          <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            Password changed. You’ll need to sign in again on your other devices.
          </div>
        ) : (
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="next">New password</Label>
                <Input id="next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              Change password
            </Button>
          </form>
        )}

        <div className="border-t pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <ShieldCheck className="size-4 text-muted-foreground" /> Forgot your current password?
          </p>
          {resetSent ? (
            <p className="text-sm text-muted-foreground">
              If an account exists for {email}, a reset link is on its way.
            </p>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={sendReset} disabled={resetBusy || !email}>
                {resetBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                Email me a reset link
              </Button>
              {!email && <span className="text-xs text-muted-foreground">No email on file.</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
