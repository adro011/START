"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HOME = "/";

/**
 * The homepage is hard-refreshed when the visitor comes back to it: after
 * switching tabs/windows, restoring it from the bfcache, or navigating back
 * from any other section. Other routes are left alone so forms keep state.
 */
export function TabRefresh() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (pathname === HOME && previousPath.current !== HOME) {
      window.location.reload();
      return;
    }
    previousPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let wasHidden = false;

    const reloadHome = () => {
      if (window.location.pathname === HOME) window.location.reload();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
        return;
      }
      if (wasHidden) {
        wasHidden = false;
        reloadHome();
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reloadHome();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
