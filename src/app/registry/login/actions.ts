"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DEMO_ADMIN_USERNAME, DEMO_ADMIN_PASSWORD } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const DEMO_COOKIE = "demo_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

/** Shop registry login: 5 attempts per username per 15 minutes. */
const REGISTRY_LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };

function safeNext(raw: string | null | undefined, fallback = "/admin"): string {
  if (!raw || typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

function setDemoCookie(user: string) {
  return cookies().then((store) => {
    store.set(DEMO_COOKIE, encodeURIComponent(JSON.stringify({ user, role: "staff", provider: "registry" })), {
      path: "/",
      maxAge: SEVEN_DAYS,
      sameSite: "lax",
    });
  });
}

/**
 * Shop registry sign-in — fixed demo credentials in dev.
 * Never hardcodes secrets in client components; validation happens here.
 */
export async function registryLoginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/admin"), "/admin");

  const rl = rateLimit(`registry-login:${username}`, REGISTRY_LOGIN_LIMIT.max, REGISTRY_LOGIN_LIMIT.windowMs);
  if (!rl.allowed) {
    redirect(`/registry/login?error=${encodeURIComponent("Too many attempts. Try again later.")}&next=${encodeURIComponent(next)}`);
  }

  if (username === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD) {
    await setDemoCookie(username);
    redirect(next);
  }

  redirect(`/registry/login?error=${encodeURIComponent("Those registry credentials didn't match. Try again.")}&next=${encodeURIComponent(next)}`);
}
