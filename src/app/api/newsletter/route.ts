import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { isRegistrationOpen, registerEmail } from "@/lib/registrations";
import { notifyAdminOfRegistration } from "@/lib/notify";

const BodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "That email address is too long.")
    .email("Enter a valid email address."),
  source: z.string().trim().max(40).optional(),
});

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
}

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(`registration:${clientKey(request)}`, 6, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email address." },
      { status: 400 },
    );
  }

  if (!(await isRegistrationOpen())) {
    return NextResponse.json(
      { ok: false, error: "Registration is closed right now." },
      { status: 403 },
    );
  }

  const result = await registerEmail(parsed.data.email, parsed.data.source ?? "footer");
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  await notifyAdminOfRegistration(parsed.data.email.trim().toLowerCase(), result.alreadyRegistered);

  return NextResponse.json({
    ok: true,
    alreadyRegistered: result.alreadyRegistered,
  });
}
