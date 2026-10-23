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
 * Footer: Join us registration (POSTs to /api/newsletter, persisted in
 * Supabase), help links, payment badges, socials, and an EN/BN language
 * switch persisted in a cookie + reload.
 */
export function SiteFooter({
  locale = "en",
  joinEnabled = true,
}: {
  locale?: Locale;
  joinEnabled?: boolean;
}) {
  const d = getDict(locale);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function join(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "busy") return;
    setStatus("busy");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setStatus("idle");
        setError(data?.error ?? d.newsletter_error);
        return;
      }
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("idle");
      setError(d.newsletter_error);
    }
  }

  return (
      <footer className="relative overflow-hidden bg-[var(--color-dark-iron)] text-[var(--color-smoke)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span aria-hidden="true" className="text-ghost absolute -bottom-8 left-4 text-[18vw] leading-none font-semibold tracking-tight opacity-60 select-none">ABRAR</span>
      </div>
      {/* Join us */}
      <div className="relative border-b border-white/15">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="kicker text-gold">First dibs, every drop</p>
            <p
              className="mt-2 text-[34px] leading-tight font-medium sm:text-[40px]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {d.newsletter_title}
            </p>
            <p className="mt-1 max-w-[44ch] text-[15px] text-steel">{d.newsletter_sub}</p>
          </div>
          {status === "done" ? (
            <div className="flex w-full flex-col gap-3" aria-live="polite">
              <p className="text-[15px] text-gold">{d.newsletter_ok}</p>
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2 border-b border-gold/60 pb-0.5 text-[13px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:text-gold"
              >
                {d.newsletter_back_home} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : joinEnabled ? (
            <form
              id="newsletter"
              onSubmit={join}
              className="flex w-full flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                {d.newsletter_placeholder}
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={d.newsletter_placeholder}
                aria-invalid={error ? true : undefined}
                className="glass-dark h-13 flex-1 px-4 py-3.5 text-[15px] text-white placeholder:text-ash focus:border-[var(--color-gold)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "busy"}
                className="h-13 bg-gold px-7 py-3.5 text-[13px] font-semibold tracking-[0.16em] text-black uppercase transition-all duration-300 hover:bg-gold-dark hover:shadow-[0_12px_32px_rgba(255,192,0,0.4)] disabled:opacity-60"
              >
                {status === "busy" ? "…" : d.newsletter_cta}
              </button>
              {error && (
                <p role="alert" className="text-[13px] text-gold sm:order-last sm:basis-full">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <p className="text-[15px] text-steel">{d.newsletter_closed}</p>
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
          <p className="mt-2 max-w-[32ch] text-[14px] leading-relaxed text-ash">
            {SITE.tagline}. {SITE.supportHours}.
          </p>
          <p className="mt-4 text-[14px] text-ash">
            <a
              href={`https://wa.me/${SITE.whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-gold hover:underline"
            >
              WhatsApp {SITE.whatsappDisplay}
            </a>
            {" · "}
            <a
              href={`mailto:${SITE.email}`}
              className="underline-offset-4 hover:text-gold hover:underline"
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
                className="text-ash underline-offset-4 hover:text-gold hover:underline"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={d.footer_shop}>
          <p className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-ash uppercase">
            {d.footer_shop}
          </p>
          <ul className="space-y-2.5 text-[14.5px]">
            <li><Link className="text-steel hover:text-gold hover:underline" href="/men">{d.nav_men}</Link></li>
            <li><Link className="text-steel hover:text-gold hover:underline" href="/women">{d.nav_women}</Link></li>
            <li><Link className="text-steel hover:text-gold hover:underline" href="/kids">{d.nav_kids}</Link></li>
            <li><Link className="text-steel hover:text-gold hover:underline" href="/new-arrivals">{d.nav_new}</Link></li>
            <li><Link className="text-steel hover:text-gold hover:underline" href="/sale">{d.nav_sale}</Link></li>
          </ul>
        </nav>

        <nav aria-label={d.footer_help}>
          <p className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-ash uppercase">
            {d.footer_help}
          </p>
          <ul className="space-y-2.5 text-[14.5px]">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link className="text-steel hover:text-gold hover:underline" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={d.footer_company}>
          <p className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-ash uppercase">
            {d.footer_company}
          </p>
          <ul className="space-y-2.5 text-[14.5px]">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link className="text-steel hover:text-gold hover:underline" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar: payments + language + rights */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-6 text-[13px] text-ash sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            {d.footer_payments}:{" "}
            <span className="inline-flex gap-1.5">
              {["COD", "bKash", "Nagad"].map((p) => (
                <span
                  key={p}
                  className="border border-white/15 px-2 py-0.5 text-[12px] font-semibold tracking-wide text-steel"
                >
                  {p}
                </span>
              ))}
            </span>
          </p>
          <p>
            © {new Date().getFullYear()} {SITE.name}. {d.footer_rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
