"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CONFIG = {
  rest: 1,
  hovered: 2.3 as any,
  others: 0.75 as any,
  parallaxMax: 22,
  zoomIn: 1.06,
  zoomOut: 1.0,
  titleShiftIn: 0,
  titleShiftOut: 14,
  ctaIn: 1,
  ctaOut: 0,
  overlayIn: 0,
  overlayOut: 0.48,
  ease: "power3.out",
  duration: 0.9,
} as const;

type Panel = {
  id: "men" | "women" | "kids";
  number: "01" | "02" | "03";
  title: string;
  href: string;
  img: string;
  alt: string;
};

const PANELS: Panel[] = [
  {
    id: "men",
    number: "01",
    title: "MEN",
    href: "/men",
    img: "/library/men.png",
    alt: "Men's collection",
  },
  {
    id: "women",
    number: "02",
    title: "WOMEN",
    href: "/women",
    img: "/library/women.png",
    alt: "Women's collection",
  },
  {
    id: "kids",
    number: "03",
    title: "KIDS",
    href: "/kids",
    img: "/library/children.png",
    alt: "Kids' collection",
  },
];

export default function CategoryShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<any>(null);
  const itemsRef = useRef<HTMLAnchorElement[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("gsap").then((mod) => {
      gsapRef.current = mod.gsap;
      if (reduceMotion.current) return;
      const mm = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (!mm.matches) return;
      const setCursor = (x: number, y: number) => {
        if (cursor.current && gsapRef.current) {
          gsapRef.current.to(cursor.current, { x, y, duration: 0.5, ease: "power2.out" });
        }
      };
      const onMove = (e: MouseEvent) => setCursor(e.clientX, e.clientY);
      window.addEventListener("mousemove", onMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMove);
    });
  }, []);

  const render = (hoveredId?: string | null, mx = 0, my = 0) => {
    if (!gsapRef.current) return;
    const gsap = gsapRef.current;
    itemsRef.current.forEach((el) => {
      if (!el) return;
      const id = el.dataset.id as string;
      const img = el.querySelector("[data-parallax]") as HTMLElement | null;
      const overlay = el.querySelector("[data-overlay]") as HTMLElement | null;
      const title = el.querySelector("[data-title]") as HTMLElement | null;
      const cta = el.querySelector("[data-cta]") as HTMLElement | null;
      let grow = CONFIG.rest;
      if (!hoveredId) {
        grow = CONFIG.rest;
      } else if (hoveredId === id) {
        grow = CONFIG.hovered;
      } else {
        grow = CONFIG.others;
      }
      gsap.quickTo(el, { flexGrow: grow as any, duration: CONFIG.duration, ease: CONFIG.ease });

      const zoom = hoveredId === id ? CONFIG.zoomIn : CONFIG.zoomOut;
      const px = hoveredId === id ? (-mx / el.clientWidth) * CONFIG.parallaxMax : 0;
      const py = hoveredId === id ? (-my / el.clientHeight) * CONFIG.parallaxMax : 0;
      if (img) gsap.quickTo(img, { scale: zoom, x: px, y: py, duration: CONFIG.duration, ease: CONFIG.ease });

      if (overlay) gsap.quickTo(overlay, { opacity: hoveredId === id ? CONFIG.overlayIn : CONFIG.overlayOut, duration: CONFIG.duration, ease: CONFIG.ease });
      if (title) gsap.quickTo(title, { y: hoveredId === id ? CONFIG.titleShiftIn : CONFIG.titleShiftOut, duration: CONFIG.duration, ease: CONFIG.ease });
      if (cta) gsap.quickTo(cta, { opacity: hoveredId === id ? CONFIG.ctaIn : CONFIG.ctaOut, duration: CONFIG.duration, ease: CONFIG.ease });
    });
  };

  useEffect(() => {
    if (reduceMotion.current) {
      render(null);
      return;
    }
    const rootEl = root.current;
    if (!rootEl) return;
    const mm = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mm.matches) {
      render(null);
      return;
    }
    const onEnter = () => render(active);
    const onLeave = () => render(null);
    const onMove = (e: MouseEvent) => {
      if (!active) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const mx = e.clientX - (rect.left + rect.width / 2);
      const my = e.clientY - (rect.top + rect.height / 2);
      render(active, mx, my);
    };
    rootEl.addEventListener("mouseenter", onEnter, { passive: true });
    rootEl.addEventListener("mouseleave", onLeave, { passive: true });
    rootEl.addEventListener("mousemove", onMove, { passive: true });
    render(null);
    return () => {
      rootEl.removeEventListener("mouseenter", onEnter);
      rootEl.removeEventListener("mouseleave", onLeave);
      rootEl.removeEventListener("mousemove", onMove);
    };
  }, [active]);

  return (
    <section aria-label="Category showcase" className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      <div ref={root} className="flex h-full flex-col md:flex-row">
        {PANELS.map((p, i) => (
          <Link
            key={p.id}
            href={p.href}
            data-id={p.id}
            ref={(el) => {
              if (el) itemsRef.current[i] = el;
            }}
            className="group relative flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#FFC000]"
            onMouseEnter={() => setActive(p.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(p.id)}
            onBlur={() => setActive(null)}
            onClick={() => {
              if (!reduceMotion.current && window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
              setActive(p.id);
            }}
          >
            <Image
              src={p.img}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center"
              data-parallax
              priority={i === 0}
            />
            <div className="pointer-events-none absolute inset-0 bg-black" data-overlay style={{ opacity: reduceMotion.current ? 0.35 : CONFIG.overlayOut }} />
            <span className="pointer-events-none absolute right-5 top-5 text-[40px] font-semibold tracking-tight sm:text-[48px]" style={{ fontFamily: "'Cormorant Garamond','Playfair Display',serif" }} aria-hidden="true">
              {p.number}
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col gap-4 px-6 sm:bottom-9 sm:px-9">
              <span data-title style={{ transform: reduceMotion.current ? "none" : `translateY(${CONFIG.titleShiftOut}px)` }}>
                <span className="block whitespace-nowrap text-[clamp(28px,5.2vw,84px)] leading-[0.92] font-medium uppercase" style={{ fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif" }}>
                  {p.title}
                </span>
              </span>
              <span data-cta className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] uppercase opacity-0" aria-hidden={active !== p.id && !reduceMotion.current}>
                SHOP NOW <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!reduceMotion.current && window.matchMedia("(hover: hover) and (pointer: fine)").matches && (
        <div ref={cursor} className="pointer-events-none fixed left-0 top-0 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 px-4 py-2 text-[11px] tracking-[0.16em] uppercase backdrop-blur-sm" aria-hidden="true">
          Explore
        </div>
      )}
    </section>
  );
}
