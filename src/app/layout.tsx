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
import { TabRefresh } from "../components/tab-refresh";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE_URL),
  icons: {
    // Simplified chevron mark for the browser tab (the full framed logo is
    // illegible at 16–32px). The full logo stays as apple-icon.png + PWA icons.
    icon: [
      { url: "/hero/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/hero/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/hero/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
    <html lang={locale} className="overflow-x-hidden">
      <head>
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
        className="overflow-x-hidden bg-[#000000] text-[#F5F5F5] antialiased"
        style={{
          fontFamily: "'LamboType', 'Roboto', 'Helvetica Neue', Arial, ui-sans-serif, system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        {/* Single full-screen brand loader: server-rendered black stage + gold
            ring (#abrar-loader in globals.css). The gate style holds the hero
            entrance at frame 0; the boot script removes loader + gate after
            window load (400ms min display, 500ms fade, 6s failsafe), waiting
            for hydration (data-mounted) so React never sees a missing node. */}
        <style
          id="abrar-loader-gate"
          dangerouslySetInnerHTML={{
            __html:
              ".hero-text-rise,.hero-enter,.cover-media{animation-play-state:paused!important}",
          }}
        />
        <div id="abrar-loader" aria-hidden="true" />
        <noscript>
          <style>{"#abrar-loader{display:none}"}</style>
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var t0=Date.now(),done=false,root=document.documentElement;
  function cleanup(){
    var el=document.getElementById("abrar-loader");
    var gate=document.getElementById("abrar-loader-gate");
    if(el&&el.parentNode)el.parentNode.removeChild(el);
    if(gate&&gate.parentNode)gate.parentNode.removeChild(gate);
  }
  function finish(){
    if(done)return;
    done=true;
    var el=document.getElementById("abrar-loader");
    if(!el||window.matchMedia("(prefers-reduced-motion: reduce)").matches){cleanup();return;}
    el.style.opacity="0";
    setTimeout(cleanup,500);
  }
  function whenMounted(cb){
    if(root.getAttribute("data-mounted")==="1"){cb();return;}
    var n=0,iv=setInterval(function(){
      if(root.getAttribute("data-mounted")==="1"||++n>60){clearInterval(iv);cb();}
    },50);
  }
  function onReady(){
    setTimeout(function(){whenMounted(finish);},Math.max(0,400-(Date.now()-t0)));
  }
  if(document.readyState==="complete")onReady();
  else window.addEventListener("load",onReady,{once:true});
  setTimeout(function(){whenMounted(finish);},6000);
})();`,
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:bg-gold focus:px-4 focus:py-2 focus:text-black"
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
          <TabRefresh />
        </Providers>
        {/* Paper-grain overlay (`.grain` defined here; foundation owns globals.css).
            Same recipe as plan §4: SVG noise, ~3% opacity, pointer-events none. */}
        <div className="grain" aria-hidden="true" />
        <style>{`.grain{position:fixed;inset:0;z-index:80;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")}@media (prefers-reduced-motion: reduce){.grain{display:none}}`}</style>
      </body>
    </html>
  );
}
