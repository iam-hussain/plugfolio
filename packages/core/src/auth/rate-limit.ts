/**
 * Fixed-window failure counter — the guard on anything guessable: admin
 * sign-in (ADR-0014) and the six-digit verification code (ADR-0024). Counts
 * only *failures*, and a success clears the key, so a person who fat-fingers a
 * code twice and then gets it right starts clean.
 *
 * ponytail: in-memory, so the window is per process — a second node simply
 * doubles the allowance. Move it behind Redis the day either service scales
 * out; until then a Map is the whole implementation.
 */

export type FailureLimit = {
  /** True once the key has spent its allowance and the window is still open. */
  isLimited(key: string): boolean;
  recordFailure(key: string): void;
  clear(key: string): void;
};

export function createFailureLimit(options: {
  windowMs: number;
  maxFailures: number;
}): FailureLimit {
  const failures = new Map<string, { count: number; resetAt: number }>();

  return {
    isLimited(key) {
      const entry = failures.get(key);
      if (!entry) return false;
      if (Date.now() > entry.resetAt) {
        failures.delete(key);
        return false;
      }
      return entry.count >= options.maxFailures;
    },

    recordFailure(key) {
      const entry = failures.get(key);
      if (!entry || Date.now() > entry.resetAt) {
        failures.set(key, { count: 1, resetAt: Date.now() + options.windowMs });
        return;
      }
      entry.count += 1;
    },

    clear(key) {
      failures.delete(key);
    },
  };
}
