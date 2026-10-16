import Link from "next/link";
import Image from "next/image";
import {
  getNewArrivals,
  getSale,
  getFeatured,
  CATEGORIES,
} from "@/lib/catalog";
import type { CatalogProduct } from "@/types/catalog";
import { ProductCard } from "../components/product-card";
import Reveal from "../components/reveal";
import Magnetic from "../components/magnetic";
import { formatBDT } from "../lib/format";
import { FREE_SHIP_THRESHOLD_PAISA } from "@/config/site";

async function safe<T>(fn: () => T | Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/** Catalog lib products satisfy the card's needs; bridge the two product types. */
function asCard(p: { slug: string }): CatalogProduct {
  return p as unknown as CatalogProduct;
}

function SectionHeading({
  kicker,
  title,
  copy,
  href,
  cta,
}: {
  kicker: string;
  title: string;
  copy?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <Reveal>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.2em] text-clay uppercase">
            {kicker}
          </p>
          <h2
            className="mt-1 text-[34px] leading-tight font-medium text-[#172121] sm:text-[42px]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {title}
          </h2>
          {copy && (
            <p className="mt-1 max-w-[52ch] text-[15px] text-[#172121]/65">
              {copy}
            </p>
          )}
        </div>
        {href && (
          <Magnetic>
            <Link
              href={href}
              className="inline-block border border-[#172121] px-5 py-2.5 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-[#172121] hover:text-[#FBF6F3]"
            >
              {cta ?? "View all →"}
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
    title: "Men",
    copy: "Panjabis with presence.",
    href: "/men",
    img: "/hero/men.svg",
    grad: "from-[#172121] via-[#7D451B] to-[#D5573B]",
  },
  {
    key: "women",
    title: "Women",
    copy: "Sharees that move with you.",
    href: "/women",
    img: "/hero/women.svg",
    grad: "from-[#7D451B] via-[#D5573B] to-[#F2CCC3]",
  },
  {
    key: "kids",
    title: "Kids",
    copy: "Festive, play-proof, all smiles.",
    href: "/kids",
    img: "/hero/kids.svg",
    grad: "from-[#172121] via-[#7E9181] to-[#F2CCC3]",
  },
] as const;

const OCCASIONS = [
  { name: "Eid", copy: "Moonlit whites & golds", href: "/women?occasion=eid", grad: "from-[#7D451B] to-[#D5573B]" },
  { name: "Wedding", copy: "Heirlooms in the making", href: "/women?occasion=wedding", grad: "from-[#172121] to-[#7D451B]" },
  { name: "Everyday", copy: "Breathable, reworn often", href: "/men?occasion=everyday", grad: "from-[#7E9181] to-[#172121]" },
  { name: "Winter", copy: "Layers with intention", href: "/men?occasion=winter", grad: "from-[#172121] to-[#7E9181]" },
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
 * Home: 3-panel hero, new-arrivals rail, category tiles, occasion band,
 * sale band, craft story, testimonials, trust row, newsletter CTA.
 * Server component; catalog lib supplies products. Empty states stay quiet.
 */
export default async function HomePage() {
  const [arrivals, sale, featured] = await Promise.all([
    safe(() => getNewArrivals(), []),
    safe(() => getSale(), []),
    safe(() => getFeatured(), []),
  ]);

  const tiles = (
    Array.isArray(CATEGORIES) && CATEGORIES.length > 0
      ? CATEGORIES.slice(0, 6).map((c) => ({
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
    <div>
      {/* ── Hero: 3 panels ─────────────────────────────── */}
      <section aria-label="Shop by section" className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-4">
        <div className="flex min-h-[78vh] flex-col gap-3 md:flex-row">
          {HERO.map((h, i) => (
            <Link
              key={h.key}
              href={h.href}
              style={{ animationDelay: `${120 + i * 110}ms` }}
              className={`hero-enter group relative flex-1 overflow-hidden bg-gradient-to-br ${h.grad} transition-[flex-grow] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] md:hover:flex-[1.7]`}
            >
              <Image
                src={h.img}
                alt={`${h.title} collection`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={h.key === "women"}
                className="object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#172121]/80 via-[#172121]/10 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <span
                  className="hero-text-rise block text-[12px] font-semibold tracking-[0.22em] text-[#F2CCC3] uppercase"
                  style={{ animationDelay: `${120 + i * 110}ms` }}
                >
                  Shop
                </span>
                <span
                  className="hero-text-rise block text-[44px] leading-none font-medium text-white sm:text-[56px]"
                  style={{ fontFamily: "'Cormorant Garamond', serif", animationDelay: `${200 + i * 110}ms` }}
                >
                  {h.title}
                </span>
                <span
                  className="hero-text-rise mt-1 block text-[14.5px] text-white/80"
                  style={{ animationDelay: `${280 + i * 110}ms` }}
                >
                  {h.copy}
                </span>
                <span className="mt-4 inline-block border border-white/70 px-5 py-2.5 text-[12px] font-semibold tracking-[0.16em] text-white uppercase transition-colors group-hover:bg-clay group-hover:border-[#D5573B]">
                  Shop {h.title} →
                </span>
              </span>
            </Link>
          ))}
        </div>
        <p className="mx-auto max-w-[1280px] overflow-hidden py-3 text-center text-[12px] font-medium tracking-[0.24em] text-[#172121]/75 uppercase">
          Handcrafted · Made in Bangladesh · Free exchange
        </p>
      </section>

      {/* ── New arrivals rail ────────────────────────── */}
      <section aria-label="New arrivals" className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <SectionHeading
          kicker="Just landed"
          title="New arrivals"
          copy="Small batches, honest fabrics. When it's gone, it's gone."
          href="/new-arrivals"
        />
        {arrivals.length > 0 ? (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:thin]">
            {arrivals.slice(0, 10).map((p, i) => (
              <Reveal
                key={p.slug}
                delay={(i % 5) * 70}
                className="w-[220px] shrink-0 snap-start sm:w-[260px]"
              >
                <ProductCard product={asCard(p)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-[#172121]/20 px-6 py-10 text-center text-[14.5px] text-[#172121]/80">
            Fresh pieces are on the cutting table — check back very soon.
          </p>
        )}
      </section>

      {/* ── Shop by category ─────────────────────────── */}
      <section aria-label="Shop by category" className="bg-[#F2CCC3]/30">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
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
                className="group relative overflow-hidden bg-gradient-to-br from-[#7E9181] to-[#172121] px-6 py-10 transition-transform duration-300 hover:-translate-y-1 sm:py-14"
              >
                <Link href={t.href} className="block">
                  <span
                    className="block text-[26px] font-medium text-white sm:text-[34px]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {t.name}
                  </span>
                  <span className="mt-2 inline-block text-[12px] font-semibold tracking-[0.18em] text-white/80 uppercase group-hover:text-white">
                    Explore →
                  </span>
                  <span aria-hidden="true" className="absolute -right-2 -bottom-5 text-[88px] leading-none font-semibold text-white/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Occasion band ────────────────────────────── */}
      <section aria-label="Shop by occasion" className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <SectionHeading
          kicker="Dress for the day"
          title="Shop by occasion"
          copy="Eid mornings, wedding evenings, and everything in between."
        />
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {OCCASIONS.map((o, i) => (
            <Reveal
              key={o.name}
              delay={i * 80}
              className={`group relative min-h-[220px] flex-1 snap-start overflow-hidden bg-gradient-to-br px-6 py-8 ${o.grad} min-w-[240px] md:min-w-0`}
            >
              <Link href={o.href} className="block">
                <span
                  className="block text-[30px] font-medium text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {o.name}
                </span>
                <span className="mt-1 block text-[13.5px] text-white/75">
                  {o.copy}
                </span>
                <span className="mt-4 inline-block text-[12px] font-semibold tracking-[0.18em] text-white uppercase underline-offset-4 group-hover:underline">
                  Shop now →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Sale band ────────────────────────────────── */}
      <section aria-label="Sale" className="bg-[#172121] text-[#FBF6F3]">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold tracking-[0.2em] text-blush uppercase">
                  Up to honest markdowns
                </p>
                <h2
                  className="mt-1 text-[34px] leading-tight font-medium sm:text-[42px]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  The sale edit
                </h2>
                <p className="mt-1 text-[15px] text-white/65">
                  Last pieces, best fabrics. {featured.length > 0 && "Loved by regulars."}
                </p>
              </div>
              <Magnetic>
                <Link
                  href="/sale"
                  className="inline-block bg-clay px-6 py-3 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-[#7D451B]"
                >
                  Shop sale →
                </Link>
              </Magnetic>
            </div>
          </Reveal>
          {sale.length > 0 && (
            <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {sale.slice(0, 8).map((p, i) => (
                <Reveal
                  key={p.slug}
                  delay={(i % 4) * 70}
                  className="w-[220px] shrink-0 snap-start sm:w-[250px] [&_a]:text-[#FBF6F3] [&_p]:text-white/70 [&_s]:text-white/70 [&_.text-clay]:text-blush"
                >
                  <ProductCard product={asCard(p)} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Craft story (CSS parallax-ish) ───────────── */}
      <section aria-label="Our craft" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#F2CCC3] via-[#FBF6F3] to-[#7E9181]/40 bg-[length:200%_200%] md:bg-fixed"
        />
        <div className="relative mx-auto grid max-w-[1280px] gap-8 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div>
              <p className="text-[12px] font-semibold tracking-[0.2em] text-clay uppercase">
                Woven, not rushed
              </p>
              <h2
                className="mt-1 text-[34px] leading-tight font-medium sm:text-[46px]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                From loom to doorstep, with patience.
              </h2>
              <p className="mt-3 max-w-[46ch] text-[15.5px] leading-relaxed text-[#172121]/70">
                We work with weaving clusters across Bangladesh — muslin, endi,
                silk — and cut every piece for real bodies and real weather.
                No overproduction, no shouting discounts. Just clothes that earn
                their place.
              </p>
              <Magnetic>
                <Link
                  href="/craft"
                  className="mt-6 inline-block border border-[#172121] px-6 py-3 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-[#172121] hover:text-[#FBF6F3]"
                >
                  Read our story →
                </Link>
              </Magnetic>
            </div>
          </Reveal>
          <dl className="grid grid-cols-3 gap-4 text-center">
            {[
              ["40+", "artisan clusters"],
              ["100%", "breathable fabrics"],
              ["7-day", "easy exchange"],
            ].map(([n, l], i) => (
              <Reveal
                key={l}
                delay={i * 90}
                variant="scale"
                className="border border-[#172121]/15 bg-[#FBF6F3]/70 px-2 py-6 backdrop-blur"
              >
                <dt
                  className="text-[32px] font-medium text-[#7D451B]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {n}
                </dt>
                <dd className="mt-1 text-[12.5px] tracking-wide text-[#172121]/65 uppercase">
                  {l}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section aria-label="Customer words" className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <SectionHeading kicker="Worn & loved" title="Word on the street" />
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="border border-[#172121]/12 bg-white/40 px-6 py-7">
                <span aria-hidden="true" className="tracking-[0.2em] text-[#7D451B]">★★★★★</span>
                <blockquote className="mt-3 text-[15px] leading-relaxed text-[#172121]/85">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-3 text-[13px] font-medium tracking-wide text-[#172121]/80">
                  — {t.name}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Trust row ────────────────────────────────── */}
      <section aria-label="Why shop with us" className="border-y border-[#172121]/10 bg-[#FBF6F3]">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
          {[
            ["Cash on delivery", "Pay at your door, anywhere in Bangladesh."],
            ["7-day exchange", "Wrong size? We swap it fast, no drama."],
            ["WhatsApp support", "Real humans, Sat–Thu 10am–8pm."],
          ].map(([t, c], i) => (
            <Reveal key={t} delay={i * 80}>
              <div className="flex flex-col items-center text-center">
                <p className="text-[13px] font-semibold tracking-[0.18em] uppercase">{t}</p>
                <p className="mt-1 max-w-[34ch] text-[14px] text-[#172121]/80">{c}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Newsletter CTA ───────────────────────────── */}
      <section aria-label="Newsletter" className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6">
        <Reveal variant="scale">
          <p
            className="text-[36px] leading-tight font-medium sm:text-[44px]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            First dibs, every drop.
          </p>
          <p className="mx-auto mt-2 max-w-[48ch] text-[15px] text-[#172121]/65">
            Join the letter for 10% off your first order over{" "}
            {formatBDT(FREE_SHIP_THRESHOLD_PAISA)} — plus craft notes worth opening.
          </p>
          <Magnetic>
            <a
              href="#newsletter"
              className="mt-6 inline-block bg-[#172121] px-8 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-[#FBF6F3] uppercase transition-colors hover:bg-clay"
            >
              Subscribe below ↓
            </a>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  );
}
