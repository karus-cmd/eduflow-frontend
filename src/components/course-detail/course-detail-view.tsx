import Link from 'next/link';
import styles from './course-detail-view.module.css';
import { StickyEnrollBar } from './sticky-enroll-bar';
import { SyllabusAccordion } from './syllabus-accordion';
import { formatDuration } from '@/lib/format';
import { formatPaise } from '@/lib/money';
import type { Course, CourseDetail, SectionNode } from '@/lib/api/types';

export interface CourseOutcome {
  title: string;
  detail: string;
}

/**
 * Course detail page — warm-paper editorial layout (design handoff). A server component: every
 * value it receives is already derived from real API data in the page (see
 * `src/app/student/courses/[id]/page.tsx`) — nothing here is invented. Only the two interactive
 * islands (the enroll bar and the syllabus accordion) are client components.
 */
export function CourseDetailView({
  course,
  previewCount,
  outcomes,
  projectSection,
  crossSell,
}: {
  course: CourseDetail;
  previewCount: number;
  outcomes: CourseOutcome[];
  /** The section whose title matches /project/i, if this course has one — omitted entirely (no
   *  section, no rail entry) when it doesn't, never a fake "0 projects" placeholder. */
  projectSection: SectionNode | null;
  /** The first other published course, for the "Also on the shelf" cross-sell — omitted when
   *  there isn't one. */
  crossSell: Course | null;
}) {
  const accessDays = course.accessDays ?? 365;
  const goodFit = [
    course.totalDurationSec === 0
      ? 'Comfortable starting text/notes-first — video is still being produced for this course'
      : null,
    previewCount > 0
      ? `Wants to try before buying — ${previewCount} ${previewCount === 1 ? 'lesson is' : 'lessons are'} free to preview`
      : null,
    `Fine committing to a ${accessDays}-day access window rather than an open-ended subscription`,
  ].filter((x): x is string => x != null);

  const notYet = [
    'Expecting graded assignments or instructor feedback along the way',
    'Wants a rating/review history to judge quality before buying',
  ];

  return (
    <div className={styles.shell}>
      <StickyEnrollBar
        course={{
          id: course.id,
          title: course.title,
          pricePaise: course.pricePaise,
          mrpPaise: course.mrpPaise,
          premiumPricePaise: course.premiumPricePaise,
          premiumMrpPaise: course.premiumMrpPaise,
          enrolled: course.enrolled,
          enrolledTier: course.enrolledTier,
        }}
      />

      <div className={styles.hero}>
        <p className={styles.kicker}>
          SELF-PACED · {course.totalLessons} {course.totalLessons === 1 ? 'LESSON' : 'LESSONS'}
        </p>
        <h1 className={styles.title}>{course.title}</h1>
        {course.description && <p className={styles.lede}>{course.description}</p>}

        <dl className={styles.statRule}>
          <Stat label="Lessons" value={String(course.totalLessons)} />
          {course.totalDurationSec > 0 && <Stat label="Video" value={formatDuration(course.totalDurationSec)} />}
          <Stat label="Sections" value={String(course.sections.length)} />
          <Stat label="Access" value={`${accessDays} days`} />
        </dl>
      </div>

      <div className={styles.body}>
        <nav className={styles.indexRail} aria-label="On this page">
          <a href="#syllabus">Syllabus</a>
          <a href="#outcomes">Outcomes</a>
          <a href="#fit">Who it&rsquo;s for</a>
          {projectSection && <a href="#projects">Projects</a>}
          {crossSell && <a href="#more">Also on the shelf</a>}
        </nav>

        <div className={styles.mainCol}>
          <section id="syllabus" className={styles.section}>
            <h2 className={styles.sectionTitle}>Syllabus</h2>
            <SyllabusAccordion sections={course.sections} courseId={course.id} />
          </section>

          <section id="outcomes" className={styles.section}>
            <h2 className={styles.sectionTitle}>What you&rsquo;ll walk away with</h2>
            {outcomes.length > 0 ? (
              <div className={styles.outcomesGrid}>
                {outcomes.map((o) => (
                  <div key={o.title} className={styles.outcomeCard}>
                    <p className={styles.outcomeTitle}>{o.title}</p>
                    {o.detail && <p className={styles.outcomeDetail}>{o.detail}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.outcomeDetail}>The syllabus for this course is being prepared.</p>
            )}
          </section>

          <section id="fit" className={styles.section}>
            <h2 className={styles.sectionTitle}>Who it&rsquo;s for</h2>
            <div className={styles.fitGrid}>
              <div className={styles.fitCard} data-kind="good">
                <p className={styles.fitHeading}>Good fit</p>
                <ul className={styles.fitList}>
                  {goodFit.map((item) => (
                    <li key={item} className={styles.fitItem}>
                      <span className={styles.fitDot} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.fitCard} data-kind="not-yet">
                <p className={styles.fitHeading}>Not yet a fit</p>
                <ul className={styles.fitList}>
                  {notYet.map((item) => (
                    <li key={item} className={styles.fitItem}>
                      <span className={styles.fitDot} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {projectSection && (
            <section id="projects" className={styles.section}>
              <h2 className={styles.sectionTitle}>Projects</h2>
              <ul className={styles.projectList}>
                {projectSection.lessons.map((l, i) => (
                  <li key={l.id} className={styles.projectItem}>
                    <span className={styles.projectIndex}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.projectTitle}>{l.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {crossSell && (
            <section id="more" className={styles.section}>
              <h2 className={styles.sectionTitle}>Also on the shelf</h2>
              <CrossSellTile course={crossSell} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

/** A small bespoke tile (not a reuse of <CourseCard>, whose Tailwind theming would clash with
 *  this page's warm-paper CSS module) — real fields only. */
function CrossSellTile({ course }: { course: Course }) {
  const price = Number(course.pricePaise);
  const mrp = course.mrpPaise == null ? 0 : Number(course.mrpPaise);
  const hasDiscount = mrp > price;
  const initial = course.title.trim().charAt(0).toUpperCase() || '?';

  return (
    <Link href={`/student/courses/${course.id}`} className={styles.crossSellTile}>
      <span className={styles.crossSellThumb}>{initial}</span>
      <div className={styles.crossSellBody}>
        <p className={styles.crossSellTitle}>{course.title}</p>
        <p className={styles.crossSellMeta}>
          {course.totalLessons} {course.totalLessons === 1 ? 'lesson' : 'lessons'}
        </p>
        <div className={styles.crossSellPriceRow}>
          <span className={styles.crossSellPrice}>{price === 0 ? 'Free' : formatPaise(course.pricePaise)}</span>
          {hasDiscount && <span className={styles.crossSellMrp}>{formatPaise(course.mrpPaise)}</span>}
        </div>
      </div>
    </Link>
  );
}
