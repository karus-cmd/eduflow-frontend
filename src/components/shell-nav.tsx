'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavLink {
  href: string;
  label: string;
}

/** A single-segment href (e.g. `/admin`) is a section index: it must match exactly, or it would
 *  stay highlighted on every child route (`/admin/managers` etc.). Deeper hrefs prefix-match. */
function isActive(pathname: string, href: string): boolean {
  const isIndex = href.split('/').filter(Boolean).length <= 1;
  return isIndex ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** The app-shell's secondary nav. Highlights the section that contains the current path. */
export function ShellNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="-mb-px flex gap-1 overflow-x-auto">
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
