import Link from 'next/link';

/**
 * Page-scoped footer.
 *
 * It previously rendered four columns of link labels — About, Careers, Blog,
 * Help center, Terms, Privacy, Refund policy and more — as plain <span>s,
 * because none of those pages exist. Fourteen dead affordances on the page a
 * student reaches just before paying is the opposite of trustworthy, so this
 * now lists only destinations that are real, and every one of them is a link.
 *
 * Terms / Privacy / Refund genuinely need to exist before taking money at
 * scale; they belong here the moment those pages are written, not before.
 */

const LINKS: { label: string; href: string }[] = [
  { label: 'Browse courses', href: '/student/browse' },
  { label: 'My Learning', href: '/student' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Questions', href: '/#faq' },
];

export function SiteFooter() {
  return (
    <footer className="mt-3 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-8">
        <div>
          <div className="flex items-center gap-2 font-heading text-base font-extrabold tracking-tight">
            <span className="grid size-6 place-items-center rounded-lg bg-primary text-primary-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
              </svg>
            </span>
            STEIN-X
          </div>
          <p className="mt-2.5 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
            Two tracks for engineering roles: DSA patterns and machine learning.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-7 gap-y-2.5 text-[13.5px]" aria-label="Footer">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-[12.5px] text-muted-foreground">
          <span>&copy; 2026 STEIN-X</span>
          <span>Made for people who show up.</span>
        </div>
      </div>
    </footer>
  );
}
