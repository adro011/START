"use client";

import { useEffect, useRef, useState } from "react";
import { motionNumber } from "@/lib/content";

/**
 * Soft cursor ring on product imagery (skill §3.2, plan §5 "Zoom" cursor).
 * Desktop fine-pointer only, lerp follow, transform-only, hidden on touch
 * and reduced-motion. Grows over [data-cursor] targets, showing their label.
 */
export default function CursorRing() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    setEnabled(true);
    const ring = ref.current;
    if (!ring) return;

    let raf = 0;
    let x = -100;
    let y = -100;
    let cx = -100;
    let cy = -100;
    const lerp = motionNumber("effects", "cursor.lerp", 0.18);

    const tick = () => {
      cx += (x - cx) * lerp;
      cy += (y - cy) * lerp;
      ring.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as HTMLElement).closest?.("[data-cursor]") as HTMLElement | null;
      const label = t?.dataset.cursor ?? "";
      ring.dataset.active = t ? "1" : "";
      if (labelRef.current) labelRef.current.textContent = label;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={ref} aria-hidden="true" className="cursor-ring" data-active="">
      <span ref={labelRef} className="cursor-ring-label" />
    </div>
  );
}
