"use client";

import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/config/site";
import Reveal from "./reveal";

const IMAGES = [
  "/products/boys-kabli-mustard-2.jpg",
  "/products/girls-jumpsuit-coral-1.jpg",
  "/products/casual-tops-floral-2.jpg",
  "/products/taaga-coaty-charcoal-2.jpg",
  "/products/muslin-sharee-rose-1.jpg",
  "/products/slim-chino-trousers-khaki-2.jpg",
  "/products/comfort-lungi-check-2.jpg",
  "/products/lawn-3pcs-mint-1.jpg",
  "/products/taaga-coaty-charcoal-1.jpg",
].slice(0, 9);

export default function InstagramGrid({
  title = "Follow the drop",
  caption = "Tag us @abrarexclusive.bd — we love seeing how you style it.",
  href = SITE.socials.instagram,
}: {
  title?: string;
  caption?: string;
  href?: string;
}) {
  return (
    <section data-spotlight-section aria-label="Instagram feed" className="cv w-full py-16">
      <div data-spotlight-target className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="kicker text-gold">On the feed</p>
            <h2 className="display-xl mt-3">{title}</h2>
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-white/65">{caption}</p>
          </div>
          <Reveal>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-white/25 px-6 py-3.5 text-[12px] font-semibold tracking-[0.18em] uppercase text-white transition-all duration-300 hover:bg-gold hover:border-gold hover:text-black"
            >
              Follow on Instagram <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {IMAGES.map((src, i) => (
            <Reveal key={src + i} delay={i * 40} className="lift group relative aspect-square overflow-hidden border border-white/10">
              <Image
                src={src}
                alt="Abrar Exclusive product"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
