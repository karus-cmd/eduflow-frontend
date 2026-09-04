'use client';

import { useRef, useState } from 'react';
import { ArrowRight, Brain, ChevronLeft, ChevronRight, Code2, FileCheck2, MessageCircle, Mic, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Slide {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  icon: React.ReactNode;
  bg: string; // gradient classes, real brand tokens only
  iconWrap: string;
  ctaClass: string;
}

// Sample editorial tracks — not backed by real courses/enrollments yet, unlike the grid below.
const SLIDES: Slide[] = [
  {
    eyebrow: 'Live practice',
    title: 'AI Mock Interview',
    subtitle: 'Practice live with an AI interviewer and get instant, honest feedback on every answer.',
    cta: 'Start a session',
    icon: <MessageCircle className="size-16" strokeWidth={1.5} />,
    bg: 'from-primary/30 via-primary/10',
    iconWrap: 'bg-primary/20 text-primary',
    ctaClass: 'bg-primary text-primary-foreground',
  },
  {
    eyebrow: '1:1 review',
    title: 'Resume Building Session',
    subtitle: 'A recruiter-eye review plus ATS-ready templates that actually get opened.',
    cta: 'Book a slot',
    icon: <FileCheck2 className="size-16" strokeWidth={1.5} />,
    bg: 'from-coral/30 via-coral/10',
    iconWrap: 'bg-coral/22 text-coral',
    ctaClass: 'bg-coral text-white',
  },
  {
    eyebrow: 'Interview-grade',
    title: 'DSA & ML Algorithms',
    subtitle: 'Problem sets and algorithm walkthroughs, start to finish, at real interview difficulty.',
    cta: 'Explore problems',
    icon: <Code2 className="size-16" strokeWidth={1.5} />,
    bg: 'from-lime/35 via-lime/10',
    iconWrap: 'bg-lime/32 text-[var(--azure-deep)]',
    ctaClass: 'bg-[var(--azure-deep)] text-white',
  },
  {
    eyebrow: 'Crash course',
    title: 'System Design Essentials',
    subtitle: 'Scalability, databases, caching, and the diagrams that win system-design rounds.',
    cta: 'See the roadmap',
    icon: <Brain className="size-16" strokeWidth={1.5} />,
    bg: 'from-[var(--chart-4)]/35 via-[var(--chart-4)]/10',
    iconWrap: 'bg-[var(--chart-4)]/28 text-[color-mix(in_oklch,var(--chart-4)_65%,black)]',
    ctaClass: 'bg-[var(--chart-4)] text-foreground',
  },
  {
    eyebrow: 'Group practice',
    title: 'Aptitude & Group Discussion',
    subtitle: 'Timed quant drills plus live GD rounds with peers, moderated and scored.',
    cta: 'Join a round',
    icon: <Users className="size-16" strokeWidth={1.5} />,
    bg: 'from-primary/25 via-coral/10',
    iconWrap: 'bg-primary/18 text-primary',
    ctaClass: 'bg-primary text-primary-foreground',
  },
  {
    eyebrow: 'STAR method',
    title: 'Behavioral Interview Prep',
    subtitle: 'Structure your best stories so they land — with a coach who’s heard every answer.',
    cta: 'Build your stories',
    icon: <Mic className="size-16" strokeWidth={1.5} />,
    bg: 'from-coral/25 via-lime/10',
    iconWrap: 'bg-coral/20 text-coral',
    ctaClass: 'bg-coral text-white',
  },
];

export function SpotlightCarousel() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(i: number) {
    const row = rowRef.current;
    if (!row) return;
    row.scrollTo({ left: i * row.clientWidth, behavior: 'smooth' });
  }

  function step(dir: 1 | -1) {
    scrollToIndex(Math.min(SLIDES.length - 1, Math.max(0, active + dir)));
  }

  function onScroll() {
    const row = rowRef.current;
    if (!row || row.clientWidth === 0) return;
    setActive(Math.round(row.scrollLeft / row.clientWidth));
  }

  return (
    <div className="mb-8">
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-heading text-[19px] font-bold tracking-tight">Beyond the syllabus</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Interview-ready extras, whenever you&rsquo;re ready for them</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={active === 0}
            className="grid size-9 place-items-center rounded-full border border-border bg-background transition hover:scale-105 hover:bg-card disabled:pointer-events-none disabled:opacity-30"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4.5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={active === SLIDES.length - 1}
            className="grid size-9 place-items-center rounded-full border border-border bg-background transition hover:scale-105 hover:bg-card disabled:pointer-events-none disabled:opacity-30"
            aria-label="Next"
          >
            <ChevronRight className="size-4.5" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[26px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((s) => (
          <div key={s.title} className="w-full shrink-0 snap-center snap-always">
            <div className={cn('relative flex h-[320px] items-center gap-8 overflow-hidden bg-card bg-gradient-to-br to-card to-70% px-12', s.bg)}>
              <div className="relative z-10 max-w-[460px]">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{s.eyebrow}</span>
                <h3 className="mt-2 font-heading text-[32px] font-extrabold leading-[1.08] tracking-tight">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.subtitle}</p>
                <span className={cn('mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold', s.ctaClass)}>
                  {s.cta}
                  <ArrowRight className="size-4" />
                </span>
              </div>
              <span className={cn('absolute -right-6 top-1/2 grid size-56 -translate-y-1/2 place-items-center rounded-full', s.iconWrap)}>
                {s.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to ${s.title}`}
            className={cn('h-1.5 rounded-full transition-all', i === active ? 'w-6 bg-primary' : 'w-1.5 bg-border')}
          />
        ))}
      </div>
    </div>
  );
}
