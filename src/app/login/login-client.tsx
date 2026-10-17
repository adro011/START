"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SITE } from "@/config/site";
import { createClient } from "@/lib/supabase/client";
import {
  demoLoginAction,
  adminLoginAction,
  oauthDemoAction,
} from "./actions";

type Mode = "account" | "admin";

const EASE = "cubic-bezier(0.22,1,0.36,1)";

function splitChars(text: string) {
  return text.split("").map((c, i) => (
    <span
      key={i}
      aria-hidden="true"
      className="login-ch"
      style={{ animationDelay: `${120 + i * 28}ms` }}
    >
      {c === " " ? "\u00A0" : c}
    </span>
  ));
}

/** Magnetic pull (desktop fine-pointer only, transform-only, 8px max). */
function useMagnetic<T extends HTMLElement>(strength = 8) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const range = 120;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (dist < range) {
          const pull = 1 - dist / range;
          el.style.transform = `translate3d(${(dx / range) * strength * pull}px, ${(dy / range) * strength * pull}px, 0)`;
        } else {
          el.style.transform = "translate3d(0,0,0)";
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "translate3d(0,0,0)";
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);
  return ref;
}

export default function LoginClient({
  next,
  error,
  initialMode,
  sent,
}: {
  next: string;
  error?: string;
  initialMode: Mode;
  sent: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [leaving, setLeaving] = useState<null | { to: string; label: string }>(null);
  const [oauthBusy, setOauthBusy] = useState<"" | "google" | "facebook">("");
  const primaryBtn = useMagnetic<HTMLButtonElement>(8);
  const adminBtn = useMagnetic<HTMLButtonElement>(8);

  // Native server-action forms redirect on their own; the onSubmit curtain
  // covers the unload so the hand-off feels like a single sweep.
  // (transform/opacity only; skipped entirely on reduced-motion.)
  const coverForSubmit = useCallback((label: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setLeaving({ to: "", label });
  }, []);

  const signInWithProvider = useCallback(
    async (provider: "google" | "facebook") => {
      setOauthBusy(provider);
      const supabase = createClient();
      if (supabase) {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
          const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
          });
          if (!oauthError) {
            coverForSubmit(provider === "google" ? "Connecting Google" : "Connecting Facebook");
            return; // browser leaves for the provider
          }
        } catch {
          // fall through to one-click demo below
        }
      }
      // Fallback: instant demo session (no email needed). Single smooth path:
      // show the curtain, then fire the server action WITHOUT awaiting — its
      // redirect() performs the navigation (no competing router.push).
      coverForSubmit(provider === "google" ? "Connecting Google" : "Connecting Facebook");
      const fd = new FormData();
      fd.set("provider", provider);
      fd.set("next", next);
      oauthDemoAction(fd).catch(() => {
        // NEXT redirect() surfaces as a rejection client-side — expected:
        // the server's 307 already navigates. Fallback for total failure:
        router.push(next);
      }).finally(() => {
        setOauthBusy("");
      });
    },
    [coverForSubmit, router, next],
  );

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black text-[#F5F5F5] lg:flex-row">
      {/* ── Left editorial panel (cinematic, ink) ── */}
      <section
        aria-label="Brand story"
        className="relative flex min-h-[42dvh] flex-col justify-end overflow-hidden bg-[#172121] px-6 pt-24 pb-10 text-[#FBF6F3] sm:px-10 lg:min-h-[100dvh] lg:w-[46%] lg:px-12 lg:pb-14"
      >
        {/* depth orbs (transform-only drift) */}
        <div aria-hidden="true" className="drift pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#D5573B]/25 blur-3xl" />
        <div aria-hidden="true" className="drift-2 pointer-events-none absolute right-[-80px] bottom-[-60px] h-80 w-80 rounded-full bg-[#7E9181]/25 blur-3xl" />
        {/* faint ghost numeral */}
        <span aria-hidden="true" className="text-ghost pointer-events-none absolute top-8 right-6 hidden font-semibold select-none sm:block lg:top-12 lg:right-10"
          style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(5rem,10vw,9rem)", lineHeight: 1 }}>
          Æ
        </span>

        <p className="login-rise kicker text-[#F2CCC3]/80" style={{ animationDelay: "60ms" }}>
          {SITE.name} · Accounts
        </p>
        <h1
          className="mt-3 font-medium text-balance"
          style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.6rem,6vw,5rem)", lineHeight: 0.95, letterSpacing: "-0.015em" }}
          aria-label={mode === "admin" ? "Shop registry." : "Welcome back."}
        >
          {splitChars(mode === "admin" ? "Shop registry." : "Welcome back.")}
        </h1>
        <p className="login-rise mt-4 max-w-md text-[16px] leading-relaxed text-[#FBF6F3]/75 sm:text-[17px]" style={{ animationDelay: "420ms" }}>
          {mode === "admin"
            ? "Staff entrance — manage products, orders and the storefront. Shoppers, use the accounts panel."
            : "Sign in to track orders, sync your wishlist and check out faster. No email needed for the demo — any username + password works."}
        </p>
        <div className="login-rise mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#FBF6F3]/65" style={{ animationDelay: "520ms" }}>
          <span>COD available</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D5573B]" />
          <span>Easy exchange</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D5573B]" />
          <span>Made in Bangladesh</span>
        </div>
      </section>

      {/* ── Right accounts panel ── */}
      <section aria-label="Sign in" className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="glass lift w-full max-w-[440px] rounded-2xl p-6 shadow-[0_24px_70px_rgba(23,33,33,0.14)] sm:p-8">
          {mode === "account" ? (
            <div key="account">
              <p className="login-rise kicker text-gold" style={{ animationDelay: "80ms" }}>Accounts · Sign in</p>
              <h2 className="login-rise mt-2 text-2xl font-semibold tracking-tight" style={{ animationDelay: "140ms", fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.7rem,3vw,2.2rem)" }}>
                Continue to {SITE.name}
              </h2>

              {sent ? (
                <div role="status" className="mt-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900">
                  Check your inbox — magic link sent. It expires in ~1 hour.
                </div>
              ) : null}
              {error ? (
                <div role="alert" className="login-shake mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                  {error}
                </div>
              ) : null}

              {/* Social */}
              <div className="login-rise mt-5 grid grid-cols-2 gap-3" style={{ animationDelay: "220ms" }}>
                <button
                  type="button"
                  onClick={() => signInWithProvider("google")}
                  disabled={oauthBusy !== ""}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#181818] px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(23,33,33,0.14)] disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.5h6c-.3 1.4-1.1 2.5-2.3 3.3v2.8h3.7c2.2-2 3.2-4.9 3.2-8.3Z"/><path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.7l-3.7-2.8c-1 .7-2.4 1.2-3.9 1.2-3 0-5.5-2-6.4-4.7H1.8v2.9C3.7 20.5 7.6 23 12 23Z"/><path fill="#FBBC05" d="M5.6 14c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.5H1.8A11 11 0 0 0 1 11.7c0 1.8.4 3.4 1.2 5l3.4-2.7Z"/><path fill="#EA4335" d="M12 5.3c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.9 15.1 1 12 1 7.6 1 3.7 3.5 1.8 6.5l3.8 2.9c.9-2.7 3.4-4.1 6.4-4.1Z"/></svg>
                  {oauthBusy === "google" ? "Connecting…" : "Google"}
                </button>
                <button
                  type="button"
                  onClick={() => signInWithProvider("facebook")}
                  disabled={oauthBusy !== ""}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-3 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(24,119,242,0.4)] disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M13.5 23v-8.2h2.8l.4-3.2h-3.2V9.5c0-.9.3-1.6 1.6-1.6h1.7V5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V23h3.4Z"/></svg>
                  {oauthBusy === "facebook" ? "Connecting…" : "Facebook"}
                </button>
              </div>

              <div className="login-rise my-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-ash uppercase" style={{ animationDelay: "280ms" }} aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" /> or demo login <span className="h-px flex-1 bg-white/10" />
              </div>

              {/* Demo login — any credentials */}
              <form action={demoLoginAction} onSubmit={() => coverForSubmit("Welcome back")} className="login-rise space-y-3" style={{ animationDelay: "340ms" }}>
                <input type="hidden" name="next" value={next} />
                <label className="block">
                  <span className="text-sm font-medium">Username <span className="font-normal text-ash">(anything works)</span></span>
                  <input name="username" required autoComplete="username" placeholder="e.g. demo.shopper"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#181818]/80 px-3.5 py-2.5 text-[16px] outline-none placeholder:text-ash focus:border-gold focus:ring-2 focus:ring-gold/25" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Password <span className="font-normal text-ash">(no restrictions)</span></span>
                  <input name="password" type="password" required autoComplete="current-password" placeholder="Anything — demo only"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#181818]/80 px-3.5 py-2.5 text-[16px] outline-none placeholder:text-ash focus:border-gold focus:ring-2 focus:ring-gold/25" />
                </label>
                <button ref={primaryBtn} type="submit"
                  className="magnetic w-full rounded-xl bg-gold px-4 py-3 text-sm font-semibold tracking-wide text-black transition-[box-shadow,background] duration-300 hover:bg-gold-dark hover:shadow-[0_16px_36px_rgba(213,87,59,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
                  style={{ transitionTimingFunction: EASE }}>
                  Sign in & continue →
                </button>
                <p className="text-center text-xs text-ash">No Gmail required · demo only · continues to home smoothly</p>
              </form>
            </div>
          ) : (
            <div key="admin">
              <p className="login-rise kicker text-gold" style={{ animationDelay: "80ms" }}>Shop registry · Staff only</p>
              <h2 className="login-rise mt-2 font-semibold tracking-tight" style={{ animationDelay: "140ms", fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.7rem,3vw,2.2rem)" }}>
                Admin log in
              </h2>
              {error ? (
                <div role="alert" className="login-shake mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                  {error}
                </div>
              ) : null}
              <form action={adminLoginAction} onSubmit={() => coverForSubmit("Opening shop registry")} className="login-rise mt-5 space-y-3" style={{ animationDelay: "220ms" }}>
                <input type="hidden" name="next" value={next.startsWith("/admin") ? next : "/admin"} />
                <label className="block">
                  <span className="text-sm font-medium">Registry username</span>
                  <input name="username" required autoComplete="username" placeholder="aa.adro.09"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#181818]/80 px-3.5 py-2.5 text-[16px] outline-none placeholder:text-ash focus:border-gold focus:ring-2 focus:ring-gold/25" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Registry password</span>
                  <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#181818]/80 px-3.5 py-2.5 text-[16px] outline-none placeholder:text-ash focus:border-gold focus:ring-2 focus:ring-gold/25" />
                </label>
                <button ref={adminBtn} type="submit"
                  className="magnetic w-full rounded-xl bg-gold px-4 py-3 text-sm font-semibold tracking-wide text-black transition-[box-shadow,background] duration-300 hover:bg-gold-dark hover:shadow-[0_16px_36px_rgba(23,33,33,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
                  style={{ transitionTimingFunction: EASE }}>
                  Open registry →
                </button>
              </form>
              <button type="button" onClick={() => setMode("account")}
                className="link-lux mt-4 text-[13px] font-medium text-steel hover:text-gold">
                ← Back to accounts
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom-left shop registry entry (blue side-left) ── */}
        <div className="absolute bottom-4 left-5 sm:left-8">
          {mode === "account" ? (
            <button
              type="button"
              onClick={() => router.push("/registry/login")}
              className="text-[11px] tracking-wide text-cyan-pulse underline-offset-4 hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-cyan-pulse"
              aria-label="Shop registry log in"
            >
              Shop registry
            </button>
          ) : (
            <span className="text-[11px] tracking-wide text-ash">Shop registry · authorised staff only</span>
          )}
        </div>
        <p className="absolute right-5 bottom-4 hidden text-[11px] tracking-wide text-ash sm:block">
          Demo build — credentials never leave this browser
        </p>
      </section>

      {/* ── Smooth curtain transition (covers route change, transform-only) ── */}
      {leaving ? (
        <div aria-hidden="true" className={`login-curtain ${leaving.to === "" ? "login-curtain-hold" : ""}`}>
          <p className="kicker text-[#F2CCC3]/70">Quality · Beauty · Elegance</p>
          <p className="mt-2 font-medium tracking-tight text-[#FBF6F3]"
            style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,6vw,3.6rem)" }}>
            {leaving.label}…
          </p>
          <span className="mt-6 block h-px w-44 overflow-hidden bg-white/15">
            <span className="login-bar block h-full w-full origin-left bg-[#D5573B]" />
          </span>
        </div>
      ) : null}
      {leaving && leaving.to !== "" ? (
        <span className="sr-only" role="status">Redirecting…</span>
      ) : null}

      <style>{`
        .login-ch{display:inline-block;opacity:0;animation:login-rise 650ms ${EASE} both;will-change:transform,opacity}
        .login-rise{opacity:0;animation:login-rise 700ms ${EASE} both;will-change:transform,opacity}
        @keyframes login-rise{from{opacity:0;transform:translate3d(0,26px,0)}to{opacity:1;transform:none}}
        .login-shake{animation:login-shake 450ms ${EASE} both}
        @keyframes login-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}
        .login-curtain{position:fixed;inset:0;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#172121;animation:login-curtain-in 620ms ${EASE} both;will-change:transform,opacity}
        .login-curtain-hold{animation:login-curtain-hold 450ms ${EASE} both}
        @keyframes login-curtain-in{from{opacity:0;transform:translate3d(0,4%,0)}to{opacity:1;transform:none}}
        @keyframes login-curtain-hold{from{opacity:0}to{opacity:1}}
        .login-bar{animation:login-bar 620ms ${EASE} both;will-change:transform}
        @keyframes login-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .magnetic{will-change:transform;transition:transform 250ms ${EASE}}
        @media (prefers-reduced-motion: reduce){
          .login-ch,.login-rise,.login-bar{animation:none;opacity:1;transform:none}
          .login-curtain{display:none}
        }
      `}</style>
    </main>
  );
}
