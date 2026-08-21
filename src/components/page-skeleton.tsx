import { Skeleton } from '@/components/ui/skeleton';

/**
 * A full-page loading placeholder that mirrors the AppShell chrome (header, secondary nav, content).
 * Rendered by route-level `loading.tsx` files while a Server Component fetches its data, so the
 * transition reads as "loading" rather than a blank flash. `rows` controls the body's card count.
 */
export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-muted/30" aria-hidden>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-4 px-4 py-2 sm:px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
