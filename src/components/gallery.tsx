"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/catalog";
import { cn } from "@/lib/format";

export default function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div
        className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-xl bg-neutral-100"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onClick={() => setLightbox(true)}
      >
        <Image
          src={current.src}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn("object-cover transition-transform duration-300", zoom && "scale-125")}
        />
      </div>

      {/* Thumb rail — horizontal swipe on mobile via overflow-x */}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border bg-neutral-100",
              i === active && "ring-2 ring-neutral-900",
            )}
          >
            <Image src={img.src} alt={img.alt || `${name} view ${i + 1}`} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
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
            <button
              onClick={() => setLightbox(false)}
              aria-label="Close fullscreen view"
              className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-medium"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
