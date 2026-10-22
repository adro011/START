import "server-only";
import { SITE } from "@/config/site";

/**
 * Best-effort admin notification for a new registration.
 * Uses Resend's REST API when RESEND_API_KEY is set; otherwise logs only, so
 * signups still persist successfully without email credentials.
 */
export async function notifyAdminOfRegistration(
  email: string,
  alreadyRegistered: boolean,
): Promise<void> {
  const to = process.env.REGISTRATION_NOTIFY_EMAIL ?? SITE.email;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[registrations] new signup (email skipped, RESEND_API_KEY unset):", email);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? `${SITE.name} <onboarding@resend.dev>`,
        to,
        subject: `New ${SITE.name} registration: ${email}`,
        text: [
          `${email} joined the ${SITE.name} list.`,
          alreadyRegistered ? "This address was already registered." : "New registration.",
          `Time: ${new Date().toISOString()}`,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error("[registrations] admin email failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[registrations] admin email failed:", err);
  }
}
