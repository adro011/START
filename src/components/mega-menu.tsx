"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCategoryGroups } from "@/lib/catalog";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";
import { cn, hardNav } from "../lib/format";

type MenuLink = { label: string; href: string };
type MenuGroup = { heading: string; href?: string; links: MenuLink[] };
type Section = {
  key: "men" | "women" | "kids";
  label: string;
  href: string;
  groups: MenuGroup[];
  blurb: string;
};

const BLURBS: Record<Section["key"], string> = {
  men: "Panjabis with presence — breathable cotton, Eid-ready.",
  women: "Sharees and sets that move with you — soft, vivid, Artistic  .",
  kids: "Play-proof festive wear — smooth fabrics,  all smiles.",
};

const FALLBACK_GROUPS: Record<Section["key"], MenuGroup[]> = {
  men: [
    {
      heading: "Traditional Wear",
      links: [
        { label: "Punjabi (Traditional Kurta)", href: "/men/punjabi" },
        { label: "Sherwani", href: "/men/sherwani" },
      ],
    },
    {
      heading: "Topwear",
      links: [
        { label: "Shirts", href: "/men/shirts" },
        { label: "T-Shirts", href: "/men/t-shirts" },
        { label: "Vests (Undershirts)", href: "/men/vests" },
      ],
    },
    {
      heading: "Bottomwear",
      links: [
        { label: "Pants", href: "/men/pants" },
        { label: "Jeans", href: "/men/jeans" },
        { label: "Gabardine Pants", href: "/men/gabardine-pants" },
        { label: "Trousers", href: "/men/trousers" },
        { label: "Three-Quarter Pants", href: "/men/three-quarter-pants" },
        { label: "Two-Quarter Pants (Shorts)", href: "/men/two-quarter-pants" },
      ],
    },
    {
      heading: "Accessories & Essentials",
      links: [
        { label: "Ties", href: "/men/ties" },
        { label: "Wallets", href: "/men/wallets" },
        { label: "Men's Undergarments", href: "/men/mens-undergarments" },
      ],
    },
  ],
  women: [
    {
      heading: "Dresses & Sets",
      links: [
        { label: "Women's Dresses", href: "/women/womens-dresses" },
        { label: "Gowns", href: "/women/gowns" },
        { label: "Ready-Made Three-Piece Sets", href: "/women/ready-made-three-piece-sets" },
        { label: "Unstitched Three-Piece Sets", href: "/women/unstitched-three-piece-sets" },
        { label: "One-Piece Outfits", href: "/women/one-piece-outfits" },
        { label: "Two-Piece Sets", href: "/women/two-piece-sets" },
        { label: "Three-Piece Sets", href: "/women/three-piece-sets" },
      ],
    },
    {
      heading: "Sarees",
      links: [
        { label: "Katan Silk Sarees", href: "/women/katan-silk-sarees" },
        { label: "Cotton Sarees", href: "/women/cotton-sarees" },
        { label: "Jamdani Sarees", href: "/women/jamdani-sarees" },
        { label: "Party Wear Sarees", href: "/women/party-wear-sarees" },
      ],
    },
    {
      heading: "Ethnic Wear",
      links: [{ label: "Lehengas", href: "/women/lehengas" }],
    },
    {
      heading: "Accessories & Essentials",
      links: [
        { label: "Women's Handbags", href: "/women/womens-handbags" },
        { label: "Women's Undergarments", href: "/women/womens-undergarments" },
      ],
    },
  ],
  kids: [
    {
      heading: "Boys",
      links: [
        { label: "Boys' Clothing Sets", href: "/kids/boys-clothing-sets" },
        { label: "T-Shirts", href: "/kids/boys-t-shirts" },
        { label: "Shirts", href: "/kids/boys-shirts" },
        { label: "Polo Shirts", href: "/kids/boys-polo-shirts" },
        { label: "Jeans", href: "/kids/boys-jeans" },
        { label: "Casual Pants", href: "/kids/boys-casual-pants" },
        { label: "Shorts", href: "/kids/boys-shorts" },
        { label: "Trousers", href: "/kids/boys-trousers" },
        { label: "Punjabi / Kurta", href: "/kids/boys-punjabi-kurta" },
        { label: "Sherwani", href: "/kids/boys-sherwani" },
        { label: "Hoodies", href: "/kids/boys-hoodies" },
        { label: "Jackets", href: "/kids/boys-jackets" },
        { label: "Sweaters", href: "/kids/boys-sweaters" },
        { label: "Pajama Sets", href: "/kids/boys-pajama-sets" },
        { label: "Tracksuits", href: "/kids/boys-tracksuits" },
        { label: "Undergarments", href: "/kids/boys-undergarments" },
      ],
    },
    {
      heading: "Girls",
      links: [
        { label: "Girls' Clothing Sets", href: "/kids/girls-clothing-sets" },
        { label: "Frocks", href: "/kids/girls-frocks" },
        { label: "Dresses", href: "/kids/girls-dresses" },
        { label: "T-Shirts", href: "/kids/girls-t-shirts" },
        { label: "Tops", href: "/kids/girls-tops" },
        { label: "Skirts", href: "/kids/girls-skirts" },
        { label: "Jeans", href: "/kids/girls-jeans" },
        { label: "Leggings", href: "/kids/girls-leggings" },
        { label: "Casual Pants", href: "/kids/girls-casual-pants" },
        { label: "One-Piece Dresses", href: "/kids/girls-one-piece-dresses" },
        { label: "Two-Piece Sets", href: "/kids/girls-two-piece-sets" },
        { label: "Three-Piece Sets", href: "/kids/girls-three-piece-sets" },
        { label: "Salwar Kameez", href: "/kids/girls-salwar-kameez" },
        { label: "Lehengas", href: "/kids/girls-lehengas" },
        { label: "Gowns", href: "/kids/girls-gowns" },
        { label: "Hoodies", href: "/kids/girls-hoodies" },
        { label: "Jackets", href: "/kids/girls-jackets" },
        { label: "Sweaters", href: "/kids/girls-sweaters" },
        { label: "Nightwear", href: "/kids/girls-nightwear" },
        { label: "Undergarments", href: "/kids/girls-undergarments" },
      ],
    },
  ],
};

/** Build mega-menu sections from the authoritative category groups. */
function buildSections(d: ReturnType<typeof getDict>): Section[] {
  const keys: Section["key"][] = ["men", "women", "kids"];
  const labels: Record<Section["key"], string> = {
    men: d.nav_men,
    women: d.nav_women,
    kids: d.nav_kids,
  };
  return keys.map((key) => {
    let groups: MenuGroup[];
    try {
      groups = getCategoryGroups(key).map((g) => ({
        heading: g.name,
        href: `/${key}`,
        links: g.children.map((k) => ({ label: k.name, href: `/${key}/${k.slug}` })),
      }));
    } catch {
      // Menu must never crash the header — curated fallback below.
      groups = FALLBACK_GROUPS[key];
    }
    return {
      key,
      label: labels[key],
      href: `/${key}`,
      groups,
      blurb: BLURBS[key],
    };
  });
}

/**
 * Full-width mega menu for Men / Women / Kids.
 * Opens on hover AND keyboard focus (focus-within), closes on Esc with a
 * 120ms leave delay so the cursor can travel without flicker.
 */
export function MegaMenu({ locale = "en" }: { locale?: Locale }) {
  const d = getDict(locale);
  const [openKey, setOpenKey] = useState<Section["key"] | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const sections = buildSections(d);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenKey(null), 120);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenKey(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      data-mega-open={openKey ? "1" : ""}
      className="relative hidden border-t border-white/15 lg:block"
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        // Keyboard users tabbing out of the whole nav should close the panel.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpenKey(null);
        }
      }}
    >
      <ul className="mx-auto flex max-w-[1280px] items-stretch justify-center gap-1 px-4">
        {sections.map((s) => (
          <li
            key={s.key}
            className="group"
            onMouseEnter={() => {
              cancelClose();
              setOpenKey(s.key);
            }}
            onFocus={() => {
              cancelClose();
              setOpenKey(s.key);
            }}
          >
            <Link
              href={s.href}
              aria-expanded={openKey === s.key}
              aria-haspopup="true"
              onClick={(e) => {
                setOpenKey(null);
                hardNav(s.href)(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpenKey(null);
              }}
              className={cn(
                "relative block px-5 py-3 text-[13px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] motion-reduce:transition-none",
                openKey === s.key || s.key === "kids"
                  ? "text-gold"
                  : "text-[var(--color-smoke)] hover:text-gold",
              )}
            >
              {s.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-5 -bottom-px h-0.5 origin-left bg-gold transition-transform duration-200 motion-reduce:transition-none",
                  openKey === s.key
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100",
                )}
              />
            </Link>
          </li>
        ))}
        {(
          [
            { label: d.nav_new, href: "/new-arrivals" },
            { label: d.nav_sale, href: "/sale", hot: true },
            { label: d.nav_stories, href: "/stories" },
          ] as const
        ).map((l) => (
          <li
            key={l.href}
            onMouseEnter={() => {
              cancelClose();
              setOpenKey(null);
            }}
          >
            <Link
              href={l.href}
              onClick={hardNav(l.href)}
              className={cn(
                "block px-5 py-3 text-[13px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] motion-reduce:transition-none",
                "hot" in l && l.hot
                  ? "text-gold hover:text-gold-dark"
                  : "text-[var(--color-smoke)] hover:text-gold",
              )}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Full-width panel — glass + editorial image preview */}
      <div
        className={cn(
          "absolute inset-x-0 top-full z-50 border-y border-white/15 bg-black shadow-[0_32px_64px_rgba(23,33,33,0.16)] transition-all duration-300 motion-reduce:transition-none",
          openKey
            ? "visible opacity-100 [clip-path:inset(0_0_0_0)]"
            : "invisible opacity-0 [clip-path:inset(0_0_100%_0)]",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {sections.map((s) => (
          <div
            key={s.key}
            hidden={openKey !== s.key}
            className={cn(
              "mx-auto grid max-w-[1280px] gap-8 px-8 py-8",
              s.groups.length >= 4
                ? "grid-cols-[1fr_1fr_1fr_1fr_300px]"
                : "grid-cols-[1fr_1fr_300px]",
            )}
          >
            {s.groups.map((g, gi) => (
              <div
                key={g.heading + gi}
                className="mega-link"
                style={{ transitionDelay: `${gi * 55}ms` }}
              >
                <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-[var(--color-smoke)] uppercase">
                  <span aria-hidden="true" className="h-px w-4 bg-gold" />
                  {g.heading}
                </p>
                <ul
                  className={
                    g.links.length > 8
                      ? "grid grid-cols-2 gap-x-8 gap-y-2"
                      : "space-y-2"
                  }
                >
                  {g.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        onClick={() => setOpenKey(null)}
                        className="link-lux text-[14.5px] text-steel transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] motion-reduce:transition-none"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={g.href ?? s.href}
                  onClick={() => setOpenKey(null)}
                  className="mt-4 inline-block text-[12px] font-semibold tracking-[0.16em] text-gold uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                >
                  {d.view_all} →
                </Link>
              </div>
            ))}
            <div className="mega-link relative overflow-hidden border-l border-white/15 pl-0" style={{ transitionDelay: "220ms" }}>
              <div className="relative ml-8 min-h-[240px] overflow-hidden bg-[var(--abrar-ink)]">
                <span aria-hidden="true" className="absolute inset-0" style={{ background: s.key === "men" ? "linear-gradient(150deg,var(--abrar-ink),#7D451B 60%,#D5573B)" : s.key === "women" ? "linear-gradient(150deg,#3d1c12,#D5573B 60%,var(--color-blush))" : "linear-gradient(150deg,var(--abrar-ink),#7E9181 65%,var(--color-blush))" }} />
                <span aria-hidden="true" className="text-ghost absolute -right-1 -bottom-4 text-[84px] leading-none font-semibold">{s.key === "men" ? "01" : s.key === "women" ? "02" : "03"}</span>
                <div className="relative flex h-full min-h-[240px] flex-col justify-end p-6">
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-[var(--color-blush)] uppercase">Featured — {s.label}</p>
                  <p className="mt-1 text-[24px] leading-tight font-medium text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {s.label} edit
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/75">
                    {s.blurb}
                  </p>
                  <Link
                    href={s.href}
                    onClick={() => setOpenKey(null)}
                    className="mt-4 inline-flex w-fit items-center gap-2 bg-[var(--color-paper)] px-5 py-2.5 text-[12px] font-semibold tracking-[0.14em] text-[var(--abrar-ink)] uppercase transition-colors hover:bg-clay hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5573B]"
                  >
                    {d.shop} {s.label} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
