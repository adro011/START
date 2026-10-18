import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less public Supabase client (anon key, RLS enforced).
 *
 * Catalog reads must work during static generation / ISR. The cookie-bound
 * client in ./server.ts calls next/headers cookies(), which opts every route
 * that touches it into dynamic rendering and blocks prerender — so those
 * pages silently fell back to local data at build time.
 *
 * Public catalog rows are readable by the anon role via RLS, so no auth
 * cookie is needed. Returns null when env is missing so callers keep their
 * local fallback instead of crashing.
 *
 * Never use this for user-scoped data — use ./server.ts (cookies) instead.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
