"use client";

import { useEffect, useState } from "react";
import { SITE } from "../config/site";

/**
 * First-visit brand preloader (skill §2.1, plan §5: <1.2s, skippable,
 * never blocks LCP — hero renders underneath, curtain lifts via clip-path).
 * Shown once per session; skipped on reduced-motion and repeat views.
 */
export default function Preloader() {
  const [state, setState] = useState<"hidden" | "showing" | "leaving">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      sessionStorage.getItem("brand-preloaded") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    setState("showing");
    const lift = window.setTimeout(() => setState("leaving"), 850);
    const done = window.setTimeout(() => {
      setState("hidden");
      sessionStorage.setItem("brand-preloaded", "1");
    }, 1250);
    const skip = () => {
      window.clearTimeout(lift);
      window.clearTimeout(done);
      setState("hidden");
      sessionStorage.setItem("brand-preloaded", "1");
    };
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(lift);
      window.clearTimeout(done);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (state === "hidden") return null;
  return (
    <div
      aria-hidden="true"
      onClick={() => setState("hidden")}
      className={`preloader ${state === "leaving" ? "preloader-leaving" : ""}`}
    >
      <p className="kicker mb-2 text-[#F2CCC3]/80">Quality · Beauty · Elegance</p>
      <p className="preloader-word tracking-tight" role="heading" aria-level={1} aria-label={SITE.name}>
        {SITE.name.split("").map((c, i) => (
          <span key={i} aria-hidden="true" className="ch" style={{ animationDelay: `${i * 30}ms` }}>
            {c}
          </span>
        ))}
      </p>
      <p className="preloader-sub mt-2">{SITE.tagline}</p>
      <span aria-hidden="true" className="mt-6 block h-px w-40 overflow-hidden bg-white/15">
        <span className="block h-full w-full origin-left animate-[preloader-bar_850ms_cubic-bezier(0.22,1,0.36,1)_both] bg-gold" />
      </span>
      <style>{`@keyframes preloader-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}
