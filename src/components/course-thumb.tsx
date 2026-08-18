import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A course thumbnail with a graceful fallback. When there's no `thumbnailUrl` (common in the
 * demo seed), a soft gradient tile with the course's initial is shown instead of a broken image.
 */
export function CourseThumb({
  title,
  thumbnailUrl,
  className,
}: {
  title: string;
  thumbnailUrl: string | null;
  className?: string;
}) {
  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbs; no next/image domain config needed
      <img
        src={thumbnailUrl}
        alt={title}
        className={cn('h-full w-full object-cover', className)}
        loading="lazy"
      />
    );
  }
  const initial = title.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-muted',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-primary/60">
        <GraduationCap className="size-8" />
        <span className="text-3xl font-semibold">{initial}</span>
      </div>
    </div>
  );
}
