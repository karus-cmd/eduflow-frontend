import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/logout-button';
import { ShellNav, type NavLink } from '@/components/shell-nav';

export function AppShell({
  title,
  user,
  nav,
  homeHref = '/',
  children,
}: {
  title: string;
  user: { fullName: string; role: string };
  /** Optional secondary nav (e.g. the student's My Learning / Browse / Profile). */
  nav?: NavLink[];
  /** Where the "EduFlow" wordmark links to (defaults to root, which bounces to the role home). */
  homeHref?: string;
  children: ReactNode;
}) {
  const initial = user.fullName.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="min-h-screen bg-background [background-image:radial-gradient(color-mix(in_oklch,var(--foreground)_5%,transparent)_1px,transparent_1px)] [background-size:26px_26px]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-baseline gap-3">
            <Link href={homeHref} className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight">
              <span className="grid size-6 -rotate-6 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_2px_0_var(--azure-deep,#1a37b8),0_5px_12px_-4px_color-mix(in_oklch,var(--primary)_55%,transparent)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                </svg>
              </span>
              EduFlow
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="max-w-[10rem] truncate text-sm font-medium">{user.fullName}</div>
              <Badge variant="secondary" className="mt-0.5 capitalize">
                {user.role}
              </Badge>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-primary/12 font-heading text-sm font-bold text-primary">
              {initial}
            </span>
            <LogoutButton />
          </div>
        </div>
        {nav && nav.length > 0 && (
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ShellNav links={nav} />
          </div>
        )}
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
