import Link from 'next/link';
import { Phone } from 'lucide-react';
import { labelize } from '@/lib/crm';
import { formatDate } from '@/lib/format';
import type { Lead } from '@/lib/api/types';

const BOARD_STAGES = ['contacted', 'interested', 'enrolled', 'junk'] as const;
type BoardStage = (typeof BOARD_STAGES)[number];

const COLUMN_DOT: Record<BoardStage, string> = {
  contacted: 'bg-primary',
  interested: 'bg-coral',
  enrolled: 'bg-lime',
  junk: 'bg-foreground',
};

/**
 * Read-only mirror of the manager's own 4-column leads board (§ leads-pipeline.tsx) — same
 * columns, same visual language, but admin-facing: no drag-and-drop, no add-lead. This is
 * for oversight ("what is this manager doing"), not for admin to edit the pipeline on their
 * behalf — see the plan note on this feature.
 */
export function ManagerLeadsBoard({ leads }: { leads: Lead[] }) {
  const byStage: Record<BoardStage, Lead[]> = { contacted: [], interested: [], enrolled: [], junk: [] };
  for (const l of leads) {
    if ((BOARD_STAGES as readonly string[]).includes(l.stage)) byStage[l.stage as BoardStage].push(l);
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-4">
        {BOARD_STAGES.map((s) => {
          const items = byStage[s];
          return (
            <div key={s} className="flex w-[248px] flex-none flex-col rounded-2xl bg-muted/50 p-2.5">
              <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
                <span className={`size-2.5 rounded-full ${COLUMN_DOT[s]}`} />
                <span className="font-heading text-sm font-bold tracking-tight">{labelize(s)}</span>
                <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-0.5">
                {items.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-xl border border-border/70 bg-card p-3 shadow-[0_1px_2px_rgba(31,28,43,0.04)]"
                  >
                    <div className="font-medium leading-tight">{l.fullName}</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                      <Phone className="size-3" /> {l.phone}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="rounded-md bg-muted px-1.5 py-0.5">{labelize(l.source)}</span>
                      {l.convertedStudentId ? (
                        <Link href={`/admin/users/${l.convertedStudentId}`} className="text-primary hover:underline">
                          Student →
                        </Link>
                      ) : (
                        <span>{l.lastContactedAt ? formatDate(l.lastContactedAt) : 'new'}</span>
                      )}
                    </div>
                  </div>
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
  );
}
