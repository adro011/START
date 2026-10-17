import type { Metadata } from "next";
import { SITE } from "@/config/site";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: `Sign in · ${SITE.name}`,
  description: `Sign in to ${SITE.name} with Google, Facebook, or demo login. Staff: shop registry admin entrance at the bottom of the page.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawNext = pick(sp.next) ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const error = pick(sp.error);
  const sent = pick(sp.sent) === "1";
  const initialMode = pick(sp.mode) === "admin" ? ("admin" as const) : ("account" as const);

  // NOTE: App Router searchParams are already decoded — never decode again
  // (a stray % would throw). Error text is encoded once at redirect time.
  return <LoginClient next={next} error={error} initialMode={initialMode} sent={sent} />;
}
