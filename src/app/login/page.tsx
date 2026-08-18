'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEMOS = [
  { label: 'Admin', email: 'admin@eduflow.local', password: 'Admin@12345' },
  { label: 'Manager', email: 'manager1@demo.eduflow.local', password: 'Demo@12345' },
  { label: 'Student', email: 'student1@demo.eduflow.local', password: 'Demo@12345' },
];

function homeFor(role: string) {
  if (role === 'admin' || role === 'finance') return '/admin';
  if (role === 'counselor' || role === 'team_lead') return '/counselor';
  return '/student';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...(totp ? { totp } : {}) }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      if (data?.error?.details?.twoFactorRequired) {
        setNeedTotp(true);
        setError('Two-factor code required.');
      } else {
        setError(data?.error?.message ?? 'Login failed.');
      }
      return;
    }
    router.push(homeFor(data.role));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">EduFlow</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {needTotp && (
              <div className="space-y-1.5">
                <Label htmlFor="totp">2FA code</Label>
                <Input id="totp" inputMode="numeric" pattern="\d{6}" maxLength={6} value={totp} onChange={(e) => setTotp(e.target.value)} />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <p className="mb-2 text-xs text-muted-foreground">Demo logins (run the demo seed first):</p>
            <div className="flex flex-wrap gap-2">
              {DEMOS.map((d) => (
                <Button
                  key={d.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.password);
                    setNeedTotp(false);
                    setError('');
                  }}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
