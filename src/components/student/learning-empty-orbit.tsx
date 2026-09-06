import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface OrbitCourse {
  id: string;
  slug: string;
  title: string;
  initials: string;
  meta: string;
}

const RING_SIZE = 600;
// ~120° apart on the ring — outer wrapper only ever sets a STATIC position; the actual
// counter-rotation lives on the inner link (see globals.css .orbit-chip-inner). Splitting them
// is required: put both on one element and the ring's own rotation composes with it, so the
// chip's translate keeps sliding instead of holding its orbital position.
const CHIP_SLOTS = [
  { top: -36, left: '50%', transform: 'translateX(-50%)' },
  { bottom: 46, left: -72 },
  { bottom: 46, right: -72 },
] as const;

/**
 * "My Learning" empty state (0 enrollments) — three recommended courses slowly orbit an empty
 * core instead of a dashed placeholder box. Real course data, real links; if fewer than 3
 * recommendations exist, only that many chips render (never padded with placeholders).
 */
export function LearningEmptyOrbit({ firstName, courses }: { firstName: string; courses: OrbitCourse[] }) {
  const core = <OrbitCore firstName={firstName} count={courses.length} />;

  return (
    <div>
      {/* Orbit stage — hidden below ~900px in favor of a plain stacked list (an 800px orbit has
          no room to breathe on a phone, and a rotating ring you can't hover to pause is just
          noise). */}
      <div className="hidden justify-center py-8 min-[900px]:flex">
        <div className="relative" style={{ width: RING_SIZE + 260, height: 700 }}>
          {/* static decorative rings */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border"
            style={{ width: 410, height: 410 }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          />
          {/* The two radar-pulse rings and the ring's 26s rotation were removed together: the
              pulse depended on a keyframe that supplied its own centring transform, so without it
              the circles sat off-centre and static, and a ring that spins forever with no input is
              exactly the idle motion this direction rules out. The chips are positioned by
              CHIP_SLOTS, so the layout does not need the animation. */}

          {/* carrier ring + chips */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            {courses.map((c, i) => {
              const slot = CHIP_SLOTS[i];
              if (!slot) return null;
              return (
                <div key={c.id} className="absolute" style={slot}>
                  <OrbitChip course={c} />
                </div>
              );
            })}
          </div>

          {/* core */}
          <div className="absolute left-1/2 top-1/2 w-[340px] -translate-x-1/2 -translate-y-1/2">
            {core}
          </div>
        </div>
      </div>

      {/* Mobile / narrow fallback — same content, no orbit */}
      <div className="flex flex-col items-center gap-8 py-6 text-center min-[900px]:hidden">
        {core}
        {courses.length > 0 && (
          <ul className="flex w-full max-w-sm flex-col gap-3">
            {courses.map((c, i) => (
              <li key={c.id} className="orbit-rise" style={{ animationDelay: `${i * 80}ms` }}>
                <OrbitChip course={c} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function OrbitCore({ firstName, count }: { firstName: string; count: number }) {
  return (
    <div className="orbit-rise text-center">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
        0 tracks active
      </div>
      <h1 className="mt-4 font-heading text-[44px] font-bold leading-[1.05] tracking-[-0.035em]">
        Pick your
        <br />
        first bundle.
      </h1>
      <p className="mt-4 text-base leading-[1.55] text-muted-foreground">
        {count > 0
          ? `${firstName}, ${count === 1 ? 'a track is' : `${count} tracks are`} circling. Lock one in and your streak starts today.`
          : `${firstName}, browse the catalogue and your streak starts the moment you pick one.`}
      </p>
      <Link
        href="/student/browse"
        className="relative mt-6 inline-flex overflow-hidden rounded-md bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-[0_6px_18px_-4px_color-mix(in_oklch,var(--primary)_55%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {/* The sweeping sheen is gone: its keyframe carried the off-screen start position, so
            without it the gradient sat as a permanent white smear across the button. */}
        <span className="relative">Browse courses</span>
      </Link>
    </div>
  );
}

function OrbitChip({ course, className }: { course: OrbitCourse; className?: string }) {
  return (
    <Link
      href={`/student/courses/${course.id}`}
      className={
        'group/chip flex items-center gap-3.5 whitespace-nowrap rounded-lg border border-border bg-card px-5 py-4 text-left shadow-[0_14px_34px_-24px_color-mix(in_oklch,var(--foreground)_28%,transparent)] transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/30 focus-visible:-translate-y-0.5 focus-visible:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' +
        (className ?? '')
      }
    >
      <span
        className="grid size-12 shrink-0 place-items-center rounded-lg border border-border font-heading text-base font-bold text-primary"
        style={{
          background:
            'linear-gradient(140deg, color-mix(in oklch, var(--foreground) 8%, var(--card)), var(--card) 45%, color-mix(in oklch, var(--foreground) 12%, var(--card)))',
        }}
      >
        {course.initials}
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-heading text-base font-bold tracking-[-0.02em]">{course.title}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{course.meta}</span>
      </span>
      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100" />
    </Link>
  );
}
