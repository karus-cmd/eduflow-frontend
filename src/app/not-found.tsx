import Link from 'next/link';
import { Compass } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-6 text-center">
      <Compass className="size-10 text-muted-foreground" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or you don&rsquo;t have access to it.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants())}>
        Go to my dashboard
      </Link>
    </div>
  );
}
