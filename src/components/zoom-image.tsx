"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

/**
 * Cursor-following image magnification (desktop) + pinch/pan (touch).
 *
 * Desktop: the moment the pointer enters, the image scales to `zoom` (default
 * 2×) with the transform-origin anchored to the cursor, clipped inside its
 * frame. Tracking is throttled to requestAnimationFrame and only runs while
 * the pointer is over the frame. Resets smoothly on leave (150ms). Disabled
 * under `prefers-reduced-motion` and on coarse-pointer (touch) devices.
 *
 * Touch: a tap opens the fullscreen viewer (when `viewer` is enabled) with
 * pinch-to-zoom, drag-while-magnified and a close button.
 */

const REDUCED = "(prefers-reduced-motion: reduce)";

interface ZoomImageProps {
  src: string;
  alt: string;
  /** CSS applied to the next/image element (e.g. object-cover, aspect). */
  className?: string;
  /** Wrapper class (the clipping frame). */
  wrapperClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Magnification factor (1.5–3). Default 2. */
  zoom?: number;
  /** Enable the touch fullscreen viewer. Default true. */
  viewer?: boolean;
  /** Optional external click handler (e.g. open a parent lightbox) — desktop only. */
  onOpen?: () => void;
}

export default function ZoomImage({
  src,
  alt,
  className,
  wrapperClassName,
  sizes,
  priority,
  zoom = 2,
  viewer = true,
  onOpen,
}: ZoomImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [origin, setOrigin] = useState("50% 50%");
  const [hovering, setHovering] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hoverDevice, setHoverDevice] = useState(false);

  // Touch viewer state
  const [open, setOpen] = useState(false);
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ scale: 1, x: 0, y: 0, startDist: 0, startX: 0, startY: 0, mode: "" as "" | "pan" | "pinch" });

  useEffect(() => {
    const mqReduce = window.matchMedia(REDUCED);
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    setReduced(mqReduce.matches);
    setHoverDevice(mqHover.matches);
    const onReduce = () => setReduced(mqReduce.matches);
    const onHover = () => setHoverDevice(mqHover.matches);
    mqReduce.addEventListener?.("change", onReduce);
    mqHover.addEventListener?.("change", onHover);
    return () => {
      mqReduce.removeEventListener?.("change", onReduce);
      mqHover.removeEventListener?.("change", onHover);
    };
  }, []);

  const zoomActive = hoverDevice && !reduced && hovering;

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!hoverDevice || reduced) return;
      const el = frameRef.current;
      if (!el) return;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setOrigin(`${x}% ${y}%`);
      });
    },
    [hoverDevice, reduced],
  );

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Touch viewer ─────────────────────────────────────────────────────────
  const openViewer = () => {
    if (onOpen) {
      onOpen();
      return;
    }
    if (viewer && !hoverDevice) {
      setOpen(true);
      setT({ scale: 1, x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    }
  };

  const closeViewer = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function onTouchStart(e: React.PointerEvent<HTMLDivElement>) {
    if (!open) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        scale: t.scale,
        x: t.x,
        y: t.y,
        startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        startX: 0,
        startY: 0,
        mode: "pinch",
      };
    } else if (pointers.current.size === 1) {
      gesture.current = { scale: t.scale, x: t.x, y: t.y, startDist: 0, startX: e.clientX, startY: e.clientY, mode: "pan" };
    }
  }

  function onTouchMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!open || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 1 && gesture.current.mode === "pan") {
      const dx = e.clientX - gesture.current.startX;
      const dy = e.clientY - gesture.current.startY;
      setT((prev) => ({ ...prev, x: gesture.current.x + dx, y: gesture.current.y + dy }));
    } else if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const nextScale = Math.min(4, Math.max(1, gesture.current.scale * (dist / gesture.current.startDist)));
      setT((prev) => ({ ...prev, scale: nextScale }));
    }
  }

  function onTouchEnd(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0 && t.scale <= 1) {
      setT({ scale: 1, x: 0, y: 0 });
    }
  }

  return (
    <>
      <div
        ref={frameRef}
        onPointerMove={onPointerMove}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onClick={openViewer}
        className={cn("relative h-full w-full overflow-hidden", hoverDevice && "cursor-zoom-in", wrapperClassName)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", className)}
          style={{
            transform: zoomActive ? `scale(${zoom})` : "scale(1)",
            transformOrigin: origin,
            transition: hoverDevice && !reduced ? "transform 150ms cubic-bezier(0.22,1,0.36,1)" : "none",
            willChange: zoomActive ? "transform" : undefined,
          }}
        />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] touch-none bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} enlarged view`}
          onPointerDown={onTouchStart}
          onPointerMove={onTouchMove}
          onPointerUp={onTouchEnd}
          onPointerCancel={onTouchEnd}
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain"
              style={{
                transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
                transformOrigin: "center center",
              }}
            />
          </div>
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close enlarged view"
            className="absolute top-4 right-4 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white"
          >
            ✕ Close
          </button>
          <p aria-hidden="true" className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            Pinch to zoom · drag to pan
          </p>
        </div>
      )}
    </>
  );
}
