"use client";

import { useEffect } from "react";

/**
 * Previously reloaded the whole page on every tab-visibility change. That
 * re-ran the app mid-session and snapped scroll back to the top of the hero
 * whenever the tab regained focus (alt-tab, notification, OS focus flap).
 * Reload-on-return is gone; the component stays as a no-op mount so layout
 * wiring is unchanged.
 */
export function TabRefresh() {
  useEffect(() => {
    // Intentionally empty — do not reload or touch scroll position here.
  }, []);
  return null;
}
