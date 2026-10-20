import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  asCatalogProduct,
  getNewArrivals,
  getSale,
  getFeatured,
} from "@/lib/catalog";
import { getLiveCategories, getLiveProducts } from "@/lib/storefront";
import type { CatalogProduct } from "@/types/catalog";
import { ProductCard } from "../components/product-card";
import Reveal from "../components/reveal";
import HeroPanels from "../components/hero-panels";
import Magnetic from "../components/magnetic";
import InstagramGrid from "../components/instagram-grid";
import { formatBDT } from "../lib/format";
import { FREE_SHIP_THRESHOLD_PAISA, SITE } from "@/config/site";
import { getSiteSections } from "@/lib/site-content";
import { DEFAULT_SECTIONS } from "@/lib/site-content-utils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const SECTION_BACKGROUNDS: Record<string, string> = {
  "new-arrivals": "#320a28",
  category: "#511730",
  occasion: "#713732",
  sale: "#082b35",
};

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
}: {
  kicker: string;
  title: string;
  copy?: string;
  href?: string;
  cta?: string;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[22rem] sm:max-w-none">
          <p className="kicker text-blush">{kicker}</p>
          <h2
            className={`display-xl mt-3 ${dark ? "text-[#FBF6F3]" : "text-[#F5F5F5]"}`}
          >
            {title}
          </h2>
          {copy && (
            <p
              className={`mt-3 max-w-[52ch] text-[16px] leading-relaxed ${dark ? "text-white/65" : "text-steel"}`}
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
                  ? "border-white/25 text-white hover:bg-white hover:text-[#172121]"
                  : "border-[#172121] text-[#F5F5F5] hover:bg-[#172121] hover:text-[#FBF6F3]"
              }`}
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  Section renderers                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

function renderCover(
  content: Awaited<ReturnType<typeof import("@/lib/site-content").getSiteSections>>[number]["content"]
) {
  const c = content as {
    headline?: string;
    subheadline?: string;
    cta?: { label: string; href: string };
    background?: string;
  };
  return (
    <section aria-label="New collection" className="cover relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black text-center text-[#FBF6F3]">
      <div aria-hidden="true" className="cover-media absolute inset-0">
        <Image
          src={c.background ?? "/hero/women.jpg"}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[50%_18%]"
        />
      </div>
      <div aria-hidden="true" className="grade-cine absolute inset-0" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div aria-hidden="true" className="paper-grain absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-[1100px] px-6 pt-16 pb-24">
        <p
          className="cover-eyebrow hero-text-rise text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]"
          style={{ animationDelay: "150ms", letterSpacing: "0.2em" }}
        >
          {c.subheadline ?? "New Collection — Eid '26 Edit"}
        </p>
        <h1 className="cover-title hero-text-rise mt-5 uppercase" style={{ animationDelay: "300ms" }}>
          {c.headline ?? "ABRAR"}
        </h1>
        <p
          className="hero-text-rise mt-5 text-[13px] font-medium tracking-[0.2em] text-white uppercase [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]"
          style={{ animationDelay: "450ms" }}
        >
          Connecting Consumer through Digital media
        </p>
        {c.cta && (
          <div className="hero-text-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "600ms" }}>
            <Magnetic strength={10}>
              <Link
                href={c.cta.href}
                className="inline-flex items-center gap-3 border border-white/70 bg-transparent px-9 py-4 text-[12px] font-semibold tracking-[0.2em] text-white uppercase transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
              >
                {c.cta.label} <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-6 sm:px-8">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-white/50 uppercase">Dhaka — Worldwide</p>
        <div className="flex flex-col items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-white/60 uppercase">
          <span>Scroll</span>
          <span className="cue-line block h-10 w-px bg-white/20"><span className="block h-full w-px bg-[#F2CCC3]" /></span>
        </div>
        <p className="hidden text-[11px] font-semibold tracking-[0.22em] text-white/50 uppercase sm:block">N°01 — The Cover</p>
      </div>
    </section>
  );
}

function renderPanels(
  content: unknown
) {
  const c = content as { panels?: Array<{ index: number; title: string; slug: string; image?: string; color?: string }> };
  const panels = c.panels ?? [
    { index: 0, title: "WOMEN", slug: "women", image: "/hero/women.svg", color: "#FFC000" },
    { index: 1, title: "MEN", slug: "men", image: "/hero/men.svg", color: "#29ABE2" },
    { index: 2, title: "KIDS", slug: "kids", image: "/hero/kids.svg", color: "#1EAEDB" },
  ];
  const heroPanels = panels.map((p) => ({
    key: p.slug,
    index: String(p.index + 1).padStart(2, "0"),
    title: p.title,
    href: `/${p.slug}`,
    img: p.image ?? `/hero/${p.slug}.svg`,
    bg: p.color
      ? `linear-gradient(150deg,#000000 0%,#000000 40%,#1a1a1a 75%,${p.color} 100%)`
      : "linear-gradient(150deg,#000000 0%,#000000 40%,#1a1a1a 75%,#FFC000 100%)",
  }));
  const MARQUEE = ["Promising Quality", "Delivery throughout Bangladesh", "Beauty, Elegance and Simplicity"] as const;
  const MARQUEE_STRIP = [...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <section aria-label="Shop by section" className="relative w-full bg-black text-[#FBF6F3]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="drift absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#D5573B]/20 blur-[120px]" />
        <div className="drift-2 absolute top-1/3 -right-28 h-[480px] w-[480px] rounded-full bg-[#7E9181]/20 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] pt-3">
        <div className="flex items-center justify-between px-1 pt-4 pb-3 sm:px-2">
          <p className="text-[12px] font-semibold tracking-[0.12em] text-[#F2CCC3]/90 uppercase">Connecting Consumer through Digital media</p>
          <p className="hidden text-[12px] tracking-[0.12em] text-white/60 uppercase sm:block">Est. Dhaka · Eid '26 edit live</p>
        </div>

        <HeroPanels panels={heroPanels} />

        <div className="flex items-center justify-between px-1 py-4 sm:px-2">
          <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.12em] text-white/55 uppercase">
            <span className="cue-line block h-8 w-px bg-white/20"><span className="block h-full w-px bg-[#F2CCC3]" /></span>
            Scroll to enter the house
          </div>
          <p className="hidden text-[11px] tracking-[0.12em] text-white/55 uppercase md:block">Hover to open · click a panel to step in</p>
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-white/10 bg-black/80 py-3 backdrop-blur">
        <div className="marquee-lux flex w-max gap-10 pr-10 text-[12px] font-semibold tracking-[0.14em] text-[#F2CCC3]/90 uppercase">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10 whitespace-nowrap" aria-hidden={k === 1}>
              {MARQUEE_STRIP.map((m, i) => (
                <Fragment key={`${m}-${i}`}>
                  <span>{m}</span>
                  <span aria-hidden="true" className="text-[#D5573B]">✦</span>
                </Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderStatement(
  content: unknown
) {
  const c = content as {
    title?: string;
    body?: string;
    cta?: { label: string; href: string };
    image?: string;
  };
  return (
    <section aria-label="House statement" className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] pt-16 pb-4">
      <Reveal>
        <p className="kicker text-blush">{c.title?.split(" ")[0] ?? "The house of Abrar"}</p>
        <p className="display-xl mt-4 max-w-[16ch] text-[#F5F5F5]">
          {c.title ?? "Quiet luxury, cut for real weather "}
          <em className="text-gold not-italic underline decoration-[#D5573B]/40 decoration-2 underline-offset-8">
            {c.body ? "" : "and real bodies."}
          </em>
        </p>
        {c.body && <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-steel">{c.body}</p>}
        {c.cta && (
          <Magnetic>
            <Link
              href={c.cta.href}
              className="group mt-7 inline-flex items-center gap-3 border border-[#172121] px-7 py-3.5 text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors hover:bg-[#172121] hover:text-[#FBF6F3]"
            >
              {c.cta.label} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          </Magnetic>
        )}
      </Reveal>
    </section>
  );
}

function renderGrid(
  content: unknown,
  products?: CatalogProduct[]
) {
  const c = content as {
    title?: string;
    subtitle?: string;
    section?: "men" | "women" | "kids";
    limit?: number;
    showViewAll?: boolean;
    viewAllHref?: string;
    items?: Array<{ title: string; slug: string; image?: string; description?: string }>;
  };
  const hasProducts = (products?.length ?? 0) > 0;
  return (
    <section aria-label={c.title ?? "Collection"} className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] py-12">
      <SectionHeading
        kicker={c.subtitle ?? "Just landed — small batches"}
        title={c.title ?? "Collection"}
        copy="Honest fabrics, limited runs. When it's gone, it's gone."
        href={c.viewAllHref}
        cta={c.showViewAll ? "View all" : undefined}
      />
      {hasProducts ? (
        <div className="rail -mx-[clamp(16px,4vw,64px)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(16px,4vw,64px)] pb-4">
          {products?.slice(0, c.limit ?? 8).map((p, i) => (
            <Reveal key={p.slug} delay={(i % 5) * 70} className="w-[228px] shrink-0 snap-start sm:w-[272px]">
              <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-ash uppercase">N° {String(i + 1).padStart(2, "0")}</span>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      ) : c.items && c.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {c.items.map((item, i) => (
            <Reveal key={item.slug} delay={(i % 4) * 80} className="lift group relative overflow-hidden border border-white/10 bg-[#172121] px-6 py-8 sm:py-10">
              <Link href={`/${c.section ?? "shop"}/${item.slug}`} className="block" data-cursor="Open">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={`${item.title} collection`}
                    width={400}
                    height={533}
                    className="mb-4 block aspect-[3/4] w-full object-cover object-center opacity-90 transition-all duration-700 group-hover:opacity-100"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                )}
                <span aria-hidden="true" className="text-ghost pointer-events-none absolute -right-2 -bottom-6 text-[96px] leading-none font-semibold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="kicker text-[#F2CCC3]/70">0{i + 1} — Explore</span>
                <span
                  className="mt-2 block text-[28px] leading-tight font-medium break-words text-white sm:text-[32px]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {item.title}
                </span>
                {item.description && <span className="mt-1 block text-[14px] text-white/75">{item.description}</span>}
                <span className="link-lux mt-3 inline-block text-[12px] font-semibold tracking-[0.2em] text-white/85 uppercase">
                  Explore →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-[#172121]/20 px-6 py-10 text-center text-[15px] text-steel">
          Fresh pieces are on the cutting table — check back very soon.
        </p>
      )}
    </section>
  );
}

function renderSplit(
  content: unknown
) {
  const c = content as {
    title?: string;
    subtitle?: string;
    cta?: { label: string; href: string };
    image?: string;
    badge?: string;
    items?: Array<{ title: string; slug: string; image?: string; description?: string }>;
  };
  return (
    <section aria-label={c.title ?? "Feature"} className="cv relative overflow-hidden text-[#FBF6F3]" style={{ backgroundColor: "var(--section-bg, #101414)" }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[360px] w-[520px] rounded-full bg-[#D5573B]/25 blur-[130px]" />
        <div className="absolute right-0 bottom-0 h-[280px] w-[380px] rounded-full bg-[#7D451B]/30 blur-[110px]" />
      </div>
      <div className="relative mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              {c.badge && <p className="kicker text-blush">{c.badge}</p>}
              <h2 className="display-xl mt-3">{c.title ?? "Feature"}</h2>
              <p className="mt-3 max-w-[48ch] text-[16px] text-white/65">{c.subtitle ?? ""}</p>
            </div>
            {c.cta && (
              <Magnetic>
                <Link
                  href={c.cta.href}
                  className="inline-flex items-center gap-3 bg-clay px-7 py-4 text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#7D451B]"
                >
                  {c.cta.label} <span aria-hidden="true">→</span>
                </Link>
              </Magnetic>
            )}
          </div>
        </Reveal>
        {c.items && c.items.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 mt-10">
            {c.items.map((item, i) => (
              <Reveal key={item.slug} delay={(i % 3) * 80} className="lift group relative overflow-hidden border border-white/10 bg-[#172121] px-6 py-8 sm:py-10">
                <Link href={`/shop/${item.slug}`} className="block" data-cursor="Open">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={`${item.title} collection`}
                      width={400}
                      height={533}
                      className="mb-4 block aspect-[3/4] w-full object-cover object-center opacity-90 transition-all duration-700 group-hover:opacity-100"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  )}
                  <span aria-hidden="true" className="text-ghost pointer-events-none absolute -right-2 -bottom-6 text-[96px] leading-none font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="kicker text-[#F2CCC3]/70">0{i + 1} — Explore</span>
                  <span
                    className="mt-2 block text-[28px] leading-tight font-medium break-words text-white sm:text-[32px]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.title}
                  </span>
                  {item.description && <span className="mt-1 block text-[14px] text-white/75">{item.description}</span>}
                  <span className="link-lux mt-3 inline-block text-[12px] font-semibold tracking-[0.2em] text-white/85 uppercase">
                    Explore →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function renderCarousel(
  content: unknown
) {
  const c = content as {
    title?: string;
    items?: Array<{ quote: string; author: string; role?: string }>;
  };
  return (
    <section aria-label="Customer words" className="cv mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] py-16">
      <SectionHeading kicker="Worn & loved" title={c.title ?? "Word on the street"} />
      <div className="grid gap-4 md:grid-cols-3">
        {(c.items ?? []).map((t, i) => (
          <Reveal key={t.author} delay={i * 90}>
            <figure className="lift flex h-full flex-col border border-[#172121]/10 bg-white/60 px-7 py-8 backdrop-blur">
              <span aria-hidden="true" className="text-[13px] tracking-[0.28em] text-[#7D451B]">★★★★★</span>
              <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-[#172121]/85" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "19px" }}>
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-[#172121]/10 pt-4 text-[13px] font-semibold tracking-[0.08em] text-[#172121]/80 uppercase">
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#172121]/15 text-[13px] text-[#172121]">{t.author.slice(0, 1)}</span>
                {t.author}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function renderTrust(
  content: unknown
) {
  const c = content as {
    items?: Array<{ icon: string; title: string; description?: string }>;
  };
  return (
    <section aria-label="Why shop with us" className="cv w-full border-y border-[#172121]/10 bg-[#FBF6F3]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-[clamp(16px,4vw,64px)] py-12 sm:grid-cols-3">
        {(c.items ?? []).map((item, i) => (
          <Reveal key={item.title} delay={i * 80}>
            <div className="flex flex-col items-center text-center">
              <span aria-hidden="true" className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#172121]/15 text-[18px] text-[#7D451B]">{item.icon}</span>
              <p className="text-[13px] font-semibold tracking-[0.22em] uppercase">{item.title}</p>
              {item.description && <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-[#172121]/70">{item.description}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function renderInstagram(
  _content: unknown
) {
  return <InstagramGrid />;
}

function renderNewsletter(
  content: unknown
) {
  const c = content as {
    title?: string;
    subtitle?: string;
    placeholder?: string;
    button?: string;
    privacyNote?: string;
  };
  return (
    <section aria-label="Newsletter" className="cv relative overflow-hidden bg-[#172121] text-center text-[#FBF6F3]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D5573B]/18 blur-[140px]" />
      </div>
      <div className="relative mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,64px)] py-20">
        <Reveal variant="scale">
          <p className="kicker text-blush">{c.subtitle ?? "The letter — 10% off first order"}</p>
          <p className="display-xl mx-auto mt-3 max-w-[14ch]">{c.title ?? "First dibs, every drop."}</p>
          <p className="mx-auto mt-4 max-w-[50ch] text-[16px] text-white/65">
            Join for 10% off your first order over{" "}
            {formatBDT(FREE_SHIP_THRESHOLD_PAISA)} — plus craft notes worth opening.
          </p>
          <Magnetic strength={12}>
            <a
              href="#newsletter"
              className="mt-8 inline-flex items-center gap-3 bg-[#FBF6F3] px-9 py-4 text-[12px] font-semibold tracking-[0.2em] text-[#172121] uppercase transition-colors hover:bg-clay hover:text-white"
            >
              {c.button ?? "Subscribe below"} <span aria-hidden="true">↓</span>
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

const RENDERERS: Record<string, (content: unknown, products?: CatalogProduct[]) => React.ReactNode> = {
  hero: renderCover,
  panels: renderPanels,
  statement: renderStatement,
  grid: renderGrid,
  split: renderSplit,
  carousel: renderCarousel,
  trust: renderTrust,
  instagram: renderInstagram,
  newsletter: renderNewsletter,
  custom: () => null,
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Home page                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
  // Live-first: Supabase products/categories, local TS mirror as fallback
  const [{ products: liveProducts }, { categories: liveCategories }] = await Promise.all([
    safe(() => getLiveProducts(), { products: [], live: false }),
    safe(() => getLiveCategories(), { categories: [], live: false }),
  ]);
  const liveList = liveProducts.length > 0 ? liveProducts : undefined;
  const [arrivals, sale, featured] = await Promise.all([
    safe(() => getNewArrivals(8, liveList), []),
    safe(() => getSale(8, liveList), []),
    safe(() => getFeatured(6, liveList), []),
  ]);

  const cats = liveCategories.length > 0 ? liveCategories : undefined;
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
  if (tiles.length >= 6) {
    tiles[0] = { name: "PANJABI", href: "/men/panjabi", img: "/library/male/PANJABI.jpg" };
    tiles[1] = { name: "PANJABI PAJAMA SETS", href: "/men/panjabi-pajama-sets", img: "/library/male/PANJABI-PAjAMA SET.jpg" };
    tiles[2] = { name: "COATY", href: "/men/coaty", img: "/library/male/Coaty.webp" };
    tiles[3] = { name: "SHIRT", href: "/men/shirts", img: "/library/male/Shirt.jpg" };
    tiles[4] = { name: "COAT", href: "/men/coaty", img: "/library/male/COAT.jpg" };
    tiles[5] = { name: "JACKETS", href: "/men/jackets", img: "/library/male/JAcket.webp" };
  }

  // Fetch sections from DB (fallback to defaults)
  const sections = await getSiteSections();
  const enabledSections = sections.length > 0 ? sections : DEFAULT_SECTIONS;

  return (
    <div className="overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />

      {enabledSections.map((section) => {
        const Renderer = RENDERERS[section.kind];
        if (!Renderer) return null;

        // Pass relevant product data to renderers that need it
        let productData: CatalogProduct[] = [];
        if (section.key === "new-arrivals") productData = arrivals.map(asCard);
        else if (section.key === "sale") productData = sale.map(asCard);
        else if (section.key === "occasion" || section.key === "category") productData = featured.map(asCard);

        const bg = SECTION_BACKGROUNDS[section.key];
        const sectionStyle = {
          ...(bg ? { backgroundColor: bg, "--section-bg": bg } : {}),
          ...(section.styles ?? {}),
        } as React.CSSProperties;

        return (
          <section
            key={section.key}
            data-section-key={section.key}
            style={sectionStyle}
          >
            {Renderer(section.content, productData)}
          </section>
        );
      })}
    </div>
  );
}