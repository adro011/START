"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/lib/catalog";
import { cn } from "@/lib/format";

const RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]";

/**
 * Editorial gallery: 2-up grid (last tile spans full width when the count
 * is odd). Every tile is a real button opening the fullscreen lightbox
 * (Esc closes, arrows page, scroll locks, focus enters + returns).
 */
export default function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  const prev = useCallback(() => {
    setLightbox((cur) =>
      cur === null ? cur : (cur - 1 + images.length) % images.length,
    );
  }, [images.length]);
  const next = useCallback(() => {
    setLightbox((cur) => (cur === null ? cur : (cur + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        return;
      }
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const items = [...root.querySelectorAll<HTMLElement>("button:not([disabled])")];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus.current?.focus?.();
    };
  }, [lightbox, prev, next]);

  const current = lightbox === null ? null : images[lightbox];
  const oddLast = images.length % 2 === 1;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => setLightbox(i)}
            aria-haspopup="dialog"
            aria-label={`Open fullscreen view, image ${i + 1} of ${images.length}: ${img.alt || name}`}
            data-cursor="Zoom"
            className={cn(
              "group relative block w-full cursor-zoom-in overflow-hidden bg-[#F2CCC3]/40",
              RING,
              oddLast && i === images.length - 1
                ? "col-span-2 aspect-[16/10]"
                : "aspect-[3/4]",
            )}
          >
            <Image
              src={img.src}
              alt={img.alt || `${name} view ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 50vw, 32vw"
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-3 bg-[#172121]/70 px-2 py-0.5 text-[11px] font-semibold tracking-[0.2em] text-[#FBF6F3] backdrop-blur-sm"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {current !== null && lightbox !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} fullscreen view`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative aspect-[4/5] w-full max-w-2xl overflow-hidden rounded-xl bg-[#181818]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={current.src} alt={current.alt || name} fill sizes="100vw" className="object-contain" />
            <p aria-live="polite" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {lightbox + 1} of {images.length}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close fullscreen view"
              className={cn("absolute top-3 right-3 rounded-full bg-white/10 px-3 py-1 text-sm font-medium", RING)}
            >
              ✕ Close
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className={cn("absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium", RING)}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className={cn("absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium", RING)}
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
