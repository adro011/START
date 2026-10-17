"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";
import { cn } from "../lib/format";

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
  men: "Panjabis with presence — breathable cotton, sharp cuts, Eid-ready.",
  women: "Sharees and sets that move with you — soft, vivid, unmistakably ours.",
  kids: "Play-proof festive wear — gentle fabrics, zero fuss, all smiles.",
};

const FALLBACK_GROUPS: Record<Section["key"], MenuGroup[]> = {
  men: [
    {
      heading: "Ethnic",
      links: [
        { label: "Panjabi", href: "/men/panjabi" },
        { label: "Short Kurta", href: "/men/short-kurta" },
        { label: "Fatua", href: "/men/fatua" },
      ],
    },
    {
      heading: "Everyday",
      links: [
        { label: "Shirts", href: "/men/shirts" },
        { label: "T-Shirts & Polos", href: "/men/t-shirts" },
        { label: "Trousers", href: "/men/trousers" },
      ],
    },
    {
      heading: "Festive",
      links: [
        { label: "Pajama Sets", href: "/men/panjabi-pajama-sets" },
        { label: "Coaty & Jackets", href: "/men/coaty" },
        { label: "Tupi", href: "/men/tupi" },
      ],
    },
    {
      heading: "More",
      links: [
        { label: "Lungi & Shawls", href: "/men/lungi" },
        { label: "Shoes", href: "/men/shoes" },
        { label: "Accessories", href: "/men/accessories" },
      ],
    },
  ],
  women: [
    {
      heading: "Signature",
      links: [
        { label: "Sharee", href: "/women/sharee" },
        { label: "3 Pcs & 2 Pcs", href: "/women/pcs-sets" },
        { label: "Gown", href: "/women/gown" },
      ],
    },
    {
      heading: "Everyday",
      links: [
        { label: "Tunic", href: "/women/tunic" },
        { label: "Tops & Shirts", href: "/women/tops-shirt" },
        { label: "Skirt", href: "/women/skirt" },
      ],
    },
    {
      heading: "Layers",
      links: [
        { label: "Jacket & Blazer", href: "/women/jacket" },
        { label: "Ladies Polo", href: "/women/ladies-polo" },
        { label: "Ladies Cap", href: "/women/ladies-cap" },
      ],
    },
    {
      heading: "More",
      links: [
        { label: "New Arrivals", href: "/new-arrivals" },
        { label: "Sale", href: "/sale" },
        { label: "Size Guide", href: "/size-guides" },
      ],
    },
  ],
  kids: [
    {
      heading: "Boys",
      links: [
        { label: "Panjabi", href: "/kids/boys-panjabi" },
        { label: "Kabli & Cord Sets", href: "/kids/boys" },
        { label: "Shirts & Polos", href: "/kids/boys-shirt" },
      ],
    },
    {
      heading: "Boys Casual",
      links: [
        { label: "T-Shirts & Tanks", href: "/kids/boys-tshirt" },
        { label: "Denim", href: "/kids/boys-denim" },
        { label: "New In", href: "/new-arrivals" },
      ],
    },
    {
      heading: "Girls",
      links: [
        { label: "3 Pcs & 2 Pcs", href: "/kids/girls-3pcs" },
        { label: "Tops & Tees", href: "/kids/girls-tops" },
        { label: "Jumpsuit", href: "/kids/girls-jumpsuit" },
      ],
    },
    {
      heading: "More",
      links: [
        { label: "Sale", href: "/sale" },
        { label: "Size Guide", href: "/size-guides" },
        { label: "Stories", href: "/stories" },
      ],
    },
  ],
};

/** Build mega-menu sections from the real catalog tree; curated fallback below. */
function buildSections(d: ReturnType<typeof getDict>): Section[] {
  const keys: Section["key"][] = ["men", "women", "kids"];
  const labels: Record<Section["key"], string> = {
    men: d.nav_men,
    women: d.nav_women,
    kids: d.nav_kids,
  };
  try {
    if (Array.isArray(CATEGORIES) && CATEGORIES.length > 0) {
      return keys.map((key) => {
        const withKids = CATEGORIES.filter(
          (c) => c.section === key && c.children && c.children.length > 0,
        );
        const groups: MenuGroup[] = withKids.slice(0, 4).map((c) => ({
          heading: c.name,
          href: `/${key}/${c.slug}`,
          links: (c.children ?? []).slice(0, 5).map((k) => ({
            label: k.name,
            href: `/${key}/${k.slug}`,
          })),
        }));
        while (groups.length < 4) {
          const fb = FALLBACK_GROUPS[key][groups.length];
          if (!fb) break;
          groups.push({
            heading: fb.heading,
            href: `/${key}`,
            links: fb.links,
          });
        }
        return {
          key,
          label: labels[key],
          href: `/${key}`,
          groups: groups.slice(0, 4),
          blurb: BLURBS[key],
        };
      });
    }
  } catch {
    // Fall through to curated fallback — menu must never crash the header.
  }
  return keys.map((key) => ({
    key,
    label: labels[key],
    href: `/${key}`,
    groups: FALLBACK_GROUPS[key].map((g) => ({ ...g, href: `/${key}` })),
    blurb: BLURBS[key],
  }));
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
              onClick={() => setOpenKey(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpenKey(null);
              }}
              className={cn(
                "relative block px-5 py-3 text-[13px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] motion-reduce:transition-none",
                openKey === s.key || s.key === "kids"
                  ? "text-gold"
                  : "text-[#F5F5F5] hover:text-gold",
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
              className={cn(
                "block px-5 py-3 text-[13px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] motion-reduce:transition-none",
                "hot" in l && l.hot
                  ? "text-gold hover:text-gold-dark"
                  : "text-[#F5F5F5] hover:text-gold",
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
            className="mx-auto grid max-w-[1280px] grid-cols-[1fr_1fr_1fr_1fr_300px] gap-8 px-8 py-8"
          >
            {s.groups.map((g, gi) => (
              <div
                key={g.heading + gi}
                className="mega-link"
                style={{ transitionDelay: `${gi * 55}ms` }}
              >
                <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-[#F5F5F5] uppercase">
                  <span aria-hidden="true" className="h-px w-4 bg-gold" />
                  {g.heading}
                </p>
                <ul className="space-y-2">
                  {g.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        onClick={() => setOpenKey(null)}
                        className="link-lux text-[14.5px] text-steel transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] motion-reduce:transition-none"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={g.href ?? s.href}
                  onClick={() => setOpenKey(null)}
                  className="mt-4 inline-block text-[12px] font-semibold tracking-[0.16em] text-gold uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
                >
                  {d.view_all} →
                </Link>
              </div>
            ))}
            <div className="mega-link relative overflow-hidden border-l border-white/15 pl-0" style={{ transitionDelay: "220ms" }}>
              <div className="relative ml-8 min-h-[240px] overflow-hidden bg-[#172121]">
                <span aria-hidden="true" className="absolute inset-0" style={{ background: s.key === "men" ? "linear-gradient(150deg,#172121,#7D451B 60%,#D5573B)" : s.key === "women" ? "linear-gradient(150deg,#3d1c12,#D5573B 60%,#F2CCC3)" : "linear-gradient(150deg,#172121,#7E9181 65%,#F2CCC3)" }} />
                <span aria-hidden="true" className="text-ghost absolute -right-1 -bottom-4 text-[84px] leading-none font-semibold">{s.key === "men" ? "01" : s.key === "women" ? "02" : "03"}</span>
                <div className="relative flex h-full min-h-[240px] flex-col justify-end p-6">
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-[#F2CCC3] uppercase">Featured — {s.label}</p>
                  <p className="mt-1 text-[24px] leading-tight font-medium text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {s.label} edit
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/75">
                    {s.blurb}
                  </p>
                  <Link
                    href={s.href}
                    onClick={() => setOpenKey(null)}
                    className="mt-4 inline-flex w-fit items-center gap-2 bg-[#FBF6F3] px-5 py-2.5 text-[12px] font-semibold tracking-[0.14em] text-[#172121] uppercase transition-colors hover:bg-clay hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5573B]"
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
