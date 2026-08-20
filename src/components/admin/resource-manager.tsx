'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { clientApi, ClientApiError } from '@/lib/client-api';
import type { ResourceItem } from '@/lib/api/types';

const RESOURCE_TYPES = ['pdf', 'doc', 'link', 'image', 'archive', 'other'] as const;

/** Add / list / delete resources for a course or a lesson (the `addEndpoint` decides which). */
export function ResourceManager({
  resources,
  addEndpoint,
  emptyText = 'No resources yet.',
}: {
  resources: ResourceItem[];
  addEndpoint: string; // e.g. /api/courses/:id/resources or /api/lessons/:id/resources
  emptyText?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('pdf');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await clientApi.post(addEndpoint, { title: title.trim(), type, url: url.trim() });
      setTitle('');
      setUrl('');
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not add the resource.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      {resources.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                {r.type === 'link' ? <Download className="size-4 text-muted-foreground" /> : <FileText className="size-4 text-muted-foreground" />}
                <span className="truncate">{r.title}</span>
                <span className="shrink-0 text-xs uppercase text-muted-foreground">{r.type}</span>
              </span>
              <Button size="icon-sm" variant="ghost" onClick={() => remove(r.id)} disabled={deleting === r.id} aria-label="Delete resource">
                {deleting === r.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
      )}

      <form onSubmit={add} className="grid gap-2 sm:grid-cols-[1fr_8rem_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <Label htmlFor={`rtitle-${addEndpoint}`} className="text-xs">Title</Label>
          <Input id={`rtitle-${addEndpoint}`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Slides.pdf" required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`rurl-${addEndpoint}`} className="text-xs">URL / R2 key</Label>
          <Input id={`rurl-${addEndpoint}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or courses/…/file.pdf" required />
        </div>
        <Button type="submit" disabled={busy || !title.trim() || !url.trim()} size="sm">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
