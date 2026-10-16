"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "../lib/dictionary";

type LocaleCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  mounted: boolean;
};

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  setLocale: () => {},
  mounted: false,
});

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}

function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)locale=(en|bn)/);
  return m ? (m[1] as Locale) : "en";
}

/**
 * App-wide client providers: locale (from cookie, default en) + motion/scroll
 * CSS vars. Cart state lives in @/store/cart (persisted); the CartDrawer is
 * mounted by the root layout, and `mounted` lets overlays avoid hydration
 * mismatch on first paint.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readLocaleCookie());
    setMounted(true);
    const root = document.documentElement;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    root.style.setProperty("--ease-out", "cubic-bezier(0.22, 1, 0.36, 1)");
    root.style.setProperty("--scroll-behavior", reduced ? "auto" : "smooth");
    root.setAttribute("data-mounted", "1");
  }, []);

  const setLocale = (l: Locale) => {
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
    setLocaleState(l);
  };

  return (
    <Ctx.Provider value={{ locale, setLocale, mounted }}>
      {children}
    </Ctx.Provider>
  );
}
