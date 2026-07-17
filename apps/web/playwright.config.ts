import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Boots the app with `next dev` and drives it in Chromium.
 *
 * PW_CHROMIUM_BIN lets an environment point at a pre-installed browser instead
 * of a Playwright-managed download (the CI job installs browsers the normal
 * way and leaves this unset).
 */
const executablePath = process.env.PW_CHROMIUM_BIN;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
      },
    },
  ],
  webServer: {
    command: "pnpm exec next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Public pages don't touch these, but set them so the dev server boots
      // cleanly if any shared module reads env at startup.
      DATABASE_URL: "postgresql://user:pass@localhost:5432/plugfolio",
      DEVICE_TOKEN_SECRET: "e2e-only-secret-at-least-thirty-two-chars",
    },
  },
});
