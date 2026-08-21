import { Skeleton } from '@/components/ui/skeleton';

/**
 * A full-page loading placeholder that mirrors the AppShell chrome and a dashboard's KPI row.
 * Rendered by route-level `loading.tsx` files while a Server Component fetches, so the transition
 * reads as "loading" rather than a blank flash.
 */
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="min-h-screen bg-background [background-image:radial-gradient(color-mix(in_oklch,var(--foreground)_5%,transparent)_1px,transparent_1px)] [background-size:26px_26px]"
      aria-hidden
    >
      <header className="border-b border-border/70 bg-background/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          <Skeleton className="h-6 w-28 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-5 px-4 py-2.5 sm:px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16 rounded" />
          ))}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-9 w-64 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
