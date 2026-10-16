"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { SITE } from "@/config/site";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";

const HELP_LINKS = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Size Guides", href: "/size-guides" },
  { label: "Track Order", href: "/track" },
  { label: "FAQ", href: "/faq" },
];

const COMPANY_LINKS = [
  { label: "Our Craft", href: "/craft" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Stories", href: "/stories" },
];

/**
 * Footer: newsletter (POSTs to /api/newsletter), help links, payment badges,
 * socials, and an EN/BN language switch persisted in a cookie + reload.
 */
export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const d = getDict(locale);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error(`newsletter ${res.status}`);
      setState("ok");
      setEmail("");
    } catch {
      setState("err");
    }
  }

  function switchLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <footer className="bg-[#172121] text-[#FBF6F3]">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p
              className="text-[30px] leading-tight font-medium"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {d.newsletter_title}
            </p>
            <p className="mt-1 text-[14px] text-white/70">{d.newsletter_sub}</p>
          </div>
          <form
            id="newsletter"
            onSubmit={subscribe}
            className="flex w-full flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {d.newsletter_cta}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={d.newsletter_placeholder}
              className="h-12 flex-1 border border-white/20 bg-transparent px-4 text-[15px] text-white placeholder:text-white/40 focus:border-[#D5573B] focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === "busy"}
              className="h-12 bg-[#D5573B] px-7 text-[13px] font-semibold tracking-[0.14em] uppercase transition-colors hover:bg-[#7D451B] disabled:opacity-60"
            >
              {state === "busy" ? "…" : d.newsletter_cta}
            </button>
            <span aria-live="polite" className="sr-only">
              {state === "ok"
                ? d.newsletter_ok
                : state === "err"
                  ? d.newsletter_error
                  : ""}
            </span>
          </form>
          {state === "ok" && (
            <p className="text-[14px] text-[#7E9181] md:col-span-2">
              {d.newsletter_ok}
            </p>
          )}
          {state === "err" && (
            <p className="text-[14px] text-[#D5573B] md:col-span-2">
              {d.newsletter_error}
            </p>
          )}
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p
            className="text-[28px] font-semibold tracking-[0.08em] uppercase"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {SITE.name}
          </p>
          <p className="mt-2 max-w-[32ch] text-[14px] leading-relaxed text-white/65">
            {SITE.tagline}. {SITE.supportHours}.
          </p>
          <p className="mt-4 text-[14px] text-white/65">
            <a
              href={`https://wa.me/${SITE.whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-white hover:underline"
            >
              WhatsApp {SITE.whatsappDisplay}
            </a>
            {" · "}
            <a
              href={`mailto:${SITE.email}`}
              className="underline-offset-4 hover:text-white hover:underline"
            >
              {SITE.email}
            </a>
          </p>
          <div className="mt-4 flex gap-4 text-[13px] font-medium tracking-[0.1em] uppercase">
            {(
              [
                ["Instagram", SITE.socials.instagram],
                ["Facebook", SITE.socials.facebook],
                ["YouTube", SITE.socials.youtube],
              ] as const
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-white/65 underline-offset-4 hover:text-white hover:underline"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={d.footer_shop}>
          <p className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-white/50 uppercase">
            {d.footer_shop}
          </p>
          <ul className="space-y-2.5 text-[14.5px]">
            <li><Link className="text-white/80 hover:text-white hover:underline" href="/men">{d.nav_men}</Link></li>
            <li><Link className="text-white/80 hover:text-white hover:underline" href="/women">{d.nav_women}</Link></li>
            <li><Link className="text-white/80 hover:text-white hover:underline" href="/kids">{d.nav_kids}</Link></li>
            <li><Link className="text-white/80 hover:text-white hover:underline" href="/new-arrivals">{d.nav_new}</Link></li>
            <li><Link className="text-white/80 hover:text-white hover:underline" href="/sale">{d.nav_sale}</Link></li>
          </ul>
        </nav>

        <nav aria-label={d.footer_help}>
          <p className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-white/50 uppercase">
            {d.footer_help}
          </p>
          <ul className="space-y-2.5 text-[14.5px]">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link className="text-white/80 hover:text-white hover:underline" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={d.footer_company}>
          <p className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-white/50 uppercase">
            {d.footer_company}
          </p>
          <ul className="space-y-2.5 text-[14.5px]">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link className="text-white/80 hover:text-white hover:underline" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar: payments + language + rights */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-6 text-[13px] text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            {d.footer_payments}:{" "}
            <span className="inline-flex gap-1.5">
              {["COD", "bKash", "Nagad"].map((p) => (
                <span
                  key={p}
                  className="border border-white/20 px-2 py-0.5 text-[12px] font-semibold tracking-wide text-white/80"
                >
                  {p}
                </span>
              ))}
            </span>
          </p>
          <div className="flex items-center gap-2" role="group" aria-label={d.language}>
            <span className="tracking-[0.1em] uppercase">{d.language}:</span>
            {(["en", "bn"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLocale(l)}
                aria-pressed={locale === l}
                className={
                  locale === l
                    ? "border border-[#D5573B] px-2.5 py-1 font-semibold text-white"
                    : "border border-white/20 px-2.5 py-1 text-white/60 hover:text-white"
                }
              >
                {l === "en" ? "EN" : "বাং"}
              </button>
            ))}
          </div>
          <p>
            © {new Date().getFullYear()} {SITE.name}. {d.footer_rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
