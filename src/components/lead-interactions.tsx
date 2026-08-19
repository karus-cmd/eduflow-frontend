'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquarePlus, CalendarPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { CONVO_CHANNELS, CONVO_DISPOSITIONS, labelize } from '@/lib/crm';

export function LeadInteractions({ leadId }: { leadId: string }) {
  return (
    <div className="space-y-4">
      <LogConversationForm leadId={leadId} />
      <ScheduleFollowUpForm leadId={leadId} />
    </div>
  );
}

function LogConversationForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [channel, setChannel] = useState('call');
  const [disposition, setDisposition] = useState('connected');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await clientApi.post('/api/conversations', { leadId, channel, disposition, notes: notes.trim() || undefined });
      setNotes('');
      router.refresh(); // re-render the timeline + stage
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not log the conversation.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquarePlus className="size-4" /> Log a conversation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="channel">Channel</Label>
              <Select id="channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CONVO_CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {labelize(c)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="disposition">Outcome</Label>
              <Select id="disposition" value={disposition} onChange={(e) => setDisposition(e.target.value)}>
                {CONVO_DISPOSITIONS.map((d) => (
                  <option key={d} value={d}>
                    {labelize(d)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was discussed…" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Log conversation
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ScheduleFollowUpForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [dueAt, setDueAt] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!dueAt) return setError('Pick a date and time.');
    setBusy(true);
    setError('');
    try {
      // datetime-local is local time with no zone; toISOString normalises to UTC for the API.
      await clientApi.post('/api/follow-ups', { leadId, dueAt: new Date(dueAt).toISOString(), note: note.trim() || undefined });
      setDueAt('');
      setNote('');
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not schedule the follow-up.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarPlus className="size-4" /> Schedule a follow-up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="dueAt">When</Label>
            <Input id="dueAt" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fnote">Note</Label>
            <Input id="fnote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Call back re: fees" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="outline" disabled={busy} className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Schedule follow-up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/** Client button used inside the (server-rendered) timeline to complete a pending follow-up. */
export function CompleteFollowUpButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function go() {
    setBusy(true);
    try {
      await clientApi.patch(`/api/follow-ups/${id}/complete`);
      setDone(true);
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  if (done) return <span className="text-xs text-emerald-600 dark:text-emerald-500">Done</span>;
  return (
    <Button size="xs" variant="ghost" onClick={go} disabled={busy}>
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
      Mark done
    </Button>
  );
}
