import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./editable.css";
import "./obsidian.css";
import { SITE } from "@/config/site";
import { asset, feature, motionValue } from "@/lib/content";
import { Providers } from "../components/providers";
import { AnnouncementBar } from "../components/announcement-bar";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { CartDrawer } from "../components/cart-drawer";
import SearchPalette from "../components/search-palette";
import { SwRegister } from "../components/sw-register";
import { TabRefresh } from "../components/tab-refresh";
import { ThemeStyle } from "../components/theme-style";
import { ThemePreview } from "../components/theme-preview";
import { isRegistrationOpen } from "@/lib/registrations";

export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Reads locale from middleware header (falls back to cookie for backward compat). */
async function getLocale(): Promise<"en" | "bn"> {
  const headersList = await import("next/headers").then((m) => m.headers());
  const locale = headersList.get("x-locale");
  if (locale === "bn") return "bn";
  // Fallback to cookie for any routes that bypass middleware
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  return cookieStore.get("locale")?.value === "bn" ? "bn" : "en";
}

/** Loader timings are editable in content/motion/effects.txt. */
const LOADER_MIN_MS =
  Number.parseInt(motionValue("effects", "loader.minDuration", "400ms"), 10) || 400;
const LOADER_MAX_MS =
  Number.parseInt(motionValue("effects", "loader.maxWait", "6000ms"), 10) || 6000;

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
      { url: asset("brand", "favicon16", "/hero/icons/favicon-16.png"), sizes: "16x16", type: "image/png" },
      { url: asset("brand", "favicon32", "/hero/icons/favicon-32.png"), sizes: "32x32", type: "image/png" },
      { url: asset("brand", "favicon48", "/hero/icons/favicon-48.png"), sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: asset("brand", "appleIcon", "/apple-icon.png"), sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "var(--color-black)",
};

/**
 * Root shell: fonts, Providers, AnnouncementBar, SiteHeader (mega menu +
 * mobile nav included internally), main, SiteFooter, CartDrawer, grain.
 * SearchPalette is NOT imported here — the header dispatches `open-search`
 * and the catalog-owned palette listens for it.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const joinEnabled = await isRegistrationOpen();
  return (
    <html lang={locale} className="overflow-x-clip">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Non-blocking font load: the stylesheet is injected with media="print"
            and flipped to "all" once ready, so Roboto never delays first paint.
            Kept as a <link> (not next/font) so builds stay offline-safe — see DECISIONS.md. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap";l.media="print";l.onload=function(){l.media="all";};document.head.appendChild(l);})();`,
          }}
        />
      </head>
      <body className="overflow-x-clip bg-[var(--color-black)] text-[var(--color-smoke)] antialiased">
        <ThemeStyle />
        <ThemePreview />
        {/* Single full-screen brand loader: server-rendered black stage + gold
            ring (#abrar-loader in globals.css). The gate style holds the hero
            entrance at frame 0 until the loader fades. The boot script NEVER
            removes React-owned nodes (that corrupts React's tree and crashes
            the next client-side navigation) — it only sets `data-done` + styles
            on the loader, then waits for hydration (data-mounted). */}
        {feature("brandLoader") && (
          <>
            <div id="abrar-loader" aria-hidden="true" />
            <noscript>
              <style>{"#abrar-loader{display:none}"}</style>
            </noscript>
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){
  var t0=Date.now(),done=false,root=document.documentElement;
  function hide(el){
    el.setAttribute("data-done","1");
    el.style.opacity="0";
    el.style.pointerEvents="none";
    setTimeout(function(){ if(el)el.style.visibility="hidden"; },500);
  }
  function finish(){
    if(done)return;
    done=true;
    var el=document.getElementById("abrar-loader");
    if(!el)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){hide(el);return;}
    el.setAttribute("data-done","1");
    el.style.opacity="0";
    el.style.pointerEvents="none";
    setTimeout(function(){ if(el)el.style.visibility="hidden"; },500);
  }
  function whenMounted(cb){
    if(root.getAttribute("data-mounted")==="1"){cb();return;}
    var n=0,iv=setInterval(function(){
      if(root.getAttribute("data-mounted")==="1"||++n>60){clearInterval(iv);cb();}
    },50);
  }
  function onReady(){
    setTimeout(function(){whenMounted(finish);},Math.max(0,${LOADER_MIN_MS}-(Date.now()-t0)));
  }
  if(document.readyState==="complete")onReady();
  else window.addEventListener("load",onReady,{once:true});
  setTimeout(function(){whenMounted(finish);},${LOADER_MAX_MS});
})();`,
              }}
            />
          </>
        )}
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
          <SiteFooter locale={locale} joinEnabled={joinEnabled} />
          <CartDrawer locale={locale} />
          {feature("searchPalette") && <SearchPalette />}
          {feature("serviceWorker") && <SwRegister />}
          {feature("tabRefresh") && <TabRefresh />}
        </Providers>
        {/* Paper-grain overlay (`.grain` defined here; foundation owns globals.css).
            Same recipe as plan §4: SVG noise, ~3% opacity, pointer-events none. */}
        <div className="grain" aria-hidden="true" />
        <style>{`.grain{position:fixed;inset:0;z-index:80;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")}@media (prefers-reduced-motion: reduce){.grain{display:none}}`}</style>
      </body>
    </html>
  );
}
