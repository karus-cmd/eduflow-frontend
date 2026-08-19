import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarClock, Mail, MessageSquare, Phone } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadInteractions, CompleteFollowUpButton } from '@/components/lead-interactions';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { COUNSELOR_NAV } from '@/lib/nav';
import { labelize, stageBadge } from '@/lib/crm';
import { formatDate, formatDateTime } from '@/lib/format';
import type { Conversation, FollowUp, LeadDetail } from '@/lib/api/types';

type TimelineItem =
  | { kind: 'conversation'; at: string; data: Conversation }
  | { kind: 'followup'; at: string; data: FollowUp };

export default async function LeadDetailPage(props: PageProps<'/counselor/leads/[id]'>) {
  const { id } = await props.params;
  const me = await requireRole(['counselor', 'team_lead']);

  let lead: LeadDetail;
  try {
    lead = await serverApi<LeadDetail>(`/leads/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }

  const timeline: TimelineItem[] = [
    ...lead.timeline.conversations.map((c) => ({ kind: 'conversation' as const, at: c.occurredAt, data: c })),
    ...lead.timeline.followUps.map((f) => ({ kind: 'followup' as const, at: f.dueAt, data: f })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <AppShell title="Lead" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
      <Link href="/counselor/leads" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to leads
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.fullName}</h1>
            <Badge variant={stageBadge(lead.stage)} className="capitalize">
              {labelize(lead.stage)}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-4" /> {lead.phone}
            </span>
            {lead.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-4" /> {lead.email}
              </span>
            )}
            <span>Source: {labelize(lead.source)}</span>
            {lead.nextFollowUpAt && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" /> Next: {formatDateTime(lead.nextFollowUpAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet — log the first conversation.</p>
            ) : (
              <ol className="relative space-y-5 border-l pl-5">
                {timeline.map((item) =>
                  item.kind === 'conversation' ? (
                    <li key={`c-${item.data.id}`} className="relative">
                      <span className="absolute -left-[26px] top-1 flex size-4 items-center justify-center rounded-full bg-primary/15 text-primary ring-4 ring-background">
                        <MessageSquare className="size-2.5" />
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium capitalize">{labelize(item.data.disposition)}</span>
                        <Badge variant="outline" className="capitalize">
                          {labelize(item.data.channel)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDateTime(item.data.occurredAt)}</span>
                      </div>
                      {item.data.notes && <p className="mt-1 text-sm text-muted-foreground">{item.data.notes}</p>}
                    </li>
                  ) : (
                    <li key={`f-${item.data.id}`} className="relative">
                      <span className="absolute -left-[26px] top-1 flex size-4 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 ring-4 ring-background dark:text-amber-500">
                        <CalendarClock className="size-2.5" />
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">Follow-up</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(item.data.dueAt)}</span>
                          {item.data.completedAt ? (
                            <Badge variant="secondary">Completed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                        {!item.data.completedAt && <CompleteFollowUpButton id={item.data.id} />}
                      </div>
                      {item.data.note && <p className="mt-1 text-sm text-muted-foreground">{item.data.note}</p>}
                    </li>
                  ),
                )}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Interactions */}
        <aside>
          <LeadInteractions leadId={lead.id} />
        </aside>
      </div>
    </AppShell>
  );
}
