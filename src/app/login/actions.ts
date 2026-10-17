"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DEMO_ADMIN_USERNAME, DEMO_ADMIN_PASSWORD } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const DEMO_COOKIE = "demo_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

/** Admin login: 5 attempts per username per 15 minutes. */
const ADMIN_LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };

/** Demo shopper login: 10 attempts per username per 15 minutes. */
const DEMO_LOGIN_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

function safeNext(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

function setDemoCookie(user: string, role: "customer" | "admin", provider = "demo") {
  // NOTE: intentionally NOT httpOnly so the client transition overlay can
  // read it for instant UI feedback; server (auth.ts) is source of truth.
  return cookies().then((store) => {
    store.set(DEMO_COOKIE, encodeURIComponent(JSON.stringify({ user, role, provider })), {
      path: "/",
      maxAge: SEVEN_DAYS,
      sameSite: "lax",
    });
  });
}

/**
 * Shopper demo sign-in — NO email required, NO restrictions.
 * Any non-empty username + password signs in as customer.
 */
export async function demoLoginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"), "/");
  if (!username || !password) {
    redirect(`/login?error=${encodeURIComponent("Enter any username and password to continue (demo — no restrictions).")}&next=${encodeURIComponent(next)}`);
  }

  // Rate limit: 10 attempts per username per 15 minutes.
  const rl = rateLimit(`demo-login:${username}`, DEMO_LOGIN_LIMIT.max, DEMO_LOGIN_LIMIT.windowMs);
  if (!rl.allowed) {
    redirect(`/login?error=${encodeURIComponent("Too many attempts. Try again later.")}&next=${encodeURIComponent(next)}`);
  }

  await setDemoCookie(username, "customer", "demo");
  redirect(next);
}

/**
 * Shop registry / Admin sign-in — fixed demo credentials.
 * username: aa.adro.09  password: Ceyx4noir@
 */
export async function adminLoginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/admin"), "/admin");

  // Rate limit: 5 attempts per username per 15 minutes.
  const rl = rateLimit(`admin-login:${username}`, ADMIN_LOGIN_LIMIT.max, ADMIN_LOGIN_LIMIT.windowMs);
  if (!rl.allowed) {
    redirect(`/login?mode=admin&error=${encodeURIComponent("Too many attempts. Try again later.")}&next=${encodeURIComponent(next)}`);
  }

  if (username === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD) {
    await setDemoCookie(username, "admin", "registry");
    redirect(next);
  }
  redirect(
    `/login?mode=admin&error=${encodeURIComponent("Those registry credentials didn't match. Try again.")}&next=${encodeURIComponent(next)}`,
  );
}

/** One-click social demo (used when Supabase OAuth is not configured). */
export async function oauthDemoAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "google").toLowerCase();
  const next = safeNext(String(formData.get("next") ?? "/"), "/");
  const label = provider === "facebook" ? "facebook-user" : "google-user";
  await setDemoCookie(label, "customer", provider);
  redirect(next);
}

/** Clears the demo session ( shoppers + admin ) and Supabase cookie flow stays untouched. */
export async function demoLogoutAction(next = "/"): Promise<void> {
  const store = await cookies();
  store.delete({ name: DEMO_COOKIE, path: "/" });
  redirect(safeNext(next, "/"));
}
