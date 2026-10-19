"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll (skill: premium-frontend-ui §6, plan §5).
 * - Desktop + touch: gentle lerp (1.1), wheel multiplier 1.
 * - Disabled when prefers-reduced-motion (native jump scrolling instead).
 * - Exposes window.__lenis for anchor handling; cleans up on unmount.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      smoothWheel: true,
      anchors: true,
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // Pause the rAF driver when the tab is hidden (battery + CPU).
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    // One-time relayout measure after late-loading images/fonts settle, so
    // Lenis' scroll bounds match the final page height (mirrors the
    // ScrollTrigger.refresh()-after-load pattern).
    const onLoad = () => lenis.resize();
    window.addEventListener("load", onLoad, { once: true });

    document.documentElement.classList.add("lenis");
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("load", onLoad);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}
