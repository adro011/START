import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  // The COD purchase test decrements live stock exactly once per run and
  // asserts the buy-box becomes interactive after hydration; run tests serially
  // so the dev server never cold-compiles routes concurrently (see purchase.spec.ts).
  workers: 1,
  fullyParallel: false,
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
