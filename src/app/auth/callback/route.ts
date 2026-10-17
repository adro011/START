import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase OAuth callback — exchanges `?code=` for a session cookie,
 * then hands off to the requested `next` page. Demo-cookie logins never
 * hit this route; they redirect directly.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? `${url.protocol}//${url.host}`;

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Missing OAuth code.")}`, siteUrl));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Sign-in is not configured.")}`, siteUrl));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: { name: string; value: string; options: CookieOptions }[]) {
        toSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // RSC read-only context — safe to ignore.
          }
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, siteUrl),
    );
  }
  return NextResponse.redirect(new URL(next, siteUrl));
}
