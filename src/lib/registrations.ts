import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface Registration {
  id: number;
  email: string;
  source: string;
  status: "active" | "unsubscribed";
  created_at: string;
  updated_at: string;
}

export type RegisterResult =
  | { ok: true; alreadyRegistered: boolean }
  | { ok: false; error: string };

/** Footer signup switch, stored in site_settings. Defaults to open. */
export async function isRegistrationOpen(): Promise<boolean> {
  const db = createServiceRoleClient();
  if (!db) return true;
  const { data, error } = await db
    .from("site_settings")
    .select("value")
    .eq("key", "registration_enabled")
    .maybeSingle();
  if (error || !data) return true;
  return data.value !== false;
}

export async function setRegistrationOpen(enabled: boolean): Promise<void> {
  const db = createServiceRoleClient();
  if (!db) throw new Error("Supabase service role is not configured.");
  const { error } = await db
    .from("site_settings")
    .upsert({ key: "registration_enabled", value: enabled }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

/** Persists a normalized email. Duplicate signups are treated as success. */
export async function registerEmail(
  email: string,
  source = "footer",
): Promise<RegisterResult> {
  const db = createServiceRoleClient();
  if (!db) return { ok: false, error: "Registration is not configured yet." };

  const normalized = email.trim().toLowerCase();
  const { error } = await db
    .from("registrations")
    .insert({ email: normalized, source, status: "active" });

  if (!error) return { ok: true, alreadyRegistered: false };
  if (error.code === "23505") return { ok: true, alreadyRegistered: true };
  return { ok: false, error: "Could not save your email. Please try again." };
}

export async function listRegistrations(limit = 500): Promise<Registration[]> {
  const db = createServiceRoleClient();
  if (!db) return [];
  const { data, error } = await db
    .from("registrations")
    .select("id, email, source, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Registration[];
}

export async function deleteRegistration(id: number): Promise<void> {
  const db = createServiceRoleClient();
  if (!db) throw new Error("Supabase service role is not configured.");
  const { error } = await db.from("registrations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
