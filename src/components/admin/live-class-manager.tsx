'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Loader2, Video, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { formatDateTime } from '@/lib/format';
import { labelize } from '@/lib/crm';
import type { LiveClass } from '@/lib/api/types';

export function LiveClassManager({ courseId, liveClasses }: { courseId: string; liveClasses: LiveClass[] }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMin, setDurationMin] = useState('60');
  const [joinUrl, setJoinUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledAt) return setError('Pick a date and time.');
    setBusy(true);
    setError('');
    try {
      await clientApi.post(`/api/courses/${courseId}/live-classes`, {
        title: title.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        ...(durationMin ? { durationMin: Number(durationMin) } : {}),
        ...(joinUrl.trim() ? { joinUrl: joinUrl.trim() } : {}),
      });
      setTitle('');
      setScheduledAt('');
      setJoinUrl('');
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not schedule the class.');
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    setActing(id);
    try {
      await clientApi.patch(`/api/live-classes/${id}`, { status: 'cancelled' });
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-4">
      {liveClasses.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {liveClasses.map((lc) => (
            <li key={lc.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{lc.title}</span>
                  <Badge variant={lc.status === 'cancelled' ? 'destructive' : lc.status === 'scheduled' ? 'secondary' : 'outline'} className="capitalize">
                    {labelize(lc.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(lc.scheduledAt)}
                  {lc.durationMin ? ` · ${lc.durationMin} min` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {lc.joinUrl && (
                  <a href={lc.joinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Video className="size-3.5" /> Join
                  </a>
                )}
                {lc.status !== 'cancelled' && (
                  <Button size="xs" variant="ghost" onClick={() => cancel(lc.id)} disabled={acting === lc.id}>
                    {acting === lc.id ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                    Cancel
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">No live classes scheduled.</p>
      )}

      <Card>
        <CardContent className="p-4">
          <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="lctitle">Title</Label>
              <Input id="lctitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Doubt-clearing session" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lcwhen">When</Label>
              <Input id="lcwhen" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lcdur">Duration (min)</Label>
              <Input id="lcdur" type="number" min={1} max={600} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="lcurl">Join URL</Label>
              <Input id="lcurl" type="url" value={joinUrl} onChange={(e) => setJoinUrl(e.target.value)} placeholder="https://meet.google.com/…" />
            </div>
            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy || !title.trim()}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
                Schedule class
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
