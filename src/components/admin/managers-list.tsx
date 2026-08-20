'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatPaise } from '@/lib/money';
import type { CounselorListItem } from '@/lib/api/types';

export function ManagersList({ managers }: { managers: CounselorListItem[] }) {
  const [onboarding, setOnboarding] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setOnboarding((v) => !v)}>
          <UserPlus className="size-4" /> Onboard manager
        </Button>
      </div>

      {onboarding && <OnboardForm onClose={() => setOnboarding(false)} />}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Earned</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/managers/${m.id}`} className="flex items-center gap-2 hover:text-primary">
                      {m.fullName}
                      {m.status !== 'active' && <Badge variant="destructive" className="capitalize">{m.status}</Badge>}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.stats.students}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPaise(m.stats.earnedPaise)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatPaise(m.stats.pendingPaise)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatPaise(m.stats.paidPaise)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/managers/${m.id}`}>
                      <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {managers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No managers yet. Click “Onboard manager” to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function OnboardForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('counselor');
  const [employeeCode, setEmployeeCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await clientApi.post('/api/users', {
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        password,
        ...(employeeCode.trim() ? { employeeCode: employeeCode.trim() } : {}),
      });
      setDone(true);
      setFullName('');
      setEmail('');
      setPassword('');
      setEmployeeCode('');
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not onboard the manager.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="o-name">Full name</Label>
            <Input id="o-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-email">Email</Label>
            <Input id="o-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-pass">Temporary password (12+ chars)</Label>
            <Input id="o-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="o-role">Role</Label>
              <Select id="o-role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="counselor">Counselor / Manager</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-emp">Employee code</Label>
              <Input id="o-emp" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="optional" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          {done && <p className="text-sm text-emerald-600 dark:text-emerald-500 sm:col-span-2">Manager onboarded — a unique referral code was assigned. Open their profile to see it.</p>}
          <div className="flex items-center gap-2 sm:col-span-2">
            <Button type="submit" disabled={busy || !fullName.trim() || !email.trim() || password.length < 12}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Onboard
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Counselors get a unique <code>MGR-XXXX</code> referral code + a zeroed commission balance automatically.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
