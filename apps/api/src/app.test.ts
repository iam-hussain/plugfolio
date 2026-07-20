import { describe, expect, it } from "vitest";

// Env must exist before the app (and its env boundary) loads. No DB is
// touched: these paths reject before any query.
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/plugfolio";
process.env.DEVICE_TOKEN_SECRET ??= "api-test-secret-at-least-thirty-two-chars";

const { app } = await import("./app");

describe("api app", () => {
  it("serves the health probe", async () => {
    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("rejects an invalid tap body with 400 before touching identity or DB", async () => {
    const response = await app.request("/api/taps", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "not-a-uuid" }),
    });
    expect(response.status).toBe(400);
  });

  it("refuses anonymous account-gated writes with 401", async () => {
    const response = await app.request("/api/follows", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId: "00000000-0000-0000-0000-0000000000b1" }),
    });
    expect(response.status).toBe(401);
  });
});
