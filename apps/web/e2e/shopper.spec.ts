import { expect, test } from "@playwright/test";

/**
 * The no-login shopper surface (ADR-0002): these journeys assert a visitor can
 * shop with NO account and NO login wall — the core promise of §2.2. The
 * creator-page journeys read the seeded @lena data (CI migrates + seeds a
 * Postgres service before running these).
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

test("the dashboard is gated by sign-in — a creator surface, never a shop wall", async ({
  page,
}) => {
  await page.goto("/dashboard");

  // Unauthenticated → Auth.js sign-in, while every shop path stays open.
  await page.waitForURL("**/api/auth/signin**");
  await expect(page.getByRole("button", { name: /sign in with email/i })).toBeVisible();
});

test("follow and comment are gated; reading them is not", async ({ page, request }) => {
  // Anonymous visitor sees the social surface read-only: comments render, the
  // Follow button is a door to sign-in, and no wall touches the page.
  await page.goto("/lena");
  await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Follow" })).toBeVisible();

  // The write APIs refuse anonymous callers with 401 (never silently accept).
  const follow = await request.post("/api/follows", {
    data: { profileId: "00000000-0000-0000-0000-0000000000b1" },
  });
  expect(follow.status()).toBe(401);
  const comment = await request.post("/api/comments", {
    data: { profileId: "00000000-0000-0000-0000-0000000000b1", body: "hi" },
  });
  expect(comment.status()).toBe(401);
});

test("shopper taps a post, sees the product, and buys — zero account", async ({ page }) => {
  // The affiliate destination is external; stub it so the journey ends
  // deterministically without leaving the test network.
  await page.route("https://example.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Retailer</h1>" }),
  );

  // Arrive on the creator page, open the seeded "Morning routine" post.
  await page.goto("/lena");
  await page.getByRole("link", { name: "Morning routine" }).click();
  await expect(page.getByText("Everyday Tote")).toBeVisible();
  await expect(page.getByText("$49.00")).toBeVisible();

  // Buy: the tap is recorded (201) and the shopper lands on the retailer.
  // Assert attribution on the request payload — the response body is discarded
  // once the page navigates to the retailer.
  const tapRequest = page.waitForRequest("**/api/taps");
  const tapResponse = page.waitForResponse("**/api/taps");
  await page.getByRole("button", { name: "Buy" }).click();
  expect((await tapResponse).status()).toBe(201);
  const payload = (await tapRequest).postDataJSON() as { postId?: string };
  expect(payload.postId).toBeDefined();
  await page.waitForURL("https://example.com/**");
});
