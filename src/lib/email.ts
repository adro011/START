import "server-only";
import { SITE } from "@/config/site";

/**
 * Minimal Resend client used by transactional notifications.
 *
 * `RESEND_API_KEY` is required; without it callers get a typed failure instead
 * of a silent no-op so misconfiguration is visible in logs and responses.
 * `RESEND_FROM_EMAIL` must be a sender on a domain verified in Resend.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  from?: string;
}

export type EmailResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function defaultFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `${SITE.name} <onboarding@resend.dev>`
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain text → minimal safe HTML (preserves newlines). */
export function textToHtml(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY is not set — skipped "${message.subject}".`,
    );
    return { ok: false, error: "Email is not configured." };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: message.from ?? defaultFromAddress(),
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    const payload = (await res.json().catch(() => null)) as
      | { id?: string; message?: string }
      | null;

    if (!res.ok) {
      const detail = payload?.message ?? `HTTP ${res.status}`;
      console.error(`[email] Resend rejected "${message.subject}":`, detail);
      return { ok: false, error: detail };
    }

    return { ok: true, id: payload?.id ?? null };
  } catch (err) {
    console.error(`[email] Resend request failed for "${message.subject}":`, err);
    return { ok: false, error: "Could not reach the email provider." };
  }
}
