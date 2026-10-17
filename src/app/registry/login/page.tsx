import type { Metadata } from "next";
import { SITE } from "@/config/site";
import LoginClient from "./login-client";

// Root layout appends `· ${SITE.name}`, so keep the brand out of this title.
export const metadata: Metadata = {
  title: "Sign in · Shop registry",
  description: `Shop registry staff login for ${SITE.name}. Authorised staff only.`,
  robots: { index: false, follow: false },
};

export default async function RegistryLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawNext = pick(sp.next) ?? "/registry";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/registry";
  const error = pick(sp.error);

  // NOTE: App Router searchParams are already decoded — never decode again.
  return <LoginClient next={next} error={error} />;
}
