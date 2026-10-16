import { z } from 'zod';

const BodySchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid email' }, { status: 400 });
  }
  // TODO: persist to newsletter table + double-opt-in via Resend (rate-limit this route).
  console.log('newsletter signup (stub) →', parsed.data.email);
  return Response.json({ ok: true });
}
