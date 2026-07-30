import { defineConfig } from "vitest/config";

/**
 * Unit tests for the app's framework-free helpers (`src/lib`). The e2e specs
 * in `e2e/` belong to Playwright — vitest picking them up is what "Playwright
 * Test did not expect test() to be called here" means.
 */
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
