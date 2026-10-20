"use client";

import { useEffect } from "react";

const PRODUCTION_HOSTNAMES = [
  "abrar-exclusive.shop",
  "www.abrar-exclusive.shop",
];

export function TabRefresh() {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const hostname = window.location.hostname.toLowerCase();
      if (!PRODUCTION_HOSTNAMES.some((h) => h.toLowerCase() === hostname)) return;
      if (sessionStorage.getItem("tab-reloaded") === "1") return;
      sessionStorage.setItem("tab-reloaded", "1");
      window.location.reload();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  return null;
}
