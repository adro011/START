"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/lib/catalog";
import { cn } from "@/lib/format";

const RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5573B]";

export default function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const current = images[Math.min(active, images.length - 1)];
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  const prev = useCallback(
    () => setActive((a) => (a - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setActive((a) => (a + 1) % images.length),
    [images.length],
  );

  // Lightbox: Esc closes, arrows page, scroll locks, focus enters + returns.
  useEffect(() => {
    if (!lightbox) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(false);
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
      // Traps-ish Tab cycle across close / prev / next.
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

  return (
    <div>
      {/* Main image is a real button so keyboard users can open the lightbox. */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        aria-label={`Open fullscreen view of ${name}`}
        aria-haspopup="dialog"
        data-cursor="Zoom"
        className={cn(
          "relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-xl bg-neutral-100",
          RING,
        )}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onFocus={() => setZoom(false)}
      >
        <Image
          src={current.src}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn("object-cover transition-transform duration-300 motion-reduce:transition-none", zoom && "scale-125 motion-reduce:scale-100")}
        />
      </button>

      {/* Thumb rail — horizontal swipe on mobile via overflow-x */}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1} of ${images.length}: ${img.alt || name}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border bg-neutral-100",
              RING,
              i === active && "ring-2 ring-neutral-900",
            )}
          >
            <Image src={img.src} alt={img.alt || `${name} view ${i + 1}`} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} fullscreen view`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <div
            className="relative aspect-[4/5] w-full max-w-2xl overflow-hidden rounded-xl bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={current.src} alt={current.alt || name} fill sizes="100vw" className="object-contain" />
            <p aria-live="polite" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {active + 1} of {images.length}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close fullscreen view"
              className={cn("absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-sm font-medium", RING)}
            >
              ✕ Close
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className={cn("absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-sm font-medium", RING)}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className={cn("absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-sm font-medium", RING)}
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
