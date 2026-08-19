'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Loader2, Phone, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientApi } from '@/lib/client-api';
import { LEAD_STAGES, labelize, stageBadge } from '@/lib/crm';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lead, QueueToday } from '@/lib/api/types';

export function LeadsPipeline({ leads, queue }: { leads: Lead[]; queue: QueueToday }) {
  const [stage, setStage] = useState<string>('all');
  const [q, setQ] = useState('');

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.stage] = (c[l.stage] ?? 0) + 1;
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (stage === 'all' || l.stage === stage) &&
        (!needle || l.fullName.toLowerCase().includes(needle) || l.phone.includes(needle)),
    );
  }, [leads, stage, q]);

  return (
    <div className="space-y-6">
      <QueueCard queue={queue} />

      {/* Stage filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={stage === 'all'} onClick={() => setStage('all')} label="All" count={leads.length} />
        {LEAD_STAGES.filter((s) => counts[s]).map((s) => (
          <FilterPill key={s} active={stage === s} onClick={() => setStage(s)} label={labelize(s)} count={counts[s]} />
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone…" className="h-9 pl-8" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Last contacted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link href={`/counselor/leads/${l.id}`} className="block hover:text-primary">
                      {l.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{l.phone}</TableCell>
                  <TableCell>
                    <Badge variant={stageBadge(l.stage)} className="capitalize">
                      {labelize(l.stage)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{labelize(l.source)}</TableCell>
                  <TableCell className="text-muted-foreground">{l.lastContactedAt ? formatDate(l.lastContactedAt) : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/counselor/leads/${l.id}`}>
                      <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No leads {stage === 'all' ? 'yet' : `in “${labelize(stage)}”`}.
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
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'opacity-80' : 'text-muted-foreground')}>{count}</span>
    </button>
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
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Today&rsquo;s queue</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Follow-ups due ({pending.length})
          </p>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">All caught up. 🎉</p>
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
