import { cookies } from "next/headers";
import type { Locale } from "@/lib/dictionary";

/** Server-side registry locale (same `locale` cookie as the storefront). */
export async function getRegistryLocale(): Promise<Locale> {
  return (await cookies()).get("locale")?.value === "bn" ? "bn" : "en";
}
