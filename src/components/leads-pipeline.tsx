'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Lock, Phone, Plus, Search, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { labelize } from '@/lib/crm';
import { formatDate } from '@/lib/format';
import type { Lead, QueueToday } from '@/lib/api/types';

/**
 * Normalize a naturally-typed phone number into the E.164 shape the backend requires
 * (`^\+?[1-9]\d{7,14}$`) — strips spaces/dashes/parens, and assumes a bare 10-digit number
 * is Indian (prepends +91). Without this, typing "98765 43210" (very common) fails backend
 * validation with no obvious reason to the user.
 */
function normalizePhone(raw: string): string {
  const stripped = raw.trim().replace(/[\s\-().]/g, '');
  if (stripped.startsWith('+')) return stripped;
  if (/^\d{10}$/.test(stripped)) return `+91${stripped}`;
  return stripped;
}

/** The 4 columns this board works — a deliberate subset of the full `LEAD_STAGES` enum (§ crm.ts). */
const BOARD_STAGES = ['contacted', 'interested', 'enrolled', 'junk'] as const;
type BoardStage = (typeof BOARD_STAGES)[number];

/** Stages a lead cannot be moved out of once reached — mirrors the backend's terminal-stage guard. */
function isTerminal(stage: string): boolean {
  return stage === 'enrolled' || stage === 'junk';
}

// a colour per pipeline column (identity, not status)
const COLUMN_DOT: Record<BoardStage, string> = {
  contacted: 'bg-primary',
  interested: 'bg-coral',
  enrolled: 'bg-lime',
  junk: 'bg-foreground',
};

export function LeadsPipeline({ leads, queue }: { leads: Lead[]; queue: QueueToday }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [dragError, setDragError] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((l) => l.fullName.toLowerCase().includes(needle) || l.phone.includes(needle));
  }, [leads, q]);

  const byStage = useMemo(() => {
    const map: Record<BoardStage, Lead[]> = { contacted: [], interested: [], enrolled: [], junk: [] };
    for (const l of filtered) {
      if ((BOARD_STAGES as readonly string[]).includes(l.stage)) map[l.stage as BoardStage].push(l);
    }
    return map;
  }, [filtered]);

  async function handleDrop(targetStage: BoardStage, e: React.DragEvent) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === targetStage || isTerminal(lead.stage)) return;

    const ok = window.confirm(`Move ${lead.fullName} to ${labelize(targetStage)}?`);
    if (!ok) return;

    setDragError('');
    try {
      await clientApi.patch(`/api/leads/${leadId}`, { stage: targetStage });
      router.refresh();
    } catch (err) {
      setDragError(err instanceof ClientApiError ? err.message : 'Could not move this lead.');
    }
  }

  return (
    <div className="space-y-6">
      <QueueCard queue={queue} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone…" className="h-9 pl-8" />
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          <UserPlus className="size-4" /> Add lead
        </Button>
      </div>

      {adding && <AddLeadForm onClose={() => setAdding(false)} />}

      {dragError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <span>{dragError}</span>
          <button type="button" onClick={() => setDragError('')} className="text-xs underline underline-offset-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Kanban board — one column per board stage */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-4">
          {BOARD_STAGES.map((s) => {
            const items = byStage[s];
            return (
              <div
                key={s}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(s, e)}
                className="flex w-[248px] flex-none flex-col rounded-2xl bg-muted/50 p-2.5"
              >
                <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
                  <span className={`size-2.5 rounded-full ${COLUMN_DOT[s]}`} />
                  <span className="font-heading text-sm font-bold tracking-tight">{labelize(s)}</span>
                  <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-0.5">
                  {items.map((l) => {
                    const locked = isTerminal(l.stage);
                    return (
                      <Link
                        key={l.id}
                        href={`/counselor/leads/${l.id}`}
                        draggable={!locked}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', l.id);
                          setDraggingId(l.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className={`group block rounded-xl border border-border/70 bg-card p-3 shadow-[0_1px_2px_rgba(31,28,43,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(31,28,43,0.4)] ${
                          locked ? 'cursor-default opacity-70' : 'cursor-grab active:cursor-grabbing'
                        } ${draggingId === l.id ? 'opacity-40' : ''}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium leading-tight group-hover:text-primary">{l.fullName}</span>
                          {locked && <Lock className="size-3 shrink-0 text-muted-foreground" aria-label="Locked — cannot be moved" />}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                          <Phone className="size-3" /> {l.phone}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="rounded-md bg-muted px-1.5 py-0.5">{labelize(l.source)}</span>
                          <span>{l.lastContactedAt ? formatDate(l.lastContactedAt) : 'new'}</span>
                        </div>
                      </Link>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border/60 py-6 text-center text-xs text-muted-foreground">
                      empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AddLeadForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState<BoardStage>('contacted');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await clientApi.post('/api/leads', { fullName: fullName.trim(), phone: normalizePhone(phone), stage });
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not add the lead.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="l-name" className="text-xs">Full name</Label>
            <Input id="l-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus className="w-48" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="l-phone" className="text-xs">Phone</Label>
            <Input
              id="l-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              required
              className="w-44"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="l-stage" className="text-xs">Category</Label>
            <Select id="l-stage" value={stage} onChange={(e) => setStage(e.target.value as BoardStage)} className="w-36">
              {BOARD_STAGES.map((s) => (
                <option key={s} value={s}>
                  {labelize(s)}
                </option>
              ))}
            </Select>
          </div>
          {error && <p className="w-full text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={busy || !fullName.trim() || !phone.trim()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function QueueCard({ queue }: { queue: QueueToday }) {
  const router = useRouter();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const pending = queue.dueFollowUps.filter((f) => !done.has(f.id));

  async function complete(id: string) {
    setBusy(id);
    try {
      await clientApi.patch(`/api/follow-ups/${id}/complete`);
      setDone((prev) => new Set(prev).add(id));
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }

  if (pending.length === 0 && queue.newLeads.length === 0) return null;

  return (
    <Card className="ring-1 ring-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Today&rsquo;s queue</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Follow-ups due ({pending.length})
          </p>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">All caught up.</p>
          ) : (
            <ul className="space-y-1.5">
              {pending.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/counselor/leads/${f.lead.id}`} className="min-w-0 truncate hover:text-primary">
                    {f.lead.fullName}
                    {f.note ? <span className="text-muted-foreground"> — {f.note}</span> : null}
                  </Link>
                  <Button size="xs" variant="ghost" onClick={() => complete(f.id)} disabled={busy === f.id}>
                    {busy === f.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                    Done
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            New leads ({queue.newLeads.length})
          </p>
          {queue.newLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">None waiting.</p>
          ) : (
            <ul className="space-y-1.5">
              {queue.newLeads.slice(0, 6).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/counselor/leads/${l.id}`} className="min-w-0 truncate hover:text-primary">
                    {l.fullName}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="size-3" /> {l.phone}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
