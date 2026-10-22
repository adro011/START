"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { asset, motionNumber } from "@/lib/content";

const CONFIG = {
  rest: 1,
  hovered: motionNumber("effects", "category.hoverGrow", 2.0),
  others: motionNumber("effects", "category.othersGrow", 0.85),
  parallaxMax: 28,
  zoomIn: 1.08,
  zoomOut: 1.0,
  titleShiftIn: 0,
  titleShiftOut: 22,
  ctaIn: 1,
  ctaOut: 0,
  overlayIn: 0.15,
  overlayOut: 0,
  ease: "expo.out",
  duration: motionNumber("effects", "category.duration", 1.7),
  imageDuration: 1.8,
  titleDuration: 1.9,
  ctaDuration: 2.0,
  glazeDuration: 1.2,
  cursorDuration: 0.9,
  idleZoomDuration: 14,
  idleZoomScale: 1.04,
} as {
  rest: number;
  hovered: number;
  others: number;
  parallaxMax: number;
  zoomIn: number;
  zoomOut: number;
  titleShiftIn: number;
  titleShiftOut: number;
  ctaIn: number;
  ctaOut: number;
  overlayIn: number;
  overlayOut: number;
  ease: string;
  duration: number;
  imageDuration: number;
  titleDuration: number;
  ctaDuration: number;
  glazeDuration: number;
  cursorDuration: number;
  idleZoomDuration: number;
  idleZoomScale: number;
};

type Panel = {
  id: string;
  number: string;
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
    img: asset("categories", "men.portrait", "/hero/men.jpg"),
    alt: asset("categories", "men.alt", "Men's collection"),
  },
  {
    id: "women",
    number: "02",
    title: "WOMEN",
    href: "/women",
    img: asset("categories", "women.portrait", "/hero/women.jpg"),
    alt: asset("categories", "women.alt", "Women's collection"),
  },
  {
    id: "kids",
    number: "03",
    title: "KIDS",
    href: "/kids",
    img: asset("categories", "kids.portrait", "/hero/kids.jpg"),
    alt: asset("categories", "kids.alt", "Kids' collection"),
  },
];

export default function CategoryShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<any>(null);
  const itemsRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const [active, setActive] = useState<string | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;

    import("gsap").then((mod) => {
      if (disposed) return;
      gsapRef.current = mod.gsap;
      const gsap = mod.gsap;

      if (reduceMotion.current) {
        renderStatic();
        return;
      }

      const mm = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (!mm.matches) {
        renderStatic();
        return;
      }

      const cursorX = gsap.quickTo(cursor.current, "x", {
        duration: CONFIG.cursorDuration,
        ease: "power3.out",
      });
      const cursorY = gsap.quickTo(cursor.current, "y", {
        duration: CONFIG.cursorDuration,
        ease: "power3.out",
      });
      const onMove = (e: MouseEvent) => {
        cursorX(e.clientX);
        cursorY(e.clientY);
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        const img = el.querySelector("[data-parallax]") as HTMLElement | null;
        if (!img) return;
        gsap.fromTo(
          img,
          { scale: 1.0 },
          {
            scale: CONFIG.idleZoomScale,
            duration: CONFIG.idleZoomDuration,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 2,
          }
        );
      });

      renderStatic();

      return () => {
        window.removeEventListener("mousemove", onMove);
      };
    });

    return () => {
      disposed = true;
    };
  }, []);

  const renderStatic = () => {
    if (!gsapRef.current) return;
    const gsap = gsapRef.current;
    itemsRef.current.forEach((el) => {
      if (!el) return;
      const img = el.querySelector("[data-parallax]") as HTMLElement | null;
      const overlay = el.querySelector("[data-overlay]") as HTMLElement | null;
      const title = el.querySelector("[data-title]") as HTMLElement | null;
      const cta = el.querySelector("[data-cta]") as HTMLElement | null;
      const glaze = el.querySelector("[data-glaze]") as HTMLElement | null;

      if (img) gsap.set(img, { scale: 1.08, x: 0, y: 0 });
      if (overlay) gsap.set(overlay, { opacity: CONFIG.overlayOut });
      if (title) gsap.set(title, { y: CONFIG.titleShiftOut });
      if (cta) gsap.set(cta, { opacity: CONFIG.ctaOut });
      if (glaze) gsap.set(glaze, { opacity: 0 });
    });
  };

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
      const glaze = el.querySelector("[data-glaze]") as HTMLElement | null;

      let grow = CONFIG.rest;
      if (hoveredId === id) {
        grow = CONFIG.hovered;
      } else if (hoveredId) {
        grow = CONFIG.others;
      }

      gsap.set(el, { flexGrow: grow });

      const isHovered = hoveredId === id;
      const zoom = isHovered ? CONFIG.zoomIn : CONFIG.zoomOut;
      const px = isHovered ? (-mx / el.clientWidth) * CONFIG.parallaxMax : 0;
      const py = isHovered ? (-my / el.clientHeight) * CONFIG.parallaxMax : 0;
      if (img) {
        gsap.to(img, {
          scale: zoom,
          x: px,
          y: py,
          duration: CONFIG.imageDuration,
          ease: CONFIG.ease,
          overwrite: "auto",
        });
      }

      if (overlay) {
        gsap.to(overlay, {
          opacity: isHovered ? CONFIG.overlayIn : CONFIG.overlayOut,
          duration: CONFIG.duration,
          ease: CONFIG.ease,
          overwrite: "auto",
        });
      }
      if (title) {
        gsap.to(title, {
          y: isHovered ? CONFIG.titleShiftIn : CONFIG.titleShiftOut,
          duration: CONFIG.titleDuration,
          ease: CONFIG.ease,
          overwrite: "auto",
        });
      }
      if (cta) {
        gsap.to(cta, {
          opacity: isHovered ? CONFIG.ctaIn : CONFIG.ctaOut,
          duration: CONFIG.ctaDuration,
          ease: CONFIG.ease,
          overwrite: "auto",
        });
      }
      if (glaze) {
        const rect = el.getBoundingClientRect();
        const gx = mx ? ((mx + rect.width / 2) / rect.width) * 100 : 50;
        const gy = my ? ((my + rect.height / 2) / rect.height) * 100 : 50;
        gsap.to(glaze, {
          opacity: isHovered ? 1 : 0,
          duration: CONFIG.glazeDuration,
          ease: CONFIG.ease,
          overwrite: "auto",
        });
        gsap.set(glaze, { "--glaze-x": `${gx}%`, "--glaze-y": `${gy}%` });
      }
    });
  };

  useEffect(() => {
    if (reduceMotion.current) {
      renderStatic();
      return;
    }
    const rootEl = root.current;
    if (!rootEl) return;
    const mm = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mm.matches) {
      renderStatic();
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
    renderStatic();
    return () => {
      rootEl.removeEventListener("mouseenter", onEnter);
      rootEl.removeEventListener("mouseleave", onLeave);
      rootEl.removeEventListener("mousemove", onMove);
    };
  }, [active]);

  return (
    <section
      aria-label="Category showcase"
      className="category-showcase relative h-[100dvh] w-full overflow-hidden bg-black text-white"
    >
      <div ref={root} className="flex h-full flex-col md:flex-row">
        {PANELS.map((p, i) => (
          <Link
            key={p.id}
            href={p.href}
            data-id={p.id}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            className="group relative flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-gold)]"
            onMouseEnter={() => setActive(p.id)}
            onMouseLeave={() => setActive((a) => (a === p.id ? null : a))}
            onFocus={() => setActive(p.id)}
            onBlur={() => setActive((a) => (a === p.id ? null : a))}
            onClick={() => {
              if (!reduceMotion.current && window.matchMedia("(hover: hover) and (pointer: fine)").matches)
                return;
              setActive(p.id);
            }}
          >
            <Image
              src={p.img}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center will-change-transform"
              data-parallax
              priority={i === 0}
            />
            <span
              className="pointer-events-none absolute inset-0 bg-black"
              data-overlay
              style={{ opacity: CONFIG.overlayOut }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light"
              data-glaze
              style={{
                background:
                  "radial-gradient(45% 45% at var(--glaze-x, 50%) var(--glaze-y, 50%), rgba(255,255,255,0.18), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-5 right-6 text-[40px] font-semibold tracking-tight text-white sm:text-[48px]"
              style={{
                fontFamily: "'Cormorant Garamond','Playfair Display',serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.3)",
                color: "transparent",
              }}
            >
              {p.number}
            </span>
            <span className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col gap-4 px-6 sm:bottom-9 sm:px-9">
              <span
                data-title
                style={{
                  transform: `translate3d(0, ${CONFIG.titleShiftOut}px, 0)`,
                }}
              >
                <span
                  className="block text-[clamp(28px,5.2vw,84px)] leading-[0.92] font-medium whitespace-nowrap uppercase"
                  style={{
                    fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
                  }}
                >
                  {p.title}
                </span>
              </span>
              <span
                data-cta
                className="group relative inline-flex w-fit items-center gap-2 text-[12px] font-semibold tracking-[0.16em] uppercase text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden={active !== p.id && !reduceMotion.current}
              >
                SHOP NOW <span aria-hidden="true">&rarr;</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
      {!reduceMotion.current && typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches && (
        <div
          ref={cursor}
          className="pointer-events-none fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 px-4 py-2 text-[11px] tracking-[0.16em] uppercase backdrop-blur-sm"
          aria-hidden="true"
        >
          Explore
        </div>
      )}
    </section>
  );
}
