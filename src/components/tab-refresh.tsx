"use client";

import { useEffect } from "react";

/**
 * Reloads the page whenever the browser tab becomes active again, so the user
 * always sees fresh content after switching tabs or windows.
 */
export function TabRefresh() {
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return null;
}
