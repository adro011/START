"use client";

import { useId } from "react";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";

/**
 * BN / ENG language switch — the system's one rounded object. A glass pill
 * with a gold knob that slides left for বাংলা, right for ENG; the active
 * label hides beneath the knob while the inactive one stays in Ash.
 *
 * Geometry (`.lang-toggle` in globals.css) reproduces the Uiverse toggle:
 * 30px-radius glass pill, inset highlight/shadow stack, chrome-gradient knob
 * recoloured to `#FFC000 → #917300`, and the mirrored
 * `perspective(100px) rotateX/rotateY` hover.
 *
 * Persists to the `locale` cookie then reloads — the server reads that cookie
 * for `<html lang>` and every server-rendered dictionary lookup.
 */
export function LanguageSwitch({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const id = useId();
  const isBn = locale === "bn";

  const switchLocale = () => {
    const next: Locale = isBn ? "en" : "bn";
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="lang-toggle" data-lang={locale}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="lang-input sr-only"
        checked={!isBn}
        onChange={switchLocale}
        aria-label={d.language}
      />

      <label htmlFor={id} className="lang-pill">
        <span className="lang-pill-txt lang-pill-txt-bn" aria-hidden="true">
          বাং
        </span>
        <span className="lang-pill-txt lang-pill-txt-en" aria-hidden="true">
          ENG
        </span>
        <span className="lang-knob" aria-hidden="true" />
      </label>
    </div>
  );
}