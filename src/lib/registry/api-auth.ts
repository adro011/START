import "server-only";

import { cookies } from "next/headers";
import {
  REGISTRY_SESSION_COOKIE,
  verifyRegistrySession,
  type RegistrySessionPayload,
} from "@/lib/registry/session";

/**
 * Registry HTTP API auth.
 *
 * Every /api/registry/* handler runs with the service_role client, which
 * bypasses RLS — so a route that does not check the session lets anyone with
 * the URL write to the live catalog. These routes previously had no check at
 * all (a POST with a valid body inserted a product, unauthenticated).
 *
 * CORS is not a substitute gate: `Access-Control-Allow-Origin: *` never sends
 * credentials cross-origin, so a browser cookie only arrives same-origin —
 * exactly the case we want to verify. Reuses the signed session issued by the
 * registry sign-in, so staff use the same credentials as the UI.
 */
export async function getRegistryApiSession(): Promise<RegistrySessionPayload | null> {
  try {
    const store = await cookies();
    return await verifyRegistrySession(store.get(REGISTRY_SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

/** Uniform 401 body for the registry API. */
export const REGISTRY_API_UNAUTHORIZED = {
  ok: false,
  error: "Registry sign-in required.",
} as const;
