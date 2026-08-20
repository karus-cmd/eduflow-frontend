'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatPaise } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Course } from '@/lib/api/types';

/** title → kebab-case slug (a-z, 0-9, hyphens). */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  published: 'default',
  draft: 'outline',
  archived: 'secondary',
};

export function ContentLibrary({ courses }: { courses: Course[] }) {
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const x of courses) c[x.status] = (c[x.status] ?? 0) + 1;
    return c;
  }, [courses]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return courses.filter(
      (c) => (status === 'all' || c.status === status) && (!needle || c.title.toLowerCase().includes(needle)),
    );
  }, [courses, status, q]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={status === 'all'} onClick={() => setStatus('all')} label="All" count={courses.length} />
        {['published', 'draft', 'archived']
          .filter((s) => counts[s])
          .map((s) => (
            <FilterPill key={s} active={status === s} onClick={() => setStatus(s)} label={s} count={counts[s]} />
          ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses…" className="h-9 pl-8" />
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="size-4" /> New course
        </Button>
      </div>

      {creating && <NewCourseForm onClose={() => setCreating(false)} />}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Lessons</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/content/${c.id}`} className="block hover:text-primary">
                      {c.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[c.status] ?? 'outline'} className="capitalize">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPaise(c.pricePaise)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{c.totalLessons}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No courses {status === 'all' ? 'yet' : `in “${status}”`}. Click “New course” to add one.
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

function FilterPill({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'opacity-80' : 'text-muted-foreground')}>{count}</span>
    </button>
  );
}

function NewCourseForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const effectiveSlug = slugTouched ? slug : slugify(title);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const rupees = Number(price) || 0;
      const created = await clientApi.post<{ id: string }>('/api/courses', {
        title: title.trim(),
        slug: effectiveSlug,
        ...(rupees > 0 ? { pricePaise: Math.round(rupees * 100) } : {}),
      });
      router.push(`/admin/content/${created.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not create the course.');
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Course title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full-Stack Web Development" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="full-stack-web-development"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" min={0} step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4999" />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="flex items-center gap-2 sm:col-span-2">
            <Button type="submit" disabled={busy || !title.trim() || !effectiveSlug}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Create &amp; edit
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
