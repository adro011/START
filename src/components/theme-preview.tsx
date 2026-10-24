"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "abrar-theme-preview";
const THEME_VALUE = "obsidian-leather";

/**
 * Obsidian Leather Studio — reversible preview driver.
 *
 * - Resolves the preview from `?theme-preview=obsidian-leather` (persisted) or
 *   localStorage; the original theme stays the default when neither is set.
 * - Adds `.obsidian-ready` so the CSS gates the studio light behind a
 *   one-time IntersectionObserver reveal (static final design without JS).
 * - Renders a small comparison toggle for A/B previewing.
 *
 * Pure presentation — no business logic, no data, no routing changes.
 */
export function ThemePreview() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    // 1. Resolve initial theme (URL param wins, then persisted preference).
    const params = new URLSearchParams(window.location.search);
    const q = params.get("theme-preview");
    let on: boolean;
    if (q === THEME_VALUE) {
      on = true;
      try {
        window.localStorage.setItem(THEME_KEY, THEME_VALUE);
      } catch {
        /* storage unavailable — preview still applies for this visit */
      }
    } else if (q === null) {
      let stored = false;
      try {
        stored = window.localStorage.getItem(THEME_KEY) === THEME_VALUE;
      } catch {
        stored = false;
      }
      on = stored;
    } else {
      on = false;
    }
    apply(on);

    // 2. Signal JS readiness so the light is gated (opacity reveal) instead
    //    of being shown statically.
    root.classList.add("obsidian-ready");

    // 3. One-time scroll-triggered illumination per section.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sections = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-spotlight-section]"),
      );

    if (reduced || !("IntersectionObserver" in window)) {
      sections().forEach((s) => s.classList.add("obsidian-lit"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("obsidian-lit");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    sections().forEach((s) => io.observe(s));

    return () => io.disconnect();
  }, []);

  function apply(on: boolean) {
    const root = document.documentElement;
    if (on) root.setAttribute("data-theme", THEME_VALUE);
    else root.removeAttribute("data-theme");
    setEnabled(on);
  }

  function toggle() {
    const next = !enabled;
    try {
      if (next) window.localStorage.setItem(THEME_KEY, THEME_VALUE);
      else window.localStorage.removeItem(THEME_KEY);
    } catch {
      /* storage unavailable — apply for this visit only */
    }
    apply(next);
  }

  return (
    <button
      type="button"
      className="theme-preview-toggle"
      aria-pressed={enabled}
      onClick={toggle}
      title={
        enabled
          ? "Obsidian Leather preview on — click for original"
          : "Click to preview Obsidian Leather Studio"
      }
    >
      <span className="theme-preview-toggle__dot" aria-hidden="true" />
      Obsidian
    </button>
  );
}
