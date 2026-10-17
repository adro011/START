"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { verifyPassword } from "@/lib/registry/password";
import {
  REGISTRY_SESSION_COOKIE,
  registrySessionCookieOptions,
  signRegistrySession,
  type RegistryRole,
} from "@/lib/registry/session";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Shop registry sign-in — real credentials from `registry_users`.
 *
 * Replaces the old demo path, which compared against hardcoded credentials and
 * set an unsigned JSON cookie that production refused to trust. Passwords are
 * scrypt hashes (lib/registry/password.ts); the session is an HMAC-signed,
 * httpOnly cookie (lib/registry/session.ts).
 */

/** Shop registry login: 5 attempts per identifier per 15 minutes. */
const REGISTRY_LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };
const DEFAULT_NEXT = "/registry";

/** Burned when no row matches, so a miss costs the same as a hit. */
const DUMMY_HASH = `scrypt$16384$8$1$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(64).toString("base64")}`;

interface RegistryUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  password_hash: string | null;
}

const USER_COLUMNS = "id, email, full_name, role, password_hash";

function safeNext(raw: string | null | undefined, fallback = DEFAULT_NEXT): string {
  if (!raw || typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

function backToLogin(error: string, next: string): never {
  redirect(`/registry/login?error=${encodeURIComponent(error)}&next=${encodeURIComponent(next)}`);
}

export async function registryLoginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? DEFAULT_NEXT));

  if (!username || !password) {
    backToLogin("Enter your registry username and password.", next);
  }

  const rl = rateLimit(
    `registry-login:${username.toLowerCase()}`,
    REGISTRY_LOGIN_LIMIT.max,
    REGISTRY_LOGIN_LIMIT.windowMs,
  );
  if (!rl.allowed) {
    backToLogin("Too many attempts. Try again in a few minutes.", next);
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    backToLogin("Registry sign-in is unavailable: Supabase is not configured.", next);
  }

  let user: RegistryUserRow | null = null;
  try {
    const byEmail = await supabase
      .from("registry_users")
      .select(USER_COLUMNS)
      .ilike("email", username)
      .is("deleted_at", null)
      .maybeSingle();
    user = (byEmail.data as RegistryUserRow | null) ?? null;
    if (!user) {
      const byName = await supabase
        .from("registry_users")
        .select(USER_COLUMNS)
        .ilike("full_name", username)
        .is("deleted_at", null)
        .maybeSingle();
      user = (byName.data as RegistryUserRow | null) ?? null;
    }
  } catch {
    backToLogin("Registry sign-in is temporarily unavailable. Try again.", next);
  }

  const passwordOk = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !passwordOk) {
    backToLogin("Those registry credentials didn't match. Try again.", next);
  }

  const role: RegistryRole = user.role === "admin" ? "admin" : "staff";
  const token = await signRegistrySession({ sub: user.id, email: user.email, role });
  if (!token) {
    backToLogin(
      "Registry sign-in is not configured on this deployment (missing session secret).",
      next,
    );
  }

  // Best effort — never block a valid sign-in on the audit timestamp.
  try {
    await supabase
      .from("registry_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);
  } catch {
    // ignore
  }

  const store = await cookies();
  store.set(REGISTRY_SESSION_COOKIE, token, registrySessionCookieOptions());

  redirect(next);
}

/** Clear the signed registry session and return to the registry sign-in. */
export async function registryLogoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(REGISTRY_SESSION_COOKIE);
  redirect("/registry/login");
}
