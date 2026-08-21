'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Phone, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientApi } from '@/lib/client-api';
import { LEAD_STAGES, labelize } from '@/lib/crm';
import { formatDate } from '@/lib/format';
import type { Lead, QueueToday } from '@/lib/api/types';

// a colour per pipeline column, cycling the brand ramp (identity, not status)
const COLUMN_DOT = ['bg-primary', 'bg-coral', 'bg-lime', 'bg-foreground', 'bg-primary', 'bg-coral', 'bg-lime'];

export function LeadsPipeline({ leads, queue }: { leads: Lead[]; queue: QueueToday }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((l) => l.fullName.toLowerCase().includes(needle) || l.phone.includes(needle));
  }, [leads, q]);

  const byStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const s of LEAD_STAGES) map[s] = [];
    for (const l of filtered) (map[l.stage] ??= []).push(l);
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <QueueCard queue={queue} />

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone…" className="h-9 pl-8" />
      </div>

      {/* Kanban board — one column per pipeline stage */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-4">
          {LEAD_STAGES.map((s, i) => {
            const items = byStage[s] ?? [];
            return (
              <div key={s} className="flex w-[248px] flex-none flex-col rounded-2xl bg-muted/50 p-2.5">
                <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
                  <span className={`size-2.5 rounded-full ${COLUMN_DOT[i % COLUMN_DOT.length]}`} />
                  <span className="font-heading text-sm font-bold tracking-tight">{labelize(s)}</span>
                  <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((l) => (
                    <Link
                      key={l.id}
                      href={`/counselor/leads/${l.id}`}
                      className="group block rounded-xl border border-border/70 bg-card p-3 shadow-[0_1px_2px_rgba(31,28,43,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(31,28,43,0.4)]"
                    >
                      <div className="font-medium leading-tight group-hover:text-primary">{l.fullName}</div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <Phone className="size-3" /> {l.phone}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="rounded-md bg-muted px-1.5 py-0.5">{labelize(l.source)}</span>
                        <span>{l.lastContactedAt ? formatDate(l.lastContactedAt) : 'new'}</span>
                      </div>
                    </Link>
                  ))}
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
