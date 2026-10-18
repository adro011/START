"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { registryLoginAction } from "./actions";

const EASE = "cubic-bezier(0.22,1,0.36,1)";

function splitChars(text: string) {
  const words = text.split(" ");
  let index = 0;
  return words.map((word, wi) => {
    const chars = word.split("").map((c, ci) => {
      const delay = `${120 + index * 28}ms`;
      index += 1;
      return (
        <span key={ci} aria-hidden="true" className="login-ch" style={{ animationDelay: delay }}>
          {c}
        </span>
      );
    });
    const isLast = wi === words.length - 1;
    const spaceDelay = `${120 + index * 28}ms`;
    if (!isLast) index += 1;
    return (
      <span key={wi} className="inline-block whitespace-nowrap">
        {chars}
        {!isLast ? (
          <span aria-hidden="true" className="login-ch" style={{ animationDelay: spaceDelay }}>
            {"\u00A0"}
          </span>
        ) : null}
      </span>
    );
  });
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

export default function RegistryLoginClient({
  next,
  error,
}: {
  next: string;
  error?: string;
}) {
  const [leaving, setLeaving] = useState<null | { label: string }>(null);
  const primaryBtn = useMagnetic<HTMLButtonElement>(8);

  // Native server-action forms redirect on their own; the curtain covers the
  // unload so the hand-off feels like a single sweep.
  const coverForSubmit = useCallback((label: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setLeaving({ label });
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#000000] text-[#F5F5F5] lg:flex-row">
      {/* ── Left editorial panel ── */}
      <section
        aria-label="Brand story"
        className="relative flex min-h-[42dvh] flex-col justify-end overflow-hidden bg-[#172121] px-6 pt-24 pb-10 text-[#FBF6F3] sm:px-10 lg:min-h-[100dvh] lg:w-[46%] lg:px-12 lg:pb-14"
      >
        <div aria-hidden="true" className="drift pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#D5573B]/25 blur-3xl" />
        <div aria-hidden="true" className="drift-2 pointer-events-none absolute right-[-80px] bottom-[-60px] h-80 w-80 rounded-full bg-[#7E9181]/25 blur-3xl" />
        <span aria-hidden="true" className="text-ghost pointer-events-none absolute top-8 right-6 hidden font-semibold select-none sm:block lg:top-12 lg:right-10"
          style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(5rem,10vw,9rem)", lineHeight: 1 }}>
          Æ
        </span>

        <p className="login-rise kicker text-[#F2CCC3]/80" style={{ animationDelay: "60ms" }}>
          {SITE.name} · Shop registry
        </p>
        <h1
          className="mt-3 font-medium text-balance"
          style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.6rem,6vw,5rem)", lineHeight: 0.95, letterSpacing: "-0.015em" }}
          aria-label="Shop registry."
        >
          {splitChars("Shop registry.")}
        </h1>
        <p className="login-rise mt-4 max-w-md text-[16px] leading-relaxed text-[#FBF6F3]/75 sm:text-[17px]" style={{ animationDelay: "420ms" }}>
          Staff entrance — manage products, orders and the storefront. Authorised registry staff only.
        </p>
        <div className="login-rise mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#FBF6F3]/65" style={{ animationDelay: "520ms" }}>
          <span>COD available</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D5573B]" />
          <span>Easy exchange</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D5573B]" />
          <span>Made in Bangladesh</span>
        </div>
      </section>

      {/* ── Right registry sign-in panel ── */}
      <section aria-label="Shop registry sign in" className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="glass lift w-full max-w-[440px] rounded-2xl p-6 shadow-[0_24px_70px_rgba(23,33,33,0.14)] sm:p-8">
          <div key="registry">
            <p className="login-rise kicker text-gold" style={{ animationDelay: "80ms" }}>Shop registry · Staff only</p>
            <h2 className="login-rise mt-2 text-2xl font-semibold tracking-tight" style={{ animationDelay: "140ms", fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.7rem,3vw,2.2rem)" }}>
              Registry log in
            </h2>
            {error ? (
              <div role="alert" className="login-shake mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                {error}
              </div>
            ) : null}
            <form action={registryLoginAction} onSubmit={() => coverForSubmit("Opening shop registry")} className="login-rise mt-5 space-y-3" style={{ animationDelay: "220ms" }}>
              <input type="hidden" name="next" value={next} />
              <div>
                <label className="block">
                  <span className="text-sm font-medium">Registry username</span>
                  <input name="username" required autoComplete="username" placeholder="Email or full name"
                    className="w-full" />
                </label>
              </div>
              <div>
                <label className="block">
                  <span className="text-sm font-medium">Registry password</span>
                  <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••"
                    className="w-full" />
                </label>
              </div>
              <button ref={primaryBtn} type="submit"
                className="magnetic w-full rounded-xl reg-btn reg-btn-primary text-sm font-semibold tracking-wide transition-[transform,box-shadow,background] duration-300 hover:shadow-[0_16px_36px_rgba(213,87,59,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
                style={{ transitionTimingFunction: EASE }}>
                Open registry →
              </button>
              <p className="text-center text-xs text-ash">Staff accounts are issued by the store owner</p>
            </form>
            <Link href="/login"
              className="link-lux mt-4 block text-center text-[13px] font-medium text-steel hover:text-gold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#FFC000]"
              aria-label="Back to customer login">
              ← Back to customer login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Smooth curtain transition ── */}
      {leaving ? (
        <div aria-hidden="true" className={`login-curtain ${!leaving.label ? "login-curtain-hold" : ""}`}>
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
        .magnetic{will-change:transform}
        @media (prefers-reduced-motion: reduce){
          .login-ch,.login-rise,.login-bar{animation:none;opacity:1;transform:none}
          .login-curtain{display:none}
        }
      `}</style>
    </main>
  );
}
