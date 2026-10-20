"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

declare global {
  interface Window {
    __timelines: Record<string, gsap.core.Timeline>;
  }
}

export type HeroPanelItem = {
  key: string;
  index: string;
  title: string;
  href: string;
  img: string;
  bg: string;
};

export default function HeroPanels({ panels }: { panels: readonly HeroPanelItem[] }) {
  const router = useRouter();

  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const panelRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const bgRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const shell = shellRef.current;
    const panelEls = panelRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const bgEls = bgRefs.current.filter(Boolean) as HTMLSpanElement[];
    const backEl = backRef.current;
    const N = panelEls.length;
    if (!root || !shell || N === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const narrow = window.matchMedia("(max-width: 768px)");

    const REST = 1 / N;
    const ON = 0.54;
    const OFF = (1 - ON) / (N - 1);
    const MAX_PARALLAX = 24;
    const STAGGER = 0.08;
    const ENTRY_DURATION = 0.6;

    let hoverIdx = -1;
    let px = 0;
    let py = 0;
    let hasPointer = false;
    let zoomed = false;
    let lastExpanded: HTMLAnchorElement | null = null;

    const getRects = () => {
      const cr = shell.getBoundingClientRect();
      return panelEls.map((panel, i) => {
        const s = panel.style.flexGrow || "0";
        const grow = parseFloat(s);
        const span = (Math.max(grow, REST) / (N * REST)) * (narrow.matches ? cr.height : cr.width);
        const cursor = panelEls.slice(0, i).reduce((acc, p) => {
          const g = parseFloat(p.style.flexGrow || "0");
          return acc + (Math.max(g, REST) / (N * REST)) * (narrow.matches ? cr.height : cr.width);
        }, 0);
        return narrow.matches
          ? { left: 0, top: cursor, width: cr.width, height: span }
          : { left: cursor, top: 0, width: span, height: cr.height };
      });
    };

    const createEntranceTimeline = () => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

      panelEls.forEach((panel, i) => {
        tl.fromTo(
          panel,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: ENTRY_DURATION },
          i * STAGGER
        );
        if (bgEls[i]) {
          tl.fromTo(
            bgEls[i],
            { scale: 1.1 },
            { scale: 1, duration: ENTRY_DURATION },
            i * STAGGER
          );
        }
      });

      return tl;
    };

    const entranceTl = createEntranceTimeline();
    timelineRef.current = entranceTl;

    if (typeof window !== "undefined") {
      window.__timelines = window.__timelines || {};
      window.__timelines["hero-panels"] = entranceTl;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        entranceTl.pause();
      } else {
        entranceTl.resume();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    entranceTl.play();

    const updatePanelStates = (targetHoverIdx: number, isZoomed: boolean, expandedEl: HTMLAnchorElement | null) => {
      panelEls.forEach((panel, i) => {
        const isExp = isZoomed && panel === expandedEl;
        const isHov = !isZoomed && targetHoverIdx >= 0 && i === targetHoverIdx;
        const tg = isZoomed ? (isExp ? 1 : 0) : targetHoverIdx >= 0 ? (isHov ? ON : OFF) : REST;
        const ta = isHov || isExp ? 1 : 0;
        const td = targetHoverIdx >= 0 && !isHov && !isZoomed ? 1 : 0;

        gsap.to(panel, { flexGrow: Math.max(0, tg), duration: 0.4, ease: "power3.out", overwrite: "auto" });
        panel.style.setProperty("--a", ta.toString());
        panel.style.setProperty("--t", ta.toString());
        panel.style.setProperty("--d", td.toString());

        const on = ta === 1;
        panel.classList.toggle("is-active", on);

        if (isZoomed) {
          panel.classList.toggle("is-expanded", isExp);
        }
      });

      root.classList.toggle("is-zoomed", isZoomed);
    };

    const quickX = gsap.quickTo(panelEls, "x", { duration: 0.4, ease: "power3" });
    const quickY = gsap.quickTo(panelEls, "y", { duration: 0.4, ease: "power3" });

    let parallaxRaf = 0;
    const animateParallax = () => {
      if (!hasPointer || zoomed || reduced.matches) return;
      const rects = getRects();
      const cr = shell.getBoundingClientRect();
      const ox = px - cr.left;
      const oy = py - cr.top;

      panelEls.forEach((_panel, i) => {
        const r = rects[i];
        if (r.width <= 1 || r.height <= 1) return;
        const tx = -Math.max(-1, Math.min(1, (ox - (r.left + r.width / 2)) / (r.width / 2))) * MAX_PARALLAX;
        const ty = -Math.max(-1, Math.min(1, (oy - (r.top + r.height / 2)) / (r.height / 2))) * MAX_PARALLAX;
        const tsx = Math.max(0, Math.min(1, (ox - r.left) / r.width)) * 100;
        const tsy = Math.max(0, Math.min(1, (oy - r.top) / r.height)) * 100;

        quickX(tx);
        quickY(ty);
        panelEls[i].style.setProperty("--sx", `${tsx.toFixed(1)}%`);
        panelEls[i].style.setProperty("--sy", `${tsy.toFixed(1)}%`);

        const bg = bgEls[i];
        if (bg) bg.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)`;
      });

      parallaxRaf = requestAnimationFrame(animateParallax);
    };

    const expand = (el: HTMLAnchorElement, fromKeyboard: boolean) => {
      if (zoomed && el.classList.contains("is-expanded")) return;
      lastExpanded = el;
      zoomed = true;
      updatePanelStates(-1, true, el);
      if (fromKeyboard) backEl?.focus();
    };

    const collapse = (fromKeyboard: boolean) => {
      const wasExpanded = lastExpanded;
      zoomed = false;
      lastExpanded = null;
      updatePanelStates(-1, false, null);
      if (fromKeyboard && wasExpanded) wasExpanded.focus();
    };

    const activate = (i: number, fromKeyboard: boolean) => {
      const el = panelEls[i];
      if (!el) return;
      if (zoomed) {
        if (lastExpanded === el) router.push(el.getAttribute("href") || "#");
        return;
      }
      expand(el, fromKeyboard);
    };

    const offs: Array<() => void> = [];

    panelEls.forEach((p, i) => {
      const onEnter = () => {
        hoverIdx = i;
        updatePanelStates(i, false, null);
      };
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        activate(i, false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          activate(i, true);
        }
      };
      const onFocus = () => {
        hoverIdx = i;
        updatePanelStates(i, false, null);
      };
      const onBlur = () => {
        if (hoverIdx === i) {
          hoverIdx = -1;
          updatePanelStates(-1, false, null);
        }
      };

      if (fine.matches) p.addEventListener("pointerenter", onEnter);
      p.addEventListener("click", onClick);
      p.addEventListener("keydown", onKey);
      p.addEventListener("focus", onFocus);
      p.addEventListener("blur", onBlur);

      offs.push(() => {
        p.removeEventListener("pointerenter", onEnter);
        p.removeEventListener("click", onClick);
        p.removeEventListener("keydown", onKey);
        p.removeEventListener("focus", onFocus);
        p.removeEventListener("blur", onBlur);
      });
    });

    const onPointerLeave = () => {
      hoverIdx = -1;
      hasPointer = false;
      parallaxStarted = false;
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
      updatePanelStates(-1, false, null);
    };
    let parallaxStarted = false;
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      hasPointer = true;
      if (!zoomed && !reduced.matches && !parallaxStarted) {
        parallaxStarted = true;
        requestAnimationFrame(animateParallax);
      }
    };
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zoomed) collapse(true);
    };
    const onBack = () => collapse(false);

    if (fine.matches) {
      root.addEventListener("pointerleave", onPointerLeave);
      root.addEventListener("pointermove", onPointerMove);
    }
    document.addEventListener("keydown", onDocKey);
    if (backEl) backEl.addEventListener("click", onBack);

    offs.push(() => {
      if (fine.matches) {
        root.removeEventListener("pointerleave", onPointerLeave);
        root.removeEventListener("pointermove", onPointerMove);
      }
      document.removeEventListener("keydown", onDocKey);
      if (backEl) backEl.removeEventListener("click", onBack);
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
      parallaxStarted = false;
      entranceTl.kill();
      if (typeof window !== "undefined" && window.__timelines) {
        delete window.__timelines["hero-panels"];
      }
      offs.forEach((off) => off());
    };
  }, [panels, router]);

  return (
    <div ref={rootRef} className="hp relative w-full" data-composition-id="hero-panels" data-duration="3">
      <div ref={shellRef} className="hp__shell flex w-full">
        {panels.map((h, i) => (
          <a
            key={h.key}
            href={h.href}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            data-cursor="Explore"
            className="hp__panel hero-enter group relative"
            style={{ background: h.bg }}
          >
            <span
              ref={(el) => {
                bgRefs.current[i] = el;
              }}
              className="hp__bg"
            >
              <Image
                src={h.img}
                alt={`${h.title} collection`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="hp__img object-cover object-center"
              />
            </span>
            <span className="hp__overlay" aria-hidden="true" />
            <span className="hp__sheen" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="hp__num"
              style={{ fontFamily: "'Cormorant Garamond','Playfair Display',serif" }}
            >
              {h.index}
            </span>
            <span className="hp__content">
              <span
                className="hp__title"
                style={{ fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif" }}
              >
                {h.title}
              </span>
              <span aria-hidden="true" className="hp__bar" />
              <span className="hp__cta">
                Shop {h.title} <span aria-hidden="true">→</span>
              </span>
            </span>
          </a>
        ))}
      </div>
      <button ref={backRef} type="button" className="hp__back">
        <span aria-hidden="true">←</span> Back
      </button>
    </div>
  );
}