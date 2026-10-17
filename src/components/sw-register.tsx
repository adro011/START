"use client";

import { useEffect } from "react";

/**
 * Service-worker cleanup.
 *
 * A previous build shipped a cache-first PWA service worker (public/sw.js). It
 * served stale Next.js chunks and page HTML, which caused "Cannot find module"
 * errors and unwanted reloads/repaint glitches when returning to the tab.
 *
 * We no longer register a service worker. This component actively unregisters
 * any worker a previous version installed and purges its caches, so the browser
 * always fetches fresh assets and nothing interferes with focus/visibility.
 */
export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => keys.forEach((k) => caches.delete(k)))
        .catch(() => {});
    }
  }, []);
  return null;
}
