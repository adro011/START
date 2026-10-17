import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import { SITE } from "@/config/site";
import { Providers } from "../components/providers";
import { AnnouncementBar } from "../components/announcement-bar";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { CartDrawer } from "../components/cart-drawer";
import SearchPalette from "../components/search-palette";
import { SwRegister } from "../components/sw-register";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/**
 * Root shell: fonts, Providers, AnnouncementBar, SiteHeader (mega menu +
 * mobile nav included internally), main, SiteFooter, CartDrawer, grain.
 * SearchPalette is NOT imported here — the header dispatches `open-search`
 * and the catalog-owned palette listens for it.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  // Locale cookie drives <html lang> + footer dictionary (header reads it client-side).
  const locale = (await cookies()).get("locale")?.value === "bn" ? "bn" : "en";
  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- deliberate: <link> fonts keep builds offline-safe (see DECISIONS.md) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[#000000] text-[#F5F5F5] antialiased"
        style={{
          fontFamily: "'LamboType', 'Roboto', 'Helvetica Neue', Arial, ui-sans-serif, system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:bg-[#172121] focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <AnnouncementBar />
          <SiteHeader />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter locale={locale} />
          <CartDrawer locale={locale} />
          <SearchPalette />
          <SwRegister />
        </Providers>
        {/* Paper-grain overlay (`.grain` defined here; foundation owns globals.css).
            Same recipe as plan §4: SVG noise, ~3% opacity, pointer-events none. */}
        <div className="grain" aria-hidden="true" />
        <style>{`.grain{position:fixed;inset:0;z-index:80;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")}@media (prefers-reduced-motion: reduce){.grain{display:none}}`}</style>
      </body>
    </html>
  );
}
