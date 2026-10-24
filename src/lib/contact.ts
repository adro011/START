import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { SITE } from "@/config/site";
import { sendEmail, textToHtml, type EmailResult } from "@/lib/email";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(160)
    .email("Enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(2000, "Keep it under 2,000 characters."),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export type ContactStatus = "new" | "read" | "replied" | "archived";

export interface ContactMessage extends ContactInput {
  id: number;
  status: ContactStatus;
  source: string;
  emailed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SaveContactResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

/** Hash rather than store raw IPs — enough for abuse forensics. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.REGISTRY_SESSION_SECRET ?? SITE.name;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function saveContactMessage(
  input: ContactInput,
  meta: { source?: string; userAgent?: string | null; ipHash?: string | null } = {},
): Promise<SaveContactResult> {
  const db = createServiceRoleClient();
  if (!db) {
    console.error("[contact] Supabase service role is not configured.");
    return { ok: false, error: "Contact storage is not configured." };
  }

  const { data, error } = await db
    .from("contact_messages")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      message: input.message,
      source: meta.source ?? "contact",
      user_agent: meta.userAgent?.slice(0, 500) ?? null,
      ip_hash: meta.ipHash ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[contact] Could not save message:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: (data as { id: number }).id };
}

export function contactInbox(): string {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.REGISTRATION_NOTIFY_EMAIL?.trim() ||
    SITE.email
  );
}

export async function notifyContactMessage(
  input: ContactInput,
  id?: number,
): Promise<EmailResult> {
  const reference = id ? `#${id}` : "new";
  const lines = [
    `New contact message (${reference}) from ${SITE.name}`,
    "",
    `Name:    ${input.name}`,
    `Email:   ${input.email}`,
    `Sent:    ${new Date().toISOString()}`,
    "",
    "Message:",
    input.message,
    "",
    "Reply directly to this email to answer the customer.",
  ];

  return sendEmail({
    to: contactInbox(),
    replyTo: input.email,
    subject: `Contact ${reference} — ${input.name}`,
    text: lines.join("\n"),
    html: `<h2>New contact message (${reference})</h2>
<p><strong>Name:</strong> ${textToHtml(input.name)}<br />
<strong>Email:</strong> ${textToHtml(input.email)}<br />
<strong>Sent:</strong> ${new Date().toISOString()}</p>
<hr />
<p>${textToHtml(input.message)}</p>
<p style="color:#666">Reply directly to this email to answer the customer.</p>`,
  });
}

export async function markContactEmailed(id: number): Promise<void> {
  const db = createServiceRoleClient();
  if (!db) return;
  const { error } = await db
    .from("contact_messages")
    .update({ emailed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[contact] Could not mark email sent:", error.message);
}

export async function listContactMessages(limit = 200): Promise<ContactMessage[]> {
  const db = createServiceRoleClient();
  if (!db) return [];
  const { data, error } = await db
    .from("contact_messages")
    .select("id, name, email, message, status, source, emailed_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[contact] Could not list messages:", error.message);
    return [];
  }
  return (data ?? []) as ContactMessage[];
}

export async function setContactStatus(
  id: number,
  status: ContactStatus,
): Promise<void> {
  const db = createServiceRoleClient();
  if (!db) throw new Error("Supabase service role is not configured.");
  const { error } = await db
    .from("contact_messages")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteContactMessage(id: number): Promise<void> {
  const db = createServiceRoleClient();
  if (!db) throw new Error("Supabase service role is not configured.");
  const { error } = await db.from("contact_messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
