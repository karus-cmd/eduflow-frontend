import { Mail, MessageCircle, Zap } from 'lucide-react';

const COLUMNS: { heading: string; items: string[] }[] = [
  { heading: 'Explore', items: ['Browse courses', 'My Learning', 'Live classes', 'Pricing'] },
  { heading: 'Company', items: ['About STEIN-X', 'Careers', 'Blog'] },
  { heading: 'Support', items: ['Help center', 'Contact us', 'FAQs'] },
  { heading: 'Legal', items: ['Terms of service', 'Privacy policy', 'Refund policy'] },
];

/** A page-scoped footer (not app-wide yet — rendered only where asked for). Link labels are
 *  real navigation intent, not wired to routes yet since most of those pages don't exist. */
export function SiteFooter() {
  return (
    <footer className="mt-3 bg-foreground text-background/90">
      <div className="mx-auto grid max-w-6xl grid-cols-[1.4fr_repeat(4,1fr)] gap-8 px-6 pb-7 pt-12 max-md:grid-cols-2 max-sm:grid-cols-1">
        <div>
          <div className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight text-background">
            <span className="grid size-6 -rotate-6 place-items-center rounded-lg bg-primary text-primary-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
              </svg>
            </span>
            STEIN-X
          </div>
          <p className="mt-3 max-w-[260px] text-[13.5px] leading-relaxed text-background/65">
            Interview prep and skill courses, built for people who want to actually get hired.
          </p>
          <div className="mt-4.5 flex gap-2">
            <span className="grid size-[34px] place-items-center rounded-full bg-background/12 text-background">
              <Mail className="size-[15px]" />
            </span>
            <span className="grid size-[34px] place-items-center rounded-full bg-background/12 text-background">
              <MessageCircle className="size-[15px]" />
            </span>
            <span className="grid size-[34px] place-items-center rounded-full bg-background/12 text-background">
              <Zap className="size-[15px]" />
            </span>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wide text-background/55">{col.heading}</h4>
            <div className="flex flex-col gap-2.5 text-[13.5px]">
              {col.items.map((item) => (
                <span key={item} className="text-background/82">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-background/14">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4.5 text-[12.5px] text-background/55">
          <span>&copy; 2026 STEIN-X. All rights reserved.</span>
          <span>Made for learners who show up.</span>
        </div>
      </div>
    </footer>
  );
}
