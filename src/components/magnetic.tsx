"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Magnetic pull for primary CTAs (skill §3.2, plan §5 micro-interactions).
 * Desktop fine-pointer only, max 8px pull, transform-only, rAF-throttled.
 * Respects reduced-motion. Requires a single child element.
 */
export default function Magnetic({
  children,
  strength = 8,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const target = el.firstElementChild as HTMLElement | null;
    if (!target) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      target.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        target.style.transform = "";
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = e.clientX - (r.left + r.width / 2);
      const py = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(px, py);
      const range = Math.max(r.width, r.height) * 1.2;
      if (dist < range) {
        x = (px / range) * strength;
        y = (py / range) * strength;
      } else {
        x = 0;
        y = 0;
      }
      kick();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      kick();
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      target.style.transform = "";
    };
  }, [strength]);

  return (
    <div ref={ref} className="magnetic inline-block">
      {children}
    </div>
  );
}
