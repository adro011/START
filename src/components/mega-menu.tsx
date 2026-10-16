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
      className="relative hidden border-t border-[#172121]/10 lg:block"
      onMouseLeave={scheduleClose}
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
                "relative block px-5 py-3 text-[13px] font-medium tracking-[0.14em] uppercase transition-colors",
                openKey === s.key
                  ? "text-clay"
                  : "text-[#172121] hover:text-clay",
              )}
            >
              {s.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-5 -bottom-px h-0.5 origin-left bg-[#D5573B] transition-transform duration-200",
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
                "block px-5 py-3 text-[13px] font-medium tracking-[0.14em] uppercase transition-colors",
                "hot" in l && l.hot
                  ? "text-clay hover:text-[#7D451B]"
                  : "text-[#172121] hover:text-clay",
              )}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Full-width panel */}
      <div
        className={cn(
          "absolute inset-x-0 top-full z-40 border-y border-[#172121]/10 bg-[#FBF6F3] shadow-[0_24px_48px_rgba(23,33,33,0.12)] transition-all duration-200",
          openKey
            ? "visible opacity-100 [clip-path:inset(0_0_0_0)]"
            : "invisible opacity-0 [clip-path:inset(0_0_100%_0)]",
        )}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {sections.map((s) => (
          <div
            key={s.key}
            hidden={openKey !== s.key}
            className="mx-auto grid max-w-[1280px] grid-cols-[1fr_1fr_1fr_1fr_260px] gap-8 px-8 py-8"
          >
            {s.groups.map((g, gi) => (
              <div
                key={g.heading + gi}
                className="transition-all duration-200"
                style={{ transitionDelay: `${gi * 40}ms` }}
              >
                <p className="mb-3 text-[12px] font-semibold tracking-[0.16em] text-[#172121] uppercase">
                  {g.heading}
                </p>
                <ul className="space-y-2">
                  {g.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        onClick={() => setOpenKey(null)}
                        className="text-[14px] text-[#172121]/70 underline-offset-4 transition-colors hover:text-clay hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={g.href ?? s.href}
                  onClick={() => setOpenKey(null)}
                  className="mt-4 inline-block text-[12px] font-medium tracking-[0.14em] text-[#7D451B] uppercase underline-offset-4 hover:underline"
                >
                  {d.view_all} →
                </Link>
              </div>
            ))}
            <div className="border-l border-[#172121]/10 pl-8">
              <p
                className="text-[22px] leading-snug font-medium text-[#172121]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {s.label}
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#172121]/70">
                {s.blurb}
              </p>
              <Link
                href={s.href}
                onClick={() => setOpenKey(null)}
                className="mt-4 inline-block bg-[#172121] px-5 py-2.5 text-[12px] font-medium tracking-[0.14em] text-[#FBF6F3] uppercase transition-colors hover:bg-clay"
              >
                {d.shop} {s.label}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
