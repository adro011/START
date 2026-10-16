import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SITE } from "@/config/site";
import { Providers } from "../components/providers";
import { AnnouncementBar } from "../components/announcement-bar";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { CartDrawer } from "../components/cart-drawer";
import SearchPalette from "../components/search-palette";
import { SwRegister } from "../components/sw-register";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL("https://example.com"),
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#172121",
};

/**
 * Root shell: fonts, Providers, AnnouncementBar, SiteHeader (mega menu +
 * mobile nav included internally), main, SiteFooter, CartDrawer, grain.
 * SearchPalette is NOT imported here — the header dispatches `open-search`
 * and the catalog-owned palette listens for it.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- deliberate: <link> fonts keep builds offline-safe (see DECISIONS.md) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@400;500;600&family=Hind+Siliguri:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[#FBF6F3] font-sans text-[#172121] antialiased"
        style={{
          fontFamily: "'Jost', 'Hind Siliguri', system-ui, sans-serif",
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
          <SiteFooter />
          <CartDrawer />
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
