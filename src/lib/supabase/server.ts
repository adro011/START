import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export type ServerSupabase =
  | ReturnType<typeof createServerClient>
  | null;

/**
 * Null-safe server client (cookies-based auth). Returns null when env is
 * missing so routes can render demo/fallback content instead of crashing.
 * Never import the service-role key here — anon key only, RLS enforced.
 */
export async function createClient(): Promise<ServerSupabase> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
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
          // Called from an RSC where cookies are read-only — safe to ignore.
        }
      },
    },
  });
}
