"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTENT, motionNumber } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export interface SpotlightConfig {
  maxRadiusFactor: number;
  baseColor: string;
  coreColor: string;
  midColor: string;
  outerColor: string;
}

export interface SpotlightSectionMetric {
  id: string;
  label: string;
  distancePx: number;
  illumination: number;
  state: "submerged" | "emerging" | "radiant";
}

export interface AbrarSpotlightAPI {
  refresh: () => void;
  getConfig: () => SpotlightConfig;
  setConfig: (next: Partial<SpotlightConfig>) => SpotlightConfig;
  getSectionMetrics: () => SpotlightSectionMetric[];
}

declare global {
  interface Window {
    __ABRAR_SPOTLIGHT__?: AbrarSpotlightAPI;
  }
}

/**
 * Lenis smooth scroll + GSAP ScrollTrigger Spotlight Engine (abrar-exclusive.shop).
 * - Calculates the exact distance between the center of the viewport and the center of each
 *   [data-spotlight-section] container on every scroll frame.
 * - Maps this distance 1:1 to a deep pitch-black (#010101) -> vibrant yellow radial spotlight.
 * - Exposes window.__ABRAR_SPOTLIGHT__ so spotlight parameters and section metrics are live-inspectable and editable.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spotlight = CONTENT.theme.spotlight as Record<string, string>;
    const config: SpotlightConfig = {
      maxRadiusFactor: motionNumber("effects", "spotlight.maxRadiusFactor", 0.72),
      baseColor: spotlight.base || "#010101",
      coreColor: spotlight.core || "255, 248, 150",
      midColor: spotlight.mid || "255, 230, 0",
      outerColor: spotlight.outer || "255, 185, 0",
    };

    const applyCssConfig = () => {
      const root = document.documentElement;
      root.style.setProperty("--spotlight-base", config.baseColor);
      root.style.setProperty("--spotlight-core", config.coreColor);
      root.style.setProperty("--spotlight-mid", config.midColor);
      root.style.setProperty("--spotlight-outer", config.outerColor);
    };
    applyCssConfig();

    const updateSpotlights = () => {
      const sections = document.querySelectorAll<HTMLElement>("[data-spotlight-section]");
      if (!sections.length) return;

      const viewportCenterY = window.innerHeight / 2;
      const maxRadius = Math.max(
        window.innerHeight * config.maxRadiusFactor,
        motionNumber("effects", "spotlight.minRadius", 460)
      );

      sections.forEach((section, idx) => {
        const targetEl = section.querySelector<HTMLElement>("[data-spotlight-target]") || section;
        const rect = targetEl.getBoundingClientRect();
        const targetCenterY = rect.top + rect.height / 2;

        // Exact distance between the center of the viewport and the center of the target
        const exactDistance = Math.abs(targetCenterY - viewportCenterY);

        const linearProximity = gsap.utils.clamp(0, 1, 1 - exactDistance / maxRadius);
        const illumination = reduced
          ? 1
          : linearProximity * linearProximity * (3 - 2 * linearProximity);

        const state: "submerged" | "emerging" | "radiant" =
          illumination >= 0.72
            ? "radiant"
            : illumination >= 0.18
              ? "emerging"
              : "submerged";

        section.style.setProperty("--illumination", illumination.toFixed(4));
        section.style.setProperty("--distance-px", `${Math.round(exactDistance)}px`);
        section.dataset.illuminationState = state;

        if (!section.dataset.particleId) {
          section.dataset.particleId = `spotlight.section.${idx + 1}`;
        }
      });
    };

    const getSectionMetrics = (): SpotlightSectionMetric[] => {
      const sections = document.querySelectorAll<HTMLElement>("[data-spotlight-section]");
      const viewportCenterY = window.innerHeight / 2;
      const metrics: SpotlightSectionMetric[] = [];

      sections.forEach((section, idx) => {
        const targetEl = section.querySelector<HTMLElement>("[data-spotlight-target]") || section;
        const rect = targetEl.getBoundingClientRect();
        const targetCenterY = rect.top + rect.height / 2;
        const distancePx = Math.round(Math.abs(targetCenterY - viewportCenterY));
        const illumination = parseFloat(section.style.getPropertyValue("--illumination") || "0");
        const state =
          (section.dataset.illuminationState as "submerged" | "emerging" | "radiant") ||
          "submerged";

        metrics.push({
          id: section.dataset.particleId || section.id || `spotlight.section.${idx + 1}`,
          label:
            section.dataset.particleLabel ||
            section.getAttribute("aria-label") ||
            `Spotlight Section ${idx + 1}`,
          distancePx,
          illumination,
          state,
        });
      });

      return metrics;
    };

    window.__ABRAR_SPOTLIGHT__ = {
      refresh: () => {
        ScrollTrigger.refresh();
        updateSpotlights();
      },
      getConfig: () => ({ ...config }),
      setConfig: (next: Partial<SpotlightConfig>) => {
        if (typeof next.maxRadiusFactor === "number" && !Number.isNaN(next.maxRadiusFactor)) {
          config.maxRadiusFactor = Math.max(0.25, Math.min(1.5, next.maxRadiusFactor));
        }
        if (typeof next.baseColor === "string" && next.baseColor.trim()) {
          config.baseColor = next.baseColor.trim();
        }
        if (typeof next.coreColor === "string" && next.coreColor.trim()) {
          config.coreColor = next.coreColor.trim();
        }
        if (typeof next.midColor === "string" && next.midColor.trim()) {
          config.midColor = next.midColor.trim();
        }
        if (typeof next.outerColor === "string" && next.outerColor.trim()) {
          config.outerColor = next.outerColor.trim();
        }
        applyCssConfig();
        updateSpotlights();
        return { ...config };
      },
      getSectionMetrics,
    };

    const trigger = ScrollTrigger.create({
      id: "abrar-spotlight-engine",
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: updateSpotlights,
    });

    let mutationRaf = 0;
    const observer = new MutationObserver(() => {
      if (mutationRaf) cancelAnimationFrame(mutationRaf);
      mutationRaf = requestAnimationFrame(() => {
        updateSpotlights();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", updateSpotlights, { passive: true });
    window.addEventListener("resize", updateSpotlights);
    updateSpotlights();

    if (reduced) {
      return () => {
        observer.disconnect();
        if (mutationRaf) cancelAnimationFrame(mutationRaf);
        trigger.kill();
        window.removeEventListener("scroll", updateSpotlights);
        window.removeEventListener("resize", updateSpotlights);
        delete window.__ABRAR_SPOTLIGHT__;
      };
    }

    const lenis = new Lenis({
      lerp: motionNumber("effects", "smooth.lerp", 0.11),
      wheelMultiplier: 1,
      touchMultiplier: 1,
      smoothWheel: true,
      anchors: true,
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", () => {
      ScrollTrigger.update();
      updateSpotlights();
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const onLoad = () => {
      lenis.resize();
      ScrollTrigger.refresh();
      updateSpotlights();
    };
    window.addEventListener("load", onLoad, { once: true });

    document.documentElement.classList.add("lenis");
    return () => {
      observer.disconnect();
      if (mutationRaf) cancelAnimationFrame(mutationRaf);
      trigger.kill();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updateSpotlights);
      window.removeEventListener("resize", updateSpotlights);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("load", onLoad);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      delete window.__ABRAR_SPOTLIGHT__;
    };
  }, []);

  return null;
}
