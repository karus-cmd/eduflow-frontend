import Link from 'next/link';
import { ChevronDown, Lock, PlayCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/format';
import type { SectionNode } from '@/lib/api/types';

/**
 * The course syllabus as native <details> accordions (no JS, works on the server and on mobile).
 * Free-preview lessons link into the player; locked lessons show a lock. `courseId` targets the
 * player; `interactive` makes unlocked lessons clickable (used on the enrolled/player side).
 */
export function SyllabusTree({
  sections,
  courseId,
  interactive = false,
  currentLessonId,
}: {
  sections: SectionNode[];
  courseId: string;
  interactive?: boolean;
  currentLessonId?: string;
}) {
  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">The syllabus for this course is being prepared.</p>;
  }

  return (
    <div className="divide-y rounded-xl border">
      {sections.map((section, i) => {
        const total = section.lessons.length;
        const dur = section.lessons.reduce((a, l) => a + l.durationSec, 0);
        return (
          <details key={section.id} open={i === 0} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                <span className="font-medium">{section.title}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {total} {total === 1 ? 'lesson' : 'lessons'}
                {dur > 0 && <> · {formatDuration(dur)}</>}
              </span>
            </summary>
            <ul className="border-t bg-muted/20">
              {section.lessons.map((l) => {
                const playable = interactive ? !l.locked : l.isFreePreview;
                const isCurrent = currentLessonId === l.id;
                const inner = (
                  <div
                    className={
                      'flex items-center justify-between gap-3 px-4 py-2.5 text-sm ' +
                      (isCurrent ? 'bg-primary/10' : playable ? 'hover:bg-muted/60' : '')
                    }
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {l.locked && !playable ? (
                        <Lock className="size-4 shrink-0 text-muted-foreground" />
                      ) : l.videoAssetId || playable ? (
                        <PlayCircle className="size-4 shrink-0 text-primary" />
                      ) : (
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={'truncate ' + (l.locked && !playable ? 'text-muted-foreground' : '')}>
                        {l.title}
                      </span>
                      {l.isFreePreview && (
                        <Badge variant="secondary" className="shrink-0">
                          Free preview
                        </Badge>
                      )}
                    </div>
                    {l.durationSec > 0 && (
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatDuration(l.durationSec)}
                      </span>
                    )}
                  </div>
                );
                return (
                  <li key={l.id}>
                    {playable ? (
                      <Link href={`/student/learn/${courseId}?lesson=${l.id}`} className="block">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
              {total === 0 && (
                <li className="px-4 py-2.5 text-sm text-muted-foreground">No lessons in this section yet.</li>
              )}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
