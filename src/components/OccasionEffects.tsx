"use client";

import { useEffect, useRef, useState } from "react";

type OccasionEffectsProps = {
  /** Number of cards in the section */
  cardCount: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Scroll-driven cinematic treatment for the Shop by Occasion section.
 *
 * Behaviour only — all styling lives in `globals.css` (`.occasion-section`,
 * `.occasion-section__glow`, `.occasion-section__sweep`, `.occasion-card`):
 * - Burgundy ambient glow + champagne sweep fade in as the section enters.
 * - The card closest to the viewport centre gets the active highlight.
 * - Intensity blends the section's own visibility with the shared
 *   `--illumination` value written by the spotlight engine.
 * - `prefers-reduced-motion` disables every movement, keeping a static wash.
 */
export default function OccasionEffects({ cardCount }: OccasionEffectsProps) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    const section = marker?.closest<HTMLElement>("[data-occasion-section]");
    if (!section) return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".occasion-card")
    );

    const clearActive = () => {
      cards.forEach((card) => card.classList.remove("occasion-card--active"));
    };

    const resetVars = () => {
      section.style.removeProperty("--burgundy-glow-opacity");
      section.style.removeProperty("--champagne-sweep-opacity");
    };

    if (reducedMotion) {
      clearActive();
      resetVars();
      return;
    }

    let frame = 0;
    let lastGlow = -1;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const inRange =
        rect.bottom > -viewport * 0.25 && rect.top < viewport * 1.25;

      if (!inRange) {
        clearActive();
        if (lastGlow !== 0) {
          lastGlow = 0;
          section.style.setProperty("--burgundy-glow-opacity", "0");
          section.style.setProperty("--champagne-sweep-opacity", "0");
        }
        return;
      }

      const visible = Math.max(
        0,
        Math.min(rect.bottom, viewport) - Math.max(rect.top, 0)
      );
      const progress = clamp01(
        rect.height > 0 ? visible / Math.min(rect.height, viewport) : 0
      );
      const illumination = clamp01(
        parseFloat(section.style.getPropertyValue("--illumination")) || 0
      );
      const glow =
        Math.round(clamp01(progress * 0.65 + illumination * 0.35) * 1000) / 1000;

      if (glow !== lastGlow) {
        lastGlow = glow;
        section.style.setProperty("--burgundy-glow-opacity", glow.toFixed(3));
        section.style.setProperty(
          "--champagne-sweep-opacity",
          (glow * 0.35).toFixed(3)
        );
      }

      if (!cards.length) return;

      const centerX = window.innerWidth / 2;
      const centerY = viewport / 2;
      let closest = -1;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const box = card.getBoundingClientRect();
        const distance = Math.hypot(
          box.left + box.width / 2 - centerX,
          box.top + box.height / 2 - centerY
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });

      cards.forEach((card, index) =>
        card.classList.toggle("occasion-card--active", index === closest)
      );
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      clearActive();
      resetVars();
    };
  }, [reducedMotion, cardCount]);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
