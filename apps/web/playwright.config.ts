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
      // The shopper journey reads seeded data, so CI provides a real
      // DATABASE_URL (migrated + seeded); the placeholder keeps local
      // DB-less boots working for the pages that don't touch the DB.
      DATABASE_URL:
        process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/plugfolio",
      DEVICE_TOKEN_SECRET:
        process.env.DEVICE_TOKEN_SECRET ?? "e2e-only-secret-at-least-thirty-two-chars",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-only-auth-secret-at-least-32-chars!",
    },
  },
});
