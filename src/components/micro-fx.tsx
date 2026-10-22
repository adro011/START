"use client";

import { useEffect, useRef } from "react";

/**
 * Homepage micro-interaction driver.
 *
 * - Adds `mfx-in` to every `[data-spotlight-section]` once it scrolls into view
 *   (CSS in `micro.css` keys all section-level micro animations off this class).
 * - Tags home cards with `mfx-glow` and feeds them pointer coordinates (--mx / --my)
 *   for the cursor-following spotlight.
 * - Drives a thin gold scroll-progress bar.
 *
 * It never touches transform/opacity of Reveal elements, so it cannot conflict with GSAP.
 */
export default function MicroFx() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("mfx");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-spotlight-section]"));

    // Section in-view flags
    let io: IntersectionObserver | null = null;
    if (reduced || typeof IntersectionObserver === "undefined") {
      sections.forEach((s) => s.classList.add("mfx-in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("mfx-in");
              io?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
      );
      sections.forEach((s) => io!.observe(s));
    }

    // Card spotlight
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-spotlight-section] [data-particle-type="card"]'),
    ).filter((c) => (c.dataset.particleId ?? "").startsWith("home."));
    cards.forEach((c) => c.classList.add("mfx-glow"));

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      const card = (ev.target as Element | null)?.closest<HTMLElement>(".mfx-glow");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${ev.clientX - r.left}px`);
      card.style.setProperty("--my", `${ev.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });

    // Scroll progress
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      root.classList.remove("mfx");
      io?.disconnect();
      cards.forEach((c) => c.classList.remove("mfx-glow"));
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={barRef} className="mfx-progress" aria-hidden="true" />;
}
