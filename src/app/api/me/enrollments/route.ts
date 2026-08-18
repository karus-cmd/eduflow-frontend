import { forward } from '@/lib/bff';

/** The signed-in student's enrollments — used by the player to refresh true progress after actions. */
export async function GET() {
  return forward('/me/enrollments');
}
