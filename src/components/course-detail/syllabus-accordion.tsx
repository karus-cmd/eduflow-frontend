'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Lock, PlayCircle } from 'lucide-react';
import styles from './syllabus-accordion.module.css';
import { formatDuration } from '@/lib/format';
import type { SectionNode } from '@/lib/api/types';

/**
 * The course syllabus, bespoke visual language for the new detail page (real precedent for the
 * gating logic — `locked`/`isFreePreview`/duration-zero guard — is syllabus-tree.tsx, but this is
 * a fresh component, not a reuse, per the design brief). Pre-enrollment context: only free-preview
 * lessons link into the player, same as the plainer page's default (non-`interactive`) behavior.
 */
export function SyllabusAccordion({ sections, courseId }: { sections: SectionNode[]; courseId: string }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(sections[0] ? [sections[0].id] : []));

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (sections.length === 0) {
    return <p className={styles.empty}>The syllabus for this course is being prepared.</p>;
  }

  return (
    <div className={styles.list}>
      {sections.map((section) => {
        const isOpen = open.has(section.id);
        const total = section.lessons.length;
        const dur = section.lessons.reduce((a, l) => a + l.durationSec, 0);
        const panelId = `syllabus-panel-${section.id}`;
        return (
          <div key={section.id} className={styles.section}>
            <button
              type="button"
              className={styles.summary}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(section.id)}
            >
              <ChevronDown className={styles.chevron} data-open={isOpen} size={16} />
              <span className={styles.sectionTitle}>{section.title}</span>
              <span className={styles.sectionMeta}>
                {total} {total === 1 ? 'lesson' : 'lessons'}
                {dur > 0 && <> · {formatDuration(dur)}</>}
              </span>
            </button>

            {isOpen && (
              <ul id={panelId} className={styles.lessons}>
                {section.lessons.map((l) => {
                  const playable = l.isFreePreview;
                  const locked = l.locked && !playable;
                  const row = (
                    <div className={styles.lessonRow}>
                      <span className={styles.lessonState} data-playable={playable}>
                        {locked ? <Lock size={15} /> : <PlayCircle size={15} />}
                      </span>
                      <span className={styles.lessonTitle} data-locked={locked}>
                        {l.title}
                      </span>
                      {l.isFreePreview && <span className={styles.previewBadge}>Free preview</span>}
                      {l.durationSec > 0 && (
                        <span className={styles.lessonDuration}>{formatDuration(l.durationSec)}</span>
                      )}
                    </div>
                  );
                  return (
                    <li key={l.id}>
                      {playable ? (
                        <Link href={`/student/learn/${courseId}?lesson=${l.id}`} className={styles.lessonLink}>
                          {row}
                        </Link>
                      ) : (
                        row
                      )}
                    </li>
                  );
                })}
                {total === 0 && <li className={styles.emptyLesson}>No lessons in this section yet.</li>}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
