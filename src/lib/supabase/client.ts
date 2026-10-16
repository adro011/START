import { createBrowserClient } from "@supabase/ssr";

export type BrowserSupabase =
  | ReturnType<typeof createBrowserClient>
  | null;

/**
 * Null-safe browser client. Returns null when env is missing (e.g. local
 * UI work before `supabase link`), so components can degrade gracefully
 * instead of throwing at import time.
 */
export function createClient(): BrowserSupabase {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

/** Alias some codebases expect. */
export const getBrowserClient = createClient;
