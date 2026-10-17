import { createBrowserClient } from "@supabase/ssr";

export type RegistryBrowserSupabase = ReturnType<typeof createBrowserClient> | null;

/**
 * Null-safe browser Supabase client for the registry.
 * Returns null when public env is missing so UI can render offline/fallback
 * instead of throwing at import time. Anon key only — RLS enforced.
 */
export function createRegistryBrowserClient(): RegistryBrowserSupabase {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

export const getRegistryBrowserClient = createRegistryBrowserClient;
