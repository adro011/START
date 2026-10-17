import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Registry Supabase clients.
 *
 * createRegistryAdminClient()  — service_role, bypasses RLS. SERVER ONLY.
 *   Used for admin writes (create/update products and images). Never import
 *   from client components or pass to the browser.
 * createRegistryClient()       — anon key + cookies, RLS enforced.
 *   Used for reads and any operation that must run as the current user.
 *
 * Both throw when required env is missing (fail fast, no secrets in code).
 */
const REGISTRY_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function requireRegistryEnv(names: string[]): void {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length > 0) {
    throw new Error(`Registry Supabase: missing required env vars: ${missing.join(", ")}`);
  }
}

/** Privileged admin client (service role). Throws if SUPABASE_SERVICE_ROLE_KEY missing. */
export function createRegistryAdminClient() {
  requireRegistryEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  return createClient(REGISTRY_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/** Anon cookie client with RLS. Throws if NEXT_PUBLIC_SUPABASE_ANON_KEY missing. */
export async function createRegistryClient() {
  requireRegistryEnv(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  const cookieStore = await cookies();
  return createServerClient(REGISTRY_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Read-only RSC cookie store — safe to ignore.
        }
      },
    },
  });
}

export type RegistryAdminClient = ReturnType<typeof createRegistryAdminClient>;
export type RegistryServerClient = Awaited<ReturnType<typeof createRegistryClient>>;
