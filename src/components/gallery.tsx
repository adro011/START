"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/lib/catalog";
import { cn } from "@/lib/format";
import ZoomImage from "@/components/zoom-image";

const RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

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

  // ── Lightbox pinch-to-zoom / pan (touch) ────────────────────────────────
  const [pinch, setPinch] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({
    scale: 1,
    x: 0,
    y: 0,
    startDist: 0,
    startX: 0,
    startY: 0,
    mode: "" as "" | "pan" | "pinch",
  });

  function onLBStart(e: React.PointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { scale: pinch.scale, x: pinch.x, y: pinch.y, startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1, startX: 0, startY: 0, mode: "pinch" };
    } else if (pointers.current.size === 1) {
      gesture.current = { scale: pinch.scale, x: pinch.x, y: pinch.y, startDist: 0, startX: e.clientX, startY: e.clientY, mode: "pan" };
    }
  }
  function onLBMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 1 && gesture.current.mode === "pan") {
      setPinch((p) => ({ ...p, x: gesture.current.x + (e.clientX - gesture.current.startX), y: gesture.current.y + (e.clientY - gesture.current.startY) }));
    } else if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const s = Math.min(4, Math.max(1, gesture.current.scale * (dist / gesture.current.startDist)));
      setPinch((p) => ({ ...p, scale: s }));
    }
  }
  function onLBEnd(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0 && pinch.scale <= 1) setPinch({ scale: 1, x: 0, y: 0 });
  }
  function resetPinch() {
    setPinch({ scale: 1, x: 0, y: 0 });
  }

  const prev = useCallback(() => {
    resetPinch();
    setLightbox((cur) => (cur === null ? cur : (cur - 1 + images.length) % images.length));
  }, [images.length]);
  const next = useCallback(() => {
    resetPinch();
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
              "group relative block w-full cursor-zoom-in overflow-hidden bg-[var(--color-blush)]/40",
              RING,
              oddLast && i === images.length - 1
                ? "col-span-2 aspect-[16/10]"
                : "aspect-[3/4]",
            )}
          >
            <ZoomImage
              src={img.src}
              alt={img.alt || `${name} view ${i + 1}`}
              priority={i === 0}
              sizes="(max-width: 768px) 50vw, 32vw"
              viewer={false}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-3 bg-[var(--abrar-ink)]/70 px-2 py-0.5 text-[11px] font-semibold tracking-[0.2em] text-[var(--color-paper)] backdrop-blur-sm"
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
            className="relative aspect-[4/5] w-full max-w-2xl touch-none overflow-hidden rounded-xl bg-[var(--color-dark-iron)]"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={onLBStart}
            onPointerMove={onLBMove}
            onPointerUp={onLBEnd}
            onPointerCancel={onLBEnd}
          >
            <Image
              src={current.src}
              alt={current.alt || name}
              fill
              sizes="100vw"
              className="object-contain"
              style={{
                transform: `translate(${pinch.x}px, ${pinch.y}px) scale(${pinch.scale})`,
                transformOrigin: "center center",
              }}
            />
            <p aria-live="polite" className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
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
