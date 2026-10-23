"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionNumber } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling + ScrollTrigger housekeeping.
 *
 * Reveal triggers are created when their components mount, but the homepage
 * streams data-driven islands in through Suspense and the display webfonts
 * load non-blocking — both change the document height after triggers are
 * measured. Re-measuring once the page settles keeps every reveal firing at
 * the right scroll offset (previously they stayed pinned to stale positions).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let raf = 0;

    const refresh = () => {
      lenis?.resize();
      ScrollTrigger.refresh();
    };

    if (!reduced) {
      lenis = new Lenis({
        lerp: motionNumber("effects", "smooth.lerp", 0.11),
        wheelMultiplier: 1,
        touchMultiplier: 1,
        smoothWheel: true,
        anchors: true,
      });
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      document.documentElement.classList.add("lenis");
    }

    const onVis = () => {
      if (reduced) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        const loop = (time: number) => {
          lenis?.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    window.addEventListener("load", refresh, { once: true });
    window.addEventListener("resize", refresh);
    const settle = window.setTimeout(refresh, 700);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", onVis);
      lenis?.destroy();
      document.documentElement.classList.remove("lenis");
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}
