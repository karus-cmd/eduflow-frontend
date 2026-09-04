'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, Pencil, Plus, Search, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatPaise } from '@/lib/money';
import { DeactivateUserButton } from '@/components/admin/deactivate-user-button';
import type { College, CounselorListItem } from '@/lib/api/types';

export function ManagersList({
  managers,
  colleges,
  collegeId,
}: {
  managers: CounselorListItem[];
  colleges: College[];
  collegeId: string | null;
}) {
  const [onboarding, setOnboarding] = useState(false);
  const [search, setSearch] = useState('');
  const activeCollege = collegeId ? (colleges.find((c) => c.id === collegeId) ?? null) : null;

  const filteredManagers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return managers;
    return managers.filter(
      (m) => m.fullName.toLowerCase().includes(q) || (m.email ?? '').toLowerCase().includes(q),
    );
  }, [managers, search]);

  return (
    <div className="space-y-5">
      <CollegesPanel colleges={colleges} activeCollegeId={collegeId} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {collegeId ? (
          <p className="text-sm text-muted-foreground">
            Filtering by <span className="font-medium text-foreground">{activeCollege?.name ?? 'college'}</span>
            {' · '}
            <Link href="/admin/managers" className="text-primary hover:underline">
              Clear filter
            </Link>
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search managers…"
              aria-label="Search managers by name or email"
              className="w-48 pl-8 sm:w-64"
            />
          </div>
          <Button onClick={() => setOnboarding((v) => !v)}>
            <UserPlus className="size-4" /> Onboard manager
          </Button>
        </div>
      </div>

      {onboarding && (
        <OnboardForm colleges={colleges} defaultCollegeId={collegeId} onClose={() => setOnboarding(false)} />
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>College</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Earned</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManagers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/managers/${m.id}`} className="flex items-center gap-2 hover:text-primary">
                      {m.fullName}
                      {m.status !== 'active' && <Badge variant="destructive" className="capitalize">{m.status}</Badge>}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell className="text-muted-foreground">{m.college?.name ?? '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.stats.students}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPaise(m.stats.earnedPaise)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatPaise(m.stats.pendingPaise)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatPaise(m.stats.paidPaise)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DeactivateUserButton userId={m.id} name={m.fullName} status={m.status} />
                      <Link href={`/admin/managers/${m.id}`}>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredManagers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    {search.trim()
                      ? `No managers match “${search.trim()}”.`
                      : collegeId
                        ? 'No managers in this college yet.'
                        : 'No managers yet. Click “Onboard manager” to add one.'}
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

/** Compact colleges management list — inline add + per-row inline edit (this repo avoids blocking dialogs). */
function CollegesPanel({ colleges, activeCollegeId }: { colleges: College[]; activeCollegeId: string | null }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Colleges</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          <Plus className="size-4" /> Add college
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && <AddCollegeForm onClose={() => setAdding(false)} />}

        <div className="divide-y divide-border/70 rounded-lg border">
          {colleges.map((c) =>
            editingId === c.id ? (
              <EditCollegeForm key={c.id} college={c} onClose={() => setEditingId(null)} />
            ) : (
              <div
                key={c.id}
                className={`flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm ${
                  c.id === activeCollegeId ? 'bg-primary/5' : ''
                }`}
              >
                <Link href={`/admin/managers?collegeId=${c.id}`} className="flex min-w-0 items-center gap-2 hover:text-primary">
                  <span className="truncate font-medium">{c.name}</span>
                  {c.isDefault && <Badge variant="outline">default</Badge>}
                  {c.city && <span className="text-xs text-muted-foreground">{c.city}</span>}
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {c.managerCount} {c.managerCount === 1 ? 'manager' : 'managers'}
                  </span>
                  <Button size="icon-xs" variant="ghost" onClick={() => setEditingId(c.id)} aria-label={`Edit ${c.name}`}>
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>
            ),
          )}
          {colleges.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No colleges yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddCollegeForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await clientApi.post('/api/colleges', { name: name.trim(), ...(city.trim() ? { city: city.trim() } : {}) });
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not add the college.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-lg border p-3">
      <div className="space-y-1">
        <Label htmlFor="c-name" className="text-xs">Name</Label>
        <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="w-48" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="c-city" className="text-xs">City</Label>
        <Input id="c-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="optional" className="w-40" />
      </div>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy || !name.trim()}>
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

function EditCollegeForm({ college, onClose }: { college: College; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(college.name);
  const [city, setCity] = useState(college.city ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await clientApi.patch(`/api/colleges/${college.id}`, { name: name.trim(), city: city.trim() || null });
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not save the college.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 bg-muted/40 px-3 py-2">
      <div className="space-y-1">
        <Label htmlFor={`e-name-${college.id}`} className="text-xs">Name</Label>
        <Input id={`e-name-${college.id}`} value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="w-48" />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`e-city-${college.id}`} className="text-xs">City</Label>
        <Input id={`e-city-${college.id}`} value={city} onChange={(e) => setCity(e.target.value)} placeholder="optional" className="w-40" />
      </div>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy || !name.trim()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function OnboardForm({
  colleges,
  defaultCollegeId,
  onClose,
}: {
  colleges: College[];
  defaultCollegeId: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('counselor');
  const [employeeCode, setEmployeeCode] = useState('');
  const initialCollege = defaultCollegeId ?? colleges.find((c) => c.isDefault)?.id ?? colleges[0]?.id ?? '';
  const [collegeId, setCollegeId] = useState(initialCollege);
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
        ...(collegeId ? { collegeId } : {}),
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
          {colleges.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="o-college">College</Label>
              <Select id="o-college" value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.isDefault ? ' (default)' : ''}
                  </option>
                ))}
              </Select>
            </div>
          )}
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
