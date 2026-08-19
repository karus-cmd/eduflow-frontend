'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  FileText,
  Lock,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/video-player';
import { clientApi } from '@/lib/client-api';
import { formatDuration } from '@/lib/format';
import { formatPct } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { Enrollment, LessonNode, ResourceItem, SectionNode } from '@/lib/api/types';

interface FlatLesson {
  lesson: LessonNode;
  sectionId: string;
  index: number;
}

export function CoursePlayer({
  courseId,
  courseTitle,
  sections,
  courseResources,
  enrolled,
  initialLessonId,
  initialProgressPct,
  totalLessons,
  initialCompletedLessonIds = [],
  lastPositions = {},
}: {
  courseId: string;
  courseTitle: string;
  sections: SectionNode[];
  courseResources: ResourceItem[];
  enrolled: boolean;
  initialLessonId: string | null;
  initialProgressPct: number;
  totalLessons: number;
  /** Lessons already completed (from GET /me/courses/:id/progress) — keeps checkmarks on reload. */
  initialCompletedLessonIds?: string[];
  /** Per-lesson last watched position (seconds) for resume. */
  lastPositions?: Record<string, number>;
}) {
  const flat = useMemo<FlatLesson[]>(() => {
    const out: FlatLesson[] = [];
    let i = 0;
    for (const s of sections) for (const l of s.lessons) out.push({ lesson: l, sectionId: s.id, index: i++ });
    return out;
  }, [sections]);

  const firstPlayable = flat.find((f) => !f.lesson.locked) ?? flat[0];
  const [currentId, setCurrentId] = useState<string | null>(
    initialLessonId ?? firstPlayable?.lesson.id ?? null,
  );
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(initialCompletedLessonIds));
  const [progressPct, setProgressPct] = useState(initialProgressPct);
  const [marking, setMarking] = useState(false);

  const current = flat.find((f) => f.lesson.id === currentId) ?? firstPlayable ?? null;
  const currentLesson = current?.lesson ?? null;

  const select = useCallback(
    (lesson: LessonNode) => {
      if (lesson.locked) return;
      setCurrentId(lesson.id);
      window.history.replaceState(null, '', `/student/learn/${courseId}?lesson=${lesson.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [courseId],
  );

  const refreshProgress = useCallback(async () => {
    try {
      const rows = await clientApi.get<Enrollment[]>('/api/me/enrollments');
      const mine = rows.find((r) => r.courseId === courseId);
      if (mine) setProgressPct(formatPct(mine.progressPct));
    } catch {
      /* non-fatal */
    }
  }, [courseId]);

  // Throttled progress ping from the player; backend auto-completes at ≥90%.
  const reportProgress = useCallback(
    async (watchedSec: number, positionSec: number) => {
      if (!enrolled || !currentLesson) return;
      try {
        const r = await clientApi.post<{ isCompleted: boolean }>(
          `/api/lessons/${currentLesson.id}/progress`,
          { watchedSec, lastPositionSec: positionSec },
        );
        if (r.isCompleted) {
          setCompleted((prev) => new Set(prev).add(currentLesson.id));
          refreshProgress();
        }
      } catch {
        /* non-fatal — the next tick retries */
      }
    },
    [enrolled, currentLesson, refreshProgress],
  );

  async function markComplete() {
    if (!currentLesson) return;
    setMarking(true);
    try {
      await clientApi.post(`/api/lessons/${currentLesson.id}/complete`);
      setCompleted((prev) => new Set(prev).add(currentLesson.id));
      await refreshProgress();
    } catch {
      /* surfaced via disabled state resetting */
    } finally {
      setMarking(false);
    }
  }

  const prev = current && current.index > 0 ? flat[current.index - 1] : null;
  const next = current && current.index < flat.length - 1 ? flat[current.index + 1] : null;
  const isDone = currentLesson ? completed.has(currentLesson.id) : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* Main */}
      <div className="min-w-0">
        <div className="mb-4">
          <Link
            href={`/student/courses/${courseId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {courseTitle}
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={progressPct} className="h-1.5" />
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{progressPct}%</span>
          </div>
        </div>

        {currentLesson ? (
          <>
            {currentLesson.locked ? (
              <LockedPanel courseId={courseId} />
            ) : currentLesson.videoAssetId ? (
              <VideoPlayer
                lessonId={currentLesson.id}
                title={currentLesson.title}
                onProgress={reportProgress}
                startPositionSec={lastPositions[currentLesson.id] ?? 0}
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-xl border bg-muted/40 text-center text-sm text-muted-foreground">
                <div>
                  <FileText className="mx-auto mb-2 size-8" />
                  This is a reading lesson — no video.
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight">{currentLesson.title}</h1>
                {currentLesson.durationSec > 0 && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatDuration(currentLesson.durationSec)}
                  </p>
                )}
              </div>
              {enrolled && !currentLesson.locked && (
                <Button onClick={markComplete} disabled={marking || isDone} variant={isDone ? 'secondary' : 'default'}>
                  {marking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isDone ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Circle className="size-4" />
                  )}
                  {isDone ? 'Completed' : 'Mark as complete'}
                </Button>
              )}
            </div>

            {currentLesson.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {currentLesson.description}
              </p>
            )}
            {currentLesson.contentHtml && (
              <div
                className="mt-4 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:mt-4 [&_h2]:font-medium [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: currentLesson.contentHtml }}
              />
            )}

            {currentLesson.resources.length > 0 && (
              <ResourceList title="Lesson resources" resources={currentLesson.resources} />
            )}

            {/* Prev / Next */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t pt-4">
              {prev && !prev.lesson.locked ? (
                <button
                  onClick={() => select(prev.lesson)}
                  className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="size-4 shrink-0" />
                  <span className="truncate">{prev.lesson.title}</span>
                </button>
              ) : (
                <span />
              )}
              {next && !next.lesson.locked ? (
                <button
                  onClick={() => select(next.lesson)}
                  className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium hover:text-primary"
                >
                  <span className="truncate">{next.lesson.title}</span>
                  <ChevronRight className="size-4 shrink-0" />
                </button>
              ) : (
                <span />
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            This course has no lessons yet.
          </div>
        )}

        {courseResources.length > 0 && (
          <ResourceList title="Course resources" resources={courseResources} />
        )}
      </div>

      {/* Curriculum sidebar */}
      <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Course content</h2>
            <p className="text-xs text-muted-foreground">
              {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
            </p>
          </div>
          <div className="divide-y">
            {sections.map((section, i) => (
              <details key={section.id} open={i === 0 || section.lessons.some((l) => l.id === currentId)} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium hover:bg-muted/50">
                  <span className="truncate">{section.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{section.lessons.length}</span>
                </summary>
                <ul>
                  {section.lessons.map((l) => {
                    const isCurrent = l.id === currentId;
                    const done = completed.has(l.id);
                    return (
                      <li key={l.id}>
                        <button
                          disabled={l.locked}
                          onClick={() => select(l)}
                          className={cn(
                            'flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors',
                            isCurrent ? 'bg-primary/10 font-medium' : 'hover:bg-muted/50',
                            l.locked && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          {l.locked ? (
                            <Lock className="size-4 shrink-0 text-muted-foreground" />
                          ) : done ? (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                          ) : (
                            <PlayCircle className={cn('size-4 shrink-0', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                          )}
                          <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          {l.isFreePreview && !enrolled && (
                            <Badge variant="secondary" className="shrink-0">
                              Free
                            </Badge>
                          )}
                          {l.durationSec > 0 && (
                            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                              {formatDuration(l.durationSec)}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function LockedPanel({ courseId }: { courseId: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border bg-muted/40 text-center">
      <Lock className="size-9 text-muted-foreground" />
      <div>
        <p className="font-medium">This lesson is locked</p>
        <p className="mt-1 text-sm text-muted-foreground">Enrol in the course to unlock all lessons.</p>
      </div>
      <Link href={`/student/checkout/${courseId}`} className={cn(buttonVariants({ size: 'sm' }))}>
        Enrol now
      </Link>
    </div>
  );
}

/** Resource rows with a click-to-fetch signed download (video/attachments alike). */
function ResourceList({ title, resources }: { title: string; resources: ResourceItem[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function download(r: ResourceItem) {
    if (r.type === 'link') {
      window.open(r.url, '_blank', 'noopener');
      return;
    }
    setBusyId(r.id);
    try {
      const res = await clientApi.get<{ url?: string; downloadUrl?: string }>(
        `/api/resources/${r.id}/download`,
      );
      const url = res.downloadUrl ?? res.url;
      if (url) window.open(url, '_blank', 'noopener');
    } catch {
      /* ignore */
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <ul className="divide-y rounded-lg border">
        {resources.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{r.title}</span>
              <span className="shrink-0 text-xs uppercase text-muted-foreground">{r.type}</span>
            </span>
            {r.isDownloadable || r.type === 'link' ? (
              <button
                onClick={() => download(r)}
                disabled={busyId === r.id}
                className="inline-flex shrink-0 items-center gap-1 text-primary hover:underline disabled:opacity-50"
              >
                {busyId === r.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                {r.type === 'link' ? 'Open' : 'Download'}
              </button>
            ) : (
              <span className="shrink-0 text-xs text-muted-foreground">Not downloadable</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
