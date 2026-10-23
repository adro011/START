import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  asCatalogProduct,
  getNewArrivals,
  getSale,
} from "@/lib/catalog";
import { getLiveCategories, getLiveProducts } from "@/lib/storefront";
import type { CatalogProduct } from "@/types/catalog";
import { ProductCard } from "../components/product-card";
import Reveal from "../components/reveal";
import HeroPanels from "../components/hero-panels";
import Magnetic from "../components/magnetic";
import InstagramGrid from "../components/instagram-grid";
import SectionAtmosphere from "../components/section-atmosphere";
import { SITE } from "@/config/site";
import { CONTENT, asset, toArray } from "@/lib/content";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// ISR: the homepage is re-rendered at most once an hour (and revalidated on
// product/category edits via revalidateTag), so it is served from cache
// instead of hitting Supabase on every request (see §9 performance budget).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/" },
    openGraph: { url: "/" },
  };
}

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  slogan: SITE.tagline,
  url: SITE_URL,
  sameAs: Object.values(SITE.socials),
};
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE_URL,
};

async function safe<T>(fn: () => T | Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/** Catalog lib products satisfy the card's needs; bridge the two product types. */
function asCard(p: Parameters<typeof asCatalogProduct>[0]): CatalogProduct {
  return asCatalogProduct(p);
}

function SectionHeading({
  kicker,
  title,
  copy,
  href,
  cta,
  dark = false,
  particlePrefix = "section",
}: {
  kicker: string;
  title: string;
  copy?: string;
  href?: string;
  cta?: string;
  dark?: boolean;
  particlePrefix?: string;
}) {
  return (
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[22rem] sm:max-w-none">
          <p
            className="kicker text-blush"
            data-particle-id={`${particlePrefix}.kicker`}
            data-particle-type="badge"
            data-particle-label={`${title} Section Kicker`}
            data-editable="true"
          >
            {kicker}
          </p>
          <h2
            className={`display-xl mt-3 ${dark ? "text-[var(--color-paper)]" : "text-[var(--color-smoke)]"}`}
            data-particle-id={`${particlePrefix}.title`}
            data-particle-type="heading"
            data-particle-label={`${title} Section Heading`}
            data-editable="true"
          >
            {title}
          </h2>
          {copy && (
            <p
              className={`mt-3 max-w-[52ch] text-[16px] leading-relaxed ${dark ? "text-white/65" : "text-steel"}`}
              data-particle-id={`${particlePrefix}.copy`}
              data-particle-type="text"
              data-particle-label={`${title} Section Description`}
              data-editable="true"
            >
              {copy}
            </p>
          )}
        </div>
        {href && (
          <Magnetic>
            <Link
              href={href}
              className={`group inline-flex items-center gap-3 border px-6 py-3.5 text-[12px] font-semibold tracking-[0.18em] uppercase transition-all duration-300 ${
                dark
                  ? "border-white/25 text-white hover:bg-white hover:text-[var(--abrar-ink)]"
                  : "border-[var(--abrar-ink)] text-[var(--color-smoke)] hover:bg-[var(--abrar-ink)] hover:text-[var(--color-paper)]"
              }`}
              data-particle-id={`${particlePrefix}.cta`}
              data-particle-type="link"
              data-particle-label={`${title} Section CTA Button`}
              data-editable="true"
            >
              {cta ?? "View all"}
              <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          </Magnetic>
        )}
      </div>
    </Reveal>
  );
}

const PANEL_BG = "linear-gradient(150deg,var(--color-black) 0%,var(--color-black) 40%,#1a1a1a 75%,var(--color-gold) 100%)";

const HERO = toArray(CONTENT.home.hero.panel).map((p) => ({
  key: p.key,
  index: p.index,
  title: p.title,
  href: p.href,
  img: p.image || asset("hero", `panel.${p.key}.tile`, "/hero/men.jpg"),
  bg: PANEL_BG,
}));

const MARQUEE = toArray(CONTENT.home.hero.marquee);

const MARQUEE_STRIP = Array.from({ length: 5 }, () => MARQUEE).flat();

const OCCASIONS = toArray(CONTENT.home.occasion.item).map((o) => ({
  name: o.name,
  copy: o.copy,
  href: o.href,
  img: o.image,
}));

const TESTIMONIALS = toArray(CONTENT.home.testimonial);

const CRAFT_STATS = toArray(CONTENT.home.craft.stat);

const TRUST_ITEMS = toArray(CONTENT.home.trust);

/** Shimmer placeholder for the streamed product rails (below the fold). */
function RailSkeleton() {
  return (
    <div
      className="rail -mx-[clamp(16px,4vw,64px)] flex gap-5 overflow-hidden px-[clamp(16px,4vw,64px)] pb-4"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[228px] shrink-0 sm:w-[272px]">
          <div className="aspect-[3/4] w-full animate-pulse bg-white/5" />
          <div className="mt-3 h-4 w-3/4 animate-pulse bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/** New-arrivals rail — streamed, so the cover paints before Supabase resolves. */
async function NewArrivalsRail() {
  const live = await safe(() => getLiveProducts(), { products: [], live: false });
  const liveList = live.products.length > 0 ? live.products : undefined;
  const arrivals = await safe(() => getNewArrivals(8, liveList), []);

  if (arrivals.length === 0) {
    return (
      <p
        className="border border-dashed border-white/20 px-6 py-10 text-center text-[15px] text-steel"
        data-particle-id="home.new-arrivals.empty"
        data-particle-type="text"
        data-particle-label="New Arrivals Empty State Text"
        data-editable="true"
      >
        {CONTENT.home.arrivals.empty}
      </p>
    );
  }

  return (
    <div className="rail -mx-[clamp(16px,4vw,64px)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(16px,4vw,64px)] pb-4">
      {arrivals.slice(0, 10).map((p, i) => (
        <Reveal
          key={p.slug}
          delay={(i % 5) * 70}
          className="w-[228px] shrink-0 snap-start sm:w-[272px]"
        >
          <span
            className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-ash uppercase"
            data-particle-id={`home.new-arrivals.item.${i}.index`}
            data-particle-type="badge"
            data-particle-label={`New Arrival Item ${i + 1} Index Badge`}
            data-editable="true"
          >
            N° {String(i + 1).padStart(2, "0")}
          </span>
          <ProductCard product={asCard(p)} />
        </Reveal>
      ))}
    </div>
  );
}

/** Category tile grid — streamed (reads live categories with local fallback). */
async function CategoryGrid() {
  const live = await safe(() => getLiveCategories(), { categories: [], live: false });
  const cats = live.categories.length > 0 ? live.categories : undefined;
  type Tile = { name: string; href: string; img?: string };
  const tiles = (
    Array.isArray(cats) && cats.length > 0
      ? cats.slice(0, 6).map((c): Tile => ({
          name: c.name,
          href: `/${c.section}/${c.slug}`,
        }))
      : [] as Tile[]
  );
  while (tiles.length < 3) {
    const fb = [
      { name: "Men", href: "/men" },
      { name: "Women", href: "/women" },
      { name: "Kids", href: "/kids" },
    ][tiles.length];
    if (fb) tiles.push(fb);
  }
  // Reorder category tiles per brand: 01 PANJABI, 02 PANJABI PAJAMA SETS, 03 COATY, 04 SHIRT, 05 COAT, 06 JACKETS
  if (tiles.length >= 6) {
    tiles[0] = { name: "PANJABI", href: "/men/panjabi", img: "/library/male/PANJABI.jpg" };
    tiles[1] = { name: "PANJABI PAJAMA SETS", href: "/men/panjabi-pajama-sets", img: "/library/male/PANJABI-PAjAMA SET.jpg" };
    tiles[2] = { name: "COATY", href: "/men/coaty", img: "/library/male/Coaty.webp" };
    tiles[3] = { name: "SHIRT", href: "/men/shirts", img: "/library/male/Shirt.jpg" };
    tiles[4] = { name: "COAT", href: "/men/coaty", img: "/library/male/COAT.jpg" };
    tiles[5] = { name: "JACKETS", href: "/men/jackets", img: "/library/male/JAcket.webp" };
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {tiles.map((t, i) => (
        <Reveal
          key={t.href + t.name}
          delay={(i % 3) * 80}
          className="lift group relative overflow-hidden border border-white/10 bg-[var(--abrar-surface)] px-6 py-8 sm:py-10"
        >
          <Link
            href={t.href}
            className="block"
            data-cursor="Open"
            data-particle-id={`home.category.tile.${i}`}
            data-particle-type="card"
            data-particle-label={`Category Tile ${t.name}`}
            data-editable="true"
          >
            {t.img && (
              <Image
                src={t.img}
                alt={`${t.name} collection`}
                width={400}
                height={533}
                className="mb-4 block aspect-[3/4] w-full object-cover object-center opacity-90 transition-all duration-700 group-hover:opacity-100"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                data-particle-id={`home.category.tile.${i}.image`}
                data-particle-type="image"
                data-particle-label={`Category Tile ${t.name} Image`}
                data-editable="true"
              />
            )}
            <span
              aria-hidden="true"
              className="text-ghost pointer-events-none absolute -right-2 -bottom-6 text-[96px] leading-none font-semibold"
              data-particle-id={`home.category.tile.${i}.number`}
              data-particle-type="badge"
              data-particle-label={`Category Tile ${t.name} Ghost Number`}
              data-editable="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="kicker text-[var(--abrar-accent)]/80"
              data-particle-id={`home.category.tile.${i}.kicker`}
              data-particle-type="badge"
              data-particle-label={`Category Tile ${t.name} Kicker`}
              data-editable="true"
            >
              0{i + 1} — {CONTENT.home.category.cta}
            </span>
            <span
              className="mt-2 block text-[28px] leading-tight font-medium break-words text-white sm:text-[32px]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              data-particle-id={`home.category.tile.${i}.title`}
              data-particle-type="heading"
              data-particle-label={`Category Tile ${t.name} Heading`}
              data-editable="true"
            >
              {t.name}
            </span>
            <span
              className="link-lux mt-3 inline-block text-[12px] font-semibold tracking-[0.2em] text-white/85 uppercase"
              data-particle-id={`home.category.tile.${i}.cta`}
              data-particle-type="link"
              data-particle-label={`Category Tile ${t.name} Explore CTA`}
              data-editable="true"
            >
              {CONTENT.home.category.cta} →
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** Sale rail — streamed (reads live products with local fallback). */
async function SaleRail() {
  const live = await safe(() => getLiveProducts(), { products: [], live: false });
  const liveList = live.products.length > 0 ? live.products : undefined;
  const sale = await safe(() => getSale(8, liveList), []);

  if (sale.length === 0) return null;

  return (
    <div className="rail rail-dark mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
      {sale.slice(0, 8).map((p, i) => (
        <Reveal
          key={p.slug}
          delay={(i % 4) * 70}
          className="w-[228px] shrink-0 snap-start sm:w-[258px] [&_a]:text-[var(--color-paper)] [&_p]:text-white/70 [&_s]:text-white/70 [&_.text-clay]:text-blush [&_.price]:text-blush"
        >
          <ProductCard product={asCard(p)} />
        </Reveal>
      ))}
    </div>
  );
}

/**
 * Home: cinematic 100dvh hero, editorial rails, occasion journey,
 * sale cinema, craft story, testimonials, trust, newsletter.
 * The three data-driven sections stream in via Suspense so the cover (LCP)
 * paints before Supabase resolves.
 */
export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
      {/* ── Lamborghini-style cover: full-viewport slow-zoom portrait, grade, giant wordmark ── */}
      <section
        data-spotlight-section
        data-atmosphere="hero"
        aria-label="New collection"
        className="cover relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black text-center text-[var(--color-paper)]"
        data-particle-id="home.cover.section"
        data-particle-type="section"
        data-particle-label="Home Cover Section"
        data-editable="true"
      >
        <div aria-hidden="true" className="cover-media absolute inset-0">
          <Image
            src="/hero/women.jpg"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[50%_18%]"
            data-particle-id="home.cover.bg-image"
            data-particle-type="image"
            data-particle-label="Home Cover Background Portrait Image"
            data-editable="true"
          />
        </div>
        <div aria-hidden="true" className="grade-cine absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div aria-hidden="true" className="paper-grain absolute inset-0 opacity-60" />
        <SectionAtmosphere preset="hero" overlay />

        <div data-spotlight-target className="relative mx-auto max-w-[1100px] px-6 pt-16 pb-24">
          <p
            className="cover-eyebrow hero-text-rise text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]"
            style={{ animationDelay: "150ms", letterSpacing: "0.2em" }}
            data-particle-id="home.cover.eyebrow"
            data-particle-type="badge"
            data-particle-label="Home Cover Eyebrow Text"
            data-editable="true"
          >
            {CONTENT.home.cover.eyebrow}
          </p>
          <h1
            className="cover-title hero-text-rise mt-5 uppercase"
            style={{ animationDelay: "300ms" }}
            data-particle-id="home.cover.title"
            data-particle-type="heading"
            data-particle-label="Home Cover Main Wordmark Heading"
            data-editable="true"
          >
            {CONTENT.home.cover.title}
          </h1>
          <p
            className="hero-text-rise mt-5 text-[13px] font-medium tracking-[0.2em] text-white uppercase [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]"
            style={{ animationDelay: "450ms" }}
            data-particle-id="home.cover.subtitle"
            data-particle-type="text"
            data-particle-label="Home Cover Subtitle Slogan"
            data-editable="true"
          >
            {CONTENT.home.cover.subtitle}
          </p>
          <div className="hero-text-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "600ms" }}>
            <Magnetic strength={10}>
              <Link
                href="/new-arrivals"
                className="inline-flex items-center gap-3 border border-white/70 bg-transparent px-9 py-4 text-[12px] font-semibold tracking-[0.2em] text-white uppercase transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                data-particle-id="home.cover.cta.arrivals"
                data-particle-type="button"
                data-particle-label="Home Cover Shop New Arrivals CTA Button"
                data-editable="true"
              >
                {CONTENT.home.cover.cta.arrivals} <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
            <Magnetic strength={10}>
              <Link
                href="/women"
                className="inline-flex items-center gap-3 border border-white/70 bg-transparent px-9 py-4 text-[12px] font-semibold tracking-[0.2em] text-white uppercase transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                data-particle-id="home.cover.cta.women"
                data-particle-type="button"
                data-particle-label="Home Cover Explore Women CTA Button"
                data-editable="true"
              >
                {CONTENT.home.cover.cta.women} <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-6 sm:px-8">
          <p
            className="text-[11px] font-semibold tracking-[0.22em] text-white/50 uppercase"
            data-particle-id="home.cover.meta.location"
            data-particle-type="text"
            data-particle-label="Home Cover Bottom Left Location Caption"
            data-editable="true"
          >
            {CONTENT.home.cover.location}
          </p>
          <div
            className="flex flex-col items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-white/60 uppercase"
            data-particle-id="home.cover.scroll-cue"
            data-particle-type="text"
            data-particle-label="Home Cover Scroll Cue"
            data-editable="true"
          >
            <span>{CONTENT.home.cover.scroll}</span>
            <span className="cue-line block h-10 w-px bg-white/20"><span className="block h-full w-px bg-[var(--color-blush)]" /></span>
          </div>
          <p
            className="hidden text-[11px] font-semibold tracking-[0.22em] text-white/50 uppercase sm:block"
            data-particle-id="home.cover.meta.number"
            data-particle-type="text"
            data-particle-label="Home Cover Bottom Right Number Caption"
            data-editable="true"
          >
            {CONTENT.home.cover.number}
          </p>
        </div>
      </section>

      {/* ── Cinematic hero: 100dvh, split-type entrance, depth orbs ── */}
      <section
        data-spotlight-section
        data-atmosphere="audience"
        aria-label="Shop by section"
        className="relative w-full bg-black text-[var(--color-paper)]"
        data-particle-id="home.hero.section"
        data-particle-type="section"
        data-particle-label="Home Hero Split Panels Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="audience" />

        <div data-spotlight-target className="relative mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] pt-3">
          {/* eyebrow */}
          <div className="flex items-center justify-between px-1 pt-4 pb-3 sm:px-2">
            <p
              className="text-[12px] font-semibold tracking-[0.12em] text-[var(--color-blush)]/90 uppercase"
              data-particle-id="home.hero.eyebrow.left"
              data-particle-type="text"
              data-particle-label="Hero Panels Left Eyebrow Slogan"
              data-editable="true"
            >
              {CONTENT.home.hero.eyebrow.left}
            </p>
            <p
              className="hidden text-[12px] tracking-[0.12em] text-white/60 uppercase sm:block"
              data-particle-id="home.hero.eyebrow.right"
              data-particle-type="text"
              data-particle-label="Hero Panels Right Eyebrow Tagline"
              data-editable="true"
            >
              {CONTENT.home.hero.eyebrow.right}
            </p>
          </div>

          <HeroPanels panels={HERO} />

          {/* scroll cue + marquee */}
          <div className="flex items-center justify-between px-1 py-4 sm:px-2">
            <div
              className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.12em] text-white/55 uppercase"
              data-particle-id="home.hero.scroll-cue"
              data-particle-type="text"
              data-particle-label="Hero Panels Scroll Cue"
              data-editable="true"
            >
              <span className="cue-line block h-8 w-px bg-white/20"><span className="block h-full w-px bg-[var(--color-blush)]" /></span>
              {CONTENT.home.hero.scrollcue}
            </div>
            <p
              className="hidden text-[11px] tracking-[0.12em] text-white/55 uppercase md:block"
              data-particle-id="home.hero.hover-hint"
              data-particle-type="text"
              data-particle-label="Hero Panels Hover Interaction Hint"
              data-editable="true"
            >
              {CONTENT.home.hero.hoverhint}
            </p>
          </div>
        </div>

        <div
          className="relative overflow-hidden border-t border-white/10 bg-black/80 py-3 backdrop-blur"
          data-particle-id="home.hero.marquee"
          data-particle-type="text"
          data-particle-label="Home scrolling luxury ticker marquee strip"
          data-editable="true"
        >
          <p className="sr-only">{MARQUEE.join(" · ")}</p>
          <div
            className="marquee-lux flex w-max gap-10 pr-10 text-[12px] font-semibold tracking-[0.14em] text-[var(--color-blush)]/90 uppercase"
            aria-hidden="true"
          >
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex gap-10 whitespace-nowrap">
                {MARQUEE_STRIP.map((m, i) => (
                  <Fragment key={`${m}-${i}`}>
                    <span
                      data-particle-id={
                        k === 0 ? `home.hero.marquee.item.${i}` : undefined
                      }
                      data-particle-type={k === 0 ? "text" : undefined}
                      data-particle-label={
                        k === 0 ? `Hero Marquee Text ${i + 1}` : undefined
                      }
                      data-editable={k === 0 ? true : undefined}
                    >
                      {m}
                    </span>
                    <span aria-hidden="true" className="text-[#D5573B]">✦</span>
                  </Fragment>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand statement ─────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="statement"
        aria-label="House statement"
        className="w-full py-16"
        data-particle-id="home.statement.section"
        data-particle-type="section"
        data-particle-label="House Statement Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="statement" />
        <div data-spotlight-target className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)]">
          <Reveal>
            <p
              className="kicker text-blush"
              data-particle-id="home.statement.kicker"
              data-particle-type="badge"
              data-particle-label="House Statement Kicker"
              data-editable="true"
            >
              {CONTENT.home.statement.kicker}
            </p>
            <p
              className="display-xl mt-4 max-w-[16ch] text-[var(--color-smoke)]"
              data-particle-id="home.statement.headline"
              data-particle-type="heading"
              data-particle-label="House Statement Main Headline"
              data-editable="true"
            >
              {CONTENT.home.statement.headline}{" "}
              <em
                className="text-gold not-italic underline decoration-[var(--abrar-accent)]/60 decoration-2 underline-offset-8"
                data-particle-id="home.statement.headline.accent"
                data-particle-type="text"
                data-particle-label="House Statement Gold Accented Text"
                data-editable="true"
              >
                {CONTENT.home.statement.accent}
              </em>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── New arrivals rail ────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="arrivals"
        aria-label="New arrivals"
        className="w-full py-12"
        data-particle-id="home.new-arrivals.section"
        data-particle-type="section"
        data-particle-label="New Arrivals Rail Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="arrivals" />
        <div data-spotlight-target className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)]">
          <SectionHeading
            kicker={CONTENT.home.arrivals.kicker}
            title={CONTENT.home.arrivals.title}
            copy={CONTENT.home.arrivals.copy}
            cta={CONTENT.home.arrivals.cta}
            href="/new-arrivals"
            particlePrefix="home.new-arrivals"
          />
          <Suspense fallback={<RailSkeleton />}>
            <NewArrivalsRail />
          </Suspense>
        </div>
      </section>

      {/* ── Shop by category: editorial brutalism ───── */}
      <section
        data-spotlight-section
        data-atmosphere="categories"
        aria-label="Shop by category"
        className="cv w-full border-y border-white/10"
        data-particle-id="home.category.section"
        data-particle-type="section"
        data-particle-label="Shop by Category Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="categories" />
        <div data-spotlight-target className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] py-16">
          <SectionHeading
            kicker={CONTENT.home.category.kicker}
            title={CONTENT.home.category.title}
            copy={CONTENT.home.category.copy}
            dark
            particlePrefix="home.category"
          />
          <Suspense fallback={<RailSkeleton />}>
            <CategoryGrid />
          </Suspense>
        </div>
      </section>

      {/* ── Occasion journey ─────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="occasions"
        aria-label="Shop by occasion"
        className="cv w-full py-16 occasion-section"
        data-particle-id="home.occasion.section"
        data-particle-type="section"
        data-particle-label="Shop by Occasion Section"
        data-editable="true"
        data-occasion-section
      >
        <SectionAtmosphere preset="occasions" />
        <div data-spotlight-target className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)]">
          <SectionHeading
            kicker={CONTENT.home.occasion.kicker}
            title={CONTENT.home.occasion.title}
            copy={CONTENT.home.occasion.copy}
            particlePrefix="home.occasion"
          />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {OCCASIONS.map((o, i) => (
              <Reveal
                key={o.name}
                delay={i * 80}
                className="lift group relative min-h-[260px] overflow-hidden border border-white/10 px-6 py-8 occasion-card"
              >
                <Image
                  src={o.img}
                  alt={`${o.name} occasion`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center opacity-100 transition-all duration-700 group-hover:scale-[1.03] occasion-card__img"
                  priority={i === 0}
                  data-particle-id={`home.occasion.card.${i}.image`}
                  data-particle-type="image"
                  data-particle-label={`Occasion Card ${o.name} Image`}
                  data-editable="true"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <span
                  aria-hidden="true"
                  className="text-ghost absolute top-4 right-5 text-[40px] font-semibold"
                  data-particle-id={`home.occasion.card.${i}.number`}
                  data-particle-type="badge"
                  data-particle-label={`Occasion Card ${o.name} Number`}
                  data-editable="true"
                >
                  0{i + 1}
                </span>
                <Link
                  href={o.href}
                  data-cursor="Shop"
                  className="relative block h-full occasion-card__link"
                  data-particle-id={`home.occasion.card.${i}`}
                  data-particle-type="card"
                  data-particle-label={`Occasion Card ${o.name}`}
                  data-editable="true"
                >
                  <span
                    className="block text-[34px] font-medium text-white"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    data-particle-id={`home.occasion.card.${i}.title`}
                    data-particle-type="heading"
                    data-particle-label={`Occasion Card ${o.name} Title`}
                    data-editable="true"
                  >
                    {o.name}
                  </span>
                  <span
                    className="mt-1 block text-[14px] text-white/75"
                    data-particle-id={`home.occasion.card.${i}.copy`}
                    data-particle-type="text"
                    data-particle-label={`Occasion Card ${o.name} Subtitle`}
                    data-editable="true"
                  >
                    {o.copy}
                  </span>
                  <span
                    className="link-lux mt-5 inline-block text-[12px] font-semibold tracking-[0.2em] text-[var(--abrar-accent)] uppercase"
                    data-particle-id={`home.occasion.card.${i}.cta`}
                    data-particle-type="link"
                    data-particle-label={`Occasion Card ${o.name} Shop Now CTA`}
                    data-editable="true"
                  >
                    {CONTENT.home.occasion.cta} →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sale cinema ──────────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="sale"
        aria-label="Sale"
        className="cv relative overflow-hidden border-y border-white/10 text-[var(--color-paper)]"
        data-particle-id="home.sale.section"
        data-particle-type="section"
        data-particle-label="Sale Edit Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="sale" />
        <div data-spotlight-target className="relative mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] py-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p
                  className="kicker text-blush"
                  data-particle-id="home.sale.kicker"
                  data-particle-type="badge"
                  data-particle-label="Sale Section Kicker"
                  data-editable="true"
                >
                  {CONTENT.home.sale.kicker}
                </p>
                <h2
                  className="display-xl mt-3"
                  data-particle-id="home.sale.title"
                  data-particle-type="heading"
                  data-particle-label="Sale Section Title"
                  data-editable="true"
                >
                  {CONTENT.home.sale.title}
                </h2>
                <p
                  className="mt-3 max-w-[48ch] text-[16px] text-white/65"
                  data-particle-id="home.sale.copy"
                  data-particle-type="text"
                  data-particle-label="Sale Section Description"
                  data-editable="true"
                >
                  {CONTENT.home.sale.copy}
                </p>
              </div>
              <Magnetic>
                <Link
                  href="/sale"
                  className="inline-flex items-center gap-3 bg-[var(--abrar-accent)] px-7 py-4 text-[12px] font-semibold tracking-[0.2em] text-black uppercase transition-colors duration-300 hover:bg-white"
                  data-particle-id="home.sale.cta"
                  data-particle-type="button"
                  data-particle-label="Shop Sale CTA Button"
                  data-editable="true"
                >
                  {CONTENT.home.sale.cta} <span aria-hidden="true">→</span>
                </Link>
              </Magnetic>
            </div>
          </Reveal>
          <Suspense fallback={null}>
            <SaleRail />
          </Suspense>
        </div>
      </section>

      {/* ── Craft story ──────────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="story"
        aria-label="Our craft"
        className="cv relative overflow-hidden text-[var(--color-smoke)]"
        data-particle-id="home.craft.section"
        data-particle-type="section"
        data-particle-label="Our Craft Story Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="story" />
        <div data-spotlight-target className="relative mx-auto grid w-full max-w-[1400px] gap-10 px-[clamp(16px,4vw,64px)] py-20 md:grid-cols-[1.2fr_1fr] md:items-center">
          <Reveal>
            <div>
              <p
                className="kicker text-[var(--abrar-accent)]"
              data-particle-id="home.craft.kicker"
              data-particle-type="badge"
              data-particle-label="Craft Story Kicker"
              data-editable="true"
            >
              {CONTENT.home.craft.kicker}
            </p>
            <h2
              className="display-xl mt-3 text-[var(--color-smoke)]"
              data-particle-id="home.craft.title"
              data-particle-type="heading"
              data-particle-label="Craft Story Heading"
              data-editable="true"
            >
              {CONTENT.home.craft.title}
            </h2>
              <div
                aria-hidden="true"
                className="mt-6 h-px w-24 bg-[var(--abrar-accent)]"
                data-particle-id="home.craft.divider"
                data-particle-type="icon"
                data-particle-label="Craft Story Gold Divider Line"
                data-editable="true"
              />
              <p
                className="mt-5 max-w-[48ch] text-[16.5px] leading-relaxed text-white/75"
              data-particle-id="home.craft.body"
              data-particle-type="text"
              data-particle-label="Craft Story Body Paragraph"
              data-editable="true"
            >
              {CONTENT.home.craft.body}
            </p>
              <Magnetic>
                <Link
                  href="/craft"
                  className="group mt-7 inline-flex items-center gap-3 border border-[var(--abrar-accent)]/60 px-7 py-3.5 text-[12px] font-semibold tracking-[0.2em] text-[var(--abrar-accent)] uppercase transition-colors hover:bg-[var(--abrar-accent)] hover:text-black"
                  data-particle-id="home.craft.cta"
                  data-particle-type="button"
                  data-particle-label="Craft Story Read Our Story CTA Button"
                  data-editable="true"
                >
                  {CONTENT.home.craft.cta} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
              </Magnetic>
            </div>
          </Reveal>
          <dl className="grid grid-cols-3 gap-3 text-center md:grid-cols-1 lg:grid-cols-3">
            {CRAFT_STATS.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 90}
                variant="scale"
                className="border border-white/15 bg-[var(--abrar-surface)]/90 px-2 py-8"
              >
                <dt
                  className="text-[38px] font-medium text-[var(--abrar-accent)]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  data-particle-id={`home.craft.stat.${i}.value`}
                  data-particle-type="heading"
                  data-particle-label={`Craft Stat ${i + 1} Value (${s.value})`}
                  data-editable="true"
                >
                  {s.value}
                </dt>
                <dd
                  className="mt-1 text-[12px] font-semibold tracking-[0.14em] text-white/70 uppercase"
                  data-particle-id={`home.craft.stat.${i}.label`}
                  data-particle-type="text"
                  data-particle-label={`Craft Stat ${i + 1} Label (${s.label})`}
                  data-editable="true"
                >
                  {s.label}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="testimonials"
        aria-label="Customer words"
        className="cv w-full py-16"
        data-particle-id="home.testimonials.section"
        data-particle-type="section"
        data-particle-label="Customer Testimonials Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="testimonials" />
        <div data-spotlight-target className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)]">
          <SectionHeading
            kicker={CONTENT.home.testimonials.kicker}
            title={CONTENT.home.testimonials.title}
            dark
            particlePrefix="home.testimonials"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <figure
                  className="lift flex h-full flex-col border border-white/12 bg-[var(--abrar-surface)]/85 px-7 py-8 backdrop-blur"
                  data-particle-id={`home.testimonials.item.${i}`}
                  data-particle-type="card"
                  data-particle-label={`Testimonial Card ${i + 1} (${t.name})`}
                  data-editable="true"
                >
                  <span
                    aria-hidden="true"
                    className="text-[13px] tracking-[0.28em] text-[var(--abrar-accent)]"
                    data-particle-id={`home.testimonials.item.${i}.stars`}
                    data-particle-type="badge"
                    data-particle-label={`Testimonial ${i + 1} Star Rating`}
                    data-editable="true"
                  >
                    ★★★★★
                  </span>
                  <blockquote
                    className="mt-4 flex-1 text-[16px] leading-relaxed text-white/85"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "19px" }}
                    data-particle-id={`home.testimonials.item.${i}.quote`}
                    data-particle-type="text"
                    data-particle-label={`Testimonial ${i + 1} Quote Text`}
                    data-editable="true"
                  >
                    "{t.quote}"
                  </blockquote>
                  <figcaption
                    className="mt-4 flex items-center gap-3 border-t border-white/12 pt-4 text-[13px] font-semibold tracking-[0.08em] text-white/80 uppercase"
                    data-particle-id={`home.testimonials.item.${i}.author`}
                    data-particle-type="text"
                    data-particle-label={`Testimonial ${i + 1} Author Name`}
                    data-editable="true"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--abrar-accent)] text-[13px] font-bold text-black"
                      data-particle-id={`home.testimonials.item.${i}.avatar`}
                      data-particle-type="badge"
                      data-particle-label={`Testimonial ${i + 1} Author Avatar Initial`}
                      data-editable="true"
                    >
                      {t.name.slice(0, 1)}
                    </span>
                    {t.name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust row ────────────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="trust"
        aria-label="Why shop with us"
        className="cv w-full border-y border-white/10 text-[var(--color-smoke)]"
        data-particle-id="home.trust.section"
        data-particle-type="section"
        data-particle-label="Trust Badges Row Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="trust" />
        <div data-spotlight-target className="mx-auto grid w-full max-w-[1400px] gap-8 px-[clamp(16px,4vw,64px)] py-12 sm:grid-cols-3">
          {TRUST_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div
                className="flex flex-col items-center border border-white/10 bg-[var(--abrar-surface)]/80 px-6 py-8 text-center"
                data-particle-id={`home.trust.item.${i}`}
                data-particle-type="card"
                data-particle-label={`Trust Badge Card ${i + 1} (${item.title})`}
                data-editable="true"
              >
                <span
                  aria-hidden="true"
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--abrar-accent)]/40 text-[18px] text-[var(--abrar-accent)]"
                  data-particle-id={`home.trust.item.${i}.icon`}
                  data-particle-type="icon"
                  data-particle-label={`Trust Badge ${i + 1} Icon`}
                  data-editable="true"
                >
                  {item.icon}
                </span>
                <p
                  className="text-[13px] font-semibold tracking-[0.22em] text-white uppercase"
                  data-particle-id={`home.trust.item.${i}.title`}
                  data-particle-type="heading"
                  data-particle-label={`Trust Badge ${i + 1} Title (${item.title})`}
                  data-editable="true"
                >
                  {item.title}
                </p>
                <p
                  className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-white/70"
                  data-particle-id={`home.trust.item.${i}.copy`}
                  data-particle-type="text"
                  data-particle-label={`Trust Badge ${i + 1} Description`}
                  data-editable="true"
                >
                  {item.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Instagram-style grid ─────────────────────── */}
      <InstagramGrid />

      {/* ── Newsletter CTA ───────────────────────────── */}
      <section
        data-spotlight-section
        data-atmosphere="newsletter"
        aria-label="Newsletter"
        className="cv relative overflow-hidden text-center text-[var(--color-paper)]"
        data-particle-id="home.newsletter.section"
        data-particle-type="section"
        data-particle-label="Home Newsletter CTA Section"
        data-editable="true"
      >
        <SectionAtmosphere preset="newsletter" />
        <div data-spotlight-target className="relative mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] py-20">
          <Reveal variant="scale">
            <p
              className="kicker text-[var(--abrar-accent)]"
              data-particle-id="home.newsletter.kicker"
              data-particle-type="badge"
              data-particle-label="Home Newsletter Kicker"
              data-editable="true"
            >
              {CONTENT.home.newsletter.kicker}
            </p>
            <p
              className="display-xl mx-auto mt-3 max-w-[14ch] text-white"
              data-particle-id="home.newsletter.title"
              data-particle-type="heading"
              data-particle-label="Home Newsletter Main Headline"
              data-editable="true"
            >
              {CONTENT.home.newsletter.title}
            </p>
            <p
              className="mx-auto mt-4 max-w-[50ch] text-[16px] text-white/70"
              data-particle-id="home.newsletter.copy"
              data-particle-type="text"
              data-particle-label="Home Newsletter Offer Description"
              data-editable="true"
            >
              {CONTENT.home.newsletter.copy}
            </p>
            <Magnetic strength={12}>
              <a
                href="#newsletter"
                className="mt-8 inline-flex items-center gap-3 bg-[var(--abrar-accent)] px-9 py-4 text-[12px] font-semibold tracking-[0.2em] text-black uppercase transition-colors hover:bg-white"
                  data-particle-id="home.newsletter.cta"
                  data-particle-type="button"
                  data-particle-label="Home Newsletter Subscribe Below Button"
                  data-editable="true"
                >
                  {CONTENT.home.newsletter.cta} <span aria-hidden="true">↓</span>
                </a>
            </Magnetic>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
