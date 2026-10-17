import type { Metadata } from "next";
import { SITE } from "@/config/site";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: `Shop registry · Sign in · ${SITE.name}`,
  description: `Shop registry staff login for ${SITE.name}. Authorised staff only.`,
};

export default async function RegistryLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawNext = pick(sp.next) ?? "/admin";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";
  const error = pick(sp.error);

  // NOTE: App Router searchParams are already decoded — never decode again.
  return <LoginClient next={next} error={error} />;
}
