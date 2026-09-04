'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { clientApi, ClientApiError } from '@/lib/client-api';
import type { College, Paginated, UserPublic } from '@/lib/api/types';

/**
 * Promotes an EXISTING account (e.g. auto-provisioned as `student` via Google Sign-In) to
 * counselor/admin. POST /users only ever creates brand-new accounts and rejects an email that's
 * already taken — this is the only route for "this person already signed in, now make them a
 * manager or admin".
 */
export function PromoteUserForm({ colleges }: { colleges: College[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [found, setFound] = useState<UserPublic | 'not_found' | null>(null);

  const [role, setRole] = useState('counselor');
  const [collegeId, setCollegeId] = useState(colleges.find((c) => c.isDefault)?.id ?? colleges[0]?.id ?? '');
  const [employeeCode, setEmployeeCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [done, setDone] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLooking(true);
    setLookupError('');
    setFound(null);
    setDone(false);
    try {
      const res = await clientApi.get<Paginated<UserPublic>>(`/api/users?email=${encodeURIComponent(email.trim())}&limit=1`);
      setFound(res.data[0] ?? 'not_found');
    } catch (e) {
      setLookupError(e instanceof ClientApiError ? e.message : 'Lookup failed.');
    } finally {
      setLooking(false);
    }
  }

  async function promote(e: React.FormEvent) {
    e.preventDefault();
    if (!found || found === 'not_found') return;
    setSaving(true);
    setSaveError('');
    try {
      await clientApi.patch(`/api/users/${found.id}`, {
        role,
        ...(role === 'counselor' && collegeId ? { collegeId } : {}),
        ...(role === 'counselor' && employeeCode.trim() ? { employeeCode: employeeCode.trim() } : {}),
      });
      setDone(true);
      router.refresh();
    } catch (e) {
      setSaveError(e instanceof ClientApiError ? e.message : 'Could not update their role.');
    } finally {
      setSaving(false);
    }
  }

  const alreadyStaff = found && found !== 'not_found' && found.role !== 'student';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" /> Promote an existing account
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          For someone who already signed in (e.g. via Google) and needs to become a manager or admin —
          onboarding a brand-new email won&rsquo;t work for them since the account already exists.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={lookup} className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="p-email">Their email</Label>
            <Input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" variant="secondary" disabled={looking || !email.trim()}>
            {looking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Look up
          </Button>
        </form>
        {lookupError && <p className="text-sm text-destructive">{lookupError}</p>}

        {found === 'not_found' && (
          <p className="text-sm text-muted-foreground">
            No account with that email yet — they haven&rsquo;t signed in, or use &ldquo;Onboard manager&rdquo; above to create one directly.
          </p>
        )}

        {found && found !== 'not_found' && alreadyStaff && (
          <p className="text-sm text-muted-foreground">
            {found.fullName} ({found.email}) is already a <span className="font-medium capitalize">{found.role}</span>.
          </p>
        )}

        {found && found !== 'not_found' && !alreadyStaff && (
          <form onSubmit={promote} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <p className="text-sm sm:col-span-2">
              Found <span className="font-medium">{found.fullName}</span> ({found.email}) — currently a <span className="font-medium">student</span>.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="p-role">New role</Label>
              <Select id="p-role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="counselor">Counselor / Manager</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            {role === 'counselor' && (
              <div className="space-y-1.5">
                <Label htmlFor="p-emp">Employee code</Label>
                <Input id="p-emp" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="optional" />
              </div>
            )}
            {role === 'counselor' && colleges.length > 0 && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-college">College</Label>
                <Select id="p-college" value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.isDefault ? ' (default)' : ''}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {saveError && <p className="text-sm text-destructive sm:col-span-2">{saveError}</p>}
            {done && <p className="text-sm text-emerald-600 dark:text-emerald-500 sm:col-span-2">Promoted.</p>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                Promote to {role === 'admin' ? 'Admin' : 'Manager'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
