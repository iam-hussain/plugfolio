/**
 * Login rate limit: fixed window per email, in-memory.
 * ponytail: single-instance store — move to Redis if the admin ever runs
 * on more than one node. 5 failures / 15 min, silent generic failure.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const failures = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(email: string): boolean {
  const entry = failures.get(email);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failures.delete(email);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(email: string): void {
  const entry = failures.get(email);
  if (!entry || Date.now() > entry.resetAt) {
    failures.set(email, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearFailures(email: string): void {
  failures.delete(email);
}
