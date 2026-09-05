import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ActivityHeartbeat } from '@/components/activity-heartbeat';
import { LogoutButton } from '@/components/logout-button';
import { ParticlesBackground } from '@/components/particles-background';
import { ShellNav, type NavLink } from '@/components/shell-nav';

export function AppShell({
  title,
  user,
  nav,
  homeHref = '/',
  backgroundLayer = <ParticlesBackground />,
  children,
}: {
  title: string;
  user: { fullName: string; role: string; employeeCode?: string | null };
  /** Optional secondary nav (e.g. the student's My Learning / Browse / Profile). */
  nav?: NavLink[];
  /** Where the "STEIN-X" wordmark links to (defaults to root, which bounces to the role home). */
  homeHref?: string;
  /**
   * A decorative layer (the ambient particle field, by default) rendered between this shell's own
   * opaque background and its real header/main content — every role's every page gets it for
   * free. Without this slot there's nowhere safe to put one: this wrapper's own `bg-background`
   * already paints across virtually the whole page, so anything mounted outside AppShell sits
   * fully behind it with no gap to show through — the actual bug the first attempt at this ran
   * into. Pass `backgroundLayer={null}` to opt a specific page out.
   */
  backgroundLayer?: ReactNode;
  children: ReactNode;
}) {
  const initial = user.fullName.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="relative min-h-screen bg-background [background-image:radial-gradient(color-mix(in_oklch,var(--foreground)_5%,transparent)_1px,transparent_1px)] [background-size:26px_26px]">
      {backgroundLayer}
      <div className="relative z-10">
        <ActivityHeartbeat />
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
                <span className="grid size-6 -rotate-6 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_2px_0_var(--azure-deep,#1E3A8A),0_5px_12px_-4px_color-mix(in_oklch,var(--primary)_55%,transparent)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                  </svg>
                </span>
                STEIN-X
              </Link>
              <span className="hidden text-sm text-muted-foreground sm:inline">{title}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right leading-tight sm:block">
                <div className="max-w-[10rem] truncate text-sm font-medium">{user.fullName}</div>
                {user.employeeCode && (
                  <div className="text-xs text-muted-foreground">{user.employeeCode}</div>
                )}
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
    </div>
  );
}
