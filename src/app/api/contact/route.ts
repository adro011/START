import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  ContactSchema,
  hashIp,
  markContactEmailed,
  notifyContactMessage,
  saveContactMessage,
} from "@/lib/contact";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

function wantsHtml(request: Request): boolean {
  return (request.headers.get("accept") ?? "").includes("text/html");
}

function redirectTo(request: Request, query: string): NextResponse {
  const url = new URL("/contact", request.url);
  url.search = query;
  return NextResponse.redirect(url, 303);
}

function fail(request: Request, native: boolean, query: string, error: string, status: number) {
  if (native) return redirectTo(request, query);
  return NextResponse.json({ ok: false, error }, { status });
}

async function readBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const json = await request.json();
      return json && typeof json === "object" ? (json as Record<string, unknown>) : null;
    }
    // Native <form> posts (and fetch with FormData): urlencoded or multipart.
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const native = wantsHtml(request);
  const ip = clientIp(request);

  const limit = rateLimit(`contact:${ip}`, 5, 10 * 60_000);
  if (!limit.allowed) {
    return fail(
      request,
      native,
      "error=rate",
      "Too many messages. Please try again in a few minutes.",
      429,
    );
  }

  const raw = await readBody(request);
  if (!raw) {
    return fail(
      request,
      native,
      "error=invalid",
      "Invalid request body.",
      400,
    );
  }

  // Honeypot: silently accept so bots do not learn they were filtered.
  if (String(raw.company ?? "").trim() !== "") {
    return native
      ? redirectTo(request, "sent=1")
      : NextResponse.json({ ok: true });
  }

  const parsed = ContactSchema.safeParse({
    name: typeof raw.name === "string" ? raw.name : "",
    email: typeof raw.email === "string" ? raw.email : "",
    message: typeof raw.message === "string" ? raw.message : "",
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    if (native) return redirectTo(request, "error=invalid");
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Please check the highlighted fields.",
        issues,
      },
      { status: 422 },
    );
  }

  const input = parsed.data;
  const stored = await saveContactMessage(input, {
    userAgent: request.headers.get("user-agent"),
    ipHash: hashIp(ip),
  });

  const emailed = await notifyContactMessage(input, stored.ok ? stored.id : undefined);
  if (emailed.ok && stored.ok) await markContactEmailed(stored.id);

  if (stored.ok) {
    if (!emailed.ok) {
      console.error(
        `[contact] Saved message #${stored.id} but email failed: ${emailed.error}`,
      );
    }
    return native
      ? redirectTo(request, "sent=1")
      : NextResponse.json({ ok: true, id: stored.id, emailed: emailed.ok });
  }

  if (emailed.ok) {
    // Email is the fallback delivery path when storage is unavailable.
    return native
      ? redirectTo(request, "sent=1")
      : NextResponse.json({ ok: true, emailed: true });
  }

  return fail(
    request,
    native,
    "error=failed",
    "We could not deliver your message. Please email us directly.",
    503,
  );
}
