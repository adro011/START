import en from "../locales/en.json";
import bn from "../locales/bn.json";

export type Locale = "en" | "bn";

export const LOCALES: Locale[] = ["en", "bn"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

/** Dictionary shape — en.json is the source of truth for keys. */
export type Dict = typeof en;

const dicts: Record<Locale, Dict> = {
  en,
  // bn.json mirrors en.json keys; cast guards against drift without failing the build.
  bn: bn as unknown as Dict,
};

/** Synchronous dictionary lookup; works in RSC and client components. */
export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? en;
}

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "bn";
}
