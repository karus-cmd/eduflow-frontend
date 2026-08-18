'use client';

import { useState } from 'react';
import { Info, KeyRound, Loader2, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatDate } from '@/lib/format';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field icon={<User className="size-4" />} label="Full name" value={user.fullName} />
          <Field icon={<Mail className="size-4" />} label="Email" value={user.email ?? '—'} />
          <Field icon={<Phone className="size-4" />} label="Phone" value={user.phone ?? '—'} />
          <Field
            icon={<ShieldCheck className="size-4" />}
            label="Account status"
            value={user.status}
            valueClassName="capitalize"
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Editing your name, email or phone isn&rsquo;t available yet — the backend has no self-service
            profile-update endpoint (admin-only <code>PATCH /users/:id</code>). Ask your counsellor to update
            your details for now.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Label>
      <div
        className={`flex h-9 items-center rounded-lg border bg-muted/40 px-3 text-sm ${valueClassName ?? ''}`}
      >
        {value}
      </div>
    </div>
  );
}

function SecurityTab({ email }: { email: string | null }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function sendReset() {
    if (!email) return;
    setBusy(true);
    setError('');
    try {
      await clientApi.post('/api/account/forgot-password', { email });
      setDone(true);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not send the reset link.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We send password changes by email. Click below and follow the link we send to{' '}
          {email ? <span className="font-medium text-foreground">{email}</span> : 'your email'} to set a new
          password.
        </p>

        {done ? (
          <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            If an account exists for {email}, a reset link is on its way. Check your inbox.
          </div>
        ) : (
          <Button onClick={sendReset} disabled={busy || !email}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Email me a reset link
          </Button>
        )}
        {!email && (
          <p className="text-xs text-muted-foreground">
            No email is on file for your account, so a reset link can&rsquo;t be sent. Add one via your
            counsellor.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Changing your password while signed in (without email) needs a backend{' '}
            <code>POST /auth/change-password</code> endpoint, which doesn&rsquo;t exist yet. The email reset
            flow above is the supported path.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
