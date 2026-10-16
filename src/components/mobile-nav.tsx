"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { CATEGORIES } from "@/lib/catalog";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";
import { cn } from "../lib/format";

function sectionLinks(): { key: string; label: string; href: string }[] {
  try {
    if (Array.isArray(CATEGORIES) && CATEGORIES.length > 0) {
      const seen = new Map<string, string>();
      for (const c of CATEGORIES) {
        if (
          (c.section === "men" || c.section === "women" || c.section === "kids") &&
          !seen.has(c.section)
        ) {
          seen.set(c.section, c.name);
        }
      }
      if (seen.size > 0) {
        return [...seen.entries()].map(([key, label]) => ({
          key,
          label: label[0].toUpperCase() + label.slice(1),
          href: `/${key}`,
        }));
      }
    }
  } catch {
    // fall through to static
  }
  return [
    { key: "men", label: "Men", href: "/men" },
    { key: "women", label: "Women", href: "/women" },
    { key: "kids", label: "Kids", href: "/kids" },
  ];
}

function Icon({ d, label }: { d: string; label: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[22px] w-[22px]"
      role="img"
      aria-label={label}
    >
      <path d={d} />
    </svg>
  );
}

/**
 * Mobile bottom tab bar (Home / Shop / Search / Wishlist / Cart) +
 * slide-in accordion drawer. Rendered on <lg screens only.
 */
export function MobileNav({ locale = "en" }: { locale?: Locale }) {
  const d = getDict(locale);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { count, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open ]);

  const sections = sectionLinks();
  const openSearch = () =>
    window.dispatchEvent(new CustomEvent("open-search"));

  const tabs = [
    { key: "home", label: d.home, href: "/", icon: "M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5" },
    { key: "shop", label: d.shop, action: () => setOpen(true), icon: "M4 7h16M4 7v13h16V7M4 7l1.5-3h13L20 7M10 11a2 2 0 0 0 4 0" },
    { key: "search", label: d.search, action: openSearch, icon: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM20 20l-4.2-4.2" },
    { key: "wishlist", label: d.wishlist, href: "/wishlist", icon: "M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9Z" },
  ] as const;

  return (
    <>
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#172121]/10 bg-[#FBF6F3]/95 backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {tabs.map((t) => (
            <li key={t.key}>
              {"href" in t && t.href ? (
                <Link
                  href={t.href}
                   className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-[#172121]/80 active:text-clay"
                >
                  <Icon d={t.icon} label={t.label} />
                  {t.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={"action" in t && t.action ? t.action : undefined}
                  className="flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-[#172121]/80 active:text-clay"
                  aria-label={t.label}
                >
                  <Icon d={t.icon} label={t.label} />
                  {t.label}
                </button>
              )}
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-[#172121]/80 active:text-clay"
              aria-label={`${d.cart} (${count})`}
            >
              <span className="relative">
                <Icon
                  d="M6 8h12l1 12.5H5L6 8ZM9 8V6.5a3 3 0 0 1 6 0V8"
                  label={d.cart}
                />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] rounded-full bg-clay px-1 text-center text-[10px] leading-[18px] font-semibold text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </span>
              {d.cart}
            </button>
          </li>
        </ul>
      </nav>

      {/* Slide-in drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "visible" : "invisible",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[#172121]/50 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={d.menu}
          className={cn(
            "absolute top-0 left-0 flex h-full w-[86vw] max-w-[340px] flex-col bg-[#FBF6F3] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-[#172121]/10 px-5 py-4">
            <span
              className="text-[24px] font-semibold"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Meraki
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={d.close}
              className="p-2 text-[#172121]/70 hover:text-clay"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {sections.map((s) => (
              <div
                key={s.key}
                className="border-b border-[#172121]/10 last:border-0"
              >
                <div className="flex items-center">
                  <Link
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="flex-1 py-3.5 text-[15px] font-medium tracking-wide"
                  >
                    {s.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={expanded === s.key}
                    aria-label={`${s.label} subcategories`}
                    onClick={() =>
                      setExpanded(expanded === s.key ? null : s.key)
                    }
                    className="p-2 text-[#172121]/80"
                  >
                    <span
                      className={cn(
                        "inline-block transition-transform duration-200",
                        expanded === s.key && "rotate-180",
                      )}
                    >
                      ▾
                    </span>
                  </button>
                </div>
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    expanded === s.key
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-1 pb-3 pl-1">
                      <li>
                        <Link
                          href={s.href}
                          onClick={() => setOpen(false)}
                          className="block py-1.5 text-[14px] text-clay"
                        >
                          {d.view_all} →
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/new-arrivals"
                          onClick={() => setOpen(false)}
                          className="block py-1.5 text-[14px] text-[#172121]/70"
                        >
                          {d.nav_new}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/sale"
                          onClick={() => setOpen(false)}
                          className="block py-1.5 text-[14px] text-[#172121]/70"
                        >
                          {d.nav_sale}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            <Link
              href="/stories"
              onClick={() => setOpen(false)}
              className="block py-3.5 text-[15px] font-medium tracking-wide"
            >
              {d.nav_stories}
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block py-3.5 text-[15px] font-medium tracking-wide text-[#172121]/70"
            >
              {d.account}
            </Link>
          </div>
          <div className="border-t border-[#172121]/10 px-5 py-4 text-[13px] text-[#172121]/80">
            Cash on delivery · 7-day exchange
          </div>
        </aside>
      </div>
      {/* Spacer so the fixed tab bar never covers footer content */}
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </>
  );
}
