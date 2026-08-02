import { afterEach, describe, expect, it, vi } from "vitest";
import { createFailureLimit } from "./rate-limit";

/** The guard standing between a six-digit code and a million guesses (ADR-0024). */
describe("createFailureLimit", () => {
  afterEach(() => vi.useRealTimers());

  const limit = () => createFailureLimit({ windowMs: 15 * 60 * 1000, maxFailures: 3 });

  it("allows the allowance, then blocks — and only for that key", () => {
    const guard = limit();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(guard.isLimited("maya@example.com")).toBe(false);
      guard.recordFailure("maya@example.com");
    }
    expect(guard.isLimited("maya@example.com")).toBe(true);
    expect(guard.isLimited("someone@example.com")).toBe(false);
  });

  it("a success wipes the slate — two typos then the right code costs nothing", () => {
    const guard = limit();
    guard.recordFailure("maya@example.com");
    guard.recordFailure("maya@example.com");
    guard.clear("maya@example.com");

    guard.recordFailure("maya@example.com");
    guard.recordFailure("maya@example.com");
    expect(guard.isLimited("maya@example.com")).toBe(false);
  });

  it("the window reopens", () => {
    vi.useFakeTimers();
    const guard = limit();
    for (let attempt = 0; attempt < 3; attempt += 1) guard.recordFailure("maya@example.com");
    expect(guard.isLimited("maya@example.com")).toBe(true);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(guard.isLimited("maya@example.com")).toBe(false);
  });
});
