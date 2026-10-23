"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type AtmospherePreset =
  | "hero"
  | "audience"
  | "statement"
  | "arrivals"
  | "categories"
  | "occasions"
  | "sale"
  | "story"
  | "testimonials"
  | "trust"
  | "drop"
  | "newsletter"
  | "footer";

type Layers = {
  base: HTMLElement;
  a: HTMLElement;
  b: HTMLElement;
  c: HTMLElement;
  d: HTMLElement;
};

type Build = (section: HTMLElement, L: Layers) => void;

/**
 * Per-section cinematic background atmosphere (see
 * skills/abrar-section-atmospheres/SKILL.md).
 *
 * - Renders a `.atmo` layer stack (base + up to 4 light layers + grain) as a
 *   sibling *before* the section content, `aria-hidden` + `pointer-events: none`.
 * - Runs one scrub ScrollTrigger per section: progress 0 = enter (reveal the
 *   atmosphere), 0.5 = centre (max intensity), 1 = exit (dim/hand-off).
 * - Idle CSS loops are gated by `.atmo--live` (IntersectionObserver) so nothing
 *   animates off-screen; `.atmo--static` (reduced-motion / coarse pointer)
 *   renders a static base with no motion.
 * - Animates only `transform` / `opacity` and GSAP-driven CSS custom
 *   properties (consumed by pseudo-elements), never layout properties.
 */
export default function SectionAtmosphere({
  preset,
  overlay = false,
}: {
  preset: AtmospherePreset;
  overlay?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const atmo = ref.current;
    if (!atmo) return;
    const section = atmo.closest<HTMLElement>("[data-atmosphere]");
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let io: IntersectionObserver | null = null;
    if (reduced || typeof IntersectionObserver === "undefined") {
      atmo.classList.add("atmo--live");
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            atmo.classList.toggle("atmo--live", e.isIntersecting);
          }
        },
        { rootMargin: "12% 0px" },
      );
      io.observe(section);
    }

    if (reduced || coarse) {
      atmo.classList.add("atmo--static");
      return () => io?.disconnect();
    }

    const layer = (name: keyof Layers) =>
      atmo.querySelector<HTMLElement>(`.atmo__${name}`) ?? atmo;

    const ctx = gsap.context(() => {
      const L: Layers = {
        base: layer("base"),
        a: layer("a"),
        b: layer("b"),
        c: layer("c"),
        d: layer("d"),
      };
      const build = PRESETS[preset];
      build?.(section, L);
    }, section);

    return () => {
      io?.disconnect();
      ctx.revert();
    };
  }, [preset]);

  return (
    <div
      ref={ref}
      className={`atmo atmo--${preset}${overlay ? " atmo--overlay" : ""}`}
      data-atmo-preset={preset}
      aria-hidden="true"
    >
      <span className="atmo__base" />
      <span className="atmo__a" />
      <span className="atmo__b" />
      <span className="atmo__c" />
      <span className="atmo__d" />
      <span className="atmo__grain" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Motion engine
   Each preset builds a scrub timeline keyed to its own section. Progress 0 is
   the section top entering the viewport bottom; 1 is the section bottom leaving
   the viewport top; ~0.5 is the section centred (peak intensity).
   ──────────────────────────────────────────────────────────────────────────── */

const scr = (section: HTMLElement): ScrollTrigger.Vars => ({
  trigger: section,
  start: "top bottom",
  end: "bottom top",
  scrub: 0.6,
});

const PRESETS: Record<AtmospherePreset, Build> = {
  /* 01 — HERO: golden silk + vertical light shafts, slow cinematic drift */
  hero(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0 }, { opacity: 0.9, duration: 0.35 }, 0);
    tl.to(L.a, { opacity: 0.25, duration: 0.65 }, 0.35);
    tl.fromTo(L.b, { opacity: 0, yPercent: -6 }, { opacity: 1, yPercent: 0, duration: 0.4 }, 0.05);
    tl.fromTo(L.c, { xPercent: -130, opacity: 0 }, { xPercent: 130, opacity: 1, duration: 1 }, 0);
    tl.fromTo(L.d, { opacity: 0 }, { opacity: 0.7, duration: 0.5 }, 0.1);
  },

  /* 02 — AUDIENCE: black runway, three independent overhead spotlights */
  audience(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0, scale: 0.82 }, { opacity: 0.9, scale: 1, duration: 0.3 }, 0);
    tl.fromTo(L.b, { opacity: 0, scale: 0.82 }, { opacity: 0.9, scale: 1, duration: 0.3 }, 0.12);
    tl.fromTo(L.c, { opacity: 0, scale: 0.82 }, { opacity: 0.9, scale: 1, duration: 0.3 }, 0.24);
    tl.to(L.a, { opacity: 0.15, duration: 0.4 }, 0.6);
    tl.to(L.b, { opacity: 0.15, duration: 0.4 }, 0.6);
    tl.to(L.c, { opacity: 0.15, duration: 0.4 }, 0.6);
    tl.fromTo(L.d, { opacity: 0 }, { opacity: 0.8, duration: 0.5 }, 0.1);
  },

  /* 03 — STATEMENT: matte black, one elegant moving diagonal champagne beam */
  statement(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { xPercent: -60, opacity: 0 }, { xPercent: 30, opacity: 0.9, duration: 0.6 }, 0);
    tl.to(L.a, { opacity: 0.1, duration: 0.4 }, 0.6);
    tl.fromTo(L.b, { xPercent: 60, opacity: 0 }, { xPercent: -25, opacity: 0.5, duration: 1 }, 0);
  },

  /* 04 — ARRIVALS: obsidian + elliptical halos under product cards */
  arrivals(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0 }, { opacity: 0.85, duration: 0.4 }, 0);
    tl.fromTo(L.b, { opacity: 0, xPercent: -8 }, { opacity: 0.7, xPercent: 0, duration: 0.6 }, 0.1);

    const items = Array.from(
      section.querySelectorAll<HTMLElement>(".rail > .reveal"),
    );
    items.forEach((item, i) => {
      const p = (i / Math.max(1, items.length - 1)) * 0.5;
      tl.fromTo(
        item,
        { "--halo": 0 },
        { "--halo": 1, duration: 0.25, ease: "power1.out" },
        p,
      );
      tl.to(item, { "--halo": 0, duration: 0.25 }, p + 0.35);
    });
  },

  /* 05 — CATEGORIES: architectural gallery, geometric shafts, staggered gold */
  categories(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0, xPercent: -40 }, { opacity: 0.8, xPercent: 20, duration: 0.7 }, 0);
    tl.fromTo(L.b, { opacity: 0, xPercent: 40 }, { opacity: 0.5, xPercent: -20, duration: 0.7 }, 0.15);

    const tiles = Array.from(
      section.querySelectorAll<HTMLElement>(".grid > .reveal"),
    );
    tiles.forEach((tile, i) => {
      const p = 0.1 + (i / Math.max(1, tiles.length - 1)) * 0.45;
      tl.fromTo(tile, { "--halo": 0 }, { "--halo": 1, duration: 0.22, ease: "power1.out" }, p);
      tl.to(tile, { "--halo": 0.25, duration: 0.3 }, p + 0.3);
    });
  },

  /* 06 — OCCASIONS: four distinct lighting zones, crossfade in sequence */
  occasions(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    [L.a, L.b, L.c, L.d].forEach((zone, i) => {
      const p = 0.05 + i * 0.11;
      tl.fromTo(zone, { opacity: 0 }, { opacity: 1, duration: 0.2 }, p);
      tl.to(zone, { opacity: 0.35, duration: 0.4 }, 0.7 + i * 0.02);
    });
    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".occasion-card"),
    );
    cards.forEach((card, i) => {
      const p = 0.08 + i * 0.1;
      tl.fromTo(card, { "--halo": 0 }, { "--halo": 1, duration: 0.2, ease: "power1.out" }, p);
    });
  },

  /* 07 — SALE: deep burgundy-black, energetic amber streaks, restrained pulses */
  sale(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0, xPercent: -70 }, { opacity: 0.9, xPercent: 50, duration: 0.6 }, 0);
    tl.fromTo(L.b, { opacity: 0, xPercent: 70 }, { opacity: 0.6, xPercent: -50, duration: 0.6 }, 0.1);
    tl.fromTo(L.c, { opacity: 0, scale: 0.8 }, { opacity: 0.9, scale: 1.15, duration: 0.5 }, 0.15);
    tl.to(L.c, { opacity: 0.3, scale: 0.9, duration: 0.5 }, 0.5);
  },

  /* 08 — STORY: dark bronze woven texture + soft moving ambient illumination */
  story(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0 }, { opacity: 0.7, duration: 0.4 }, 0);
    tl.fromTo(
      L.b,
      { opacity: 0, xPercent: -20, yPercent: -10 },
      { opacity: 0.8, xPercent: 10, yPercent: 6, duration: 1 },
      0,
    );
  },

  /* 09 — TESTIMONIALS: minimal charcoal + warm edge lighting */
  testimonials(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0 }, { opacity: 0.9, duration: 0.4 }, 0);
    tl.fromTo(L.b, { opacity: 0 }, { opacity: 0.6, duration: 0.5 }, 0.1);
    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".grid > .reveal"),
    );
    cards.forEach((card, i) => {
      const p = 0.1 + i * 0.1;
      tl.fromTo(card, { "--halo": 0 }, { "--halo": 1, duration: 0.2, ease: "power1.out" }, p);
    });
  },

  /* 10 — TRUST: dark metallic surface + animated fine gold lines */
  trust(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0 }, { opacity: 0.65, duration: 0.4 }, 0);
    tl.fromTo(L.b, { xPercent: -110, opacity: 0 }, { xPercent: 110, opacity: 0.9, duration: 0.9 }, 0);
    tl.fromTo(L.c, { opacity: 0 }, { opacity: 0.8, duration: 0.4 }, 0.1);
  },

  /* 11 — DROP: editorial black, alternating teal + warm-gold illumination */
  drop(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0 }, { opacity: 0.85, duration: 0.4 }, 0);
    tl.fromTo(L.b, { opacity: 0 }, { opacity: 0.7, duration: 0.5 }, 0.12);
    const items = Array.from(
      section.querySelectorAll<HTMLElement>(".grid > .reveal"),
    );
    items.forEach((item, i) => {
      const p = 0.05 + (i / Math.max(1, items.length - 1)) * 0.5;
      tl.fromTo(item, { "--halo": 0 }, { "--halo": 1, duration: 0.2, ease: "power1.out" }, p);
    });
  },

  /* 12 — NEWSLETTER: golden sunrise glow that grows as the section enters */
  newsletter(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0, scale: 0.55, yPercent: 30 }, { opacity: 1, scale: 1, yPercent: 0, duration: 0.5, ease: "power2.out" }, 0);
    tl.to(L.a, { opacity: 0.4, scale: 0.9, duration: 0.5 }, 0.5);
    tl.fromTo(L.b, { opacity: 0 }, { opacity: 0.7, duration: 0.4 }, 0.1);
    tl.fromTo(L.c, { opacity: 0, rotation: -20 }, { opacity: 0.6, rotation: 0, duration: 0.5 }, 0.05);
  },

  /* 13 — FOOTER: obsidian finish, bronze grain, minimal movement */
  footer(section, L) {
    const tl = gsap.timeline({ scrollTrigger: scr(section), defaults: { ease: "none" } });
    tl.fromTo(L.a, { opacity: 0 }, { opacity: 0.7, duration: 0.4 }, 0);
    tl.fromTo(L.b, { opacity: 0 }, { opacity: 0.5, duration: 0.6 }, 0.1);
    tl.to(L.b, { opacity: 0.18, duration: 0.4 }, 0.6);
  },
};
