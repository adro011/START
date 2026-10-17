import type { Metadata } from "next";
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
import Magnetic from "../components/magnetic";
import { formatBDT } from "../lib/format";
import { FREE_SHIP_THRESHOLD_PAISA, SITE } from "@/config/site";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

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
          <p className="kicker text-clay">{kicker}</p>
          <h2
            className={`display-xl mt-3 ${dark ? "text-[#FBF6F3]" : "text-[#F5F5F5]"}`}
          >
            {title}
          </h2>
          {copy && (
            <p
              className={`mt-3 max-w-[52ch] text-[16px] leading-relaxed ${dark ? "text-white/65" : "text-[#172121]/65"}`}
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

const HERO = [
  {
    key: "men",
    index: "01",
    title: "MAN",
    href: "/men",
    img: "/library/men.png",
    bg: "linear-gradient(150deg,#000000 0%,#000000 40%,#1a1a1a 75%,#FFC000 100%)",
  },
  {
    key: "women",
    index: "02",
    title: "WOMEN",
    href: "/women",
    img: "/library/women.png",
    bg: "linear-gradient(150deg,#000000 0%,#000000 40%,#1a1a1a 75%,#FFC000 100%)",
  },
  {
    key: "kids",
    index: "03",
    title: "CHILDREN",
    href: "/kids",
    img: "/library/children.png",
    bg: "linear-gradient(150deg,#000000 0%,#000000 40%,#1a1a1a 75%,#FFC000 100%)",
  },
] as const;

const OCCASIONS = [
  { name: "Eid", copy: "Moonlit whites & golds", href: "/women?occasion=eid", bg: "linear-gradient(140deg,#3d2410,#D5573B)" },
  { name: "Wedding", copy: "Heirlooms in the making", href: "/women?occasion=wedding", bg: "linear-gradient(140deg,#101a1a,#7D451B)" },
  { name: "Everyday", copy: "Breathable, reworn often", href: "/men?occasion=everyday", bg: "linear-gradient(140deg,#2e4238,#172121)" },
  { name: "Winter", copy: "Layers with intention", href: "/men?occasion=winter", bg: "linear-gradient(140deg,#172121,#7E9181)" },
] as const;

const TESTIMONIALS = [
  {
    quote: "The panjabi fits like it was cut for me. Wore it all Eid, zero wrinkles.",
    name: "Tanvir · Dhaka",
  },
  {
    quote: "Ordered Tuesday, delivered Thursday. The muslin sharee is softer in person.",
    name: "Nusrat · Chattogram",
  },
  {
    quote: "Finally, kids' festive wear that survives actual kids. Exchanged a size over WhatsApp in minutes.",
    name: "Faria · Sylhet",
  },
] as const;

/**
 * Home: cinematic 100dvh hero, editorial rails, occasion journey,
 * sale cinema, craft story, testimonials, trust, newsletter.
 * Server component; catalog lib supplies products.
 */
export default async function HomePage() {
  // Live-first: Supabase products/categories, local TS mirror as fallback
  // (offline builds, missing env). Same helpers, source list injected.
  const [{ products: liveProducts }, { categories: liveCategories }] = await Promise.all([
    safe(() => getLiveProducts(), { products: [], live: false }),
    safe(() => getLiveCategories(), { categories: [], live: false }),
  ]);
  // Live-first: Supabase products, local TS mirror as fallback (offline
  // builds, missing env). `undefined` selects the catalog default (local).
  const liveList = liveProducts.length > 0 ? liveProducts : undefined;
  const [arrivals, sale, featured] = await Promise.all([
    safe(() => getNewArrivals(8, liveList), []),
    safe(() => getSale(8, liveList), []),
    safe(() => getFeatured(6, liveList), []),
  ]);

  const cats = liveCategories.length > 0 ? liveCategories : undefined;
  const tiles = (
    Array.isArray(cats) && cats.length > 0
      ? cats.slice(0, 6).map((c) => ({
          name: c.name,
          href: `/${c.section}/${c.slug}`,
        }))
      : []
  );
  while (tiles.length < 3) {
    const fb = [
      { name: "Men", href: "/men" },
      { name: "Women", href: "/women" },
      { name: "Kids", href: "/kids" },
    ][tiles.length];
    if (fb) tiles.push(fb);
  }

  return (
    <div className="overflow-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
      {/* ── Gucci-style cover: full-viewport slow-zoom portrait, grade, giant wordmark ── */}
      <section aria-label="New collection" className="cover relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black text-center text-[#FBF6F3]">
        <div aria-hidden="true" className="cover-media absolute inset-0">
          <Image
            src="/hero/women.jpg"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[50%_18%]"
          />
        </div>
        <div aria-hidden="true" className="grade-cine absolute inset-0" />
        <div aria-hidden="true" className="paper-grain absolute inset-0 opacity-60" />

        <div className="relative mx-auto max-w-[1100px] px-6 pt-16 pb-24">
          <p className="cover-eyebrow hero-text-rise text-[#F2CCC3]" style={{ animationDelay: "150ms" }}>
            New Collection — Eid ’26 Edit
          </p>
          <h1 className="cover-title hero-text-rise mt-5 uppercase" style={{ animationDelay: "300ms" }}>
            ABRAR
          </h1>
          <p className="hero-text-rise mt-5 text-[13px] font-medium tracking-[0.32em] text-white/75 uppercase" style={{ animationDelay: "450ms" }}>
            Quality · Beauty · Elegance
          </p>
          <div className="hero-text-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "600ms" }}>
            <Magnetic strength={10}>
              <Link
                href="/new-arrivals"
                className="inline-flex items-center gap-3 bg-[#FBF6F3] px-9 py-4 text-[12px] font-semibold tracking-[0.2em] text-[#172121] uppercase transition-colors duration-300 hover:bg-clay hover:text-white"
              >
                Shop new arrivals <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
            <Link
              href="/women"
              className="link-lux px-2 py-4 text-[12px] font-semibold tracking-[0.2em] text-white/85 uppercase hover:text-white"
            >
              Explore women
            </Link>
          </div>
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

      {/* ── Cinematic hero: 100dvh, split-type entrance, depth orbs ── */}
      <section aria-label="Shop by section" className="relative bg-black text-[#FBF6F3]">
        {/* ambient orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="drift absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#D5573B]/20 blur-[120px]" />
          <div className="drift-2 absolute top-1/3 -right-28 h-[480px] w-[480px] rounded-full bg-[#7E9181]/20 blur-[130px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-3 pt-3 sm:px-4">
          {/* eyebrow */}
          <div className="flex items-center justify-between px-1 pt-4 pb-3 sm:px-2">
            <p className="text-[12px] font-semibold tracking-[0.12em] text-[#F2CCC3]/90 uppercase">Connecting Consumer through Digital media</p>
            <p className="hidden text-[12px] tracking-[0.12em] text-white/60 uppercase sm:block">Est. Dhaka · Eid ’26 edit live</p>
          </div>

          <div className="hero-shell flex min-h-[86dvh] flex-col gap-3 pb-3 md:flex-row">
            {HERO.map((h, i) => (
              <Link
                key={h.key}
                href={h.href}
                data-cursor="Explore"
                style={{ animationDelay: `${120 + i * 110}ms`, background: h.bg }}
                className="hero-enter hero-panel group relative flex-1 overflow-hidden transition-[flex-grow] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] md:hover:flex-[1.75]"
              >
                <Image
                  src={h.img}
                  alt={`${h.title} collection`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.06]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" aria-hidden="true" />
                {/* index */}
                <span aria-hidden="true" className="text-ghost absolute top-5 right-6 font-semibold text-[40px] tracking-tight sm:text-[48px]" style={{ fontFamily: "'Cormorant Garamond','Playfair Display',serif" }}>
                  {h.index}
                </span>
                <span className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                  <span
                    className="hero-text-rise block leading-[0.92] tracking-[0.01em]"
                    style={{ animationDelay: `${200 + i * 110}ms` }}
                  >
                    <span className="block text-[clamp(3rem,7vw,6.5rem)] font-medium text-white uppercase" style={{ fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif" }}>
                      {h.title}
                    </span>
                  </span>
                  <span className="mt-5 inline-flex items-center gap-3 bg-[#FFC000] px-7 py-3 text-[13px] font-semibold tracking-[0.12em] text-black uppercase transition-colors duration-300 group-hover:bg-[#917300] group-hover:text-white">
                    Shop {h.title}
                    <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </span>
                </span>
                {/* bottom progress hairline */}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#F2CCC3] transition-transform duration-700 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* scroll cue + marquee */}
          <div className="flex items-center justify-between px-1 py-4 sm:px-2">
            <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.12em] text-white/55 uppercase">
              <span className="cue-line block h-8 w-px bg-white/20"><span className="block h-full w-px bg-[#F2CCC3]" /></span>
              Scroll to enter the house
            </div>
            <p className="hidden text-[11px] tracking-[0.12em] text-white/55 uppercase md:block">Hover a panel — it breathes</p>
          </div>
        </div>

        <div className="relative overflow-hidden border-t border-white/10 bg-black/80 py-3 backdrop-blur">
          <div className="marquee-lux flex w-max gap-10 pr-10 text-[12px] font-semibold tracking-[0.14em] text-[#F2CCC3]/90 uppercase">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex gap-10 whitespace-nowrap" aria-hidden={k === 1}>
                <span>Handcrafted in Bangladesh</span><span aria-hidden="true" className="text-[#D5573B]">✦</span>
                <span>Free 7-day exchange</span><span aria-hidden="true" className="text-[#D5573B]">✦</span>
                <span>Cash on delivery nationwide</span><span aria-hidden="true" className="text-[#D5573B]">✦</span>
                <span>Small batches — when it’s gone, it’s gone</span><span aria-hidden="true" className="text-[#D5573B]">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand statement ─────────────────────────── */}
      <section aria-label="House statement" className="mx-auto max-w-[1280px] px-4 pt-16 pb-4 sm:px-6">
        <Reveal>
          <p className="kicker text-clay">The house of Abrar</p>
          <p className="display-xl mt-4 max-w-[16ch] text-[#F5F5F5]">
            Quiet luxury, cut for real weather <em className="text-gold not-italic underline decoration-[#D5573B]/40 decoration-2 underline-offset-8">and real bodies.</em>
          </p>
        </Reveal>
      </section>

      {/* ── New arrivals rail ────────────────────────── */}
      <section aria-label="New arrivals" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <SectionHeading
          kicker="Just landed — small batches"
          title="New arrivals"
          copy="Honest fabrics, limited runs. When it's gone, it's gone."
          href="/new-arrivals"
        />
        {arrivals.length > 0 ? (
          <div className="rail -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
            {arrivals.slice(0, 10).map((p, i) => (
              <Reveal
                key={p.slug}
                delay={(i % 5) * 70}
                className="w-[228px] shrink-0 snap-start sm:w-[272px]"
              >
                <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-ash uppercase">N° {String(i + 1).padStart(2, "0")}</span>
                <ProductCard product={asCard(p)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-[#172121]/20 px-6 py-10 text-center text-[15px] text-steel">
            Fresh pieces are on the cutting table — check back very soon.
          </p>
        )}
      </section>

      {/* ── Shop by category: editorial brutalism ───── */}
      <section aria-label="Shop by category" className="cv border-y border-[#172121]/10 bg-[#F2CCC3]/30">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
          <SectionHeading
            kicker="Find your lane"
            title="Shop by category"
            copy="Three sections, one thread: clothes that respect the craft."
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {tiles.map((t, i) => (
              <Reveal
                key={t.href + t.name}
                delay={(i % 3) * 80}
                className="lift group relative overflow-hidden border border-[#172121]/10 bg-[#172121] px-6 py-10 sm:py-14"
              >
                <Link href={t.href} className="block" data-cursor="Open">
                  <span aria-hidden="true" className="text-ghost pointer-events-none absolute -right-2 -bottom-6 text-[96px] leading-none font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="kicker text-[#F2CCC3]/70">0{i + 1} — Explore</span>
                  <span
                    className="mt-2 block text-[28px] leading-tight font-medium text-white sm:text-[36px]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {t.name}
                  </span>
                  <span className="link-lux mt-3 inline-block text-[12px] font-semibold tracking-[0.2em] text-white/85 uppercase">
                    Explore →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Occasion journey ─────────────────────────── */}
      <section aria-label="Shop by occasion" className="cv mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <SectionHeading
          kicker="Dress for the day"
          title="Shop by occasion"
          copy="Eid mornings, wedding evenings, and everything in between."
        />
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {OCCASIONS.map((o, i) => (
            <Reveal
              key={o.name}
              delay={i * 80}
              className="lift group relative min-h-[260px] overflow-hidden px-6 py-8"
            >
              <span aria-hidden="true" className="absolute inset-0" style={{ background: o.bg }} />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span aria-hidden="true" className="text-ghost absolute top-4 right-5 text-[40px] font-semibold">0{i + 1}</span>
              <Link href={o.href} data-cursor="Shop" className="relative block h-full">
                <span
                  className="block text-[34px] font-medium text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {o.name}
                </span>
                <span className="mt-1 block text-[14px] text-white/75">
                  {o.copy}
                </span>
                <span className="link-lux mt-5 inline-block text-[12px] font-semibold tracking-[0.2em] text-white uppercase">
                  Shop now →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Sale cinema ──────────────────────────────── */}
      <section aria-label="Sale" className="cv relative overflow-hidden bg-[#101414] text-[#FBF6F3]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 h-[360px] w-[520px] rounded-full bg-[#D5573B]/25 blur-[130px]" />
          <div className="absolute right-0 bottom-0 h-[280px] w-[380px] rounded-full bg-[#7D451B]/30 blur-[110px]" />
        </div>
        <div className="relative mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="kicker text-blush">Up to honest markdowns</p>
                <h2 className="display-xl mt-3">The sale edit</h2>
                <p className="mt-3 max-w-[48ch] text-[16px] text-white/65">
                  Last pieces, best fabrics. {featured.length > 0 && "Loved by regulars."}
                </p>
              </div>
              <Magnetic>
                <Link
                  href="/sale"
                  className="inline-flex items-center gap-3 bg-clay px-7 py-4 text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#7D451B]"
                >
                  Shop sale <span aria-hidden="true">→</span>
                </Link>
              </Magnetic>
            </div>
          </Reveal>
          {sale.length > 0 && (
            <div className="rail rail-dark mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
              {sale.slice(0, 8).map((p, i) => (
                <Reveal
                  key={p.slug}
                  delay={(i % 4) * 70}
                  className="w-[228px] shrink-0 snap-start sm:w-[258px] [&_a]:text-[#FBF6F3] [&_p]:text-white/70 [&_s]:text-white/70 [&_.text-clay]:text-blush [&_.price]:text-blush"
                >
                  <ProductCard product={asCard(p)} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Craft story ──────────────────────────────── */}
      <section aria-label="Our craft" className="cv relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#F2CCC3] via-[#FBF6F3] to-[#7E9181]/40 bg-[length:200%_200%] md:bg-fixed"
        />
        <div className="relative mx-auto grid max-w-[1280px] gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <Reveal>
            <div>
              <p className="kicker text-clay">Woven, not rushed</p>
              <h2 className="display-xl mt-3">
                From loom to doorstep, with patience.
              </h2>
              <div aria-hidden="true" className="mt-6 h-px w-24 bg-[#D5573B]" />
              <p className="mt-5 max-w-[48ch] text-[16.5px] leading-relaxed text-[#172121]/70">
                We work with weaving clusters across Bangladesh — muslin, endi,
                silk — and cut every piece for real bodies and real weather.
                No overproduction, no shouting discounts. Just clothes that earn
                their place.
              </p>
              <Magnetic>
                <Link
                  href="/craft"
                  className="group mt-7 inline-flex items-center gap-3 border border-[#172121] px-7 py-3.5 text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors hover:bg-[#172121] hover:text-[#FBF6F3]"
                >
                  Read our story <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
              </Magnetic>
            </div>
          </Reveal>
          <dl className="grid grid-cols-3 gap-3 text-center md:grid-cols-1 lg:grid-cols-3">
            {[
              ["40+", "artisan clusters"],
              ["100%", "breathable fabrics"],
              ["7-day", "easy exchange"],
            ].map(([n, l], i) => (
              <Reveal
                key={l}
                delay={i * 90}
                variant="scale"
                className="glass px-2 py-8"
              >
                <dt
                  className="text-[38px] font-medium text-[#7D451B]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {n}
                </dt>
                <dd className="mt-1 text-[12px] font-semibold tracking-[0.14em] text-[#172121]/65 uppercase">
                  {l}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section aria-label="Customer words" className="cv mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <SectionHeading kicker="Worn & loved" title="Word on the street" />
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="lift flex h-full flex-col border border-[#172121]/10 bg-white/60 px-7 py-8 backdrop-blur">
                <span aria-hidden="true" className="text-[13px] tracking-[0.28em] text-[#7D451B]">★★★★★</span>
                <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-[#172121]/85" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "19px" }}>
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-[#172121]/10 pt-4 text-[13px] font-semibold tracking-[0.08em] text-[#172121]/80 uppercase">
                  <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#172121] text-[13px] text-[#FBF6F3]">{t.name.slice(0, 1)}</span>
                  {t.name}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Trust row ────────────────────────────────── */}
      <section aria-label="Why shop with us" className="cv border-y border-[#172121]/10 bg-[#FBF6F3]">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {[
            ["Cash on delivery", "Pay at your door, anywhere in Bangladesh.", "৳"],
            ["7-day exchange", "Wrong size? We swap it fast, no drama.", "↺"],
            ["WhatsApp support", "Real humans, Sat–Thu 10am–8pm.", "✦"],
          ].map(([t, c, icon], i) => (
            <Reveal key={t} delay={i * 80}>
              <div className="flex flex-col items-center text-center">
                <span aria-hidden="true" className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#172121]/15 text-[18px] text-[#7D451B]">{icon}</span>
                <p className="text-[13px] font-semibold tracking-[0.22em] uppercase">{t}</p>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-[#172121]/70">{c}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Newsletter CTA ───────────────────────────── */}
      <section aria-label="Newsletter" className="cv relative overflow-hidden bg-[#172121] text-center text-[#FBF6F3]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D5573B]/18 blur-[140px]" />
        </div>
        <div className="relative mx-auto max-w-[1280px] px-4 py-20 sm:px-6">
          <Reveal variant="scale">
            <p className="kicker text-blush">The letter — 10% off first order</p>
            <p className="display-xl mx-auto mt-3 max-w-[14ch]">
              First dibs, every drop.
            </p>
            <p className="mx-auto mt-4 max-w-[50ch] text-[16px] text-white/65">
              Join for 10% off your first order over{" "}
              {formatBDT(FREE_SHIP_THRESHOLD_PAISA)} — plus craft notes worth opening.
            </p>
            <Magnetic strength={12}>
              <a
                href="#newsletter"
                className="mt-8 inline-flex items-center gap-3 bg-[#FBF6F3] px-9 py-4 text-[12px] font-semibold tracking-[0.2em] text-[#172121] uppercase transition-colors hover:bg-clay hover:text-white"
              >
                Subscribe below <span aria-hidden="true">↓</span>
              </a>
            </Magnetic>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
