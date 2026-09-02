import { StreakCelebration } from '@/components/student/streak-celebration';

export const metadata = { title: 'Streak celebration — dev preview' };

/**
 * Unauthenticated preview of the streak celebration popup — no login, no real data, just the
 * real component/CSS module so what you see here is exactly what ships on /student. Visit with
 * ?celebrate=1 to force it open (reuses the component's own manual-test escape hatch). Delete
 * this route once you're done eyeballing the animation — it isn't linked from anywhere real.
 */
export default function StreakPreviewPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--muted, #f4f2ee)',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        color: 'var(--muted-foreground, #666)',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <p>
        Add <code>?celebrate=1</code> to this URL to trigger the celebration
        (already applied if you followed the link you were given).
      </p>
      <StreakCelebration userId="preview-user" streak={7} />
    </main>
  );
}
