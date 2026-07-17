import { expect, test } from "@playwright/test";

/**
 * The no-login shopper surface (ADR-0002): these journeys assert a visitor can
 * reach a creator page with NO account and NO login wall — the core promise of
 * §2.2. The full tap → affiliate redirect needs a seeded DB and lands with the
 * DB-backed e2e job; this covers the account-free rendering path.
 */
test("home page renders the value prop without a login wall", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /shoppable creator pages/i })).toBeVisible();
  await expect(page.getByText(/no login/i)).toBeVisible();
  // Nothing on the landing path should demand sign-in.
  await expect(page.getByRole("link", { name: /sign in|log in/i })).toHaveCount(0);
});

test("a creator page is reachable by handle with no account", async ({ page }) => {
  await page.goto("/lena");

  await expect(page.getByRole("heading", { name: "lena" })).toBeVisible();
  await expect(page.getByText("@lena")).toBeVisible();
});
