import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged server-only Supabase client (service_role, bypasses RLS).
 * NEVER import from client components or pass to the browser.
 * Use only for: sku→variant resolution, post-order breakdown reads,
 * admin reads, emails. The actual `create_order` RPC call must use the
 * anon cookie client (lib/supabase/server.ts) so auth.uid() is preserved.
 * Returns null when env is missing → callers fall back to demo totals.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
