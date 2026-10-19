"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type HeroPanelItem = {
  key: string;
  index: string;
  title: string;
  href: string;
  img: string;
  bg: string;
};

type Vec = { v: number; vel: number };
type Spring = Vec & { f: Vec };
type PanelState = {
  g: Spring;
  a: Spring;
  t: Spring;
  d: Spring;
  x: Spring;
  y: Spring;
  sx: Spring;
  sy: Spring;
  on: boolean;
};

/**
 * Cinematic three-panel hero driven by a single JS spring engine.
 * Hover expands a panel (siblings dim), the cursor drives a parallax +
 * sheen, a click zooms a panel full-width, Esc / Back collapses it, and
 * keyboard focus mirrors hover. All motion is transform/opacity/flex-grow
 * only, driven by CSS variables the engine writes per frame.
 */
export default function HeroPanels({ panels }: { panels: readonly HeroPanelItem[] }) {
  const router = useRouter();

  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const panelRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const bgRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const rootMaybe = rootRef.current;
    const shellMaybe = shellRef.current;
    if (!rootMaybe || !shellMaybe) return;
    const root = rootMaybe;
    const shell = shellMaybe;
    const panelEls = panelRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const bgEls = bgRefs.current.filter(Boolean) as HTMLSpanElement[];
    const backEl = backRef.current;
    const N = panelEls.length;
    if (N === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const narrow = window.matchMedia("(max-width: 768px)");

    // Settle time (1 = original, bigger = slower). A panel settles in ~0.6 s.
    const SLOW = 0.27;
    const BASE: Record<string, number> = { grow: 0.7, img: 0.85, txt: 1.05, dim: 0.9, par: 0.55, sheen: 0.4 };
    const TIME: Record<string, number> = {};
    for (const k in BASE) TIME[k] = BASE[k] * SLOW;

    const REST = 1 / N;
    const ON = 0.54;
    const OFF = (1 - ON) / (N - 1);
    const MAX = 24; // parallax px

    let hoverIdx = -1;
    let px = 0;
    let py = 0;
    let hasPointer = false;
    let running = false;
    let last = 0;
    let dtS = 1 / 60;
    let raf = 0;
    let zoomed = false;
    let lastExpanded: HTMLAnchorElement | null = null;

    const spring = (v: number): Spring => ({ v, vel: 0, f: { v, vel: 0 } });
    const st: PanelState[] = panelEls.map(() => ({
      g: spring(REST),
      a: spring(0),
      t: spring(0),
      d: spring(0),
      x: spring(0),
      y: spring(0),
      sx: spring(50),
      sy: spring(50),
      on: false,
    }));

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    function step(o: Vec, target: number, time: number, dt: number) {
      const w = 2 / time;
      const x = w * dt;
      const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const c = o.v - target;
      const tmp = (o.vel + w * c) * dt;
      o.vel = (o.vel - w * tmp) * e;
      o.v = target + (c + tmp) * e;
    }

    // Two chained springs: soft start AND stop.
    function sd(o: Spring, target: number, time: number, dt: number) {
      if (reduced.matches) time = 0.08; // reduced motion: quick but NOT instant
      step(o.f, target, time * 0.6, dt);
      step(o, o.f.v, time, dt);
    }

    function busy(o: Spring, target: number, eps: number) {
      return Math.abs(o.v - target) > eps || Math.abs(o.vel) > eps || Math.abs(o.f.vel) > eps;
    }

    function frame(now: number) {
      const raw = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      dtS += (raw - dtS) * 0.2;
      const dt = dtS;

      const zoomedNow = zoomed;
      const anyHover = hoverIdx >= 0 && !zoomedNow;
      const still = !hasPointer || zoomedNow || reduced.matches;

      const cr = shell.getBoundingClientRect();
      const W = cr.width;
      const H = cr.height;
      const ox = px - cr.left;
      const oy = py - cr.top;

      let total = 0;
      st.forEach((q) => {
        total += Math.max(q.g.v, 0.0001);
      });

      let cursor = 0;
      let again = false;

      panelEls.forEach((panel, i) => {
        const s = st[i];
        const span = (Math.max(s.g.v, 0) / total) * (narrow.matches ? H : W);
        const r = narrow.matches
          ? { left: 0, top: cursor, width: W, height: span }
          : { left: cursor, top: 0, width: span, height: H };
        cursor += span;

        const isExp = zoomedNow && panel === lastExpanded;
        const isHov = anyHover && i === hoverIdx;
        const tg = zoomedNow ? (isExp ? 1 : 0) : anyHover ? (isHov ? ON : OFF) : REST;
        const ta = isHov || isExp ? 1 : 0;
        const td = anyHover && !isHov ? 1 : 0;

        let tx = 0;
        let ty = 0;
        let tsx = 50;
        let tsy = 50;
        if (!still && r.width > 1 && r.height > 1) {
          tx = -clamp((ox - (r.left + r.width / 2)) / (r.width / 2), -1, 1) * MAX;
          ty = -clamp((oy - (r.top + r.height / 2)) / (r.height / 2), -1, 1) * MAX;
          tsx = clamp((ox - r.left) / r.width, 0, 1) * 100;
          tsy = clamp((oy - r.top) / r.height, 0, 1) * 100;
        }

        sd(s.g, tg, TIME.grow, dt);
        sd(s.a, ta, TIME.img, dt);
        sd(s.t, ta, TIME.txt, dt);
        sd(s.d, td, TIME.dim, dt);
        sd(s.x, tx, TIME.par, dt);
        sd(s.y, ty, TIME.par, dt);
        sd(s.sx, tsx, TIME.sheen, dt);
        sd(s.sy, tsy, TIME.sheen, dt);

        panel.style.flexGrow = Math.max(0, s.g.v).toFixed(6);
        panel.style.setProperty("--a", clamp(s.a.v, 0, 1).toFixed(4));
        panel.style.setProperty("--t", clamp(s.t.v, 0, 1).toFixed(4));
        panel.style.setProperty("--d", clamp(s.d.v, 0, 1).toFixed(4));
        panel.style.setProperty("--sx", s.sx.v.toFixed(1) + "%");
        panel.style.setProperty("--sy", s.sy.v.toFixed(1) + "%");

        const bg = bgEls[i];
        if (bg) bg.style.transform = `translate3d(${s.x.v.toFixed(2)}px,${s.y.v.toFixed(2)}px,0)`;

        const on = ta === 1;
        if (on !== s.on) {
          s.on = on;
          panel.classList.toggle("is-active", on);
        }

        if (
          busy(s.g, tg, 0.0005) ||
          busy(s.a, ta, 0.002) ||
          busy(s.t, ta, 0.002) ||
          busy(s.d, td, 0.002) ||
          busy(s.x, tx, 0.05) ||
          busy(s.y, ty, 0.05) ||
          busy(s.sx, tsx, 0.2) ||
          busy(s.sy, tsy, 0.2)
        ) {
          again = true;
        }
      });

      if (again) raf = requestAnimationFrame(frame);
      else running = false;
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function expand(el: HTMLAnchorElement, fromKeyboard: boolean) {
      if (zoomed && el.classList.contains("is-expanded")) return;
      panelEls.forEach((p) => p.classList.toggle("is-expanded", p === el));
      root.classList.add("is-zoomed");
      zoomed = true;
      lastExpanded = el;
      if (fromKeyboard) backEl?.focus();
      start();
    }

    function collapse(fromKeyboard: boolean) {
      panelEls.forEach((p) => p.classList.remove("is-expanded"));
      root.classList.remove("is-zoomed");
      zoomed = false;
      if (fromKeyboard && lastExpanded) lastExpanded.focus();
      start();
    }

    function activate(i: number, fromKeyboard: boolean) {
      const el = panelEls[i];
      if (!el) return;
      if (zoomed) {
        if (lastExpanded === el) router.push(el.getAttribute("href") || "#");
        return;
      }
      expand(el, fromKeyboard);
    }

    const offs: Array<() => void> = [];

    panelEls.forEach((p, i) => {
      const onEnter = () => {
        hoverIdx = i;
        start();
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
        start();
      };
      const onBlur = () => {
        if (hoverIdx === i) {
          hoverIdx = -1;
          start();
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
      start();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      hasPointer = true;
      start();
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

    start();

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      offs.forEach((off) => off());
    };
  }, [panels, router]);

  return (
    <div ref={rootRef} className="hp relative w-full">
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
            style={{ animationDelay: `${120 + i * 110}ms`, background: h.bg }}
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
