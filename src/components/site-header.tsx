"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { SITE } from "@/config/site";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";

function readLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)locale=(en|bn)/);
  return m ? (m[1] as Locale) : "en";
}

function HeaderIcon({
  label,
  badge,
  onClick,
  href,
  children,
}: {
  label: string;
  badge?: number;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const cls =
    "relative rounded-full p-2.5 text-[#F5F5F5] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-gold hover:shadow-[0_8px_20px_rgba(213,87,59,0.18)] focus-visible:outline-2 focus-visible:outline-[#FFC000]";
  const inner = (
    <>
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] rounded-full bg-gold px-1 text-center text-[10px] leading-[18px] font-semibold text-black">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );
  return href ? (
    <Link href={href} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/**
 * Sticky header: solid black at every scroll position, logo centered, search
 * button dispatches `open-search` (the catalog-owned SearchPalette listens for
 * it). MegaMenu + MobileNav are mounted here so layout stays a thin shell.
 */
export function SiteHeader() {
  const [locale, setLocale] = useState<Locale>("en");
  const { count, setOpen } = useCart();

  useEffect(() => {
    setLocale(readLocale());
  }, []);

  const openSearch = () =>
    window.dispatchEvent(new CustomEvent("open-search"));

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const d = getDict(locale);

  return (
    <>
      <header className="site-header sticky top-0 z-50 border-b border-white/15 bg-black">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-4 sm:px-6">
          <div className="flex items-center">
            <a
              href={`https://wa.me/${SITE.whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              className="hidden text-[12.5px] font-medium tracking-[0.08em] text-steel uppercase underline-offset-4 hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] lg:block"
            >
              WhatsApp {SITE.whatsappDisplay}
            </a>
          </div>

          <Link
            href="/"
            aria-label={`${SITE.name} — home`}
            className="text-center text-[22px] font-semibold tracking-[0.06em] whitespace-nowrap text-[#F5F5F5] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] sm:text-[25px]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {SITE.name}
          </Link>

          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button
              type="button"
              role="switch"
              aria-checked={locale === "bn"}
              aria-label={d.language}
              onClick={() => switchLocale(locale === "en" ? "bn" : "en")}
              className="relative mr-1 inline-flex h-7 shrink-0 items-center rounded-full border border-white/20 bg-[#181818] p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
            >
              <span
                aria-hidden="true"
                className={
                  "absolute inset-y-0.5 left-0.5 w-9 rounded-full bg-gold shadow-[0_2px_10px_rgba(255,192,0,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none " +
                  (locale === "bn" ? "translate-x-9" : "translate-x-0")
                }
              />
              <span
                className={
                  "relative z-10 w-9 text-center text-[11px] font-semibold tracking-[0.1em] transition-colors duration-300 " +
                  (locale === "en" ? "text-black" : "text-steel")
                }
              >
                EN
              </span>
              <span
                className={
                  "relative z-10 w-9 text-center text-[11px] font-semibold tracking-[0.1em] transition-colors duration-300 " +
                  (locale === "bn" ? "text-black" : "text-steel")
                }
              >
                বাং
              </span>
            </button>
            <HeaderIcon label={d.search} onClick={openSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-[21px] w-[21px]" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <path d="M20 20l-4.2-4.2" />
              </svg>
            </HeaderIcon>
            <span className="hidden sm:block">
              <HeaderIcon label={d.account} href="/account">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-[21px] w-[21px]" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.6" />
                  <path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
                </svg>
              </HeaderIcon>
            </span>
            <span className="hidden sm:block">
              <HeaderIcon label={d.wishlist} href="/wishlist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" className="h-[21px] w-[21px]" aria-hidden="true">
                  <path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9Z" />
                </svg>
              </HeaderIcon>
            </span>
            <HeaderIcon
              label={`${d.cart} (${count})`}
              badge={count}
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" className="h-[21px] w-[21px]" aria-hidden="true">
                <path d="M6 8h12l1 12.5H5L6 8ZM9 8V6.5a3 3 0 0 1 6 0V8" />
              </svg>
            </HeaderIcon>
          </div>
        </div>

        <MegaMenu locale={locale} />
      </header>
      <MobileNav locale={locale} />
    </>
  );
}
