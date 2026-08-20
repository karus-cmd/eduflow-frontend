import { forward } from '@/lib/bff';

/** Create a course (admin). Backend enforces content.create + slug uniqueness (409). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/courses', { method: 'POST', body });
}
